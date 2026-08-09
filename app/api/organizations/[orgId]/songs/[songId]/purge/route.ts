import { PurgeSong } from "@backend/application/song/PurgeSong";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createSongRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string; songId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { orgId, songId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const repository = await createSongRepository();
    await new PurgeSong(repository).execute(orgId, songId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to permanently delete song" },
      { status: 500 },
    );
  }
}
