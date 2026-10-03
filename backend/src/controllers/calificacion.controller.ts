import type { Request, Response, NextFunction } from "express";
import { calificacionService } from "../services/calificacion.service.js";
import { apiResponse } from "../utils/response.js";

export const calificacionController = {
  async calificar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: turnoId } = req.params;
      const calificacion = await calificacionService.calificar(turnoId!, req.body);
      return apiResponse.success(res, calificacion, 201);
    } catch (error) {
      next(error);
    }
  },
};
