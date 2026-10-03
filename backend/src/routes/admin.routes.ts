import { Router } from "express";
import { RolUsuario } from "@prisma/client";
import { adminController } from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateQuery } from "../middlewares/validate.middleware.js";
import {
  filtroHistorialSchema,
  filtroCalificacionesSchema,
  filtroDiagnosticosSchema,
} from "../validators/admin.validator.js";

export const adminRouter = Router();

// Todas las rutas administrativas requieren autenticación y rol SUPERADMIN exclusivamente
adminRouter.use(requireAuth, requireRole(RolUsuario.SUPERADMIN));

adminRouter.get(
  "/historial",
  validateQuery(filtroHistorialSchema),
  adminController.getHistorial
);

adminRouter.get(
  "/calificaciones",
  validateQuery(filtroCalificacionesSchema),
  adminController.getCalificaciones
);

adminRouter.get(
  "/diagnosticos",
  validateQuery(filtroDiagnosticosSchema),
  adminController.getDiagnosticos
);
