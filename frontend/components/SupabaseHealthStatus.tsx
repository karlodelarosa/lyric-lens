"use client";

import { useEffect, useState } from "react";
import {
  getSupabaseHealth,
  type SupabaseHealthResponse,
} from "@frontend/lib/api/health";

export function SupabaseHealthStatus() {
  const [health, setHealth] = useState<SupabaseHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSupabaseHealth()
      .then(setHealth)
      .catch(() => setError("Could not reach API"));
  }, []);

  if (error) {
    return (
      <p className="text-xs text-destructive" data-testid="supabase-health">
        DB: {error}
      </p>
    );
  }

  if (!health) {
    return (
      <p
        className="text-xs text-muted-foreground"
        data-testid="supabase-health"
      >
        DB: checking…
      </p>
    );
  }

  return (
    <p
      className={`text-xs ${health.ok ? "text-green-600" : "text-destructive"}`}
      data-testid="supabase-health"
    >
      DB: {health.ok ? `connected (${health.projectRef})` : "unavailable"}
    </p>
  );
}
