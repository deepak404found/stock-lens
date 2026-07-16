import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { UnauthorizedError } from "../../shared/errors.js";
import type { AuthUser } from "../../shared/types.js";
import { authRepository } from "./repository.js";
import type { LoginInput } from "./validation.js";

function toPublicUser(user: { id: string; email: string; fullName: string }): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
  };
}

export class AuthService {
  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email.toLowerCase());

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    await authRepository.updateLastLogin(user.id);

    const token = jwt.sign(
      {
        email: user.email,
        fullName: user.fullName,
      },
      env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      },
    );

    return {
      token,
      user: toPublicUser(user),
    };
  }

  async getMe(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Unauthorized");
    }
    return toPublicUser(user);
  }
}

export const authService = new AuthService();
