import { z } from "zod";
import type { TipoIdentificacion } from "@/types";

/** Valida cédula ecuatoriana (provincia, tercer dígito y dígito verificador módulo 10). */
export function validarCedula(value: string): boolean {
  if (!/^\d{10}$/.test(value)) return false;
  const provincia = parseInt(value.slice(0, 2), 10);
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) return false;
  if (parseInt(value[2], 10) >= 6) return false;
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let v = parseInt(value[i], 10) * (i % 2 === 0 ? 2 : 1);
    if (v > 9) v -= 9;
    suma += v;
  }
  const verificador = (10 - (suma % 10)) % 10;
  return verificador === parseInt(value[9], 10);
}

/** Pasaporte: 6 a 9 caracteres alfanuméricos. */
export const validarPasaporte = (value: string) => /^[A-Za-z0-9]{6,9}$/.test(value);

export const validarIdentificacion = (tipo: TipoIdentificacion, value: string) =>
  tipo === "cedula" ? validarCedula(value) : validarPasaporte(value);

/** Celular ecuatoriano: 09XXXXXXXX o +5939XXXXXXXX. */
export function validarCelular(value: string): boolean {
  const v = value.replace(/[\s-]/g, "");
  return /^09\d{8}$/.test(v) || /^\+5939\d{8}$/.test(v);
}

export function normalizarCelular(value: string) {
  const v = value.replace(/[\s-]/g, "");
  return v.startsWith("+593") ? `0${v.slice(4)}` : v;
}

export const solicitudSchema = z
  .object({
    tipoIdentificacion: z.enum(["cedula", "pasaporte"]),
    identificacion: z.string().trim().min(1, "La identificación es obligatoria"),
    nombre: z.string().trim().min(3, "Ingresa tu nombre completo").max(100, "Máximo 100 caracteres"),
    celular: z.string().trim().min(1, "El celular es obligatorio").refine(validarCelular, "Formato inválido (ej. 0991234567)"),
    problema: z.string().trim().min(10, "Describe el problema (mínimo 10 caracteres)").max(500, "Máximo 500 caracteres"),
    mecanicoPreferidoId: z.string().nullable(),
  })
  .superRefine((d, ctx) => {
    if (d.identificacion && !validarIdentificacion(d.tipoIdentificacion, d.identificacion)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["identificacion"],
        message: d.tipoIdentificacion === "cedula" ? "Cédula ecuatoriana inválida" : "Pasaporte inválido (6-9 caracteres alfanuméricos)",
      });
    }
  });

export type SolicitudInput = z.infer<typeof solicitudSchema>;
