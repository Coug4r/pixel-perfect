import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validators/auth.validator.js";
import { loginRateLimiter } from "../middlewares/rateLimit.middleware.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  loginRateLimiter,
  validateBody(loginSchema),
  authController.login
);
