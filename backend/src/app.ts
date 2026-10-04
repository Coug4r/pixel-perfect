import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { swaggerDocument } from "./config/swagger.js";
import { apiV1Router } from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { NotFoundError } from "./utils/errors.js";

export const app = express();

// Middlewares de seguridad y parsing
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (
    origin === env.FRONTEND_URL ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)
  ) {
    return true;
  }
  return false;
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Documentación OpenAPI / Swagger
app.use("/api/docs", ...swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Rutas de la API v1
app.use("/api/v1", apiV1Router);

// Ruta no encontrada (404)
app.use((_req, _res, next) => {
  next(new NotFoundError("La ruta solicitada no existe"));
});

// Manejo centralizado de errores
app.use(errorHandler);
