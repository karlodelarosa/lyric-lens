import { CreateOrganization } from "@backend/application/organization/CreateOrganization";
import { ListOrganizations } from "@backend/application/organization/ListOrganizations";
import { GetCurrentUser } from "@backend/application/auth/GetCurrentUser";
import {
  parseCreateOrganizationBody,
  organizationToDto,
} from "@backend/infrastructure/api/organizationMappers";
import {
  createAuthRepository,
  createOrganizationRepository,
} from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authRepository = await createAuthRepository();
    const user = await new GetCurrentUser(authRepository).execute();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgRepository = await createOrganizationRepository();
    const organizations = await new ListOrganizations(orgRepository).execute();

    return NextResponse.json({
      organizations: organizations.map((org) => organizationToDto(org)),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load organizations" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authRepository = await createAuthRepository();
    const user = await new GetCurrentUser(authRepository).execute();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const input = parseCreateOrganizationBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid organization payload" },
        { status: 400 },
      );
    }

    const orgRepository = await createOrganizationRepository();
    const organization = await new CreateOrganization(orgRepository).execute(
      user.id,
      input,
    );

    return NextResponse.json(
      {
        organization: organizationToDto(organization),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
