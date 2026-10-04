import type {
  EstadoTurno,
  TallerState,
  Turno,
  Cliente,
  Diagnostico,
  Calificacion,
  Notificacion,
} from "@/types";
import { createSeedState } from "@/data";
import { todayKey } from "@/utils/format";
import { io, Socket } from "socket.io-client";
import {
  api,
  mapBackendTurno,
  mapBackendCliente,
  mapBackendMecanico,
  mapBackendDiagnostico,
  mapBackendCalificacion,
  mapBackendNotificacion,
} from "./api";

export type TurnoEvent =
  | { type: "created"; turnoId: string }
  | { type: "updated"; turnoId: string; estado: EstadoTurno }
  | { type: "sync" };

const KEY = "taller.state.v1";
const serverState = createSeedState();
let state: TallerState = serverState;
let hydrated = false;
let socket: Socket | null = null;
let syncPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();
const eventListeners = new Set<(e: TurnoEvent) => void>();

function notify(events: TurnoEvent[]) {
  listeners.forEach((l) => l());
  events.forEach((e) => eventListeners.forEach((l) => l(e)));
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento no disponible */
  }
}

/**
 * Consulta la base de datos PostgreSQL a través de la API REST del backend
 * y sincroniza el estado local en memoria y en localStorage.
 */
async function syncWithBackend(): Promise<void> {
  if (typeof window === "undefined") return;
  if (syncPromise) {
    return syncPromise;
  }

  syncPromise = (async () => {
    try {
      const [turnosRaw, mecanicosRaw] = await Promise.all([
        api.turnos.listar(),
        api.turnos.mecanicos(),
      ]);

    const turnosMapped = (turnosRaw || []).map(mapBackendTurno);
    const mecanicosMapped = (mecanicosRaw || []).map(mapBackendMecanico);

    // Clientes únicos asociados a los turnos
    const clientesMap = new Map<string, Cliente>();
    for (const tr of turnosRaw || []) {
      if (tr.cliente) {
        clientesMap.set(tr.cliente.id, mapBackendCliente(tr.cliente));
      }
    }
    const clientesMapped = Array.from(clientesMap.values());

    // Extraer diagnósticos
    const diagnosticosMapped: Diagnostico[] = [];
    for (const tr of turnosRaw || []) {
      if (Array.isArray(tr.diagnosticos)) {
        for (const d of tr.diagnosticos) {
          diagnosticosMapped.push(mapBackendDiagnostico(d));
        }
      }
    }

    // Extraer calificaciones
    const calificacionesMapped: Calificacion[] = [];
    for (const tr of turnosRaw || []) {
      if (tr.calificacion) {
        calificacionesMapped.push(mapBackendCalificacion(tr.calificacion));
      }
    }

    // Extraer notificaciones
    const notificacionesMapped: Notificacion[] = [];
    for (const tr of turnosRaw || []) {
      if (Array.isArray(tr.notificaciones)) {
        for (const n of tr.notificaciones) {
          notificacionesMapped.push(mapBackendNotificacion(n));
        }
      }
    }

    state = {
      fecha: todayKey(),
      turnos: turnosMapped,
      mecanicos: mecanicosMapped,
      clientes: clientesMapped,
      diagnosticos: diagnosticosMapped,
      calificaciones: calificacionesMapped,
      notificaciones: notificacionesMapped,
    };

    persist();
    notify([{ type: "sync" }]);
    } catch (err) {
      console.warn("[turnoStore] No se pudo sincronizar con PostgreSQL:", err);
    } finally {
      syncPromise = null;
    }
  })();

  return syncPromise;
}

/**
 * Conexión Socket.IO con el servidor Node.js/Express
 */
function initSocket() {
  if (typeof window === "undefined" || socket) return;
  try {
    const socketUrl = "http://localhost:3000";
    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 20,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      // Sincronizar inmediatamente al conectar
      syncWithBackend();
    });

    const backendEvents = [
      "turno:creado",
      "turno:actualizado",
      "turno:asignado",
      "turno:atencion",
      "turno:diagnostico",
      "turno:listo",
      "turno:finalizado",
      "turno:reagendado",
      "turno:cancelado",
    ];

    for (const ev of backendEvents) {
      socket.on(ev, () => {
        syncWithBackend();
      });
    }
  } catch (err) {
    console.error("[Socket.IO] Error iniciando cliente socket:", err);
  }
}

export const turnoStore = {
  getState: () => state,
  getServerState: () => serverState,
  syncWithBackend,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  onEvent(l: (e: TurnoEvent) => void) {
    eventListeners.add(l);
    return () => {
      eventListeners.delete(l);
    };
  },
  setState(updater: (s: TallerState) => TallerState, event?: TurnoEvent) {
    state = updater(state);
    persist();
    notify(event ? [event] : []);
  },
  reset() {
    state = createSeedState();
    persist();
    notify([{ type: "sync" }]);
    syncWithBackend();
  },
  hydrate() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as TallerState) : null;
      state = parsed && parsed.fecha === todayKey() ? parsed : createSeedState();
    } catch {
      state = createSeedState();
    }
    persist();
    notify([{ type: "sync" }]);

    window.addEventListener("storage", (e) => {
      if (e.key !== KEY || !e.newValue) return;
      const prev = state;
      state = JSON.parse(e.newValue) as TallerState;
      const events: TurnoEvent[] = [];
      for (const t of state.turnos) {
        const old = prev.turnos.find((p) => p.id === t.id);
        if (!old) events.push({ type: "created", turnoId: t.id });
        else if (old.estado !== t.estado) events.push({ type: "updated", turnoId: t.id, estado: t.estado });
      }
      notify(events.length ? events : [{ type: "sync" }]);
    });

    // Iniciar conexión en tiempo real y sincronizar desde PostgreSQL
    initSocket();
    syncWithBackend();
  },
};
