import "server-only";

import { createClient } from "../../supabase/server";
import { upsertProfileForUser } from "../profiles/service";
import { ensureUserHasCompany } from "../tenancy/service";

type Credentials = {
  email: string;
  password: string;
};

function normalizeCredentials(credentials: Credentials): Credentials {
  return {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  };
}

export async function loginWithPassword(credentials: Credentials) {
  const supabase = await createClient();
  const normalized = normalizeCredentials(credentials);
  const { data, error } = await supabase.auth.signInWithPassword(normalized);

  if (error) {
    throw new Error(error.message);
  }

  if (data.user) {
    await upsertProfileForUser(data.user);
    await ensureUserHasCompany(data.user);
  }
}

export async function signupWithPassword(credentials: Credentials) {
  const supabase = await createClient();
  const normalized = normalizeCredentials(credentials);
  const { data, error } = await supabase.auth.signUp(normalized);

  if (error) {
    throw new Error(error.message);
  }

  if (data.user) {
    await upsertProfileForUser(data.user);
    await ensureUserHasCompany(data.user);
  }
}

export async function logoutCurrentUser() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
