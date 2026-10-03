import type { AuthSession } from "./types";
import { MOCK_CREDENTIALS } from "./credentials.mock";
import { MECANICOS } from "@/data/mecanicos";

/**
 * Contrato de autenticación. Para conectar un backend real, crear otra clase
 * que implemente AuthService (fetch a /login, etc.) y exportarla abajo.
 */
export interface AuthService {
  login(cedula: string, password: string): Promise<AuthSession>;
  logout(): Promise<void>;
  getSession(): AuthSession | null;
}

export class AuthError extends Error {}

const SESSION_KEY = "taller.session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

class MockAuthService implements AuthService {
  async login(cedula: string, password: string): Promise<AuthSession> {
    await new Promise((r) => setTimeout(r, 400));
    const cred = MOCK_CREDENTIALS.find((c) => c.cedula === cedula.trim());
    const hash = await sha256(password);
    if (!cred || cred.passwordHash !== hash) {
      throw new AuthError("Cédula o contraseña incorrecta.");
    }

    if (cred.role === "superadmin") {
      const session: AuthSession = {
        token: crypto.randomUUID(),
        user: { id: "superadmin", cedula: cred.cedula, nombre: cred.nombre || "Super Administrador", rol: "superadmin" },
        expiresAt: Date.now() + SESSION_TTL_MS,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    }

    const mecanico = MECANICOS.find((m) => m.id === cred.userId && m.activo);
    if (!mecanico) {
      throw new AuthError("Mecánico inactivo o no registrado.");
    }

    const session: AuthSession = {
      token: crypto.randomUUID(),
      user: { id: mecanico.id, cedula: mecanico.cedula, nombre: mecanico.nombre, rol: "mecanico" },
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  async logout() {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.clear();
      // Dispatch storage event so other tabs/listeners update immediately
      window.dispatchEvent(new Event("storage"));
    } catch {}
  }

  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as AuthSession;
      if (!s?.token || !s.user || (s.user.rol !== "mecanico" && s.user.rol !== "superadmin") || s.expiresAt < Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }
}

export const AUTH_STORAGE_KEY = SESSION_KEY;
export const authService: AuthService = new MockAuthService();
