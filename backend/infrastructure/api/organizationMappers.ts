import type { CreateOrganizationInput } from "../../domain/organization/OrganizationRepository";
import type { OrganizationRole } from "../../domain/organization/OrganizationMember";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function parseCreateOrganizationBody(
  body: unknown,
): CreateOrganizationInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) return null;

  const slugInput =
    typeof record.slug === "string" ? record.slug.trim() : slugify(name);
  const slug = slugify(slugInput) || slugify(name);

  if (!slug) return null;

  return { name, slug };
}

export function parseInviteMemberBody(body: unknown): {
  userId: string;
  role: OrganizationRole;
} | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const userId = typeof record.userId === "string" ? record.userId.trim() : "";
  const role =
    typeof record.role === "string"
      ? (record.role as OrganizationRole)
      : "viewer";

  if (!userId) return null;
  if (role !== "admin" && role !== "operator" && role !== "viewer") {
    return null;
  }

  return { userId, role };
}
