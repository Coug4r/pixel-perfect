import type {
  Turno,
  Cliente,
  Mecanico,
  Diagnostico,
  Calificacion,
  Notificacion,
  TallerState,
  EstadoTurno,
} from "@/types";

export const API_BASE_URL =
  (typeof window !== "undefined" && (window as any).__API_BASE_URL__) ||
  "http://localhost:3000/api/v1";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Obtiene el token de autenticación del almacenamiento local
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("taller.session");
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.token || null;
  } catch {
    return null;
  }
}

/**
 * Función base para solicitudes HTTP con manejo de errores y autorización JWT
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  let data: any = null;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errCode = data?.error?.code || `HTTP_${response.status}`;
    const errMessage =
      data?.error?.message ||
      (typeof data === "string" ? data : response.statusText);
    throw new ApiError(errCode, errMessage, response.status, data?.error?.details);
  }

  // Las respuestas exitosas del backend vienen envueltas en { success: true, data: ... }
  return data?.data !== undefined ? data.data : (data as T);
}

// -------------------------------------------------------------
// MAPPERS: Backend Prisma -> Frontend Types
// -------------------------------------------------------------

export function mapBackendTurno(t: any): Turno {
  return {
    id: t.id,
    numero: t.numero,
    clienteId: t.clienteId,
    placa: t.vehiculo?.placa || t.placa || "N/A",
    problema: t.motivo || t.problema || "Mantenimiento general",
    mecanicoPreferidoId: t.mecanicoPreferidoId || null,
    mecanicoAsignadoId: t.mecanicoId || t.mecanicoAsignadoId || null,
    estado: t.estado as EstadoTurno,
    creadoEn: t.createdAt || t.creadoEn || new Date().toISOString(),
    horaProgramada: t.createdAt || t.horaProgramada || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    historial: Array.isArray(t.historial)
      ? t.historial.map((h: any) => ({
          estado: (h.estadoNuevo || h.estado) as EstadoTurno,
          fecha: h.createdAt || h.fecha || new Date().toISOString(),
          nota: h.metadata?.motivo || h.nota,
        }))
      : [{ estado: t.estado, fecha: t.createdAt || new Date().toISOString() }],
  };
}

export function mapBackendCliente(c: any): Cliente {
  return {
    id: c.id,
    tipoIdentificacion:
      c.tipoIdentificacion?.toLowerCase() === "pasaporte"
        ? "pasaporte"
        : "cedula",
    identificacion: c.identificacion,
    nombre: c.nombre,
    celular: c.celular,
  };
}

export function mapBackendMecanico(m: any): Mecanico {
  const nombreCompleto = `${m.nombre || ""} ${m.apellido || ""}`.trim();
  const p1 = (m.nombre || "")[0] || "";
  const p2 = (m.apellido || "")[0] || "";
  const iniciales = `${p1}${p2}`.toUpperCase() || "MC";

  return {
    id: m.id,
    cedula: m.identificacion || m.cedula,
    nombre: nombreCompleto,
    iniciales,
    activo: m.activo !== false,
  };
}

export function mapBackendDiagnostico(d: any): Diagnostico {
  return {
    id: d.id,
    turnoId: d.turnoId,
    mecanicoId: d.mecanicoId,
    mecanicoNombre: d.mecanico?.nombre || d.mecanicoNombre,
    diagnostico: d.descripcion || d.diagnostico || "",
    observaciones: d.observaciones || "",
    trabajoRealizado: d.trabajoRealizado || "",
    recomendaciones: d.recomendaciones || "",
    fecha: d.createdAt || d.fecha || new Date().toISOString(),
  };
}

export function mapBackendCalificacion(c: any): Calificacion {
  return {
    id: c.id,
    turnoId: c.turnoId,
    mecanicoId: c.mecanicoId,
    estrellas: c.estrellas,
    comentario: c.comentario || "",
    fecha: c.createdAt || c.fecha || new Date().toISOString(),
  };
}

export function mapBackendNotificacion(n: any): Notificacion {
  return {
    id: n.id,
    turnoId: n.turnoId,
    estado: (n.tipo as EstadoTurno) || "AGENDADO",
    mensaje: n.mensaje,
    fecha: n.createdAt || n.fecha || new Date().toISOString(),
    canal: "whatsapp-simulado",
    leida: n.leida || false,
  };
}

// -------------------------------------------------------------
// API CLIENT IMPLEMENTATION
// -------------------------------------------------------------

export const api = {
  // Autenticación
  auth: {
    async login(identificacion: string, password: string) {
      return await request<{
        accessToken: string;
        user: {
          id: string;
          nombre: string;
          apellido?: string;
          identificacion: string;
          rol: "MECANICO" | "SUPERADMIN";
        };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identificacion, password }),
      });
    },
  },

  // Turnos
  turnos: {
    async listar(filtro?: { fecha?: string; estado?: string; mecanicoId?: string }) {
      const query = new URLSearchParams(filtro as any).toString();
      const endpoint = query ? `/turnos?${query}` : "/turnos";
      return await request<any[]>(endpoint);
    },

    async mecanicos() {
      return await request<any[]>("/turnos/mecanicos");
    },

    async crear(input: {
      tipoIdentificacion: "CEDULA" | "PASAPORTE";
      identificacion: string;
      nombre: string;
      celular: string;
      placa: string;
      motivo: string;
      mecanicoPreferidoId?: string | null;
    }) {
      return await request<any>("/turnos", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },

    async consultar(numeroTurno: number, placa: string) {
      return await request<any>("/turnos/consulta", {
        method: "POST",
        body: JSON.stringify({ numeroTurno, placa }),
      });
    },

    async tomar(turnoId: string) {
      return await request<any>(`/turnos/${turnoId}/tomar`, {
        method: "POST",
      });
    },

    async llamar(turnoId: string) {
      return await request<any>(`/turnos/${turnoId}/llamar`, {
        method: "PATCH",
      });
    },

    async marcarListo(turnoId: string) {
      return await request<any>(`/turnos/${turnoId}/listo`, {
        method: "PATCH",
      });
    },

    async finalizar(turnoId: string) {
      return await request<any>(`/turnos/${turnoId}/finalizar`, {
        method: "PATCH",
      });
    },

    async noAsistio(turnoId: string) {
      return await request<any>(`/turnos/${turnoId}/no-asistio`, {
        method: "PATCH",
      });
    },

    async reagendar(turnoId: string, motivo?: string) {
      return await request<any>(`/turnos/${turnoId}/reagendar`, {
        method: "PATCH",
        body: JSON.stringify({ motivo: motivo || "Reagendado por solicitud" }),
      });
    },

    async calificar(
      turnoId: string,
      data: {
        numeroTurno: number;
        placa: string;
        estrellas: number;
        comentario?: string;
      }
    ) {
      return await request<any>(`/turnos/${turnoId}/calificacion`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async agregarDiagnostico(
      turnoId: string,
      data: {
        descripcion: string;
        observaciones?: string;
        trabajoRealizado?: string;
        recomendaciones?: string;
      }
    ) {
      return await request<any>(`/turnos/${turnoId}/diagnosticos`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async getDiagnosticos(turnoId: string) {
      return await request<any[]>(`/turnos/${turnoId}/diagnosticos`);
    },
  },

  // Mecánicos
  mecanico: {
    async dashboard() {
      return await request<{
        turnosPendientesCantidad: number;
        turnosPendientes: any[];
        misTurnosAsignados: any[];
      }>("/mecanico/dashboard");
    },

    async turnos(placa?: string) {
      const endpoint = placa
        ? `/mecanico/turnos?placa=${encodeURIComponent(placa)}`
        : "/mecanico/turnos";
      return await request<{
        enCola: any[];
        diagnosticados: any[];
        finalizados: any[];
      }>(endpoint);
    },
  },

  // Administrador
  admin: {
    async historial(params?: {
      page?: number;
      limit?: number;
      placa?: string;
      mecanico?: string;
      estado?: string;
    }) {
      const query = new URLSearchParams(params as any).toString();
      return await request<any>(`/admin/historial?${query}`);
    },

    async calificaciones(params?: {
      page?: number;
      limit?: number;
      placa?: string;
      mecanico?: string;
      estrellas?: number;
    }) {
      const query = new URLSearchParams(params as any).toString();
      return await request<any>(`/admin/calificaciones?${query}`);
    },

    async diagnosticos(params?: {
      page?: number;
      limit?: number;
      placa?: string;
      mecanico?: string;
    }) {
      const query = new URLSearchParams(params as any).toString();
      return await request<any>(`/admin/diagnosticos?${query}`);
    },
  },
};
