"use server";

import { redirect } from "next/navigation";

import {
  loginWithPassword,
  logoutCurrentUser,
  signupWithPassword,
} from "../../lib/backend/auth/service";

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Please%20provide%20email%20and%20password");
  }

  return { email, password };
}

export async function login(formData: FormData) {
  try {
    await loginWithPassword(readCredentials(formData));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  redirect("/?welcome=1");
}

export async function signup(formData: FormData) {
  try {
    await signupWithPassword(readCredentials(formData));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  redirect("/?welcome=1&user=New%20User");
}

export async function logout() {
  try {
    await logoutCurrentUser();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Logout failed";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  redirect("/login?message=Logged%20out");
}
