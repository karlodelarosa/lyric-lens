import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@frontend/contexts/AuthContext";
import { updateProfile } from "@frontend/lib/api/auth";
import { OrganizationTeam } from "../OrganizationTeam";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Profile() {
  const { user, refresh } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user?.displayName]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsSaving(true);
    try {
      await updateProfile(displayName.trim());
      await refresh();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your account and organization team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="rounded-lg border bg-muted/30 p-4 flex flex-col items-center text-center">
              <Avatar className="size-24">
                <AvatarFallback className="text-2xl font-semibold">
                  {getInitials(displayName || "User")}
                </AvatarFallback>
              </Avatar>
              <p className="mt-3 font-semibold">{displayName || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h3 className="font-semibold">Personal Details</h3>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email ?? ""} disabled />
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save profile"}
              </Button>
            </form>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Organization & team</h3>
            </div>
            <OrganizationTeam />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
