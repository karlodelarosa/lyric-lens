import "server-only";

import type { User } from "@supabase/supabase-js";

import { createClient } from "../../supabase/server";

function getDisplayName(user: User): string {
  const metadataName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null;

  if (metadataName) {
    return metadataName;
  }

  return user.email?.split("@")[0] ?? "User";
}

export async function upsertProfileForUser(user: User) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      display_name: getDisplayName(user),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}
