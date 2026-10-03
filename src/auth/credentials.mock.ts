/**
 * Credenciales mock de prototipo. Solo se guardan hashes SHA-256, nunca la
 * contraseña en claro. Se eliminará al conectar un backend real.
 */
export interface MockCredential {
  cedula: string;
  passwordHash: string;
  userId: string;
  role?: "mecanico" | "superadmin";
  nombre?: string;
}

export const MOCK_CREDENTIALS: MockCredential[] = [
  { cedula: "1100000000", userId: "superadmin", role: "superadmin", nombre: "Super Administrador", passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9" },
  { cedula: "1100000001", userId: "m1", role: "mecanico", nombre: "Carlos Ramírez", passwordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" },
  { cedula: "1100000002", userId: "m2", role: "mecanico", nombre: "Juan Ortega", passwordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" },
  { cedula: "1100000003", userId: "m3", role: "mecanico", nombre: "Luis Paredes", passwordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" },
];

