import { describe, it, expect } from "vitest";
import {
  validarCedulaEcuatoriana,
  validarPasaporte,
  normalizarCelular,
  normalizarPlaca,
} from "../src/utils/validators.js";

describe("Validadores de Dominio Ecuatoriano", () => {
  describe("Algoritmo de Cédula Ecuatoriana (Módulo 10)", () => {
    it("valida cédulas ecuatorianas reales", () => {
      expect(validarCedulaEcuatoriana("1100000001")).toBe(true);
      expect(validarCedulaEcuatoriana("0848259792")).toBe(true);
      expect(validarCedulaEcuatoriana("1100000000")).toBe(true);
    });

    it("rechaza cédulas con longitud o provincia inválida", () => {
      expect(validarCedulaEcuatoriana("12345")).toBe(false);
      expect(validarCedulaEcuatoriana("9999999999")).toBe(false);
      expect(validarCedulaEcuatoriana("0000000000")).toBe(false);
    });

    it("rechaza cédulas con dígito verificador incorrecto", () => {
      expect(validarCedulaEcuatoriana("1100000009")).toBe(false);
      expect(validarCedulaEcuatoriana("0848259790")).toBe(false);
    });
  });

  describe("Validador de Pasaporte", () => {
    it("acepta pasaportes válidos de 6 a 12 caracteres alfanuméricos", () => {
      expect(validarPasaporte("A1234567")).toBe(true);
      expect(validarPasaporte("PASSPORT12")).toBe(true);
      expect(validarPasaporte("ECU123456")).toBe(true);
    });

    it("rechaza pasaportes muy cortos o con caracteres no permitidos", () => {
      expect(validarPasaporte("123")).toBe(false);
      expect(validarPasaporte("ABC-1234")).toBe(false);
    });
  });

  describe("Normalizador de Celular", () => {
    it("convierte números locales a formato internacional E.164 (+593...)", () => {
      expect(normalizarCelular("0991234567")).toBe("+593991234567");
      expect(normalizarCelular("0987654321")).toBe("+593987654321");
      expect(normalizarCelular("+593991234567")).toBe("+593991234567");
      expect(normalizarCelular("593991234567")).toBe("+593991234567");
    });

    it("rechaza números de teléfono fijo o longitudes incorrectas", () => {
      expect(normalizarCelular("022345678")).toBeNull();
      expect(normalizarCelular("12345")).toBeNull();
    });
  });

  describe("Normalizador de Placa", () => {
    it("convierte a mayúsculas y remueve guiones", () => {
      expect(normalizarPlaca("pbx-1024")).toBe("PBX1024");
      expect(normalizarPlaca("abc 1234")).toBe("ABC1234");
      expect(normalizarPlaca("xyz987")).toBe("XYZ987");
    });

    it("rechaza placas con formato inválido", () => {
      expect(normalizarPlaca("1234ABC")).toBeNull();
      expect(normalizarPlaca("AB-12")).toBeNull();
    });
  });
});
