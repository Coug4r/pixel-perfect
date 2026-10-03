import rateLimit from "express-rate-limit";
import { apiResponse } from "../utils/response.js";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // 30 intentos por ventana
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return apiResponse.error(
      res,
      "Demasiados intentos de inicio de sesión. Por favor intenta más tarde.",
      429,
      "TOO_MANY_REQUESTS"
    );
  },
});
