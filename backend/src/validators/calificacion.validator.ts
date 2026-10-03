import { z } from "zod";

export const crearCalificacionSchema = z.object({
  numeroTurno: z.coerce
    .number({ required_error: "El número de turno es requerido para calificar" })
    .int()
    .positive(),
  placa: z
    .string({ required_error: "La placa es requerida para verificar el vehículo" })
    .trim()
    .transform((val) => val.replace(/[\s-]/g, "").toUpperCase()),
  estrellas: z.coerce
    .number({ required_error: "La calificación de estrellas es requerida" })
    .int("Debe ser un número entero")
    .min(1, "La calificación mínima es 1 estrella")
    .max(5, "La calificación máxima es 5 estrellas"),
  comentario: z.string().trim().max(500, "El comentario no puede exceder 500 caracteres").optional(),
});

export type CrearCalificacionInput = z.infer<typeof crearCalificacionSchema>;
