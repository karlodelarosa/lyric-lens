import type { AuthRepository } from "../../domain/auth/AuthRepository";
import type { AuthUser } from "../../domain/auth/AuthUser";

export class GetCurrentUser {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<AuthUser | null> {
    return this.authRepository.getCurrentUser();
  }
}
