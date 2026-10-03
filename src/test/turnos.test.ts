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

  it("crea un turno correctamente con orden de llegada", () => {
    const turno = crearTurno({
      tipoIdentificacion: "cedula",
      identificacion: "0848259792",
      nombre: "Test Usuario",
      celular: "0991234567",
      problema: "Frenos desgastados y vibración",
      mecanicoPreferidoId: null,
    });

    expect(turno.numero).toBeGreaterThan(0);
    expect(turno.estado).toBe("AGENDADO");
    expect(turno.mecanicoAsignadoId).toBeNull();

    const buscado = buscarTurno(turno.numero, "0848259792");
    expect(buscado).toBeDefined();
    expect(buscado?.id).toBe(turno.id);
  });

  it("permite a un mecánico tomar un turno y cambiar estados", () => {
    const turno = crearTurno({
      tipoIdentificacion: "cedula",
      identificacion: "0340748334",
      nombre: "Carlos Test",
      celular: "0991234567",
      problema: "Revisión general de motor",
      mecanicoPreferidoId: "m1",
    });

    // Iniciar atención
    turnoActions.tomarTurno(turno.id, "m1");
    let state = turnoStore.getState();
    let currentTurno = state.turnos.find((t) => t.id === turno.id);
    expect(currentTurno?.estado).toBe("EN_ESPERA");

    // Pasar a EN_ATENCION
    turnoActions.cambiarEstado(turno.id, "m1", "EN_ATENCION");
    state = turnoStore.getState();
    currentTurno = state.turnos.find((t) => t.id === turno.id);
    expect(currentTurno?.estado).toBe("EN_ATENCION");

    // Registrar Diagnóstico
    turnoActions.registrarDiagnostico(turno.id, "m1", {
      diagnostico: "Desgaste de zapatas traseras.",
      observaciones: "Requiere rectificación.",
      trabajoRealizado: "Inspección de tambores.",
      recomendaciones: "Revisar en 10.000 km.",
    });

    state = turnoStore.getState();
    currentTurno = state.turnos.find((t) => t.id === turno.id);
    expect(currentTurno?.estado).toBe("DIAGNOSTICO");
    const diag = state.diagnosticos.find((d) => d.turnoId === turno.id);
    expect(diag?.diagnostico).toBe("Desgaste de zapatas traseras.");

    // Pasar a LISTO
    turnoActions.cambiarEstado(turno.id, "m1", "LISTO");
    state = turnoStore.getState();
    currentTurno = state.turnos.find((t) => t.id === turno.id);
    expect(currentTurno?.estado).toBe("LISTO");

    // Finalizar
    turnoActions.cambiarEstado(turno.id, "m1", "FINALIZADO");
    state = turnoStore.getState();
    currentTurno = state.turnos.find((t) => t.id === turno.id);
    expect(currentTurno?.estado).toBe("FINALIZADO");

    // Calificar turno finalizado
    turnoActions.calificar(turno.id, 5, "Excelente trabajo");
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
});

describe("Autenticación Desacoplada de Mecánicos", () => {
  it("autentica correctamente con credenciales válidas y rechaza inválidas", async () => {
    const session = await authService.login("1100000001", "123456");
    expect(session.user.rol).toBe("mecanico");
    expect(session.user.cedula).toBe("1100000001");
    expect(session.token).toBeDefined();

    await expect(authService.login("1100000001", "wrongpassword")).rejects.toThrow();
  });
});
