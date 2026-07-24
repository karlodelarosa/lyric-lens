"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, ListMusic, MonitorPlay } from "lucide-react";
import { Button } from "../../src/app/components/ui/button";
import { Input } from "../../src/app/components/ui/input";
import { Label } from "../../src/app/components/ui/label";
import { login } from "@frontend/lib/api/auth";
import { ApiError } from "@frontend/lib/api/client";
import { LyricLensLogo, LyricLensMark } from "./LyricLensLogo";
import { SupabaseHealthStatus } from "./SupabaseHealthStatus";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen w-full grid lg:grid-cols-[1.05fr_1fr]">
      {/* ── Brand panel ─────────────────────────────────────────── */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white">
        {/* gradient base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(150deg, #4c1d95 0%, #6d28d9 45%, #7c3aed 100%)",
          }}
        />
        {/* soft light bloom */}
        <div
          className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #c4b5fd, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 -left-16 w-[26rem] h-[26rem] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }}
        />
        {/* faint grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10">
          <LyricLensLogo mono subtitle="Worship Platform" />
        </div>

        <div className="relative z-10 max-w-md">
          <h1
            className="text-4xl font-bold leading-tight tracking-tight"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Every lyric, in perfect focus.
          </h1>
          <p className="mt-4 text-base text-white/75 leading-relaxed">
            Plan services, build setlists, and run your worship presentation
            live — all from one place.
          </p>

          <div className="mt-10 space-y-4">
            <Feature
              icon={<ListMusic className="w-4 h-4" />}
              title="Song library & setlists"
              body="Organize every song and build service flows in seconds."
            />
            <Feature
              icon={<MonitorPlay className="w-4 h-4" />}
              title="Live projection mode"
              body="Control the screen in real time when it matters most."
            />
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Lyric Lens
        </p>
      </aside>

      {/* ── Form panel ──────────────────────────────────────────── */}
      <section className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          {/* Logo shown here on small screens where the brand panel is hidden */}
          <div className="lg:hidden mb-8 flex justify-center">
            <LyricLensLogo subtitle="Worship Platform" />
          </div>

          <div className="mb-8">
            <div className="hidden lg:flex mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/15">
                <LyricLensMark className="w-7 h-7" />
              </div>
            </div>
            <h2
              className="text-2xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Sign in to your Lyric Lens account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full h-11 group transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                "Signing in…"
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center leading-relaxed">
            After sign-in, create or join an organization from your profile.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4">
              <SupabaseHealthStatus />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-white/10 ring-1 ring-white/15 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-sm text-white/60 leading-snug">{body}</p>
      </div>
    </div>
  );
}
