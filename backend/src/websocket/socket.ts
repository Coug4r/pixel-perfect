import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { env } from "../config/env.js";

let io: SocketIOServer | null = null;

export function initWebSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    // Unirse a la sala de un turno específico
    socket.on("join:turno", (turnoId: string) => {
      if (turnoId) {
        socket.join(`turno:${turnoId}`);
      }
    });

    // Unirse a la sala de un mecánico
    socket.on("join:mecanico", (mecanicoId: string) => {
      if (mecanicoId) {
        socket.join(`mecanico:${mecanicoId}`);
      }
    });

    socket.on("disconnect", () => {
      // Disconnection handling
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO no ha sido inicializado");
  }
  return io;
}

// Helpers para emitir eventos con tipado consistente
export const socketEvents = {
  emitTurnoCreado(turno: any) {
    if (!io) return;
    io.emit("turno:creado", turno);
  },

  emitTurnoActualizado(turno: any) {
    if (!io) return;
    io.to(`turno:${turno.id}`).emit("turno:actualizado", turno);
    io.emit("turno:actualizado", turno);
  },

  emitTurnoAsignado(turno: any) {
    if (!io) return;
    if (turno.mecanicoId) {
      io.to(`mecanico:${turno.mecanicoId}`).emit("turno:asignado", turno);
    }
    io.to(`turno:${turno.id}`).emit("turno:asignado", turno);
    io.emit("turno:asignado", turno);
  },

  emitTurnoAtencion(turno: any) {
    if (!io) return;
    io.to(`turno:${turno.id}`).emit("turno:atencion", turno);
    io.emit("turno:atencion", turno);
  },

  emitTurnoDiagnostico(turnoId: string, diagnostico: any) {
    if (!io) return;
    io.to(`turno:${turnoId}`).emit("turno:diagnostico", { turnoId, diagnostico });
    io.emit("turno:diagnostico", { turnoId, diagnostico });
  },

  emitTurnoListo(turno: any) {
    if (!io) return;
    io.to(`turno:${turno.id}`).emit("turno:listo", turno);
    io.emit("turno:listo", turno);
  },

  emitTurnoFinalizado(turno: any) {
    if (!io) return;
    io.to(`turno:${turno.id}`).emit("turno:finalizado", turno);
    io.emit("turno:finalizado", turno);
  },

  emitTurnoReagendado(turno: any) {
    if (!io) return;
    io.to(`turno:${turno.id}`).emit("turno:reagendado", turno);
    io.emit("turno:reagendado", turno);
  },

  emitTurnoCancelado(turno: any) {
    if (!io) return;
    io.to(`turno:${turno.id}`).emit("turno:cancelado", turno);
    io.emit("turno:cancelado", turno);
  },
};
