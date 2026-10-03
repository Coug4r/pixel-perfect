import type { Response, NextFunction } from "express";
import { RolUsuario } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";
import type { AuthenticatedRequest } from "../types/index.js";

export function requireRole(...allowedRoles: RolUsuario[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Usuario no autenticado"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Se requiere uno de los siguientes roles: ${allowedRoles.join(", ")}. Tu rol actual es: ${req.user.role}`
        )
      );
    }

    next();
  };
}
