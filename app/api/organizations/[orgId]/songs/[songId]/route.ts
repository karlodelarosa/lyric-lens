import { DeleteSong } from "@backend/application/song/DeleteSong";
import { requireUser } from "@backend/infrastructure/api/requireUser";
import { createSongRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string; songId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId, songId } = await context.params;
    const repository = await createSongRepository();
    await new DeleteSong(repository).execute(orgId, songId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 },
    );
  }
}
