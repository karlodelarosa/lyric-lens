import { InviteOrganizationMember } from "@backend/application/organization/InviteOrganizationMember";
import { ListOrganizationMembers } from "@backend/application/organization/ListOrganizationMembers";
import { parseInviteMemberBody } from "@backend/infrastructure/api/organizationMappers";
import { requireOrgAdmin } from "@backend/infrastructure/api/requireOrgAdmin";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createOrganizationRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { orgId } = await context.params;
    const member = await requireOrgMember(orgId);

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const repository = await createOrganizationRepository();
    const members = await new ListOrganizationMembers(repository).execute(
      orgId,
    );

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        createdAt: m.createdAt,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load members" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { orgId } = await context.params;
    const admin = await requireOrgAdmin(orgId);

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const input = parseInviteMemberBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid invite payload" },
        { status: 400 },
      );
    }

    const repository = await createOrganizationRepository();
    const member = await new InviteOrganizationMember(repository).execute(
      orgId,
      input.userId,
      input.role,
    );

    return NextResponse.json(
      {
        member: {
          id: member.id,
          userId: member.userId,
          role: member.role,
          createdAt: member.createdAt,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to invite member" },
      { status: 500 },
    );
  }
}
