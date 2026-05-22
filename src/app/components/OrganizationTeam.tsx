import { useCallback, useEffect, useState } from "react";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import { useAuth } from "@frontend/contexts/AuthContext";
import {
  createOrganization,
  getOrganizationMembers,
  inviteOrganizationMember,
  type OrganizationMemberDto,
} from "@frontend/lib/api/organizations";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

export function OrganizationTeam() {
  const { user } = useAuth();
  const {
    organizations,
    activeOrganizationId,
    refresh,
    isLoading: isOrgLoading,
  } = useOrganization();
  const [members, setMembers] = useState<OrganizationMemberDto[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState<"operator" | "viewer">(
    "operator",
  );

  const loadMembers = useCallback(async () => {
    if (!activeOrganizationId) {
      setMembers([]);
      return;
    }

    setIsLoadingMembers(true);
    try {
      const { members: loaded } =
        await getOrganizationMembers(activeOrganizationId);
      setMembers(loaded);
    } catch {
      setMembers([]);
      toast.error("Failed to load team members");
    } finally {
      setIsLoadingMembers(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsSaving(true);
    try {
      await createOrganization({ name: newOrgName.trim() });
      setNewOrgName("");
      await refresh();
      toast.success("Organization created");
    } catch {
      toast.error("Failed to create organization");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganizationId || !inviteUserId.trim()) return;

    setIsSaving(true);
    try {
      await inviteOrganizationMember(activeOrganizationId, {
        userId: inviteUserId.trim(),
        role: inviteRole,
      });
      setInviteUserId("");
      await loadMembers();
      toast.success("Member invited");
    } catch {
      toast.error("Failed to invite member");
    } finally {
      setIsSaving(false);
    }
  };

  if (isOrgLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading organizations...</p>
    );
  }

  if (organizations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create your organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOrganization} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Grace Community Church"
                required
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Creating..." : "Create organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <p className="text-sm text-muted-foreground">
              Your user ID: <code className="text-xs">{user.id}</code> — share
              this with admins when joining an organization.
            </p>
          )}

          {isLoadingMembers ? (
            <p className="text-sm text-muted-foreground">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members found.</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <code className="text-xs">{member.userId}</code>
                  <span className="capitalize text-muted-foreground">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleInviteMember} className="space-y-3 pt-2 border-t">
            <p className="text-sm font-medium">Invite member (admin only)</p>
            <div className="space-y-2">
              <Label htmlFor="invite-user-id">Member user ID</Label>
              <Input
                id="invite-user-id"
                value={inviteUserId}
                onChange={(e) => setInviteUserId(e.target.value)}
                placeholder="Supabase auth user UUID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(value) =>
                  setInviteRole(value as "operator" | "viewer")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isSaving || !activeOrganizationId}>
              {isSaving ? "Inviting..." : "Invite member"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
