/**
 * Credenciales mock de prototipo. Solo se guardan hashes SHA-256, nunca la
 * contraseña en claro. Se eliminará al conectar un backend real.
 */
export interface MockCredential {
  cedula: string;
  passwordHash: string;
  userId: string;
}

export const MOCK_CREDENTIALS: MockCredential[] = [
  { cedula: "1100000001", userId: "m1", passwordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" },
  { cedula: "1100000002", userId: "m2", passwordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" },
];
