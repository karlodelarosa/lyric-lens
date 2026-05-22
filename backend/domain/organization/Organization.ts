export type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  created_by: string | null;
  created_at: string;
};

export class Organization {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: string,
    readonly createdBy: string | null,
    readonly createdAt: string,
  ) {}

  static fromRow(row: OrganizationRow): Organization {
    return new Organization(
      row.id,
      row.name,
      row.slug,
      row.created_by,
      row.created_at,
    );
  }
}
