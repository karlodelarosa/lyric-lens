import { ListOrganizations } from "@backend/application/organization/ListOrganizations";
import { GetCurrentUser } from "@backend/application/auth/GetCurrentUser";
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
      organizations: organizations.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        createdAt: org.createdAt,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load organizations" },
      { status: 500 },
    );
  }
}
