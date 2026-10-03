import type { Calificacion, Turno } from "@/types";

const RATINGS: Record<string, [number, string]> = {
  t1: [5, "Muy buena atención, me explicaron todo con claridad."],
  t2: [4, "Rápido y ordenado."],
};

export function buildSeedCalificaciones(turnos: Turno[]): Calificacion[] {
  const result: Calificacion[] = [];
  for (const t of turnos) {
    const data = RATINGS[t.id];
    if (data && t.mecanicoAsignadoId) {
      const lastHist = t.historial[t.historial.length - 1];
      result.push({
        id: `r_${t.id}`,
        turnoId: t.id,
        mecanicoId: t.mecanicoAsignadoId,
        estrellas: data[0] ?? 5,
        comentario: data[1] ?? "",
        fecha: lastHist ? lastHist.fecha : t.creadoEn,
      });
    }
  }
  return result;
}
