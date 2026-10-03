import type { Request, Response, NextFunction } from "express";
import { diagnosticoService } from "../services/diagnostico.service.js";
import { apiResponse } from "../utils/response.js";
import type { AuthenticatedRequest } from "../types/index.js";

export const diagnosticoController = {
  async crear(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id: turnoId } = req.params;
      const mecanicoId = req.user!.userId;
      const diagnostico = await diagnosticoService.crearDiagnostico(
        turnoId!,
        mecanicoId,
        req.body
      );
      return apiResponse.success(res, diagnostico, 201);
    } catch (error) {
      next(error);
    }
  },

  async getPorTurno(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: turnoId } = req.params;
      const diagnosticos = await diagnosticoService.getDiagnosticos(turnoId!);
      return apiResponse.success(res, diagnosticos, 200);
    } catch (error) {
      next(error);
    }
  },

  async editar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id: diagnosticoId } = req.params;
      const mecanicoId = req.user!.userId;
      const diagnostico = await diagnosticoService.editarDiagnostico(
        diagnosticoId!,
        mecanicoId,
        req.body
      );
      return apiResponse.success(res, diagnostico, 200);
    } catch (error) {
      next(error);
    }
  },
};
