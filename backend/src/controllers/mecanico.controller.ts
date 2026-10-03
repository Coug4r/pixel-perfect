import type { Response, NextFunction } from "express";
import { mecanicoService } from "../services/mecanico.service.js";
import { apiResponse } from "../utils/response.js";
import type { AuthenticatedRequest } from "../types/index.js";

export const mecanicoController = {
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const mecanicoId = req.user!.userId;
      const data = await mecanicoService.getDashboard(mecanicoId);
      return apiResponse.success(res, data, 200);
    } catch (error) {
      next(error);
    }
  },

  async getTurnos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const mecanicoId = req.user!.userId;
      const { placa } = req.query as { placa?: string };
      const data = await mecanicoService.getTurnos(mecanicoId, placa);
      return apiResponse.success(res, data, 200);
    } catch (error) {
      next(error);
    }
  },
};
