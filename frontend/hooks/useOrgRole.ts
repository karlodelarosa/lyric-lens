import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@frontend/contexts/AuthContext";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import {
  getOrganizationMembers,
  type OrganizationMemberDto,
} from "@frontend/lib/api/organizations";

export function useOrgRole() {
  const { user } = useAuth();
  const { activeOrganizationId } = useOrganization();
  const [members, setMembers] = useState<OrganizationMemberDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!activeOrganizationId) {
      setMembers([]);
      return;
    }

    setIsLoading(true);
    try {
      const { members: loaded } =
        await getOrganizationMembers(activeOrganizationId);
      setMembers(loaded);
    } catch {
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const currentMember =
    members.find((member) => member.userId === user?.id) ?? null;

  return {
    role: currentMember?.role ?? null,
    isAdmin: currentMember?.role === "admin",
    isLoading,
    refresh: loadMembers,
  };
}
