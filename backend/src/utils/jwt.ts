import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthenticatedUser } from "../types/index.js";

export function signToken(user: AuthenticatedUser): string {
  const payload = {
    userId: user.userId,
    role: user.role,
    identificacion: user.identificacion,
    nombre: user.nombre,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthenticatedUser {
  return jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
}
