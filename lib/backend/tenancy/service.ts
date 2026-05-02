import "server-only";

import type { User } from "@supabase/supabase-js";

import { createAdminClient } from "../../supabase/admin";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function buildCompanySeed(user: User) {
  const emailPrefix = user.email?.split("@")[0] ?? "new-user";
  const safePrefix = slugify(emailPrefix) || "new-user";
  const suffix = user.id.slice(0, 8);
  return {
    slug: `${safePrefix}-${suffix}`,
    name: `${emailPrefix}'s Team`,
  };
}

export async function ensureUserHasCompany(user: User) {
  const admin = createAdminClient();

  const { data: existingMembership, error: membershipError } = await admin
    .from("company_memberships")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (existingMembership) {
    await ensureProfileCurrentCompany(user.id, existingMembership.company_id);
    await ensureCompanyHasStarterSubscription(existingMembership.company_id);
    return;
  }

  const seed = buildCompanySeed(user);

  const { data: company, error: companyError } = await admin
    .from("companies")
    .upsert(
      {
        slug: seed.slug,
        name: seed.name,
        created_by: user.id,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (companyError) {
    throw new Error(companyError.message);
  }

  const { error: addMemberError } = await admin.from("company_memberships").upsert(
    {
      company_id: company.id,
      user_id: user.id,
      role: "owner",
      status: "active",
    },
    { onConflict: "company_id,user_id" },
  );

  if (addMemberError) {
    throw new Error(addMemberError.message);
  }

  await ensureProfileCurrentCompany(user.id, company.id);
  await ensureCompanyHasStarterSubscription(company.id);
}

async function ensureProfileCurrentCompany(userId: string, companyId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ current_company_id: companyId })
    .eq("id", userId)
    .is("current_company_id", null);

  if (error) {
    throw new Error(error.message);
  }
}

async function ensureCompanyHasStarterSubscription(companyId: string) {
  const admin = createAdminClient();

  const { data: existingSubscription, error: lookupError } = await admin
    .from("subscriptions")
    .select("id")
    .eq("company_id", companyId)
    .in("status", ["trialing", "active", "past_due", "incomplete"])
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  if (existingSubscription) {
    return;
  }

  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(now.getDate() + 14);

  const { error: createError } = await admin.from("subscriptions").insert({
    company_id: companyId,
    provider: "manual",
    plan_code: "starter",
    status: "trialing",
    amount_cents: 0,
    currency: "usd",
    billing_interval: "month",
    current_period_start: now.toISOString(),
    current_period_end: trialEnd.toISOString(),
  });

  if (createError) {
    throw new Error(createError.message);
  }
}
