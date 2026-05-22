import { DeleteSetlist } from "@backend/application/setlist/DeleteSetlist";
import { UpdateSetlist } from "@backend/application/setlist/UpdateSetlist";
import {
  parseUpdateSetlistBody,
  setlistToDto,
} from "@backend/infrastructure/api/setlistMappers";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createSetlistRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string; setlistId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { orgId, setlistId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const input = parseUpdateSetlistBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid setlist payload" },
        { status: 400 },
      );
    }

    const repository = await createSetlistRepository();
    const setlist = await new UpdateSetlist(repository).execute(
      orgId,
      setlistId,
      input,
    );

    return NextResponse.json({ setlist: setlistToDto(setlist) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update setlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { orgId, setlistId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const repository = await createSetlistRepository();
    await new DeleteSetlist(repository).execute(orgId, setlistId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete setlist" },
      { status: 500 },
    );
  }
}
