import type { AuthRepository } from "../../domain/auth/AuthRepository";

export class SignOut {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    return this.authRepository.signOut();
  }
}
