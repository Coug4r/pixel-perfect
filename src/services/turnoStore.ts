import type { EstadoTurno, TallerState } from "@/types";
import { createSeedState } from "@/data";
import { todayKey } from "@/utils/format";

/**
 * Almacén local de turnos. Simula el "tiempo real" con suscriptores en memoria
 * y sincronización entre pestañas vía localStorage. Para producción se puede
 * sustituir por un cliente WebSocket que llame a setState/emit.
 */
export type TurnoEvent =
  | { type: "created"; turnoId: string }
  | { type: "updated"; turnoId: string; estado: EstadoTurno }
  | { type: "sync" };

const KEY = "taller.state.v1";
const serverState = createSeedState();
let state: TallerState = serverState;
let hydrated = false;
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

export const turnoStore = {
  getState: () => state,
  getServerState: () => serverState,
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
  },
};
