import { useMemo, useSyncExternalStore } from "react";
import { turnoStore } from "@/services/turnoStore";
import { turnoActions, primerTurnoGeneral, ordenarPorActualizacion } from "@/services/turnoService";
import { MECANICOS } from "@/data";

/** Acceso de solo lectura al estado del taller + acciones. Desacoplado de la fuente de datos. */
export function useTurnos() {
  const state = useSyncExternalStore(turnoStore.subscribe, turnoStore.getState, turnoStore.getServerState);
  return useMemo(() => {
    // Ordenar por última modificación (updatedAt más reciente primero)
    const turnosOrdenados = [...state.turnos].sort(ordenarPorActualizacion);
    const activeMecanicos = state.mecanicos && state.mecanicos.length > 0 ? state.mecanicos : MECANICOS;
    return {
      ...state,
      turnos: turnosOrdenados,
      mecanicos: activeMecanicos,
      primerGeneral: primerTurnoGeneral(state),
      getCliente: (id: string) => state.clientes.find((c) => c.id === id),
      getMecanico: (id: string | null) =>
        id ? activeMecanicos.find((m) => m.id === id || m.cedula === id) : undefined,
      getDiagnostico: (turnoId: string) =>
        state.diagnosticos.filter((d) => d.turnoId === turnoId).slice(-1)[0],
      getDiagnosticos: (turnoId: string) =>
        state.diagnosticos.filter((d) => d.turnoId === turnoId).sort((a, b) => b.fecha.localeCompare(a.fecha)),
      getCalificacion: (turnoId: string) => state.calificaciones.find((c) => c.turnoId === turnoId),
      notificacionesDe: (turnoId: string) =>
        state.notificaciones.filter((n) => n.turnoId === turnoId).sort((a, b) => a.fecha.localeCompare(b.fecha)),
      actions: turnoActions,
    };
  }, [state]);
}
