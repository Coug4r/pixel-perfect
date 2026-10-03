import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/errors.js";

export function validateBody(schema: ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }));
        next(new ValidationError("Error de validación en el cuerpo de la solicitud", details));
        return;
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }));
        next(new ValidationError("Error de validación en los parámetros de consulta", details));
        return;
      }
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }));
        next(new ValidationError("Error de validación en los parámetros de la URL", details));
        return;
      }
      next(error);
    }
  };
}
