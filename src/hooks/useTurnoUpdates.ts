import { useEffect, useRef } from "react";
import { turnoStore, type TurnoEvent } from "@/services/turnoStore";

/** Suscripción a cambios de turnos. Hoy local; mañana puede venir de un WebSocket. */
export function useTurnoUpdates(handler: (e: TurnoEvent) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => turnoStore.onEvent((e) => ref.current(e)), []);
}
