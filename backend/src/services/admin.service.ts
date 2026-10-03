import { prisma } from "../config/prisma.js";
import type {
  FiltroHistorialInput,
  FiltroCalificacionesInput,
  FiltroDiagnosticosInput,
} from "../validators/admin.validator.js";

export const adminService = {
  /**
   * Consulta paginada del historial de turnos con filtros múltiples
   */
  async getHistorial(filtros: FiltroHistorialInput) {
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filtros.estado) {
      where.estadoNuevo = filtros.estado;
    }

    if (filtros.mecanico) {
      where.usuario = {
        OR: [
          { nombre: { contains: filtros.mecanico, mode: "insensitive" } },
          { apellido: { contains: filtros.mecanico, mode: "insensitive" } },
          { identificacion: { contains: filtros.mecanico } },
        ],
      };
    }

    if (filtros.placa || filtros.cliente || filtros.numeroTurno) {
      where.turno = {};

      if (filtros.placa) {
        where.turno.vehiculo = {
          placa: { contains: filtros.placa, mode: "insensitive" },
        };
      }

      if (filtros.cliente) {
        where.turno.cliente = {
          OR: [
            { nombre: { contains: filtros.cliente, mode: "insensitive" } },
            { identificacion: { contains: filtros.cliente } },
          ],
        };
      }

      if (filtros.numeroTurno) {
        where.turno.numero = filtros.numeroTurno;
      }
    }

    if (filtros.fecha) {
      const inicioDia = new Date(`${filtros.fecha}T00:00:00.000Z`);
      const finDia = new Date(`${filtros.fecha}T23:59:59.999Z`);
      where.createdAt = {
        gte: inicioDia,
        lte: finDia,
      };
    }

    const [total, items] = await Promise.all([
      prisma.historialTurno.count({ where }),
      prisma.historialTurno.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, rol: true },
          },
          turno: {
            include: {
              cliente: { select: { nombre: true, identificacion: true } },
              vehiculo: { select: { placa: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  /**
   * Consulta paginada de calificaciones con filtros
   */
  async getCalificaciones(filtros: FiltroCalificacionesInput) {
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filtros.estrellas) {
      where.estrellas = filtros.estrellas;
    }

    if (filtros.mecanico) {
      where.mecanico = {
        OR: [
          { nombre: { contains: filtros.mecanico, mode: "insensitive" } },
          { apellido: { contains: filtros.mecanico, mode: "insensitive" } },
          { identificacion: { contains: filtros.mecanico } },
        ],
      };
    }

    if (filtros.placa) {
      where.turno = {
        vehiculo: {
          placa: { contains: filtros.placa, mode: "insensitive" },
        },
      };
    }

    if (filtros.fecha) {
      const inicioDia = new Date(`${filtros.fecha}T00:00:00.000Z`);
      const finDia = new Date(`${filtros.fecha}T23:59:59.999Z`);
      where.createdAt = {
        gte: inicioDia,
        lte: finDia,
      };
    }

    const [total, items] = await Promise.all([
      prisma.calificacion.count({ where }),
      prisma.calificacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          mecanico: { select: { id: true, nombre: true, apellido: true } },
          cliente: { select: { id: true, nombre: true } },
          turno: {
            include: { vehiculo: { select: { placa: true } } },
          },
        },
      }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  /**
   * Consulta histórica completa de diagnósticos
   */
  async getDiagnosticos(filtros: FiltroDiagnosticosInput) {
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filtros.mecanico) {
      where.mecanico = {
        OR: [
          { nombre: { contains: filtros.mecanico, mode: "insensitive" } },
          { apellido: { contains: filtros.mecanico, mode: "insensitive" } },
          { identificacion: { contains: filtros.mecanico } },
        ],
      };
    }

    if (filtros.placa || filtros.cliente || filtros.numeroTurno) {
      where.turno = {};

      if (filtros.placa) {
        where.turno.vehiculo = {
          placa: { contains: filtros.placa, mode: "insensitive" },
        };
      }

      if (filtros.cliente) {
        where.turno.cliente = {
          OR: [
            { nombre: { contains: filtros.cliente, mode: "insensitive" } },
            { identificacion: { contains: filtros.cliente } },
          ],
        };
      }

      if (filtros.numeroTurno) {
        where.turno.numero = filtros.numeroTurno;
      }
    }

    if (filtros.fecha) {
      const inicioDia = new Date(`${filtros.fecha}T00:00:00.000Z`);
      const finDia = new Date(`${filtros.fecha}T23:59:59.999Z`);
      where.createdAt = {
        gte: inicioDia,
        lte: finDia,
      };
    }

    const [total, items] = await Promise.all([
      prisma.diagnostico.count({ where }),
      prisma.diagnostico.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          mecanico: { select: { id: true, nombre: true, apellido: true } },
          turno: {
            include: {
              cliente: { select: { nombre: true, identificacion: true } },
              vehiculo: { select: { placa: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },
};
