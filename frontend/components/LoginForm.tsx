"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "../../src/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../src/app/components/ui/card";
import { Input } from "../../src/app/components/ui/input";
import { Label } from "../../src/app/components/ui/label";
import { login } from "@frontend/lib/api/auth";
import { ApiError } from "@frontend/lib/api/client";
import { SupabaseHealthStatus } from "./SupabaseHealthStatus";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { user } = await login(email, password);
      router.push(`/?welcome=1&user=${encodeURIComponent(user.displayName)}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      className="bg-background flex items-center justify-center"
      style={{ minHeight: "100vh" }}
    >
      <Card
        className="w-full animate-in fade-in-0 zoom-in-95 duration-300"
        style={{ width: "clamp(320px, 33vw, 500px)" }}
      >
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold leading-none">Lyric Lens</p>
              <p className="text-xs text-muted-foreground mt-1">
                Worship Platform
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Lyric Lens Account</p>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Sign in with your Lyric Lens account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? "Signing in…" : "Login and Continue"}
            </Button>

            <p className="text-sm text-muted-foreground">
              After sign-in, create or join an organization from your profile.
            </p>

            {process.env.NODE_ENV === "development" && <SupabaseHealthStatus />}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
