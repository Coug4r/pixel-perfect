import type { Diagnostico, EstadoTurno, TallerState, TipoIdentificacion, Turno } from "@/types";
import { turnoStore } from "./turnoStore";
import { buildNotificacion } from "./notificationService";
import { ESTADO_META } from "@/utils/estados";
import { formatHora, formatNumero, horaHoyIso } from "@/utils/format";
import { MECANICOS } from "@/data/mecanicos";
import { api, mapBackendTurno } from "./api";

/** Reglas de negocio de turnos conectadas a PostgreSQL */
export class TurnoError extends Error {}

const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const TRANSICIONES: Partial<Record<EstadoTurno, EstadoTurno[]>> = {
  AGENDADO: ["EN_ESPERA", "NO_ASISTIO", "CANCELADO"],
  REAGENDADO: ["EN_ESPERA", "LLAMADO", "EN_ATENCION", "NO_ASISTIO", "CANCELADO"],
  EN_ESPERA: ["LLAMADO", "EN_ATENCION", "NO_ASISTIO"],
  LLAMADO: ["EN_ATENCION", "NO_ASISTIO"],
  EN_ATENCION: ["DIAGNOSTICO", "FINALIZADO"],
  DIAGNOSTICO: ["DIAGNOSTICO", "LISTO", "FINALIZADO"],
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
    throw new TurnoError(`No se puede pasar de "${ESTADO_META[t.estado]?.label || t.estado}" a "${ESTADO_META[estado]?.label || estado}".`);
  }
}

function assertPropietario(t: Turno, mecanicoId: string) {
  if (t.mecanicoAsignadoId && t.mecanicoAsignadoId !== mecanicoId) {
    throw new TurnoError("Este turno está asignado a otro mecánico.");
  }
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
  const cliente = state.clientes.find((c) => c.id === turno.clienteId);
  return {
    ...state,
    turnos: state.turnos.map((t) => (t.id === turnoId ? updated : t)),
    notificaciones: cliente
      ? [...state.notificaciones, buildNotificacion(updated, cliente, estado)]
      : state.notificaciones,
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

export async function crearTurno(input: CrearTurnoInput): Promise<Turno> {
  const ident = input.identificacion.toUpperCase();
  const placaNorm = input.placa.trim().toUpperCase();

  // Si estamos en el navegador, persistir en PostgreSQL
  if (typeof window !== "undefined") {
    try {
      const res = await api.turnos.crear({
        tipoIdentificacion: input.tipoIdentificacion.toUpperCase() as "CEDULA" | "PASAPORTE",
        identificacion: ident,
        nombre: input.nombre.trim(),
        celular: input.celular.trim(),
        placa: placaNorm,
        motivo: input.problema.trim(),
        mecanicoPreferidoId:
          input.mecanicoPreferidoId &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.mecanicoPreferidoId)
            ? input.mecanicoPreferidoId
            : null,
      });

      const creado = mapBackendTurno(res);
      turnoStore.setState(
        (st) => ({
          ...st,
          turnos: [creado, ...st.turnos.filter((t) => t.id !== creado.id)],
        }),
        { type: "created", turnoId: creado.id }
      );
      await turnoStore.syncWithBackend();
      return creado;
    } catch (err: any) {
      console.error("[crearTurno] Error guardando en backend:", err);
      throw new TurnoError(err.message || "Error al registrar el turno en base de datos.");
    }
  }

  // Fallback para pruebas unitarias / entorno SSR sin backend
  const s = turnoStore.getState();
  const existente = s.clientes.find((c) => c.identificacion.toUpperCase() === ident);
  const cliente = existente
    ? { ...existente, nombre: input.nombre, celular: input.celular }
    : { id: uid("c"), tipoIdentificacion: input.tipoIdentificacion, identificacion: ident, nombre: input.nombre, celular: input.celular };
  const now = new Date().toISOString();
  const creado: Turno = {
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

export async function tomarTurno(turnoId: string, mecanicoId: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      await api.turnos.tomar(turnoId);
      await turnoStore.syncWithBackend();
      return;
    } catch (err: any) {
      console.error("[tomarTurno] Error en backend:", err);
      throw new TurnoError(err.message || "Error al tomar el turno en base de datos.");
    }
  }

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

export async function cambiarEstado(turnoId: string, mecanicoId: string, estado: EstadoTurno): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      if (estado === "LLAMADO") {
        await api.turnos.llamar(turnoId);
      } else if (estado === "LISTO") {
        await api.turnos.marcarListo(turnoId);
      } else if (estado === "FINALIZADO") {
        await api.turnos.finalizar(turnoId);
      } else if (estado === "NO_ASISTIO") {
        await api.turnos.noAsistio(turnoId);
      } else if (estado === "EN_ATENCION") {
        // En backend tomarTurno inicia la atención
      }
      await turnoStore.syncWithBackend();
      return;
    } catch (err: any) {
      console.error("[cambiarEstado] Error en backend:", err);
      throw new TurnoError(err.message || "Error al cambiar estado en base de datos.");
    }
  }

  const t = getTurno(turnoStore.getState(), turnoId);
  assertPropietario(t, mecanicoId);
  assertTransicion(t, estado);
  turnoStore.setState((st) => aplicarEstado(st, turnoId, estado), { type: "updated", turnoId, estado });
}

export type DiagnosticoInput = Pick<Diagnostico, "diagnostico" | "observaciones" | "trabajoRealizado" | "recomendaciones">;

/** Múltiples diagnósticos: guarda cada nuevo diagnóstico en PostgreSQL sin sobrescribir los anteriores */
export async function registrarDiagnostico(turnoId: string, mecanicoId: string, data: DiagnosticoInput): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      await api.turnos.agregarDiagnostico(turnoId, {
        descripcion: data.diagnostico,
        observaciones: data.observaciones,
        trabajoRealizado: data.trabajoRealizado,
        recomendaciones: data.recomendaciones,
      });
      await turnoStore.syncWithBackend();
      return;
    } catch (err: any) {
      console.error("[registrarDiagnostico] Error en backend:", err);
      throw new TurnoError(err.message || "Error al registrar diagnóstico en base de datos.");
    }
  }

  const s = turnoStore.getState();
  const t = getTurno(s, turnoId);
  assertPropietario(t, mecanicoId);
  const now = new Date().toISOString();
  const mec = (s.mecanicos || MECANICOS).find((m) => m.id === mecanicoId);
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
      return aplicarEstado(conDiag, turnoId, "DIAGNOSTICO");
    },
    { type: "updated", turnoId, estado: "DIAGNOSTICO" },
  );
}

export async function reagendar(turnoId: string, mecanicoId: string, hhmm: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      await api.turnos.reagendar(turnoId, `Reagendado para las ${hhmm}`);
      await turnoStore.syncWithBackend();
      return;
    } catch (err: any) {
      console.error("[reagendar] Error en backend:", err);
      throw new TurnoError(err.message || "Error al reagendar en base de datos.");
    }
  }

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

export async function calificar(turnoId: string, estrellas: number, comentario: string): Promise<void> {
  const s = turnoStore.getState();
  const t = getTurno(s, turnoId);

  if (typeof window !== "undefined") {
    try {
      await api.turnos.calificar(turnoId, {
        numeroTurno: t.numero,
        placa: t.placa,
        estrellas,
        comentario,
      });
      await turnoStore.syncWithBackend();
      return;
    } catch (err: any) {
      console.error("[calificar] Error en backend:", err);
      throw new TurnoError(err.message || "Error al registrar calificación en base de datos.");
    }
  }

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
