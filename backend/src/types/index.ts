import type { Request } from "express";

export type RolUsuario = "MECANICO" | "SUPERADMIN";

export type EstadoTurno =
  | "AGENDADO"
  | "EN_ESPERA"
  | "LLAMADO"
  | "EN_ATENCION"
  | "DIAGNOSTICO"
  | "LISTO"
  | "FINALIZADO"
  | "NO_ASISTIO"
  | "REAGENDADO"
  | "CANCELADO";

export interface AuthenticatedUser {
  userId: string;
  role: RolUsuario;
  identificacion: string;
  nombre: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TurnoPublicInfo {
  numero: number;
  fecha: string;
  hora: string;
  estado: EstadoTurno;
  motivo: string;
  mecanicoAsignado: {
    nombre: string;
    apellido: string;
  } | null;
  vehiculo: {
    placa: string;
    marca?: string | null;
    modelo?: string | null;
    color?: string | null;
  };
  diagnosticos: {
    id: string;
    descripcion: string;
    observaciones?: string | null;
    trabajoRealizado?: string | null;
    recomendaciones?: string | null;
    fecha: string;
  }[];
  calificacion?: {
    estrellas: number;
    comentario?: string | null;
  } | null;
}
