import { prisma } from "../config/prisma.js";
import { EstadoTurno, AccionHistorial, TipoNotificacion } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { notificationService } from "./notification.service.js";
import { socketEvents } from "../websocket/socket.js";
import type {
  CrearDiagnosticoInput,
  EditarDiagnosticoInput,
} from "../validators/diagnostico.validator.js";

export const diagnosticoService = {
  /**
   * Crear diagnóstico para un turno
   * Permite registrar múltiples diagnósticos sin sobrescribir los anteriores
   */
  async crearDiagnostico(
    turnoId: string,
    mecanicoId: string,
    input: CrearDiagnosticoInput
  ) {
    return await prisma.$transaction(async (tx) => {
      const turno = await tx.turno.findUnique({
        where: { id: turnoId },
        include: { cliente: true },
      });

      if (!turno) {
        throw new NotFoundError("Turno no encontrado");
      }

      if (turno.mecanicoId !== mecanicoId) {
        throw new ForbiddenError(
          "Solo el mecánico asignado a este turno puede registrar diagnósticos"
        );
      }

      // Crear el nuevo diagnóstico (conservando todos los diagnósticos previos del turno)
      const diagnostico = await tx.diagnostico.create({
        data: {
          turnoId,
          mecanicoId,
          descripcion: input.descripcion,
          observaciones: input.observaciones,
          trabajoRealizado: input.trabajoRealizado,
          recomendaciones: input.recomendaciones,
        },
      });

      // Actualizar el estado del turno a DIAGNOSTICO y refrescar updatedAt
      const estadoAnterior = turno.estado;
      const turnoActualizado = await tx.turno.update({
        where: { id: turnoId },
        data: {
          estado: EstadoTurno.DIAGNOSTICO,
          updatedAt: new Date(),
        },
      });

      // Registrar acción en el historial
      await tx.historialTurno.create({
        data: {
          turnoId,
          usuarioId: mecanicoId,
          accion: AccionHistorial.DIAGNOSTICO_AGREGADO,
          estadoAnterior,
          estadoNuevo: EstadoTurno.DIAGNOSTICO,
          metadata: {
            diagnosticoId: diagnostico.id,
            descripcion: input.descripcion,
          },
        },
      });

      // Notificar al cliente
      const mensajeNotif = notificationService.buildMensaje(
        TipoNotificacion.DIAGNOSTICO,
        turno.numero,
        input.descripcion
      );
      await notificationService.crearNotificacion(
        {
          turnoId,
          tipo: TipoNotificacion.DIAGNOSTICO,
          mensaje: mensajeNotif,
          telefonoCliente: turno.cliente.celular,
          clienteNombre: turno.cliente.nombre,
          turnoNumero: turno.numero,
        },
        tx
      );

      // Emitir WebSockets
      socketEvents.emitTurnoDiagnostico(turnoId, diagnostico);
      socketEvents.emitTurnoActualizado(turnoActualizado);

      return diagnostico;
    });
  },

  /**
   * Obtiene todos los diagnósticos de un turno
   */
  async getDiagnosticos(turnoId: string) {
    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
    });

    if (!turno) {
      throw new NotFoundError("Turno no encontrado");
    }

    return await prisma.diagnostico.findMany({
      where: { turnoId },
      include: {
        mecanico: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Edita un diagnóstico existente (solo el mecánico que lo creó)
   */
  async editarDiagnostico(
    diagnosticoId: string,
    mecanicoId: string,
    input: EditarDiagnosticoInput
  ) {
    return await prisma.$transaction(async (tx) => {
      const diag = await tx.diagnostico.findUnique({
        where: { id: diagnosticoId },
        include: { turno: true },
      });

      if (!diag) {
        throw new NotFoundError("Diagnóstico no encontrado");
      }

      if (diag.mecanicoId !== mecanicoId) {
        throw new ForbiddenError("Solo el autor del diagnóstico puede editarlo");
      }

      const actualizado = await tx.diagnostico.update({
        where: { id: diagnosticoId },
        data: {
          ...(input.descripcion !== undefined && { descripcion: input.descripcion }),
          ...(input.observaciones !== undefined && { observaciones: input.observaciones }),
          ...(input.trabajoRealizado !== undefined && { trabajoRealizado: input.trabajoRealizado }),
          ...(input.recomendaciones !== undefined && { recomendaciones: input.recomendaciones }),
          updatedAt: new Date(),
        },
      });

      // Actualizar updatedAt del turno correspondiente
      await tx.turno.update({
        where: { id: diag.turnoId },
        data: { updatedAt: new Date() },
      });

      await tx.historialTurno.create({
        data: {
          turnoId: diag.turnoId,
          usuarioId: mecanicoId,
          accion: AccionHistorial.DIAGNOSTICO_EDITADO,
          metadata: {
            diagnosticoId,
            cambios: input,
          },
        },
      });

      socketEvents.emitTurnoDiagnostico(diag.turnoId, actualizado);

      return actualizado;
    });
  },
};
