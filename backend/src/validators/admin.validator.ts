import { z } from "zod";
import { EstadoTurno } from "@prisma/client";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const filtroHistorialSchema = paginationQuerySchema.extend({
  placa: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? val.replace(/[\s-]/g, "").toUpperCase() : undefined)),
  cliente: z.string().trim().optional(),
  mecanico: z.string().trim().optional(),
  fecha: z.string().trim().optional(), // YYYY-MM-DD
  numeroTurno: z.coerce.number().int().positive().optional(),
  estado: z.nativeEnum(EstadoTurno).optional(),
});

export const filtroCalificacionesSchema = paginationQuerySchema.extend({
  mecanico: z.string().trim().optional(),
  placa: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? val.replace(/[\s-]/g, "").toUpperCase() : undefined)),
  fecha: z.string().trim().optional(),
  estrellas: z.coerce.number().int().min(1).max(5).optional(),
});

export const filtroDiagnosticosSchema = paginationQuerySchema.extend({
  placa: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? val.replace(/[\s-]/g, "").toUpperCase() : undefined)),
  mecanico: z.string().trim().optional(),
  cliente: z.string().trim().optional(),
  numeroTurno: z.coerce.number().int().positive().optional(),
  fecha: z.string().trim().optional(),
});

export type FiltroHistorialInput = z.infer<typeof filtroHistorialSchema>;
export type FiltroCalificacionesInput = z.infer<typeof filtroCalificacionesSchema>;
export type FiltroDiagnosticosInput = z.infer<typeof filtroDiagnosticosSchema>;
