import { prisma } from "../config/prisma.js";
import { EstadoTurno } from "@prisma/client";
import { normalizarPlaca } from "../utils/validators.js";
import { NotFoundError, ConflictError, ValidationError } from "../utils/errors.js";
import { socketEvents } from "../websocket/socket.js";
import type { CrearCalificacionInput } from "../validators/calificacion.validator.js";

export const calificacionService = {
  /**
   * Calificar una atención como cliente (público mediante número de turno + placa)
   * Solo aplicable para turnos en estado FINALIZADO y una sola vez por turno
   */
  async calificar(turnoId: string, input: CrearCalificacionInput) {
    const placaNorm = normalizarPlaca(input.placa);
    if (!placaNorm) {
      throw new ValidationError("La placa no es válida");
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Buscar turno y verificar coincidencia con placa y número de turno
      const turno = await tx.turno.findUnique({
        where: { id: turnoId },
        include: {
          vehiculo: true,
          calificacion: true,
        },
      });

      if (!turno) {
        throw new NotFoundError("El turno solicitado no existe");
      }

      if (turno.numero !== input.numeroTurno || turno.vehiculo.placa !== placaNorm) {
        throw new ValidationError(
          "El número de turno y la placa no coinciden con los registros del sistema"
        );
      }

      // 2. Verificar que el turno esté en estado FINALIZADO
      if (turno.estado !== EstadoTurno.FINALIZADO) {
        throw new ConflictError(
          "TURN_NOT_FINISHED",
          "Solo se pueden calificar turnos que hayan sido marcados como FINALIZADOS"
        );
      }

      // 3. Verificar que no haya sido calificado previamente
      if (turno.calificacion) {
        throw new ConflictError(
          "ALREADY_RATED",
          "Este turno ya ha sido calificado previamente. No se permiten calificaciones duplicadas."
        );
      }

      if (!turno.mecanicoId) {
        throw new ValidationError("El turno no tiene un mecánico registrado");
      }

      // 4. Crear la calificación
      const calificacion = await tx.calificacion.create({
        data: {
          turnoId: turno.id,
          mecanicoId: turno.mecanicoId,
          clienteId: turno.clienteId,
          estrellas: input.estrellas,
          comentario: input.comentario,
        },
      });

      // 5. Emitir evento por WebSockets
      socketEvents.emitTurnoActualizado(turno);

      return calificacion;
    });
  },
};
