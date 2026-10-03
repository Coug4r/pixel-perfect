import type { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.service.js";
import { apiResponse } from "../utils/response.js";

export const adminController = {
  async getHistorial(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getHistorial(req.query as any);
      return apiResponse.success(res, result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  },

  async getCalificaciones(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getCalificaciones(req.query as any);
      return apiResponse.success(res, result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  },

  async getDiagnosticos(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getDiagnosticos(req.query as any);
      return apiResponse.success(res, result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  },
};
