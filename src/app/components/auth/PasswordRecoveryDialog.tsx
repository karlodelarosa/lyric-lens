"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createClient } from "../../../../lib/supabase/client";
import { tryGetSupabaseConfig } from "../../../../lib/supabase/config";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

/**
 * When a user opens a password-reset email link, Supabase redirects with tokens in the hash
 * and emits PASSWORD_RECOVERY. They must call updateUser({ password }) to finish.
 */
export function PasswordRecoveryDialog() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tryGetSupabaseConfig()) return;

    const supabase = createClient();
    let cancelled = false;

    const showRecovery = () => {
      if (!cancelled) setOpen(true);
    };

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") showRecovery();
    });

    void (async () => {
      await supabase.auth.getSession();
      if (cancelled) return;
      if (window.location.hash.includes("type=recovery")) showRecovery();
    })();

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Use at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated. You can use it to sign in.");
    setOpen(false);
    setPassword("");
    setConfirm("");

    const { pathname, search } = window.location;
    window.history.replaceState(null, "", `${pathname}${search}`);
  }

  if (!tryGetSupabaseConfig()) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Set a new password</DialogTitle>
            <DialogDescription>
              You used a password-reset link. Choose a new password for your
              account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="recovery-password">New password</Label>
              <Input
                id="recovery-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recovery-confirm">Confirm password</Label>
              <Input
                id="recovery-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Update password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
