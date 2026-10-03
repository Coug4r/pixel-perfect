-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('MECANICO', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "TipoIdentificacion" AS ENUM ('CEDULA', 'PASAPORTE');

-- CreateEnum
CREATE TYPE "EstadoMecanico" AS ENUM ('DISPONIBLE', 'EN_ATENCION', 'FUERA_DE_SERVICIO');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('AGENDADO', 'EN_ESPERA', 'LLAMADO', 'EN_ATENCION', 'DIAGNOSTICO', 'LISTO', 'FINALIZADO', 'NO_ASISTIO', 'REAGENDADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "AccionHistorial" AS ENUM ('TURNO_CREADO', 'TURNO_ASIGNADO', 'TURNO_TOMADO', 'ATENCION_INICIADA', 'DIAGNOSTICO_AGREGADO', 'DIAGNOSTICO_EDITADO', 'TURNO_LISTO', 'TURNO_FINALIZADO', 'NO_ASISTIO', 'TURNO_REAGENDADO', 'TURNO_CANCELADO');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('TURNO_CREADO', 'MECANICO_DISPONIBLE', 'DIAGNOSTICO', 'VEHICULO_LISTO', 'TURNO_FINALIZADO', 'REAGENDADO');

-- CreateEnum
CREATE TYPE "CanalNotificacion" AS ENUM ('APP', 'MOCK_WHATSAPP');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "identificacion" TEXT NOT NULL,
    "tipoIdentificacion" "TipoIdentificacion" NOT NULL DEFAULT 'CEDULA',
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "disponible" "EstadoMecanico" NOT NULL DEFAULT 'DISPONIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "identificacion" TEXT NOT NULL,
    "tipoIdentificacion" "TipoIdentificacion" NOT NULL DEFAULT 'CEDULA',
    "nombre" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "anio" INTEGER,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "mecanicoPreferidoId" TEXT,
    "mecanicoId" TEXT,
    "motivo" TEXT NOT NULL,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'AGENDADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurnoSecuenciaDiaria" (
    "fechaStr" TEXT NOT NULL,
    "ultimoNumero" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TurnoSecuenciaDiaria_pkey" PRIMARY KEY ("fechaStr")
);

-- CreateTable
CREATE TABLE "Diagnostico" (
    "id" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "mecanicoId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "observaciones" TEXT,
    "trabajoRealizado" TEXT,
    "recomendaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calificacion" (
    "id" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "mecanicoId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "estrellas" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialTurno" (
    "id" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" "AccionHistorial" NOT NULL,
    "estadoAnterior" "EstadoTurno",
    "estadoNuevo" "EstadoTurno",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialTurno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "canal" "CanalNotificacion" NOT NULL DEFAULT 'APP',
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_identificacion_key" ON "Usuario"("identificacion");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_identificacion_idx" ON "Usuario"("identificacion");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rol_idx" ON "Usuario"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_identificacion_key" ON "Cliente"("identificacion");

-- CreateIndex
CREATE INDEX "Cliente_identificacion_idx" ON "Cliente"("identificacion");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_placa_key" ON "Vehiculo"("placa");

-- CreateIndex
CREATE INDEX "Vehiculo_placa_idx" ON "Vehiculo"("placa");

-- CreateIndex
CREATE INDEX "Vehiculo_clienteId_idx" ON "Vehiculo"("clienteId");

-- CreateIndex
CREATE INDEX "Turno_numero_idx" ON "Turno"("numero");

-- CreateIndex
CREATE INDEX "Turno_fecha_idx" ON "Turno"("fecha");

-- CreateIndex
CREATE INDEX "Turno_estado_idx" ON "Turno"("estado");

-- CreateIndex
CREATE INDEX "Turno_clienteId_idx" ON "Turno"("clienteId");

-- CreateIndex
CREATE INDEX "Turno_vehiculoId_idx" ON "Turno"("vehiculoId");

-- CreateIndex
CREATE INDEX "Turno_mecanicoId_idx" ON "Turno"("mecanicoId");

-- CreateIndex
CREATE INDEX "Turno_updatedAt_idx" ON "Turno"("updatedAt");

-- CreateIndex
CREATE INDEX "Diagnostico_turnoId_idx" ON "Diagnostico"("turnoId");

-- CreateIndex
CREATE INDEX "Diagnostico_mecanicoId_idx" ON "Diagnostico"("mecanicoId");

-- CreateIndex
CREATE UNIQUE INDEX "Calificacion_turnoId_key" ON "Calificacion"("turnoId");

-- CreateIndex
CREATE INDEX "Calificacion_mecanicoId_idx" ON "Calificacion"("mecanicoId");

-- CreateIndex
CREATE INDEX "Calificacion_clienteId_idx" ON "Calificacion"("clienteId");

-- CreateIndex
CREATE INDEX "Calificacion_estrellas_idx" ON "Calificacion"("estrellas");

-- CreateIndex
CREATE INDEX "HistorialTurno_turnoId_idx" ON "HistorialTurno"("turnoId");

-- CreateIndex
CREATE INDEX "HistorialTurno_usuarioId_idx" ON "HistorialTurno"("usuarioId");

-- CreateIndex
CREATE INDEX "HistorialTurno_createdAt_idx" ON "HistorialTurno"("createdAt");

-- CreateIndex
CREATE INDEX "Notificacion_turnoId_idx" ON "Notificacion"("turnoId");

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_mecanicoPreferidoId_fkey" FOREIGN KEY ("mecanicoPreferidoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_mecanicoId_fkey" FOREIGN KEY ("mecanicoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnostico" ADD CONSTRAINT "Diagnostico_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnostico" ADD CONSTRAINT "Diagnostico_mecanicoId_fkey" FOREIGN KEY ("mecanicoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_mecanicoId_fkey" FOREIGN KEY ("mecanicoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialTurno" ADD CONSTRAINT "HistorialTurno_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialTurno" ADD CONSTRAINT "HistorialTurno_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

