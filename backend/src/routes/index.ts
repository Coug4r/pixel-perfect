import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { turnoRouter } from "./turno.routes.js";
import { mecanicoRouter } from "./mecanico.routes.js";
import { diagnosticoRouter } from "./diagnostico.routes.js";
import { adminRouter } from "./admin.routes.js";

export const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/turnos", turnoRouter);
apiV1Router.use("/mecanico", mecanicoRouter);
apiV1Router.use("/diagnosticos", diagnosticoRouter);
apiV1Router.use("/admin", adminRouter);
