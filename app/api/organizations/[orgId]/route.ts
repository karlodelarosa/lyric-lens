import { UpdateOrganization } from "@backend/application/organization/UpdateOrganization";
import {
  organizationToDto,
  parseUpdateOrganizationBody,
} from "@backend/infrastructure/api/organizationMappers";
import { requireOrgAdmin } from "@backend/infrastructure/api/requireOrgAdmin";
import { createOrganizationRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { orgId } = await context.params;
    const admin = await requireOrgAdmin(orgId);

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const input = parseUpdateOrganizationBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid organization payload" },
        { status: 400 },
      );
    }

    const repository = await createOrganizationRepository();
    const organization = await new UpdateOrganization(repository).execute(
      orgId,
      input,
    );

    return NextResponse.json({
      organization: organizationToDto(organization),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 },
    );
  }
}
