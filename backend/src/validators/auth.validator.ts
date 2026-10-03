import { z } from "zod";

export const loginSchema = z.object({
  identificacion: z
    .string({ required_error: "La identificación es requerida" })
    .trim()
    .min(5, "La identificación debe tener al menos 5 caracteres"),
  password: z
    .string({ required_error: "La contraseña es requerida" })
    .min(1, "La contraseña no puede estar vacía"),
});

export type LoginInput = z.infer<typeof loginSchema>;
