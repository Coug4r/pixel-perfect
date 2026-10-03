import { prisma } from "../config/prisma.js";
import { comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { UnauthorizedError } from "../utils/errors.js";
import type { LoginInput } from "../validators/auth.validator.js";

export const authService = {
  async login(input: LoginInput) {
    const user = await prisma.usuario.findUnique({
      where: { identificacion: input.identificacion },
    });

    if (!user) {
      throw new UnauthorizedError("Identificación o contraseña incorrectos");
    }

    if (!user.activo) {
      throw new UnauthorizedError("El usuario se encuentra inactivo. Contacte al administrador");
    }

    const isValidPassword = await comparePassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Identificación o contraseña incorrectos");
    }

    const accessToken = signToken({
      userId: user.id,
      role: user.rol,
      identificacion: user.identificacion,
      nombre: user.nombre,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        identificacion: user.identificacion,
        rol: user.rol,
      },
    };
  },
};
