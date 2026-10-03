import type { Request, Response, NextFunction } from "express";
import { turnoService } from "../services/turno.service.js";
import { apiResponse } from "../utils/response.js";
import type { AuthenticatedRequest } from "../types/index.js";

export const turnoController = {
  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const turno = await turnoService.crearTurno(req.body);
      return apiResponse.success(res, turno, 201);
    } catch (error) {
      next(error);
    }
  },

  async consultar(req: Request, res: Response, next: NextFunction) {
    try {
      const infoPublica = await turnoService.consultarTurno(req.body);
      return apiResponse.success(res, infoPublica, 200);
    } catch (error) {
      next(error);
    }
  },

  async tomar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mecanicoId = req.user!.userId;
      const turno = await turnoService.tomarTurno(id!, mecanicoId);
      return apiResponse.success(res, turno, 200);
    } catch (error) {
      next(error);
    }
  },

  async marcarListo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mecanicoId = req.user!.userId;
      const turno = await turnoService.marcarListo(id!, mecanicoId);
      return apiResponse.success(res, turno, 200);
    } catch (error) {
      next(error);
    }
  },

  async finalizar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mecanicoId = req.user!.userId;
      const turno = await turnoService.finalizarTurno(id!, mecanicoId);
      return apiResponse.success(res, turno, 200);
    } catch (error) {
      next(error);
    }
  },

  async noAsistio(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mecanicoId = req.user!.userId;
      const turno = await turnoService.registrarInasistencia(id!, mecanicoId);
      return apiResponse.success(res, turno, 200);
    } catch (error) {
      next(error);
    }
  },

  async reagendar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mecanicoId = req.user!.userId;
      const { motivo } = req.body || {};
      const turno = await turnoService.reagendarTurno(id!, mecanicoId, motivo);
      return apiResponse.success(res, turno, 200);
    } catch (error) {
      next(error);
    }
  },
};
