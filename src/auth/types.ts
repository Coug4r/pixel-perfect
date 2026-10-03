export type Rol = "mecanico" | "superadmin";

export interface AuthUser {
  id: string;
  cedula: string;
  nombre: string;
  rol: Rol;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt: number;
}
