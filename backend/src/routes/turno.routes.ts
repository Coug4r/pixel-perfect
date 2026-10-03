import { Router } from "express";
import { RolUsuario } from "@prisma/client";
import { turnoController } from "../controllers/turno.controller.js";
import { diagnosticoController } from "../controllers/diagnostico.controller.js";
import { calificacionController } from "../controllers/calificacion.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  validateBody,
  validateParams,
} from "../middlewares/validate.middleware.js";
import {
  crearTurnoSchema,
  consultarTurnoSchema,
  turnoIdParamSchema,
  reagendarTurnoSchema,
} from "../validators/turno.validator.js";
import { crearDiagnosticoSchema } from "../validators/diagnostico.validator.js";
import { crearCalificacionSchema } from "../validators/calificacion.validator.js";

export const turnoRouter = Router();

// --- Rutas públicas para Clientes (SIN JWT) ---
turnoRouter.post(
  "/",
  validateBody(crearTurnoSchema),
  turnoController.crear
);

turnoRouter.post(
  "/consulta",
  validateBody(consultarTurnoSchema),
  turnoController.consultar
);

turnoRouter.post(
  "/:id/calificacion",
  validateParams(turnoIdParamSchema),
  validateBody(crearCalificacionSchema),
  calificacionController.calificar
);

// Consulta de diagnósticos de un turno (público o autenticado)
turnoRouter.get(
  "/:id/diagnosticos",
  validateParams(turnoIdParamSchema),
  diagnosticoController.getPorTurno
);

// --- Rutas protegidas para Mecánicos ---
turnoRouter.post(
  "/:id/tomar",
  requireAuth,
  requireRole(RolUsuario.MECANICO),
  validateParams(turnoIdParamSchema),
  turnoController.tomar
);

turnoRouter.post(
  "/:id/diagnosticos",
  requireAuth,
  requireRole(RolUsuario.MECANICO),
  validateParams(turnoIdParamSchema),
  validateBody(crearDiagnosticoSchema),
  diagnosticoController.crear
);

turnoRouter.patch(
  "/:id/listo",
  requireAuth,
  requireRole(RolUsuario.MECANICO),
  validateParams(turnoIdParamSchema),
  turnoController.marcarListo
);

turnoRouter.patch(
  "/:id/finalizar",
  requireAuth,
  requireRole(RolUsuario.MECANICO),
  validateParams(turnoIdParamSchema),
  turnoController.finalizar
);

turnoRouter.patch(
  "/:id/no-asistio",
  requireAuth,
  requireRole(RolUsuario.MECANICO),
  validateParams(turnoIdParamSchema),
  turnoController.noAsistio
);

turnoRouter.patch(
  "/:id/reagendar",
  requireAuth,
  requireRole(RolUsuario.MECANICO),
  validateParams(turnoIdParamSchema),
  validateBody(reagendarTurnoSchema),
  turnoController.reagendar
);
