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

export type TipoIdentificacion = "cedula" | "pasaporte";

export interface Mecanico {
  id: string;
  cedula: string;
  nombre: string;
  iniciales: string;
  activo: boolean;
}

export interface Cliente {
  id: string;
  tipoIdentificacion: TipoIdentificacion;
  identificacion: string;
  nombre: string;
  celular: string;
}

export interface HistorialEstado {
  estado: EstadoTurno;
  fecha: string;
  nota?: string | undefined;
}

export interface Turno {
  id: string;
  numero: number;
  clienteId: string;
  problema: string;
  mecanicoPreferidoId: string | null;
  mecanicoAsignadoId: string | null;
  estado: EstadoTurno;
  creadoEn: string;
  horaProgramada: string;
  historial: HistorialEstado[];
}

export interface Diagnostico {
  id: string;
  turnoId: string;
  mecanicoId: string;
  diagnostico: string;
  observaciones: string;
  trabajoRealizado: string;
  recomendaciones: string;
  fecha: string;
}

export interface Notificacion {
  id: string;
  turnoId: string;
  estado: EstadoTurno;
  mensaje: string;
  fecha: string;
  canal: "whatsapp-simulado";
  leida: boolean;
}

export interface Calificacion {
  id: string;
  turnoId: string;
  mecanicoId: string;
  estrellas: number;
  comentario: string;
  fecha: string;
}

export interface TallerState {
  fecha: string;
  clientes: Cliente[];
  turnos: Turno[];
  diagnosticos: Diagnostico[];
  notificaciones: Notificacion[];
  calificaciones: Calificacion[];
}
