import { useMemo, useSyncExternalStore } from "react";
import { turnoStore } from "@/services/turnoStore";
import { turnoActions, primerTurnoGeneral, ordenarPorHora } from "@/services/turnoService";
import { MECANICOS } from "@/data";

/** Acceso de solo lectura al estado del taller + acciones. Desacoplado de la fuente de datos. */
export function useTurnos() {
  const state = useSyncExternalStore(turnoStore.subscribe, turnoStore.getState, turnoStore.getServerState);
  return useMemo(() => {
    const turnosOrdenados = [...state.turnos].sort(ordenarPorHora);
    return {
      ...state,
      turnos: turnosOrdenados,
      mecanicos: MECANICOS,
      primerGeneral: primerTurnoGeneral(state),
      getCliente: (id: string) => state.clientes.find((c) => c.id === id),
      getMecanico: (id: string | null) => (id ? MECANICOS.find((m) => m.id === id) : undefined),
      getDiagnostico: (turnoId: string) => state.diagnosticos.find((d) => d.turnoId === turnoId),
      getCalificacion: (turnoId: string) => state.calificaciones.find((c) => c.turnoId === turnoId),
      notificacionesDe: (turnoId: string) =>
        state.notificaciones.filter((n) => n.turnoId === turnoId).sort((a, b) => a.fecha.localeCompare(b.fecha)),
      actions: turnoActions,
    };
  }, [state]);
}
