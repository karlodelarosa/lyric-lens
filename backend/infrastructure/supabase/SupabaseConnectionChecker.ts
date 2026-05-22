import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConnectionChecker } from "../../domain/connection/ConnectionChecker";
import type { ConnectionStatus } from "../../domain/shared/ConnectionStatus";
import { getProjectRef } from "../config/env";
import type { Database } from "./database.types";

export class SupabaseConnectionChecker implements ConnectionChecker {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async check(): Promise<ConnectionStatus> {
    const checkedAt = new Date().toISOString();
    const projectRef = getProjectRef();

    const { error } = await this.client
      .from("organizations")
      .select("id", { count: "exact", head: true });

    if (error) {
      return {
        ok: false,
        checkedAt,
        projectRef,
        message: "Database connection failed",
      };
    }

    return { ok: true, checkedAt, projectRef };
  }
}
