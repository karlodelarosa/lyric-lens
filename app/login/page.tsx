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

export default function LoginPage() {
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
            This is a placeholder login screen for the future SaaS account flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@company.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="********" />
          </div>

          <Button
            asChild
            className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Link href="/?welcome=1&user=Demo%20User">Login and Continue</Link>
          </Button>

          <p className="text-sm text-muted-foreground">
            Organization setup will be handled in a separate flow later.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
