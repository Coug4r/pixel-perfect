import { prisma } from "../config/prisma.js";
import {
  EstadoTurno,
  EstadoMecanico,
  AccionHistorial,
  TipoNotificacion,
  RolUsuario,
} from "@prisma/client";
import {
  normalizarCelular,
  normalizarPlaca,
  getFechaStr,
} from "../utils/validators.js";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} from "../utils/errors.js";
import { notificationService } from "./notification.service.js";
import { socketEvents } from "../websocket/socket.js";
import type { CrearTurnoInput, ConsultarTurnoInput } from "../validators/turno.validator.js";
import type { TurnoPublicInfo } from "../types/index.js";

export const turnoService = {
  /**
   * Crear turno como cliente (público)
   * Implementa generación segura y atómica del número diario sin count() + 1
   */
  async crearTurno(input: CrearTurnoInput) {
    const celularNorm = normalizarCelular(input.celular)!;
    const placaNorm = normalizarPlaca(input.placa)!;
    const fechaHoyStr = getFechaStr(new Date());

    return await prisma.$transaction(async (tx) => {
      // 1. Reutilizar o crear Cliente sin duplicar identificación
      const cliente = await tx.cliente.upsert({
        where: { identificacion: input.identificacion },
        update: {
          nombre: input.nombre,
          celular: celularNorm,
          tipoIdentificacion: input.tipoIdentificacion,
        },
        create: {
          identificacion: input.identificacion,
          tipoIdentificacion: input.tipoIdentificacion,
          nombre: input.nombre,
          celular: celularNorm,
        },
      });

      // 2. Reutilizar o crear Vehículo vinculado al cliente
      const vehiculo = await tx.vehiculo.upsert({
        where: { placa: placaNorm },
        update: {
          clienteId: cliente.id,
        },
        create: {
          placa: placaNorm,
          clienteId: cliente.id,
        },
      });

      // 3. Validar mecánico preferido si fue solicitado
      if (input.mecanicoPreferidoId) {
        const mec = await tx.usuario.findUnique({
          where: { id: input.mecanicoPreferidoId },
        });
        if (!mec || mec.rol !== RolUsuario.MECANICO || !mec.activo) {
          throw new ValidationError("El mecánico preferido seleccionado no está disponible");
        }
      }

      // 4. Asignación atómica del número de turno diario (seguro contra concurrencia)
      const secuencia = await tx.turnoSecuenciaDiaria.upsert({
        where: { fechaStr: fechaHoyStr },
        update: {
          ultimoNumero: { increment: 1 },
        },
        create: {
          fechaStr: fechaHoyStr,
          ultimoNumero: 1,
        },
      });
      const numeroTurno = secuencia.ultimoNumero;

      // 5. Crear el Turno
      const turno = await tx.turno.create({
        data: {
          numero: numeroTurno,
          fecha: new Date(),
          clienteId: cliente.id,
          vehiculoId: vehiculo.id,
          mecanicoPreferidoId: input.mecanicoPreferidoId || null,
          mecanicoId: input.mecanicoPreferidoId || null, // Si tiene preferido, preasignado
          motivo: input.motivo,
          estado: EstadoTurno.AGENDADO,
        },
        include: {
          cliente: true,
          vehiculo: true,
          mecanicoPreferido: {
            select: { id: true, nombre: true, apellido: true },
          },
        },
      });

      // 6. Registrar en el Historial del turno
      await tx.historialTurno.create({
        data: {
          turnoId: turno.id,
          accion: AccionHistorial.TURNO_CREADO,
          estadoNuevo: EstadoTurno.AGENDADO,
          metadata: {
            motivo: input.motivo,
            placa: placaNorm,
            cliente: input.nombre,
          },
        },
      });

      // 7. Generar Notificación para el cliente
      const mensajeNotif = notificationService.buildMensaje(
        TipoNotificacion.TURNO_CREADO,
        turno.numero
      );
      await notificationService.crearNotificacion(
        {
          turnoId: turno.id,
          tipo: TipoNotificacion.TURNO_CREADO,
          mensaje: mensajeNotif,
          telefonoCliente: cliente.celular,
          clienteNombre: cliente.nombre,
          turnoNumero: turno.numero,
        },
        tx
      );

      // 8. Emitir evento Socket.IO
      socketEvents.emitTurnoCreado(turno);

      return turno;
    });
  },

  /**
   * Consulta pública de turno por número de turno + placa
   * Devuelve únicamente información pública segura
   */
  async consultarTurno(input: ConsultarTurnoInput): Promise<TurnoPublicInfo> {
    const placaNorm = normalizarPlaca(input.placa);
    if (!placaNorm) {
      throw new ValidationError("Formato de placa inválido");
    }

    const turno = await prisma.turno.findFirst({
      where: {
        numero: input.numeroTurno,
        vehiculo: {
          placa: placaNorm,
        },
      },
      include: {
        vehiculo: true,
        mecanicoAsignado: {
          select: { nombre: true, apellido: true },
        },
        diagnosticos: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            descripcion: true,
            observaciones: true,
            trabajoRealizado: true,
            recomendaciones: true,
            createdAt: true,
          },
        },
        calificacion: {
          select: { estrellas: true, comentario: true },
        },
      },
    });

    if (!turno) {
      throw new NotFoundError(
        `No se encontró ningún turno con el número #${input.numeroTurno} y la placa ${placaNorm}`
      );
    }

    const fecha = new Date(turno.fecha);

    return {
      numero: turno.numero,
      fecha: getFechaStr(fecha),
      hora: fecha.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      estado: turno.estado,
      motivo: turno.motivo,
      mecanicoAsignado: turno.mecanicoAsignado
        ? {
            nombre: turno.mecanicoAsignado.nombre,
            apellido: turno.mecanicoAsignado.apellido,
          }
        : null,
      vehiculo: {
        placa: turno.vehiculo.placa,
        marca: turno.vehiculo.marca,
        modelo: turno.vehiculo.modelo,
        color: turno.vehiculo.color,
      },
      diagnosticos: turno.diagnosticos.map((d) => ({
        id: d.id,
        descripcion: d.descripcion,
        observaciones: d.observaciones,
        trabajoRealizado: d.trabajoRealizado,
        recomendaciones: d.recomendaciones,
        fecha: d.createdAt.toISOString(),
      })),
      calificacion: turno.calificacion
        ? {
            estrellas: turno.calificacion.estrellas,
            comentario: turno.calificacion.comentario,
          }
        : null,
    };
  },

  /**
   * Tomar turno por un mecánico (con protección estricta contra concurrencia)
   */
  async tomarTurno(turnoId: string, mecanicoId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validar mecánico activo y disponible
      const mecanico = await tx.usuario.findUnique({
        where: { id: mecanicoId },
      });

      if (!mecanico || mecanico.rol !== RolUsuario.MECANICO || !mecanico.activo) {
        throw new ForbiddenError("El usuario no es un mecánico activo");
      }

      if (mecanico.disponible === EstadoMecanico.EN_ATENCION) {
        throw new ConflictError(
          "MECHANIC_BUSY",
          "Ya tienes un turno en atención. Finaliza o reagenda el turno actual antes de tomar otro."
        );
      }

      // 2. Verificar existencia del turno
      const turnoExistente = await tx.turno.findUnique({
        where: { id: turnoId },
        include: { cliente: true },
      });

      if (!turnoExistente) {
        throw new NotFoundError("El turno solicitado no existe");
      }

      // Regla de mecánico preferido: si tiene un mecánico preferido distinto, rechazar
      if (
        turnoExistente.mecanicoPreferidoId &&
        turnoExistente.mecanicoPreferidoId !== mecanicoId
      ) {
        throw new ForbiddenError(
          "Este turno está asignado a otro mecánico por preferencia expresa del cliente."
        );
      }

      // 3. ACTUALIZACIÓN ATÓMICA CON CONDICIÓN (Protección de concurrencia)
      // Si otro mecánico ya tomó el turno una milésima de segundo antes, updateMany retornará count = 0
      const updateResult = await tx.turno.updateMany({
        where: {
          id: turnoId,
          mecanicoId: null, // Debe seguir sin asignar
          estado: {
            in: [EstadoTurno.AGENDADO, EstadoTurno.EN_ESPERA, EstadoTurno.REAGENDADO],
          },
        },
        data: {
          mecanicoId: mecanicoId,
          estado: EstadoTurno.EN_ATENCION,
          updatedAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictError(
          "TURN_ALREADY_ASSIGNED",
          "El turno ya fue asignado a otro mecánico."
        );
      }

      // 4. Actualizar estado del mecánico a EN_ATENCION
      await tx.usuario.update({
        where: { id: mecanicoId },
        data: { disponible: EstadoMecanico.EN_ATENCION },
      });

      // 5. Registrar Historial
      await tx.historialTurno.create({
        data: {
          turnoId: turnoId,
          usuarioId: mecanicoId,
          accion: AccionHistorial.TURNO_TOMADO,
          estadoAnterior: turnoExistente.estado,
          estadoNuevo: EstadoTurno.EN_ATENCION,
        },
      });

      // 6. Notificar al cliente
      const mensajeNotif = notificationService.buildMensaje(
        TipoNotificacion.MECANICO_DISPONIBLE,
        turnoExistente.numero
      );
      await notificationService.crearNotificacion(
        {
          turnoId: turnoId,
          tipo: TipoNotificacion.MECANICO_DISPONIBLE,
          mensaje: mensajeNotif,
          telefonoCliente: turnoExistente.cliente.celular,
          clienteNombre: turnoExistente.cliente.nombre,
          turnoNumero: turnoExistente.numero,
        },
        tx
      );

      // 7. Obtener turno actualizado con relaciones
      const turnoActualizado = await tx.turno.findUnique({
        where: { id: turnoId },
        include: {
          cliente: true,
          vehiculo: true,
          mecanicoAsignado: {
            select: { id: true, nombre: true, apellido: true },
          },
        },
      });

      // 8. Emitir WebSockets
      socketEvents.emitTurnoAsignado(turnoActualizado);
      socketEvents.emitTurnoAtencion(turnoActualizado);

      return turnoActualizado;
    });
  },

  /**
   * Llamar al cliente para iniciar atención en el taller
   */
  async llamarCliente(turnoId: string, mecanicoId: string) {
    return await prisma.$transaction(async (tx) => {
      const turno = await tx.turno.findUnique({
        where: { id: turnoId },
        include: { cliente: true },
      });

      if (!turno) {
        throw new NotFoundError("Turno no encontrado");
      }

      if (turno.mecanicoId && turno.mecanicoId !== mecanicoId) {
        throw new ForbiddenError("No puedes llamar un turno asignado a otro mecánico");
      }

      const estadoAnterior = turno.estado;
      const turnoActualizado = await tx.turno.update({
        where: { id: turnoId },
        data: {
          estado: EstadoTurno.LLAMADO,
          updatedAt: new Date(),
        },
        include: {
          cliente: true,
          vehiculo: true,
          mecanicoAsignado: {
            select: { id: true, nombre: true, apellido: true },
          },
        },
      });

      await tx.historialTurno.create({
        data: {
          turnoId,
          usuarioId: mecanicoId,
          accion: AccionHistorial.ATENCION_INICIADA,
          estadoAnterior,
          estadoNuevo: EstadoTurno.LLAMADO,
        },
      });

      socketEvents.emitTurnoActualizado(turnoActualizado);

      return turnoActualizado;
    });
  },

  /**
   * Marcar vehículo listo para entrega
   */
  async marcarListo(turnoId: string, mecanicoId: string) {
    return await prisma.$transaction(async (tx) => {
      const turno = await tx.turno.findUnique({
        where: { id: turnoId },
        include: { cliente: true },
      });

      if (!turno) {
        throw new NotFoundError("Turno no encontrado");
      }

      if (turno.mecanicoId !== mecanicoId) {
        throw new ForbiddenError("No puedes modificar un turno que no te pertenece");
      }

      const estadoAnterior = turno.estado;
      const turnoActualizado = await tx.turno.update({
        where: { id: turnoId },
        data: {
          estado: EstadoTurno.LISTO,
          updatedAt: new Date(),
        },
        include: { cliente: true, vehiculo: true },
      });

      await tx.historialTurno.create({
        data: {
          turnoId,
          usuarioId: mecanicoId,
          accion: AccionHistorial.TURNO_LISTO,
          estadoAnterior,
          estadoNuevo: EstadoTurno.LISTO,
        },
      });

      const mensaje = notificationService.buildMensaje(
        TipoNotificacion.VEHICULO_LISTO,
        turno.numero
      );
      await notificationService.crearNotificacion(
        {
          turnoId,
          tipo: TipoNotificacion.VEHICULO_LISTO,
          mensaje,
          telefonoCliente: turno.cliente.celular,
          clienteNombre: turno.cliente.nombre,
          turnoNumero: turno.numero,
        },
        tx
      );

      socketEvents.emitTurnoListo(turnoActualizado);
      socketEvents.emitTurnoActualizado(turnoActualizado);

      return turnoActualizado;
    });
  },

  /**
   * Finalizar turno y liberar al mecánico a DISPONIBLE
   */
  async finalizarTurno(turnoId: string, mecanicoId: string) {
    return await prisma.$transaction(async (tx) => {
      const turno = await tx.turno.findUnique({
        where: { id: turnoId },
        include: { cliente: true },
      });

      if (!turno) {
        throw new NotFoundError("Turno no encontrado");
      }

      if (turno.mecanicoId !== mecanicoId) {
        throw new ForbiddenError("No puedes finalizar un turno que no te pertenece");
      }

      const estadoAnterior = turno.estado;
      const turnoActualizado = await tx.turno.update({
        where: { id: turnoId },
        data: {
          estado: EstadoTurno.FINALIZADO,
          updatedAt: new Date(),
        },
        include: { cliente: true, vehiculo: true },
      });

      // Liberar al mecánico
      await tx.usuario.update({
        where: { id: mecanicoId },
        data: { disponible: EstadoMecanico.DISPONIBLE },
      });

      await tx.historialTurno.create({
        data: {
          turnoId,
          usuarioId: mecanicoId,
          accion: AccionHistorial.TURNO_FINALIZADO,
          estadoAnterior,
          estadoNuevo: EstadoTurno.FINALIZADO,
        },
      });

      const mensaje = notificationService.buildMensaje(
        TipoNotificacion.TURNO_FINALIZADO,
        turno.numero
      );
      await notificationService.crearNotificacion(
        {
          turnoId,
          tipo: TipoNotificacion.TURNO_FINALIZADO,
          mensaje,
          telefonoCliente: turno.cliente.celular,
          clienteNombre: turno.cliente.nombre,
          turnoNumero: turno.numero,
        },
        tx
      );

      socketEvents.emitTurnoFinalizado(turnoActualizado);
      socketEvents.emitTurnoActualizado(turnoActualizado);

      return turnoActualizado;
    });
  },

  /**
   * Registrar inasistencia del cliente
   */
  async registrarInasistencia(turnoId: string, mecanicoId: string) {
    return await prisma.$transaction(async (tx) => {
      const turno = await tx.turno.findUnique({
        where: { id: turnoId },
      });

      if (!turno) {
        throw new NotFoundError("Turno no encontrado");
      }

      const estadoAnterior = turno.estado;
      const turnoActualizado = await tx.turno.update({
        where: { id: turnoId },
        data: {
          estado: EstadoTurno.NO_ASISTIO,
          updatedAt: new Date(),
        },
      });

      // Si el mecánico estaba en atención de este turno, liberarlo
      if (turno.mecanicoId === mecanicoId) {
        await tx.usuario.update({
          where: { id: mecanicoId },
          data: { disponible: EstadoMecanico.DISPONIBLE },
        });
      }

      await tx.historialTurno.create({
        data: {
          turnoId,
          usuarioId: mecanicoId,
          accion: AccionHistorial.NO_ASISTIO,
          estadoAnterior,
          estadoNuevo: EstadoTurno.NO_ASISTIO,
        },
      });

      socketEvents.emitTurnoActualizado(turnoActualizado);

      return turnoActualizado;
    });
  },

  /**
   * Reagendar turno para el mismo día
   */
  async reagendarTurno(turnoId: string, mecanicoId: string, motivo?: string) {
    return await prisma.$transaction(async (tx) => {
      const turno = await tx.turno.findUnique({
        where: { id: turnoId },
        include: { cliente: true },
      });

      if (!turno) {
        throw new NotFoundError("Turno no encontrado");
      }

      const estadoAnterior = turno.estado;
      const turnoActualizado = await tx.turno.update({
        where: { id: turnoId },
        data: {
          estado: EstadoTurno.REAGENDADO,
          updatedAt: new Date(),
        },
      });

      // Liberar al mecánico si lo tenía en atención
      if (turno.mecanicoId === mecanicoId) {
        await tx.usuario.update({
          where: { id: mecanicoId },
          data: { disponible: EstadoMecanico.DISPONIBLE },
        });
      }

      await tx.historialTurno.create({
        data: {
          turnoId,
          usuarioId: mecanicoId,
          accion: AccionHistorial.TURNO_REAGENDADO,
          estadoAnterior,
          estadoNuevo: EstadoTurno.REAGENDADO,
          metadata: motivo ? { motivo } : undefined,
        },
      });

      const mensaje = notificationService.buildMensaje(
        TipoNotificacion.REAGENDADO,
        turno.numero,
        motivo
      );
      await notificationService.crearNotificacion(
        {
          turnoId,
          tipo: TipoNotificacion.REAGENDADO,
          mensaje,
          telefonoCliente: turno.cliente.celular,
          clienteNombre: turno.cliente.nombre,
          turnoNumero: turno.numero,
        },
        tx
      );

      socketEvents.emitTurnoReagendado(turnoActualizado);
      socketEvents.emitTurnoActualizado(turnoActualizado);

      return turnoActualizado;
    });
  },

  /**
   * Listar todos los turnos con relaciones (para sincronización del front y pantallas generales)
   */
  async listarTurnos(filtro?: { fecha?: string; estado?: EstadoTurno; mecanicoId?: string }) {
    return await prisma.turno.findMany({
      where: {
        ...(filtro?.estado ? { estado: filtro.estado } : {}),
        ...(filtro?.mecanicoId ? { mecanicoId: filtro.mecanicoId } : {}),
        ...(filtro?.fecha ? { fecha: filtro.fecha } : {}),
      },
      include: {
        cliente: true,
        vehiculo: true,
        mecanicoAsignado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            identificacion: true,
          },
        },
        mecanicoPreferido: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            identificacion: true,
          },
        },
        diagnosticos: {
          orderBy: { createdAt: "asc" },
        },
        calificacion: true,
        historial: {
          orderBy: { createdAt: "desc" },
        },
        notificaciones: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  },
};
