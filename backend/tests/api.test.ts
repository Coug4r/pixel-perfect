import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/password.js";
import { RolUsuario, TipoIdentificacion, EstadoMecanico, EstadoTurno } from "@prisma/client";

let adminToken = "";
let mecanicoToken1 = "";
let mecanicoToken2 = "";
let mecanicoId1 = "";
let mecanicoId2 = "";

beforeAll(async () => {
  // Asegurar usuarios base para los tests
  const passHash = await hashPassword("123456");
  const adminPassHash = await hashPassword("admin123");

  const admin = await prisma.usuario.upsert({
    where: { identificacion: "1100000000" },
    update: { passwordHash: adminPassHash, activo: true, rol: RolUsuario.SUPERADMIN },
    create: {
      identificacion: "1100000000",
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      nombre: "Admin",
      apellido: "Test",
      celular: "+593990000000",
      email: "admintest@mekaturn.com",
      passwordHash: adminPassHash,
      rol: RolUsuario.SUPERADMIN,
      activo: true,
      disponible: EstadoMecanico.DISPONIBLE,
    },
  });

  const mec1 = await prisma.usuario.upsert({
    where: { identificacion: "1100000001" },
    update: { passwordHash: passHash, activo: true, rol: RolUsuario.MECANICO, disponible: EstadoMecanico.DISPONIBLE },
    create: {
      identificacion: "1100000001",
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      nombre: "MecanicoUno",
      apellido: "Test",
      celular: "+593990000001",
      email: "mec1test@mekaturn.com",
      passwordHash: passHash,
      rol: RolUsuario.MECANICO,
      activo: true,
      disponible: EstadoMecanico.DISPONIBLE,
    },
  });
  mecanicoId1 = mec1.id;

  const mec2 = await prisma.usuario.upsert({
    where: { identificacion: "1100000002" },
    update: { passwordHash: passHash, activo: true, rol: RolUsuario.MECANICO, disponible: EstadoMecanico.DISPONIBLE },
    create: {
      identificacion: "1100000002",
      tipoIdentificacion: TipoIdentificacion.CEDULA,
      nombre: "MecanicoDos",
      apellido: "Test",
      celular: "+593990000002",
      email: "mec2test@mekaturn.com",
      passwordHash: passHash,
      rol: RolUsuario.MECANICO,
      activo: true,
      disponible: EstadoMecanico.DISPONIBLE,
    },
  });
  mecanicoId2 = mec2.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("1. Módulo de Autenticación (JWT + bcrypt)", () => {
  it("inicia sesión exitosamente como Superadmin", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identificacion: "1100000000", password: "admin123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.rol).toBe("SUPERADMIN");
    adminToken = res.body.data.accessToken;
  });

  it("inicia sesión exitosamente como Mecánico 1 y Mecánico 2", async () => {
    const res1 = await request(app)
      .post("/api/v1/auth/login")
      .send({ identificacion: "1100000001", password: "123456" });

    expect(res1.status).toBe(200);
    expect(res1.body.data.user.rol).toBe("MECANICO");
    mecanicoToken1 = res1.body.data.accessToken;

    const res2 = await request(app)
      .post("/api/v1/auth/login")
      .send({ identificacion: "1100000002", password: "123456" });

    expect(res2.status).toBe(200);
    mecanicoToken2 = res2.body.data.accessToken;
  });

  it("rechaza inicio de sesión con contraseña incorrecta", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identificacion: "1100000001", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rechaza usuario inexistente", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identificacion: "9999999999", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("rechaza solicitudes a rutas protegidas sin token", async () => {
    const res = await request(app).get("/api/v1/mecanico/dashboard");
    expect(res.status).toBe(401);
  });
});

describe("2. Control de Acceso por Roles (RBAC)", () => {
  it("impide que un Mecánico acceda al historial administrativo", async () => {
    const res = await request(app)
      .get("/api/v1/admin/historial")
      .set("Authorization", `Bearer ${mecanicoToken1}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("impide que un Mecánico acceda a las calificaciones administrativas", async () => {
    const res = await request(app)
      .get("/api/v1/admin/calificaciones")
      .set("Authorization", `Bearer ${mecanicoToken1}`);

    expect(res.status).toBe(403);
  });

  it("permite que el Superadmin acceda a las rutas administrativas", async () => {
    const res = await request(app)
      .get("/api/v1/admin/historial")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("3. Flujo Completo de Turnos, Concurrencia, Diagnósticos y Calificación", () => {
  let createdTurnoId = "";
  let createdTurnoNumero = 0;
  const placaTest = "TTA1024";

  it("crea un nuevo turno como cliente (público)", async () => {
    const res = await request(app)
      .post("/api/v1/turnos")
      .send({
        identificacion: "0848259792",
        tipoIdentificacion: "CEDULA",
        nombre: "Cliente Prueba",
        celular: "0991234567",
        placa: placaTest,
        motivo: "Falla intermitente en aceleración y testigo de motor encendido",
        mecanicoPreferidoId: null,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.numero).toBeGreaterThan(0);
    expect(res.body.data.estado).toBe("AGENDADO");

    createdTurnoId = res.body.data.id;
    createdTurnoNumero = res.body.data.numero;
  });

  it("permite consultar el turno públicamente por número + placa", async () => {
    const res = await request(app)
      .post("/api/v1/turnos/consulta")
      .send({
        numeroTurno: createdTurnoNumero,
        placa: placaTest,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.numero).toBe(createdTurnoNumero);
    expect(res.body.data.vehiculo.placa).toBe(placaTest);
  });

  it("permite a Mecánico 1 tomar el turno disponible", async () => {
    const res = await request(app)
      .post(`/api/v1/turnos/${createdTurnoId}/tomar`)
      .set("Authorization", `Bearer ${mecanicoToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe("EN_ATENCION");
    expect(res.body.data.mecanicoId).toBe(mecanicoId1);
  });

  it("PROTECCIÓN DE CONCURRENCIA: Mecánico 2 intenta tomar el mismo turno simultáneamente y recibe 409", async () => {
    const res = await request(app)
      .post(`/api/v1/turnos/${createdTurnoId}/tomar`)
      .set("Authorization", `Bearer ${mecanicoToken2}`);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("TURN_ALREADY_ASSIGNED");
  });

  it("impide calificar un turno antes de que esté FINALIZADO", async () => {
    const res = await request(app)
      .post(`/api/v1/turnos/${createdTurnoId}/calificacion`)
      .send({
        numeroTurno: createdTurnoNumero,
        placa: placaTest,
        estrellas: 5,
        comentario: "Excelente servicio",
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("TURN_NOT_FINISHED");
  });

  it("Mecánico 1 agrega múltiples diagnósticos al turno", async () => {
    // Diagnóstico 1
    const res1 = await request(app)
      .post(`/api/v1/turnos/${createdTurnoId}/diagnosticos`)
      .set("Authorization", `Bearer ${mecanicoToken1}`)
      .send({
        descripcion: "Fallo en sensor MAF y cuerpo de aceleración sucio",
        observaciones: "Limpieza requerida",
        trabajoRealizado: "Diagnóstico por escáner OBD2",
        recomendaciones: "Limpiar cuerpo de aceleración",
      });

    expect(res1.status).toBe(201);
    expect(res1.body.data.descripcion).toContain("sensor MAF");

    // Diagnóstico 2 (Múltiples diagnósticos sin sobrescribir)
    const res2 = await request(app)
      .post(`/api/v1/turnos/${createdTurnoId}/diagnosticos`)
      .set("Authorization", `Bearer ${mecanicoToken1}`)
      .send({
        descripcion: "Fuga leve en manguera de admisión de aire",
        observaciones: "Ajuste de abrazadera",
      });

    expect(res2.status).toBe(201);

    // Consultar diagnósticos del turno: deben ser 2
    const resList = await request(app).get(`/api/v1/turnos/${createdTurnoId}/diagnosticos`);
    expect(resList.status).toBe(200);
    expect(resList.body.data.length).toBe(2);
  });

  it("Mecánico 1 marca vehículo LISTO", async () => {
    const res = await request(app)
      .patch(`/api/v1/turnos/${createdTurnoId}/listo`)
      .set("Authorization", `Bearer ${mecanicoToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe("LISTO");
  });

  it("Mecánico 1 finaliza el turno y se libera su disponibilidad", async () => {
    const res = await request(app)
      .patch(`/api/v1/turnos/${createdTurnoId}/finalizar`)
      .set("Authorization", `Bearer ${mecanicoToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe("FINALIZADO");

    // Verificar en BD que el mecánico quedó DISPONIBLE
    const mec = await prisma.usuario.findUnique({ where: { id: mecanicoId1 } });
    expect(mec?.disponible).toBe("DISPONIBLE");
  });

  it("Cliente califica el turno finalizado con número + placa", async () => {
    const res = await request(app)
      .post(`/api/v1/turnos/${createdTurnoId}/calificacion`)
      .send({
        numeroTurno: createdTurnoNumero,
        placa: placaTest,
        estrellas: 5,
        comentario: "Trabajo impecable y muy rápido",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estrellas).toBe(5);
  });

  it("impide calificación duplicada en el mismo turno", async () => {
    const res = await request(app)
      .post(`/api/v1/turnos/${createdTurnoId}/calificacion`)
      .send({
        numeroTurno: createdTurnoNumero,
        placa: placaTest,
        estrellas: 4,
        comentario: "Segundo intento",
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ALREADY_RATED");
  });
});
