import { CreateSetlist } from "@backend/application/setlist/CreateSetlist";
import { ListSetlists } from "@backend/application/setlist/ListSetlists";
import {
  parseCreateSetlistBody,
  setlistToDto,
} from "@backend/infrastructure/api/setlistMappers";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createSetlistRepository } from "@backend/infrastructure/supabase/factory";
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

    const repository = await createSetlistRepository();
    const setlists = await new ListSetlists(repository).execute(orgId);

    return NextResponse.json({
      setlists: setlists.map(setlistToDto),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load setlists";
    console.error("[setlists GET]", message);
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
    const input = parseCreateSetlistBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid setlist payload" },
        { status: 400 },
      );
    }

    const repository = await createSetlistRepository();
    const setlist = await new CreateSetlist(repository).execute(
      orgId,
      member.userId,
      input,
    );

    return NextResponse.json(
      { setlist: setlistToDto(setlist) },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create setlist" },
      { status: 500 },
    );
  }
}
