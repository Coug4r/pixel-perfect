import { prisma } from "../config/prisma.js";
import { TipoNotificacion, CanalNotificacion } from "@prisma/client";

export interface WhatsAppPayload {
  telefono: string;
  mensaje: string;
  clienteNombre?: string;
  turnoNumero?: number;
}

export interface NotificationChannel {
  sendWhatsApp(payload: WhatsAppPayload): Promise<void>;
}

// Implementación simulada de WhatsApp para pruebas y desarrollo
export const mockWhatsAppChannel: NotificationChannel = {
  async sendWhatsApp(payload: WhatsAppPayload): Promise<void> {
    // Simulación: en producción aquí se llamará a la API de WhatsApp Business
    console.log(`[MOCK_WHATSAPP] A ${payload.telefono}: "${payload.mensaje}"`);
  },
};

let activeWhatsAppChannel: NotificationChannel = mockWhatsAppChannel;

export function setWhatsAppChannel(channel: NotificationChannel) {
  activeWhatsAppChannel = channel;
}

export const notificationService = {
  async crearNotificacion(
    params: {
      turnoId: string;
      tipo: TipoNotificacion;
      mensaje: string;
      telefonoCliente?: string;
      clienteNombre?: string;
      turnoNumero?: number;
      canal?: CanalNotificacion;
    },
    prismaClient: any = prisma
  ) {
    const {
      turnoId,
      tipo,
      mensaje,
      telefonoCliente,
      clienteNombre,
      turnoNumero,
      canal = CanalNotificacion.MOCK_WHATSAPP,
    } = params;

    // Guardar notificación en base de datos
    const notif = await prismaClient.notificacion.create({
      data: {
        turnoId,
        tipo,
        mensaje,
        canal,
        leida: false,
      },
    });

    // Despachar por el canal correspondiente (simulación o real)
    if (telefonoCliente && (canal === CanalNotificacion.MOCK_WHATSAPP || canal === CanalNotificacion.APP)) {
      await activeWhatsAppChannel.sendWhatsApp({
        telefono: telefonoCliente,
        mensaje,
        clienteNombre,
        turnoNumero,
      });
    }

    return notif;
  },

  buildMensaje(tipo: TipoNotificacion, turnoNumero: number, extra?: string): string {
    const num = String(turnoNumero).padStart(3, "0");
    switch (tipo) {
      case TipoNotificacion.TURNO_CREADO:
        return `¡Hola! Tu turno #${num} fue agendado exitosamente. Te informaremos de cada avance por este medio.`;
      case TipoNotificacion.MECANICO_DISPONIBLE:
        return `Tu turno #${num} ha sido tomado por un mecánico. Puedes acercarte a la estación del taller.`;
      case TipoNotificacion.DIAGNOSTICO:
        return `El mecánico ha registrado un nuevo diagnóstico para tu vehículo en el turno #${num}.${extra ? ` Detalle: ${extra}` : ""}`;
      case TipoNotificacion.VEHICULO_LISTO:
        return `¡Buenas noticias! Tu vehículo del turno #${num} está listo para ser retirado.`;
      case TipoNotificacion.TURNO_FINALIZADO:
        return `La atención del turno #${num} ha finalizado. ¡Gracias por confiar en MekaTurn! Por favor califica la atención ingresando tu número de turno y placa en nuestro portal.`;
      case TipoNotificacion.REAGENDADO:
        return `Tu turno #${num} ha sido reagendado para hoy más tarde.${extra ? ` Motivo: ${extra}` : ""}`;
      default:
        return `Actualización en tu turno #${num}: ${extra || "Estado actualizado"}`;
    }
  },
};
