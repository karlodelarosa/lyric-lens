import { CreateAnnouncement } from "@backend/application/announcement/CreateAnnouncement";
import { ListAnnouncements } from "@backend/application/announcement/ListAnnouncements";
import {
  announcementToDto,
  parseCreateAnnouncementBody,
} from "@backend/infrastructure/api/announcementMappers";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createAnnouncementRepository } from "@backend/infrastructure/supabase/factory";
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

    const repository = await createAnnouncementRepository();
    const announcements = await new ListAnnouncements(repository).execute(
      orgId,
    );

    return NextResponse.json({
      announcements: announcements.map(announcementToDto),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load announcements";
    console.error("[announcements GET]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { orgId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const input = parseCreateAnnouncementBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid announcement payload" },
        { status: 400 },
      );
    }

    const repository = await createAnnouncementRepository();
    const announcement = await new CreateAnnouncement(repository).execute(
      orgId,
      member.userId,
      input,
    );

    return NextResponse.json(
      { announcement: announcementToDto(announcement) },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create announcement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
