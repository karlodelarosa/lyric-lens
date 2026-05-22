import type { ConnectionStatus } from "../shared/ConnectionStatus";

export interface ConnectionChecker {
  check(): Promise<ConnectionStatus>;
}
