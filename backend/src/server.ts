import { createServer } from "http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { initWebSocket } from "./websocket/socket.js";

const httpServer = createServer(app);

// Inicializar Socket.IO
initWebSocket(httpServer);

async function startServer() {
  try {
    // Probar conexión a la base de datos PostgreSQL mediante Prisma
    await prisma.$connect();
    console.log("✅ Conexión a PostgreSQL establecida exitosamente.");

    httpServer.listen(env.PORT, () => {
      console.log(`🚀 Servidor backend escuchando en: http://localhost:${env.PORT}`);
      console.log(`📄 Documentación Swagger disponible en: http://localhost:${env.PORT}/api/docs`);
      console.log(`⚡ WebSockets (Socket.IO) inicializado.`);
    });
  } catch (error) {
    console.error("💥 Error al iniciar el servidor backend:", error);
    process.exit(1);
  }
}

// Cierre controlado
const shutdown = async () => {
  console.log("\n🛑 Apagando servidor de forma segura...");
  httpServer.close(async () => {
    await prisma.$disconnect();
    console.log("🔌 Conexión a base de datos cerrada.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer();
