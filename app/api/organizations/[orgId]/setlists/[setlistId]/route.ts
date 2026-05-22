import { DeleteSetlist } from "@backend/application/setlist/DeleteSetlist";
import { UpdateSetlist } from "@backend/application/setlist/UpdateSetlist";
import {
  parseUpdateSetlistBody,
  setlistToDto,
} from "@backend/infrastructure/api/setlistMappers";
import { requireUser } from "@backend/infrastructure/api/requireUser";
import { createSetlistRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string; setlistId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId, setlistId } = await context.params;
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
  } catch {
    return NextResponse.json(
      { error: "Failed to update setlist" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId, setlistId } = await context.params;
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
