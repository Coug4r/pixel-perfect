import type { Cliente, EstadoTurno, Notificacion, Turno } from "@/types";
import { mensajeCliente } from "@/utils/estados";

/**
 * Canal de notificaciones. Hoy es una simulación; para producción basta con
 * registrar un canal real (p. ej. WhatsApp Business API) con setNotificationChannel.
 */
export interface NotificationChannel {
  name: string;
  send(payload: { telefono: string; mensaje: string }): void | Promise<void>;
}

const simulatedWhatsApp: NotificationChannel = {
  name: "whatsapp-simulado",
  send: () => {
    /* Simulación: el mensaje solo se guarda en el estado local. */
  },
};

let channel: NotificationChannel = simulatedWhatsApp;

export function setNotificationChannel(c: NotificationChannel) {
  channel = c;
}

export function buildNotificacion(turno: Turno, cliente: Cliente, estado: EstadoTurno): Notificacion {
  const mensaje = mensajeCliente(estado, turno);
  void channel.send({ telefono: cliente.celular, mensaje });
  return {
    id: `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    turnoId: turno.id,
    estado,
    mensaje,
    fecha: new Date().toISOString(),
    canal: "whatsapp-simulado",
    leida: false,
  };
}
