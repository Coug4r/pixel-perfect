import type { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";
import { UnauthorizedError } from "../utils/errors.js";
import type { AuthenticatedRequest } from "../types/index.js";

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Token de autenticación no proporcionado"));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next(new UnauthorizedError("Formato de token inválido"));
    }
    const decoded = verifyToken(token);

    // Verificar que el usuario exista y siga activo en base de datos
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: { id: true, identificacion: true, nombre: true, rol: true, activo: true },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedError("Usuario no encontrado o inactivo");
    }

    req.user = {
      userId: user.id,
      role: user.rol,
      identificacion: user.identificacion,
      nombre: user.nombre,
    };

    next();
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    next(new UnauthorizedError("Token expirado o inválido"));
  }
}
