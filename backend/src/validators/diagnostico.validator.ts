import { z } from "zod";

export const crearDiagnosticoSchema = z.object({
  descripcion: z
    .string({ required_error: "La descripción técnica del diagnóstico es requerida" })
    .trim()
    .min(5, "La descripción debe tener al menos 5 caracteres"),
  observaciones: z.string().trim().optional(),
  trabajoRealizado: z.string().trim().optional(),
  recomendaciones: z.string().trim().optional(),
});

export const editarDiagnosticoSchema = z.object({
  descripcion: z.string().trim().min(5, "La descripción debe tener al menos 5 caracteres").optional(),
  observaciones: z.string().trim().optional(),
  trabajoRealizado: z.string().trim().optional(),
  recomendaciones: z.string().trim().optional(),
});

export const diagnosticoIdParamSchema = z.object({
  id: z.string().uuid("El ID del diagnóstico debe ser un UUID válido"),
});

export type CrearDiagnosticoInput = z.infer<typeof crearDiagnosticoSchema>;
export type EditarDiagnosticoInput = z.infer<typeof editarDiagnosticoSchema>;
