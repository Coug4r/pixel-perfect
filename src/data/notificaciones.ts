import type { Notificacion, Turno } from "@/types";
import { mensajeCliente } from "@/utils/estados";

// Genera el historial de mensajes simulados a partir de los cambios de estado.
export function buildSeedNotificaciones(turnos: Turno[]): Notificacion[] {
  return turnos.flatMap((t) =>
    t.historial.map((h, i) => ({
      id: `n_${t.id}_${i}`,
      turnoId: t.id,
      estado: h.estado,
      mensaje: mensajeCliente(h.estado, t),
      fecha: h.fecha,
      canal: "whatsapp-simulado" as const,
      leida: true,
    })),
  );
}
