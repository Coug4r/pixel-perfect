import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors.js";
import { apiResponse } from "../utils/response.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // Manejo de errores controlados de la aplicación
  if (err instanceof AppError) {
    return apiResponse.error(res, err.message, err.statusCode, err.code, err.details);
  }

  // Manejo de errores específicos de Prisma ORM
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target) ? err.meta?.target.join(", ") : "campo único";
      return apiResponse.error(
        res,
        `Ya existe un registro con el mismo valor para: ${target}`,
        409,
        "DUPLICATE_ENTRY"
      );
    }
    if (err.code === "P2025") {
      return apiResponse.error(
        res,
        "El registro solicitado no existe en la base de datos",
        404,
        "RECORD_NOT_FOUND"
      );
    }
  }

  // Error inesperado del servidor
  console.error("💥 Error no controlado en el servidor:", err);

  const message =
    env.NODE_ENV === "production"
      ? "Ocurrió un error interno en el servidor"
      : err?.message || "Error interno del servidor";

  return apiResponse.error(res, message, 500, "INTERNAL_SERVER_ERROR", {
    ...(env.NODE_ENV !== "production" ? { stack: err?.stack } : {}),
  });
}
