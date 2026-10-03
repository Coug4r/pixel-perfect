import { PrismaClient, RolUsuario, TipoIdentificacion, EstadoTurno, EstadoMecanico, AccionHistorial } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar datos existentes en orden inverso por llaves foráneas
  await prisma.notificacion.deleteMany();
  await prisma.historialTurno.deleteMany();
  await prisma.calificacion.deleteMany();
  await prisma.diagnostico.deleteMany();
  await prisma.turno.deleteMany();
  await prisma.turnoSecuenciaDiaria.deleteMany();
  await prisma.vehiculo.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.usuario.deleteMany();

  console.log("🧹 Base de datos reseteada para poblar datos maestros.");

  // 1. Crear SUPERADMIN
  const superadminPasswordHash = await bcrypt.hash("admin123", 10);
  const superadmin = await prisma.usuario.create({
    data: {
      identificacion: "1100000000",
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      nombre: "Carlos",
      apellido: "Administrador",
      celular: "+593990000000",
      email: "admin@mekaturn.com",
      passwordHash: superadminPasswordHash,
      rol: RolUsuario.SUPERADMIN,
      activo: true,
      disponible: EstadoMecanico.DISPONIBLE,
    },
  });
  console.log(`👤 Superadmin creado: ${superadmin.nombre} (${superadmin.identificacion})`);

  // 2. Crear 3 MECÁNICOS
  const mecanicoPasswordHash = await bcrypt.hash("123456", 10);

  const m1 = await prisma.usuario.create({
    data: {
      identificacion: "1100000001",
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      nombre: "Juan",
      apellido: "Pérez",
      celular: "+593991234561",
      email: "juan.perez@mekaturn.com",
      passwordHash: mecanicoPasswordHash,
      rol: RolUsuario.MECANICO,
      activo: true,
      disponible: EstadoMecanico.DISPONIBLE,
    },
  });

  const m2 = await prisma.usuario.create({
    data: {
      identificacion: "1100000002",
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      nombre: "Carlos",
      apellido: "Mendoza",
      celular: "+593991234562",
      email: "carlos.mendoza@mekaturn.com",
      passwordHash: mecanicoPasswordHash,
      rol: RolUsuario.MECANICO,
      activo: true,
      disponible: EstadoMecanico.DISPONIBLE,
    },
  });

  const m3 = await prisma.usuario.create({
    data: {
      identificacion: "1100000003",
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      nombre: "Roberto",
      apellido: "Gómez",
      celular: "+593991234563",
      email: "roberto.gomez@mekaturn.com",
      passwordHash: mecanicoPasswordHash,
      rol: RolUsuario.MECANICO,
      activo: true,
      disponible: EstadoMecanico.DISPONIBLE,
    },
  });

  console.log("🔧 3 Mecánicos creados exitosamente (1100000001, 1100000002, 1100000003)");

  // 3. Crear Clientes de prueba
  const c1 = await prisma.cliente.create({
    data: {
      identificacion: "1100000004",
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      nombre: "María Fernanda Silva",
      celular: "+593984567890",
    },
  });

  const c2 = await prisma.cliente.create({
    data: {
      identificacion: "1100000005",
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      nombre: "Andrés Benítez",
      celular: "+593976543210",
    },
  });

  const c3 = await prisma.cliente.create({
    data: {
      identificacion: "1100000006",
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      nombre: "Patricia Morales",
      celular: "+593992233445",
    },
  });

  // 4. Crear Vehículos de prueba
  const v1 = await prisma.vehiculo.create({
    data: {
      placa: "PBX1024",
      clienteId: c1.id,
      marca: "Chevrolet",
      modelo: "Sail",
      anio: 2018,
      color: "Plata",
    },
  });

  const v2 = await prisma.vehiculo.create({
    data: {
      placa: "ABC1234",
      clienteId: c2.id,
      marca: "Toyota",
      modelo: "Yaris",
      anio: 2021,
      color: "Blanco",
    },
  });

  const v3 = await prisma.vehiculo.create({
    data: {
      placa: "XYZ9876",
      clienteId: c3.id,
      marca: "Hyundai",
      modelo: "Tucson",
      anio: 2020,
      color: "Negro",
    },
  });

  // 5. Secuencia Diaria
  const hoyStr = new Date().toISOString().split("T")[0]!;
  await prisma.turnoSecuenciaDiaria.create({
    data: {
      fechaStr: hoyStr,
      ultimoNumero: 3,
    },
  });

  // 6. Turnos de prueba
  // Turno 1: En atención por m1
  const t1 = await prisma.turno.create({
    data: {
      numero: 1,
      fecha: new Date(),
      clienteId: c1.id,
      vehiculoId: v1.id,
      mecanicoId: m1.id,
      motivo: "Vibración severa en frenos al superar 60 km/h",
      estado: EstadoTurno.DIAGNOSTICO,
    },
  });

  // Turno 2: Finalizado por m2 con calificación
  const t2 = await prisma.turno.create({
    data: {
      numero: 2,
      fecha: new Date(),
      clienteId: c2.id,
      vehiculoId: v2.id,
      mecanicoId: m2.id,
      motivo: "Mantenimiento preventivo de 40.000 km y cambio de aceite",
      estado: EstadoTurno.FINALIZADO,
    },
  });

  // Turno 3: Pendiente en cola general
  const t3 = await prisma.turno.create({
    data: {
      numero: 3,
      fecha: new Date(),
      clienteId: c3.id,
      vehiculoId: v3.id,
      mecanicoId: null,
      motivo: "Ruidos metálicos en la suspensión delantera derecha",
      estado: EstadoTurno.AGENDADO,
    },
  });

  // 7. Diagnósticos de prueba
  await prisma.diagnostico.create({
    data: {
      turnoId: t1.id,
      mecanicoId: m1.id,
      descripcion: "Desgaste asimétrico de pastillas delanteras y alabeo en disco izquierdo.",
      observaciones: "Se requiere rectificación de disco y cambio de juego de pastillas.",
      trabajoRealizado: "Desmontaje de mordaza e inspección visual.",
      recomendaciones: "Revisar líquido de frenos DOT4 en 5000 km.",
    },
  });

  await prisma.diagnostico.create({
    data: {
      turnoId: t2.id,
      mecanicoId: m2.id,
      descripcion: "Cambio de aceite 10W-30 sintético, filtro de aire y bujías.",
      observaciones: "Motor en óptimas condiciones de compresión.",
      trabajoRealizado: "Reemplazo de consumibles y reseteo de testigo de mantenimiento.",
      recomendaciones: "Siguiente servicio a los 50.000 km.",
    },
  });

  // 8. Calificación de prueba para t2
  await prisma.calificacion.create({
    data: {
      turnoId: t2.id,
      mecanicoId: m2.id,
      clienteId: c2.id,
      estrellas: 5,
      comentario: "Excelente atención de Carlos, muy rápido y el auto quedó como nuevo.",
    },
  });

  // 9. Historiales
  await prisma.historialTurno.createMany({
    data: [
      {
        turnoId: t1.id,
        accion: AccionHistorial.TURNO_CREADO,
        estadoNuevo: EstadoTurno.AGENDADO,
      },
      {
        turnoId: t1.id,
        usuarioId: m1.id,
        accion: AccionHistorial.TURNO_TOMADO,
        estadoAnterior: EstadoTurno.AGENDADO,
        estadoNuevo: EstadoTurno.EN_ATENCION,
      },
      {
        turnoId: t1.id,
        usuarioId: m1.id,
        accion: AccionHistorial.DIAGNOSTICO_AGREGADO,
        estadoAnterior: EstadoTurno.EN_ATENCION,
        estadoNuevo: EstadoTurno.DIAGNOSTICO,
      },
      {
        turnoId: t2.id,
        accion: AccionHistorial.TURNO_CREADO,
        estadoNuevo: EstadoTurno.AGENDADO,
      },
      {
        turnoId: t2.id,
        usuarioId: m2.id,
        accion: AccionHistorial.TURNO_FINALIZADO,
        estadoAnterior: EstadoTurno.LISTO,
        estadoNuevo: EstadoTurno.FINALIZADO,
      },
      {
        turnoId: t3.id,
        accion: AccionHistorial.TURNO_CREADO,
        estadoNuevo: EstadoTurno.AGENDADO,
      },
    ],
  });

  console.log("✅ Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
