import type { AuthSession, Rol } from "./types";
import { api } from "@/services/api";

/**
 * Servicio de autenticación conectado directamente al backend PostgreSQL + JWT
 */
export interface AuthService {
  login(cedula: string, password: string): Promise<AuthSession>;
  logout(): Promise<void>;
  getSession(): AuthSession | null;
}

export class AuthError extends Error {}

const SESSION_KEY = "taller.session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const memoryStore = new Map<string, string>();

function getStorage(key: string): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      return localStorage.getItem(key);
    } catch {}
  }
  return memoryStore.get(key) || null;
}

function setStorage(key: string, val: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(key, val);
    } catch {}
  }
  memoryStore.set(key, val);
}

function removeStorage(key: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.removeItem(key);
      sessionStorage.clear();
      window.dispatchEvent(new Event("storage"));
    } catch {}
  }
  memoryStore.delete(key);
}

class RealAuthService implements AuthService {
  async login(cedula: string, password: string): Promise<AuthSession> {
    try {
      const res = await api.auth.login(cedula.trim(), password);
      const rolStr = res.user.rol.toLowerCase() as Rol;
      const session: AuthSession = {
        token: res.accessToken,
        user: {
          id: res.user.id,
          cedula: res.user.identificacion,
          nombre: `${res.user.nombre} ${res.user.apellido || ""}`.trim(),
          rol: rolStr,
        },
        expiresAt: Date.now() + SESSION_TTL_MS,
      };
      setStorage(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (err: any) {
      throw new AuthError(err.message || "Cédula o contraseña incorrecta.");
    }
  }

  async logout() {
    removeStorage(SESSION_KEY);
  }

  getSession(): AuthSession | null {
    try {
      const raw = getStorage(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as AuthSession;
      if (!s?.token || !s.user || (s.user.rol !== "mecanico" && s.user.rol !== "superadmin") || s.expiresAt < Date.now()) {
        removeStorage(SESSION_KEY);
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }
}

export const AUTH_STORAGE_KEY = SESSION_KEY;
export const authService: AuthService = new RealAuthService();

