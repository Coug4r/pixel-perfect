import { Router } from "express";
import { RolUsuario } from "@prisma/client";
import { mecanicoController } from "../controllers/mecanico.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateQuery } from "../middlewares/validate.middleware.js";
import { mecanicoTurnosQuerySchema } from "../validators/turno.validator.js";

export const mecanicoRouter = Router();

// Todas las rutas de este router requieren autenticación y rol MECANICO
mecanicoRouter.use(requireAuth, requireRole(RolUsuario.MECANICO));

mecanicoRouter.get("/dashboard", mecanicoController.getDashboard);

mecanicoRouter.get(
  "/turnos",
  validateQuery(mecanicoTurnosQuerySchema),
  mecanicoController.getTurnos
);
