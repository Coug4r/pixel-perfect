import type { EstadoTurno, Turno } from "@/types";

function at(base: Date, h: number, m: number) {
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function historial(start: Date, estados: EstadoTurno[]) {
  return estados.map((estado, i) => ({
    estado,
    fecha: new Date(start.getTime() + i * 12 * 60000).toISOString(),
  }));
}

type SeedRow = [string, number, string, string, string, string | null, string | null, [number, number], EstadoTurno[]];

const ROWS: SeedRow[] = [
  ["t1", 1, "c1", "PBX-1024", "Ruido metálico al frenar en las ruedas delanteras.", null, "m1", [8, 1], ["AGENDADO", "EN_ESPERA", "LLAMADO", "EN_ATENCION", "DIAGNOSTICO", "LISTO", "FINALIZADO"]],
  ["t2", 2, "c2", "PCD-3382", "Cambio de aceite y revisión general.", "m1", "m1", [8, 5], ["AGENDADO", "EN_ESPERA", "EN_ATENCION", "DIAGNOSTICO", "LISTO", "FINALIZADO"]],
  ["t3", 3, "c3", "GSX-9912", "El motor se recalienta en el tráfico.", null, "m2", [8, 8], ["AGENDADO", "EN_ESPERA", "EN_ATENCION", "DIAGNOSTICO", "LISTO"]],
  ["t4", 4, "c4", "ABC-1234", "Luz de check engine encendida.", "m2", "m2", [8, 12], ["AGENDADO", "EN_ESPERA", "EN_ATENCION", "DIAGNOSTICO"]],
  ["t5", 5, "c5", "TBA-4455", "Vibración del volante a más de 80 km/h.", "m1", "m1", [8, 30], ["AGENDADO", "EN_ESPERA", "LLAMADO", "EN_ATENCION"]],
  ["t6", 6, "c6", "GYE-8821", "La batería se descarga durante la noche.", null, "m3", [8, 45], ["AGENDADO", "EN_ESPERA", "NO_ASISTIO"]],
  ["t7", 7, "c7", "PDF-5510", "El aire acondicionado no enfría.", null, null, [9, 2], ["AGENDADO"]],
  ["t8", 8, "c8", "MAZ-2045", "Fuga de líquido debajo del motor.", "m1", "m1", [9, 10], ["AGENDADO"]],
  ["t9", 9, "c9", "LBA-7730", "Revisión de suspensión, golpeteo en baches.", "m2", "m2", [9, 20], ["AGENDADO"]],
  ["t10", 10, "c10", "PCH-9090", "Cambio de pastillas y discos de freno.", null, null, [9, 31], ["AGENDADO"]],
];

export function buildSeedTurnos(base: Date): Turno[] {
  return ROWS.map(([id, numero, clienteId, placa, problema, pref, asig, [h, m], estados]) => {
    const creado = at(base, h ?? 8, m ?? 0);
    const ultimoEstado = estados[estados.length - 1] ?? "AGENDADO";
    const hist = historial(creado, estados);
    const lastHistTime = hist[hist.length - 1]?.fecha ?? creado.toISOString();
    return {
      id,
      numero,
      clienteId,
      placa,
      problema,
      mecanicoPreferidoId: pref,
      mecanicoAsignadoId: asig,
      estado: ultimoEstado,
      creadoEn: creado.toISOString(),
      horaProgramada: creado.toISOString(),
      updatedAt: lastHistTime,
      historial: hist,
    };
  });
}
