import type { TallerState } from "@/types";
import { todayKey } from "@/utils/format";
import { CLIENTES } from "./clientes";
import { buildSeedTurnos } from "./turnos";
import { buildSeedDiagnosticos } from "./diagnosticos";
import { buildSeedCalificaciones } from "./calificaciones";
import { buildSeedNotificaciones } from "./notificaciones";

export { MECANICOS } from "./mecanicos";

/** Estado inicial mock del taller para el día actual. Reemplazable por una API. */
export function createSeedState(base = new Date()): TallerState {
  const turnos = buildSeedTurnos(base);
  return {
    fecha: todayKey(base),
    clientes: CLIENTES,
    turnos,
    diagnosticos: buildSeedDiagnosticos(turnos),
    calificaciones: buildSeedCalificaciones(turnos),
    notificaciones: buildSeedNotificaciones(turnos),
  };
}
