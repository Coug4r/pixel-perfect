import type { Calificacion, Turno } from "@/types";

const RATINGS: Record<string, [number, string]> = {
  t1: [5, "Muy buena atención, me explicaron todo con claridad."],
  t2: [4, "Rápido y ordenado."],
};

export function buildSeedCalificaciones(turnos: Turno[]): Calificacion[] {
  return turnos
    .filter((t) => RATINGS[t.id] && t.mecanicoAsignadoId)
    .map((t) => ({
      id: `r_${t.id}`,
      turnoId: t.id,
      mecanicoId: t.mecanicoAsignadoId!,
      estrellas: RATINGS[t.id][0],
      comentario: RATINGS[t.id][1],
      fecha: t.historial[t.historial.length - 1].fecha,
    }));
}
