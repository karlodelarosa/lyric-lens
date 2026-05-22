import type {
  AuthRepository,
  SignInCredentials,
} from "../../domain/auth/AuthRepository";
import type { AuthUser } from "../../domain/auth/AuthUser";

export class SignIn {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(credentials: SignInCredentials): Promise<AuthUser> {
    return this.authRepository.signIn(credentials);
  }
}
