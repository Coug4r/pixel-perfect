import { Router } from "express";
import { RolUsuario } from "@prisma/client";
import { diagnosticoController } from "../controllers/diagnostico.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  validateParams,
  validateBody,
} from "../middlewares/validate.middleware.js";
import {
  diagnosticoIdParamSchema,
  editarDiagnosticoSchema,
} from "../validators/diagnostico.validator.js";

export const diagnosticoRouter = Router();

diagnosticoRouter.patch(
  "/:id",
  requireAuth,
  requireRole(RolUsuario.MECANICO),
  validateParams(diagnosticoIdParamSchema),
  validateBody(editarDiagnosticoSchema),
  diagnosticoController.editar
);
