import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { apiResponse } from "../utils/response.js";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return apiResponse.success(res, result, 200);
    } catch (error) {
      next(error);
    }
  },
};
