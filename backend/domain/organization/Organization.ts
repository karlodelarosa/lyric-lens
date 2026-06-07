import {
  resolveOrgThemePresetId,
  type OrgThemePresetId,
} from "./orgThemePresets";

export type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  created_by: string | null;
  created_at: string;
  theme_preset?: string | null;
  logo_url?: string | null;
  show_org_name_in_sidebar?: boolean | null;
};

export class Organization {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: string,
    readonly createdBy: string | null,
    readonly createdAt: string,
    readonly themePreset: OrgThemePresetId,
    readonly logoUrl: string | null,
    readonly showOrgNameInSidebar: boolean,
  ) {}

  static fromRow(row: OrganizationRow): Organization {
    return new Organization(
      row.id,
      row.name,
      row.slug,
      row.created_by,
      row.created_at,
      resolveOrgThemePresetId(row.theme_preset),
      row.logo_url ?? null,
      row.show_org_name_in_sidebar ?? true,
    );
  }
}
