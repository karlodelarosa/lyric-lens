import type { AuthUser } from "../../domain/auth/AuthUser";
import type {
  AuthRepository,
  UpdateProfileInput,
} from "../../domain/auth/AuthRepository";

export class UpdateProfile {
  constructor(private readonly repository: AuthRepository) {}

  async execute(input: UpdateProfileInput): Promise<AuthUser> {
    return this.repository.updateProfile(input);
  }
}
