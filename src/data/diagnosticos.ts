import type { Diagnostico, Turno } from "@/types";

const DIAGS: Record<string, Omit<Diagnostico, "id" | "turnoId" | "mecanicoId" | "fecha">> = {
  t1: {
    diagnostico: "Se detectó desgaste en las pastillas de freno delanteras.",
    observaciones: "Se recomienda reemplazo.",
    trabajoRealizado: "Inspección del sistema de frenos.",
    recomendaciones: "Realizar cambio de pastillas.",
  },
  t2: {
    diagnostico: "Aceite degradado y filtro de aire saturado.",
    observaciones: "Resto de niveles en buen estado.",
    trabajoRealizado: "Cambio de aceite 10W-30, filtro de aceite y filtro de aire.",
    recomendaciones: "Próximo cambio a los 5.000 km.",
  },
  t3: {
    diagnostico: "Termostato atascado y nivel de refrigerante bajo.",
    observaciones: "Mangueras sin fugas visibles.",
    trabajoRealizado: "Reemplazo de termostato y recarga de refrigerante.",
    recomendaciones: "Revisar nivel de refrigerante semanalmente durante un mes.",
  },
  t4: {
    diagnostico: "Sensor de oxígeno defectuoso (código P0135).",
    observaciones: "Consumo de combustible elevado.",
    trabajoRealizado: "Escaneo OBD-II y prueba del sensor.",
    recomendaciones: "Reemplazar sensor de oxígeno.",
  },
};

export function buildSeedDiagnosticos(turnos: Turno[]): Diagnostico[] {
  const result: Diagnostico[] = [];
  for (const t of turnos) {
    const data = DIAGS[t.id];
    if (data && t.mecanicoAsignadoId) {
      result.push({
        id: `d_${t.id}`,
        turnoId: t.id,
        mecanicoId: t.mecanicoAsignadoId,
        fecha: t.historial.find((h) => h.estado === "DIAGNOSTICO")?.fecha ?? t.creadoEn,
        diagnostico: data.diagnostico,
        observaciones: data.observaciones,
        trabajoRealizado: data.trabajoRealizado,
        recomendaciones: data.recomendaciones,
      });
    }
  }
  return result;
}
