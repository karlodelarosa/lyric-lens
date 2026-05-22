export type OrganizationMemberRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

export type OrganizationRole = "admin" | "operator" | "viewer";

export class OrganizationMember {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly userId: string,
    readonly role: OrganizationRole,
    readonly createdAt: string,
  ) {}

  static fromRow(row: OrganizationMemberRow): OrganizationMember {
    const role = row.role as OrganizationRole;
    return new OrganizationMember(
      row.id,
      row.organization_id,
      row.user_id,
      role === "admin" || role === "operator" || role === "viewer"
        ? role
        : "viewer",
      row.created_at,
    );
  }
}
