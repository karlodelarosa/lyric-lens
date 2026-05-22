import type { ConnectionChecker } from "../../domain/connection/ConnectionChecker";
import type { ConnectionStatus } from "../../domain/shared/ConnectionStatus";

export class VerifyDatabaseConnection {
  constructor(private readonly checker: ConnectionChecker) {}

  async execute(): Promise<ConnectionStatus> {
    return this.checker.check();
  }
}
