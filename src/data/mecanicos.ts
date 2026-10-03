import type { Mecanico } from "@/types";

// Datos públicos de los mecánicos. Las credenciales viven aparte, en src/auth.
export const MECANICOS: Mecanico[] = [
  { id: "m1", cedula: "1100000001", nombre: "Carlos Ramírez", iniciales: "CR", activo: true },
  { id: "m2", cedula: "1100000002", nombre: "Juan Ortega", iniciales: "JO", activo: true },
  { id: "m3", cedula: "1100000003", nombre: "Luis Paredes", iniciales: "LP", activo: true },
];
