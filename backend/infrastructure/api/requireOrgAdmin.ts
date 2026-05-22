import type { OrganizationRole } from "../../domain/organization/OrganizationMember";
import { createOrganizationRepository } from "../supabase/factory";
import { requireUser } from "./requireUser";

export async function requireOrgAdmin(
  organizationId: string,
): Promise<{ userId: string; role: OrganizationRole } | null> {
  const user = await requireUser();
  if (!user) return null;

  const repository = await createOrganizationRepository();
  const role = await repository.getMemberRole(organizationId, user.id);

  if (!role || role !== "admin") {
    return null;
  }

  return { userId: user.id, role };
}

export async function requireOrgMember(
  organizationId: string,
): Promise<{ userId: string; role: OrganizationRole } | null> {
  const user = await requireUser();
  if (!user) return null;

  const repository = await createOrganizationRepository();
  const role = await repository.getMemberRole(organizationId, user.id);

  if (!role) return null;

  return { userId: user.id, role };
}
