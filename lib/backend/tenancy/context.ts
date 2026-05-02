import "server-only";

import { createClient } from "../../supabase/server";

export type TenantContext = {
  userId: string;
  companyId: string;
};

export async function getTenantContext(): Promise<TenantContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("current_company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile?.current_company_id) {
    throw new Error("No active company selected");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("company_memberships")
    .select("id")
    .eq("company_id", profile.current_company_id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership) {
    throw new Error("No active membership for selected company");
  }

  return {
    userId: user.id,
    companyId: profile.current_company_id,
  };
}
