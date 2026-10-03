import { z } from "zod";
import { TipoIdentificacion } from "@prisma/client";
import {
  validarCedulaEcuatoriana,
  validarPasaporte,
  normalizarCelular,
  normalizarPlaca,
} from "../utils/validators.js";

export const crearTurnoSchema = z
  .object({
    identificacion: z
      .string({ required_error: "La identificación es requerida" })
      .trim(),
    tipoIdentificacion: z.nativeEnum(TipoIdentificacion, {
      required_error: "El tipo de identificación es requerido (CEDULA o PASAPORTE)",
    }),
    nombre: z
      .string({ required_error: "El nombre del cliente es requerido" })
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres"),
    celular: z
      .string({ required_error: "El número celular es requerido" })
      .trim(),
    placa: z
      .string({ required_error: "La placa del vehículo es requerida" })
      .trim(),
    motivo: z
      .string({ required_error: "El motivo de la asistencia es requerido" })
      .trim()
      .min(5, "El motivo debe describir el problema con al menos 5 caracteres"),
    mecanicoPreferidoId: z.string().uuid("ID de mecánico preferido inválido").nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Validar cédula o pasaporte
    if (data.tipoIdentificacion === TipoIdentificacion.CEDULA) {
      if (!validarCedulaEcuatoriana(data.identificacion)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["identificacion"],
          message: "La cédula ecuatoriana no es válida según el algoritmo de verificación",
        });
      }
    } else if (data.tipoIdentificacion === TipoIdentificacion.PASAPORTE) {
      if (!validarPasaporte(data.identificacion)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["identificacion"],
          message: "El formato del pasaporte no es válido (6 a 12 caracteres alfanuméricos)",
        });
      }
    }

    // 2. Validar y normalizar celular
    const celNorm = normalizarCelular(data.celular);
    if (!celNorm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["celular"],
        message: "El número celular no es válido para Ecuador (ej: 0991234567 o +593991234567)",
      });
    }

    // 3. Validar y normalizar placa
    const placaNorm = normalizarPlaca(data.placa);
    if (!placaNorm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["placa"],
        message: "La placa no es válida (debe tener 3 letras y 3 o 4 números, ej: ABC1234)",
      });
    }
  });

export const consultarTurnoSchema = z.object({
  numeroTurno: z.coerce
    .number({ required_error: "El número de turno es requerido" })
    .int("El número de turno debe ser un entero")
    .positive("El número de turno debe ser positivo"),
  placa: z
    .string({ required_error: "La placa es requerida" })
    .trim()
    .transform((val) => val.replace(/[\s-]/g, "").toUpperCase()),
});

export const turnoIdParamSchema = z.object({
  id: z.string().uuid("El ID del turno debe ser un UUID válido"),
});

export const reagendarTurnoSchema = z.object({
  motivo: z.string().trim().optional(),
});

export const mecanicoTurnosQuerySchema = z.object({
  placa: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? val.replace(/[\s-]/g, "").toUpperCase() : undefined)),
});

export type CrearTurnoInput = z.infer<typeof crearTurnoSchema>;
export type ConsultarTurnoInput = z.infer<typeof consultarTurnoSchema>;
