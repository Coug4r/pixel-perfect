import { prisma } from "../config/prisma.js";
import { EstadoTurno } from "@prisma/client";

export const mecanicoService = {
  /**
   * Obtiene la información del Dashboard del mecánico
   * NO devuelve calificaciones, comentarios, historial global ni estadísticas administrativas
   */
  async getDashboard(mecanicoId: string) {
    // 1. Turnos en cola general disponibles para asignación (respetando orden de llegada)
    const turnosColaGeneral = await prisma.turno.findMany({
      where: {
        mecanicoId: null,
        estado: {
          in: [EstadoTurno.AGENDADO, EstadoTurno.EN_ESPERA, EstadoTurno.REAGENDADO],
        },
      },
      include: {
        cliente: { select: { nombre: true, celular: true } },
        vehiculo: { select: { placa: true, marca: true, modelo: true } },
      },
      orderBy: [{ fecha: "asc" }, { numero: "asc" }],
    });

    // 2. Turnos asignados a este mecánico específico en curso
    const misTurnosAsignados = await prisma.turno.findMany({
      where: {
        mecanicoId,
        estado: {
          in: [
            EstadoTurno.AGENDADO,
            EstadoTurno.EN_ESPERA,
            EstadoTurno.LLAMADO,
            EstadoTurno.REAGENDADO,
            EstadoTurno.EN_ATENCION,
            EstadoTurno.DIAGNOSTICO,
          ],
        },
      },
      include: {
        cliente: { select: { nombre: true, celular: true } },
        vehiculo: { select: { placa: true, marca: true, modelo: true } },
        diagnosticos: {
          select: { id: true, descripcion: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const cantidadPendientesTotal = turnosColaGeneral.length + misTurnosAsignados.length;

    return {
      turnosPendientesCount: cantidadPendientesTotal,
      turnosColaGeneral,
      misTurnosAsignados,
    };
  },

  /**
   * Obtiene los turnos asignados al mecánico organizados en EN_COLA, DIAGNOSTICADOS, FINALIZADOS
   * Orden obligatorio: updatedAt DESC
   */
  async getTurnos(mecanicoId: string, placaFilter?: string) {
    const whereCondition: any = {
      mecanicoId,
    };

    if (placaFilter) {
      whereCondition.vehiculo = {
        placa: { contains: placaFilter, mode: "insensitive" },
      };
    }

    const todosMisTurnos = await prisma.turno.findMany({
      where: whereCondition,
      include: {
        cliente: true,
        vehiculo: true,
        diagnosticos: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Clasificación en los 3 grupos requeridos
    const estadosEnCola: EstadoTurno[] = [
      EstadoTurno.AGENDADO,
      EstadoTurno.EN_ESPERA,
      EstadoTurno.LLAMADO,
      EstadoTurno.REAGENDADO,
      EstadoTurno.EN_ATENCION,
    ];
    const enCola = todosMisTurnos.filter((t) => estadosEnCola.includes(t.estado));

    const diagnosticados = todosMisTurnos.filter(
      (t) => t.estado === EstadoTurno.DIAGNOSTICO
    );

    const finalizados = todosMisTurnos.filter(
      (t) => t.estado === EstadoTurno.FINALIZADO
    );

    return {
      EN_COLA: enCola,
      DIAGNOSTICADOS: diagnosticados,
      FINALIZADOS: finalizados,
    };
  },
};
