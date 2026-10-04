import { describe, it, expect, beforeEach } from "vitest";
import { validarCedula, validarPasaporte, validarCelular } from "@/utils/validators";
import { turnoActions, crearTurno, buscarTurno, TRANSICIONES } from "@/services/turnoService";
import { turnoStore } from "@/services/turnoStore";
import { authService } from "@/auth/authService";
import { ESTADOS, progresoIndex } from "@/utils/estados";

describe("Validaciones de Identificación y Celular Ecuatoriano", () => {
  it("valida cédulas ecuatorianas válidas e inválidas", () => {
    // 0848259792 (válida)
    expect(validarCedula("0848259792")).toBe(true);
    // 1100000001 (válida)
    expect(validarCedula("1100000001")).toBe(true);
    // Cédula incompleta o incorrecta
    expect(validarCedula("12345")).toBe(false);
    expect(validarCedula("9999999999")).toBe(false);
  });

  it("valida pasaportes de 6 a 9 caracteres", () => {
    expect(validarPasaporte("A123456")).toBe(true);
    expect(validarPasaporte("PASSPORT9")).toBe(true);
    expect(validarPasaporte("123")).toBe(false);
  });

  it("valida celulares ecuatorianos", () => {
    expect(validarCelular("0991234567")).toBe(true);
    expect(validarCelular("+593991234567")).toBe(true);
    expect(validarCelular("022345678")).toBe(false);
  });
});

describe("Lógica de Turnos y Transición de Estados", () => {
  beforeEach(() => {
    turnoStore.reset();
  });

  it("crea un turno correctamente con orden de llegada", async () => {
    const turno = await crearTurno({
      tipoIdentificacion: "cedula",
      identificacion: "0848259792",
      nombre: "Test Usuario",
      celular: "0991234567",
      placa: "PBX-1024",
      problema: "Frenos desgastados y vibración",
      mecanicoPreferidoId: null,
    });

    expect(turno.numero).toBeGreaterThan(0);
    expect(turno.estado).toBe("AGENDADO");
    expect(turno.placa.replace("-", "")).toBe("PBX1024");
    expect(turno.mecanicoAsignadoId).toBeNull();

    const buscado = buscarTurno(turno.numero, "PBX-1024");
    expect(buscado).toBeDefined();
    expect(buscado?.id).toBe(turno.id);
  });

  it("permite a un mecánico tomar un turno y cambiar estados", async () => {
    const session = await authService.login("1100000001", "123456");
    const mecId = session.user.id;

    const turno = await crearTurno({
      tipoIdentificacion: "cedula",
      identificacion: "0340748334",
      nombre: "Carlos Test",
      celular: "0991234567",
      placa: "ABC-1234",
      problema: "Revisión general de motor",
      mecanicoPreferidoId: null,
    });

    // Iniciar atención (en backend tomarTurno asigna y pasa a EN_ATENCION)
    await turnoActions.tomarTurno(turno.id, mecId);
    let state = turnoStore.getState();
    let currentTurno = state.turnos.find((t) => t.id === turno.id);
    expect(["EN_ESPERA", "EN_ATENCION"]).toContain(currentTurno?.estado);

    // Registrar Diagnóstico 1
    await turnoActions.registrarDiagnostico(turno.id, mecId, {
      diagnostico: "Desgaste de zapatas traseras.",
      observaciones: "Requiere rectificación.",
      trabajoRealizado: "Inspección de tambores.",
      recomendaciones: "Revisar en 10.000 km.",
    });

    state = turnoStore.getState();
    currentTurno = state.turnos.find((t) => t.id === turno.id);
    expect(currentTurno?.estado).toBe("DIAGNOSTICO");
    let diags = state.diagnosticos.filter((d) => d.turnoId === turno.id);
    expect(diags.length).toBeGreaterThanOrEqual(1);

    // Registrar Diagnóstico 2 (Múltiples diagnósticos conservados)
    await turnoActions.registrarDiagnostico(turno.id, mecId, {
      diagnostico: "Fuga leve en bombín de freno.",
      observaciones: "Se procede con purgado y cambio de retén.",
      trabajoRealizado: "Reemplazo de retén.",
      recomendaciones: "Probar frenos en 500 km.",
    });

    state = turnoStore.getState();
    diags = state.diagnosticos.filter((d) => d.turnoId === turno.id);
    expect(diags.length).toBeGreaterThanOrEqual(2);

    // Pasar a LISTO
    await turnoActions.cambiarEstado(turno.id, mecId, "LISTO");
    state = turnoStore.getState();
    currentTurno = state.turnos.find((t) => t.id === turno.id);
    expect(currentTurno?.estado).toBe("LISTO");

    // Finalizar
    await turnoActions.cambiarEstado(turno.id, mecId, "FINALIZADO");
    state = turnoStore.getState();
    currentTurno = state.turnos.find((t) => t.id === turno.id);
    expect(currentTurno?.estado).toBe("FINALIZADO");

    // Calificar turno finalizado
    await turnoActions.calificar(turno.id, 5, "Excelente trabajo");
    state = turnoStore.getState();
    const cal = state.calificaciones.find((c) => c.turnoId === turno.id);
    expect(cal?.estrellas).toBe(5);
    expect(cal?.comentario).toBe("Excelente trabajo");
  });

  it("calcula correctamente el progreso para el stepper del cliente", () => {
    expect(progresoIndex("AGENDADO")).toBe(0);
    expect(progresoIndex("EN_ESPERA")).toBe(1);
    expect(progresoIndex("LLAMADO")).toBe(1);
    expect(progresoIndex("EN_ATENCION")).toBe(2);
    expect(progresoIndex("DIAGNOSTICO")).toBe(3);
    expect(progresoIndex("LISTO")).toBe(4);
    expect(progresoIndex("FINALIZADO")).toBe(5);
  });

  it("permite finalizar un turno directamente desde el estado DIAGNOSTICO", async () => {
    const session = await authService.login("1100000001", "123456");
    const mecId = session.user.id;

    const turno = await crearTurno({
      tipoIdentificacion: "cedula",
      identificacion: "0340748334",
      nombre: "Finalizar Test",
      celular: "0991234567",
      placa: "XYZ-9999",
      problema: "Revisión rápida",
      mecanicoPreferidoId: null,
    });

    await turnoActions.tomarTurno(turno.id, mecId);
    await turnoActions.registrarDiagnostico(turno.id, mecId, {
      diagnostico: "Diagnóstico inicial completo.",
      observaciones: "Listo para entrega inmediata.",
      trabajoRealizado: "Ajuste.",
      recomendaciones: "Ninguna.",
    });

    let currentTurno = turnoStore.getState().turnos.find((t) => t.id === turno.id);
    expect(currentTurno?.estado).toBe("DIAGNOSTICO");

    // Botón Finalizar Turno desde DIAGNOSTICO directamente a FINALIZADO
    await turnoActions.cambiarEstado(turno.id, mecId, "FINALIZADO");
    currentTurno = turnoStore.getState().turnos.find((t) => t.id === turno.id);
    expect(currentTurno?.estado).toBe("FINALIZADO");
  });
});

describe("Autenticación Desacoplada: Mecánicos y Superadmin", () => {
  it("autentica correctamente a un mecánico", async () => {
    const session = await authService.login("1100000001", "123456");
    expect(session.user.rol).toBe("mecanico");
    expect(session.user.cedula).toBe("1100000001");
    expect(session.token).toBeDefined();
  });

  it("autentica correctamente al Superadmin", async () => {
    const session = await authService.login("1100000000", "admin123");
    expect(session.user.rol).toBe("superadmin");
    expect(session.user.cedula).toBe("1100000000");
    expect(session.token).toBeDefined();
  });

  it("rechaza contraseñas inválidas", async () => {
    await expect(authService.login("1100000000", "wrongpass")).rejects.toThrow();
  });

  it("cierra sesión y limpia los datos de sesión", async () => {
    await authService.login("1100000001", "123456");
    expect(authService.getSession()).not.toBeNull();
    await authService.logout();
    expect(authService.getSession()).toBeNull();
  });
});
