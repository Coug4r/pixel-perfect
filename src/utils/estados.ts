import type { EstadoTurno, Turno } from "@/types";
import { formatHora, formatNumero } from "./format";

export const ESTADOS: EstadoTurno[] = [
  "AGENDADO", "EN_ESPERA", "LLAMADO", "EN_ATENCION", "DIAGNOSTICO",
  "LISTO", "FINALIZADO", "NO_ASISTIO", "REAGENDADO", "CANCELADO",
];

export const ESTADO_META: Record<EstadoTurno, { label: string; className: string }> = {
  AGENDADO: { label: "Agendado", className: "bg-status-scheduled/12 text-status-scheduled border-status-scheduled/30" },
  EN_ESPERA: { label: "En espera", className: "bg-status-waiting/15 text-status-waiting border-status-waiting/35" },
  LLAMADO: { label: "Llamado", className: "bg-status-called/15 text-status-called border-status-called/35" },
  EN_ATENCION: { label: "En atención", className: "bg-status-working/12 text-status-working border-status-working/30" },
  DIAGNOSTICO: { label: "Diagnóstico", className: "bg-status-diagnosis/12 text-status-diagnosis border-status-diagnosis/30" },
  LISTO: { label: "Listo", className: "bg-status-ready/15 text-status-ready border-status-ready/35" },
  FINALIZADO: { label: "Finalizado", className: "bg-status-done/10 text-status-done border-status-done/25" },
  NO_ASISTIO: { label: "No asistió", className: "bg-status-noshow/12 text-status-noshow border-status-noshow/30" },
  REAGENDADO: { label: "Reagendado", className: "bg-status-rescheduled/12 text-status-rescheduled border-status-rescheduled/30" },
  CANCELADO: { label: "Cancelado", className: "bg-status-cancelled/10 text-status-cancelled border-status-cancelled/25" },
};

/** Pasos visibles para el cliente. */
export const PROGRESO: EstadoTurno[] = ["AGENDADO", "EN_ESPERA", "EN_ATENCION", "DIAGNOSTICO", "LISTO"];

export function progresoIndex(estado: EstadoTurno): number {
  switch (estado) {
    case "AGENDADO":
    case "REAGENDADO":
      return 0;
    case "EN_ESPERA":
    case "LLAMADO":
      return 1;
    case "EN_ATENCION":
      return 2;
    case "DIAGNOSTICO":
      return 3;
    case "LISTO":
      return 4;
    case "FINALIZADO":
      return 5;
    default:
      return -1;
  }
}

export const ESTADOS_PENDIENTES: EstadoTurno[] = ["AGENDADO", "EN_ESPERA", "LLAMADO", "REAGENDADO"];
export const ESTADOS_EN_ATENCION: EstadoTurno[] = ["EN_ATENCION", "DIAGNOSTICO", "LISTO"];
export const ESTADOS_ACTIVOS: EstadoTurno[] = [...ESTADOS_PENDIENTES, ...ESTADOS_EN_ATENCION];

export function mensajeCliente(estado: EstadoTurno, turno: Pick<Turno, "numero" | "horaProgramada">): string {
  const n = formatNumero(turno.numero);
  switch (estado) {
    case "AGENDADO": return `Hola, tu turno ${n} fue registrado para las ${formatHora(turno.horaProgramada)}. Te avisaremos cada cambio por aquí.`;
    case "EN_ESPERA": return "Tu turno está próximo. Puedes acercarte al taller.";
    case "LLAMADO": return "El mecánico está disponible para atenderte.";
    case "EN_ATENCION": return "Tu vehículo está siendo atendido.";
    case "DIAGNOSTICO": return "El mecánico ha registrado el diagnóstico.";
    case "LISTO": return "Tu vehículo está listo para ser retirado.";
    case "FINALIZADO": return `Atención del turno ${n} finalizada. ¡Gracias! Califica al mecánico desde la consulta de tu turno.`;
    case "NO_ASISTIO": return `No registramos tu asistencia para el turno ${n}. Contáctanos para reagendar.`;
    case "REAGENDADO": return `Tu turno ${n} fue reagendado para las ${formatHora(turno.horaProgramada)}.`;
    case "CANCELADO": return `Tu turno ${n} fue cancelado.`;
  }
}
