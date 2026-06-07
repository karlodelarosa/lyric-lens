import type { CreateOrganizationInput } from "../../domain/organization/OrganizationRepository";
import type { UpdateOrganizationInput } from "../../domain/organization/OrganizationRepository";
import type { OrganizationRole } from "../../domain/organization/OrganizationMember";
import type { Organization } from "../../domain/organization/Organization";
import { isOrgThemePresetId } from "../../domain/organization/orgThemePresets";

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

export function organizationToDto(org: Organization) {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    createdAt: org.createdAt,
    themePreset: org.themePreset,
    logoUrl: org.logoUrl,
    showOrgNameInSidebar: org.showOrgNameInSidebar,
  };
}

export function parseUpdateOrganizationBody(
  body: unknown,
): UpdateOrganizationInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const input: UpdateOrganizationInput = {};

  if ("themePreset" in record) {
    const themePreset =
      typeof record.themePreset === "string" ? record.themePreset.trim() : "";
    if (!isOrgThemePresetId(themePreset)) {
      return null;
    }
    input.themePreset = themePreset;
  }

  if ("logoUrl" in record) {
    if (record.logoUrl === null) {
      input.logoUrl = null;
    } else if (typeof record.logoUrl === "string") {
      const logoUrl = record.logoUrl.trim();
      if (!logoUrl) {
        input.logoUrl = null;
      } else {
        input.logoUrl = logoUrl;
      }
    } else {
      return null;
    }
  }

  if ("showOrgNameInSidebar" in record) {
    if (typeof record.showOrgNameInSidebar !== "boolean") {
      return null;
    }
    input.showOrgNameInSidebar = record.showOrgNameInSidebar;
  }

  if (Object.keys(input).length === 0) {
    return null;
  }

  return input;
}
