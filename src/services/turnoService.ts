import type { Diagnostico, EstadoTurno, TallerState, TipoIdentificacion, Turno } from "@/types";
import { turnoStore } from "./turnoStore";
import { buildNotificacion } from "./notificationService";
import { ESTADO_META } from "@/utils/estados";
import { formatHora, formatNumero, horaHoyIso } from "@/utils/format";
import { MECANICOS } from "@/data/mecanicos";

/** Reglas de negocio de turnos. Cada función podría delegarse a una API real. */
export class TurnoError extends Error {}

const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const TRANSICIONES: Partial<Record<EstadoTurno, EstadoTurno[]>> = {
  AGENDADO: ["EN_ESPERA", "NO_ASISTIO", "CANCELADO"],
  REAGENDADO: ["EN_ESPERA", "LLAMADO", "EN_ATENCION", "NO_ASISTIO", "CANCELADO"],
  EN_ESPERA: ["LLAMADO", "EN_ATENCION", "NO_ASISTIO"],
  LLAMADO: ["EN_ATENCION", "NO_ASISTIO"],
  EN_ATENCION: ["DIAGNOSTICO"],
  DIAGNOSTICO: ["DIAGNOSTICO", "LISTO"],
  LISTO: ["FINALIZADO"],
  NO_ASISTIO: ["REAGENDADO", "CANCELADO"],
};

export const ordenarPorActualizacion = (a: Turno, b: Turno) =>
  new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() || b.numero - a.numero;

export const ordenarPorHora = (a: Turno, b: Turno) =>
  a.horaProgramada.localeCompare(b.horaProgramada) || a.numero - b.numero;

/** Primer turno sin mecánico asignado, respetando orden de llegada. */
export function primerTurnoGeneral(state: TallerState): Turno | undefined {
  return state.turnos
    .filter((t) => !t.mecanicoAsignadoId && (t.estado === "AGENDADO" || t.estado === "REAGENDADO"))
    .sort(ordenarPorHora)[0];
}

function getTurno(state: TallerState, id: string) {
  const t = state.turnos.find((x) => x.id === id);
  if (!t) throw new TurnoError("Turno no encontrado");
  return t;
}

function assertTransicion(t: Turno, estado: EstadoTurno) {
  if (!TRANSICIONES[t.estado]?.includes(estado)) {
    throw new TurnoError(`No se puede pasar de "${ESTADO_META[t.estado].label}" a "${ESTADO_META[estado].label}".`);
  }
}

function assertPropietario(t: Turno, mecanicoId: string) {
  if (t.mecanicoAsignadoId !== mecanicoId) throw new TurnoError("Este turno está asignado a otro mecánico.");
}

function aplicarEstado(state: TallerState, turnoId: string, estado: EstadoTurno, patch: Partial<Turno> = {}, nota?: string): TallerState {
  const turno = getTurno(state, turnoId);
  const now = new Date().toISOString();
  const updated: Turno = {
    ...turno,
    ...patch,
    estado,
    updatedAt: now,
    historial: [
      ...turno.historial,
      { estado, fecha: now, ...(nota !== undefined ? { nota } : {}) },
    ],
  };
  const cliente = state.clientes.find((c) => c.id === turno.clienteId)!;
  return {
    ...state,
    turnos: state.turnos.map((t) => (t.id === turnoId ? updated : t)),
    notificaciones: [...state.notificaciones, buildNotificacion(updated, cliente, estado)],
  };
}

export interface CrearTurnoInput {
  tipoIdentificacion: TipoIdentificacion;
  identificacion: string;
  nombre: string;
  celular: string;
  placa: string;
  problema: string;
  mecanicoPreferidoId: string | null;
}

export function crearTurno(input: CrearTurnoInput): Turno {
  let creado!: Turno;
  const s = turnoStore.getState();
  const ident = input.identificacion.toUpperCase();
  const placaNorm = input.placa.trim().toUpperCase();
  const existente = s.clientes.find((c) => c.identificacion.toUpperCase() === ident);
  const cliente = existente
    ? { ...existente, nombre: input.nombre, celular: input.celular }
    : { id: uid("c"), tipoIdentificacion: input.tipoIdentificacion, identificacion: ident, nombre: input.nombre, celular: input.celular };
  const now = new Date().toISOString();
  creado = {
    id: uid("t"),
    numero: Math.max(0, ...s.turnos.map((t) => t.numero)) + 1,
    clienteId: cliente.id,
    placa: placaNorm,
    problema: input.problema,
    mecanicoPreferidoId: input.mecanicoPreferidoId,
    mecanicoAsignadoId: input.mecanicoPreferidoId,
    estado: "AGENDADO",
    creadoEn: now,
    horaProgramada: now,
    updatedAt: now,
    historial: [{ estado: "AGENDADO", fecha: now }],
  };
  turnoStore.setState(
    (st) => ({
      ...st,
      clientes: existente ? st.clientes.map((c) => (c.id === cliente.id ? cliente : c)) : [...st.clientes, cliente],
      turnos: [...st.turnos, creado],
      notificaciones: [...st.notificaciones, buildNotificacion(creado, cliente, "AGENDADO")],
    }),
    { type: "created", turnoId: creado.id },
  );
  return creado;
}

export function tomarTurno(turnoId: string, mecanicoId: string) {
  const s = turnoStore.getState();
  const t = getTurno(s, turnoId);
  if (t.mecanicoAsignadoId && t.mecanicoAsignadoId !== mecanicoId) throw new TurnoError("Este turno pertenece a otro mecánico.");
  if (!t.mecanicoAsignadoId) {
    const primero = primerTurnoGeneral(s);
    if (primero && primero.id !== t.id) {
      throw new TurnoError(`Respeta el orden de llegada: primero el turno ${formatNumero(primero.numero)}.`);
    }
  }
  assertTransicion(t, "EN_ESPERA");
  turnoStore.setState((st) => aplicarEstado(st, turnoId, "EN_ESPERA", { mecanicoAsignadoId: mecanicoId }), {
    type: "updated", turnoId, estado: "EN_ESPERA",
  });
}

export function cambiarEstado(turnoId: string, mecanicoId: string, estado: EstadoTurno) {
  const t = getTurno(turnoStore.getState(), turnoId);
  assertPropietario(t, mecanicoId);
  assertTransicion(t, estado);
  turnoStore.setState((st) => aplicarEstado(st, turnoId, estado), { type: "updated", turnoId, estado });
}

export type DiagnosticoInput = Pick<Diagnostico, "diagnostico" | "observaciones" | "trabajoRealizado" | "recomendaciones">;

/** Múltiples diagnósticos: guarda cada nuevo diagnóstico sin sobrescribir los anteriores */
export function registrarDiagnostico(turnoId: string, mecanicoId: string, data: DiagnosticoInput) {
  const s = turnoStore.getState();
  const t = getTurno(s, turnoId);
  assertPropietario(t, mecanicoId);
  const now = new Date().toISOString();
  const mec = MECANICOS.find((m) => m.id === mecanicoId);
  const diag: Diagnostico = {
    id: uid("d"),
    turnoId,
    mecanicoId,
    mecanicoNombre: mec?.nombre,
    fecha: now,
    ...data,
  };

  turnoStore.setState(
    (st) => {
      const conDiag = {
        ...st,
        diagnosticos: [...st.diagnosticos, diag],
      };
      // Si está en atención o en diagnóstico, actualiza el estado y updatedAt
      return aplicarEstado(conDiag, turnoId, "DIAGNOSTICO");
    },
    { type: "updated", turnoId, estado: "DIAGNOSTICO" },
  );
}

export function reagendar(turnoId: string, mecanicoId: string, hhmm: string) {
  const t = getTurno(turnoStore.getState(), turnoId);
  assertPropietario(t, mecanicoId);
  assertTransicion(t, "REAGENDADO");
  const iso = horaHoyIso(hhmm);
  if (new Date(iso).getTime() < Date.now() - 60000) throw new TurnoError("Elige una hora posterior a la actual.");
  turnoStore.setState(
    (st) => aplicarEstado(st, turnoId, "REAGENDADO", { horaProgramada: iso }, `Nueva hora ${formatHora(iso)}`),
    { type: "updated", turnoId, estado: "REAGENDADO" },
  );
}

export function buscarTurno(numero: number, placaOrId: string): Turno | undefined {
  const s = turnoStore.getState();
  const q = placaOrId.trim().toUpperCase().replace(/[\s-]/g, "");
  return s.turnos.find((t) => {
    if (t.numero !== numero) return false;
    const placaClean = t.placa.toUpperCase().replace(/[\s-]/g, "");
    if (placaClean === q) return true;
    const c = s.clientes.find((x) => x.id === t.clienteId);
    return c?.identificacion.toUpperCase() === q;
  });
}

export function calificar(turnoId: string, estrellas: number, comentario: string) {
  const s = turnoStore.getState();
  const t = getTurno(s, turnoId);
  if (t.estado !== "FINALIZADO" || !t.mecanicoAsignadoId) throw new TurnoError("Solo puedes calificar turnos finalizados.");
  if (s.calificaciones.some((c) => c.turnoId === turnoId)) throw new TurnoError("Este turno ya fue calificado.");
  if (estrellas < 1 || estrellas > 5) throw new TurnoError("Selecciona de 1 a 5 estrellas.");
  turnoStore.setState(
    (st) => ({
      ...st,
      calificaciones: [
        ...st.calificaciones,
        { id: uid("r"), turnoId, mecanicoId: t.mecanicoAsignadoId!, estrellas, comentario: comentario.trim().slice(0, 300), fecha: new Date().toISOString() },
      ],
    }),
    { type: "updated", turnoId, estado: t.estado },
  );
}

export function marcarNotificacionesLeidas(turnoId: string) {
  const s = turnoStore.getState();
  if (!s.notificaciones.some((n) => n.turnoId === turnoId && !n.leida)) return;
  turnoStore.setState((st) => ({
    ...st,
    notificaciones: st.notificaciones.map((n) => (n.turnoId === turnoId ? { ...n, leida: true } : n)),
  }));
}

export const turnoActions = {
  crearTurno,
  tomarTurno,
  cambiarEstado,
  registrarDiagnostico,
  reagendar,
  buscarTurno,
  calificar,
  marcarNotificacionesLeidas,
};

