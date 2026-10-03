import type { Response } from "express";
import type { ApiResponse } from "../types/index.js";

export const apiResponse = {
  success<T>(
    res: Response,
    data: T,
    statusCode = 200,
    pagination?: ApiResponse["pagination"]
  ): Response {
    const payload: ApiResponse<T> = {
      success: true,
      data,
    };
    if (pagination) {
      payload.pagination = pagination;
    }
    return res.status(statusCode).json(payload);
  },

  error(
    res: Response,
    message: string,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    details?: any
  ): Response {
    const payload: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    };
    return res.status(statusCode).json(payload);
  },
};
