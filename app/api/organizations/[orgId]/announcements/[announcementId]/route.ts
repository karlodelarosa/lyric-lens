import { DeleteAnnouncement } from "@backend/application/announcement/DeleteAnnouncement";
import { UpdateAnnouncement } from "@backend/application/announcement/UpdateAnnouncement";
import {
  announcementToDto,
  parseUpdateAnnouncementBody,
} from "@backend/infrastructure/api/announcementMappers";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createAnnouncementRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string; announcementId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { orgId, announcementId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const input = parseUpdateAnnouncementBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid announcement payload" },
        { status: 400 },
      );
    }

    const repository = await createAnnouncementRepository();
    const announcement = await new UpdateAnnouncement(repository).execute(
      orgId,
      announcementId,
      input,
    );

    return NextResponse.json({
      announcement: announcementToDto(announcement),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update announcement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { orgId, announcementId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const repository = await createAnnouncementRepository();
    await new DeleteAnnouncement(repository).execute(orgId, announcementId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 },
    );
  }
}
