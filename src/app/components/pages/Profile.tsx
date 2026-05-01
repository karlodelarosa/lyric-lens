import { Camera, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

export function Profile() {
  return (
    <div className="p-8">
      <Card className="max-w-4xl animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your account information and security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="rounded-lg border bg-muted/30 p-4 flex flex-col items-center text-center">
              <Avatar className="size-24">
                <AvatarFallback className="text-2xl font-semibold">DU</AvatarFallback>
              </Avatar>
              <p className="mt-3 font-semibold">Demo User</p>
              <p className="text-xs text-muted-foreground">Owner</p>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                <Camera className="h-4 w-4 mr-2" />
                Change Image
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Personal Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First Name" id="firstName" placeholder="Demo" />
                <Field label="Last Name" id="lastName" placeholder="User" />
                <Field
                  label="Email Address"
                  id="email"
                  placeholder="demo@lyriclens.com"
                  type="email"
                />
                <Field label="Phone" id="phone" placeholder="+63 900 000 0000" />
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h3 className="font-semibold">Other Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Organization" id="org" placeholder="Coming soon" />
              <Field label="Role" id="role" placeholder="Owner" />
              <Field label="Plan" id="plan" placeholder="Starter" />
              <Field label="Timezone" id="timezone" placeholder="Asia/Manila" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell your team a little about yourself..."
                className="min-h-24"
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Change Password</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Current Password"
                id="currentPassword"
                placeholder="********"
                type="password"
              />
              <Field
                label="New Password"
                id="newPassword"
                placeholder="********"
                type="password"
              />
              <Field
                label="Confirm Password"
                id="confirmPassword"
                placeholder="********"
                type="password"
              />
            </div>
            <div className="flex justify-end">
              <Button>Update Profile</Button>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  id,
  placeholder,
  type = "text",
}: {
  label: string;
  id: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} placeholder={placeholder} />
    </div>
  );
}
