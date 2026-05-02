import Link from "next/link";
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
import { login, signup } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

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
              <p className="text-xs text-muted-foreground mt-1">Worship Platform</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Lyric Lens Account</p>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Sign in or create your account with Supabase email/password auth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
              />
            </div>

            {params.error ? (
              <p className="text-sm text-red-500">{params.error}</p>
            ) : null}

            {params.message ? (
              <p className="text-sm text-green-600">{params.message}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="submit"
                formAction={login}
                className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                Login
              </Button>
              <Button
                type="submit"
                formAction={signup}
                variant="secondary"
                className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                Sign Up
              </Button>
            </div>
          </form>

          <p className="text-sm text-muted-foreground">
            Enable Email provider in Supabase Auth settings before testing signup.
          </p>

          <p className="text-sm text-muted-foreground">
            Continue browsing without auth:{" "}
            <Link href="/?welcome=1&user=Demo%20User" className="underline">
              Use demo mode
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
