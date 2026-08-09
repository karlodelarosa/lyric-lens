import { ListTrashedSongs } from "@backend/application/song/ListTrashedSongs";
import { trashedSongToDto } from "@backend/infrastructure/api/songMappers";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createSongRepository } from "@backend/infrastructure/supabase/factory";
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

    const repository = await createSongRepository();
    const songs = await new ListTrashedSongs(repository).execute(orgId);

    return NextResponse.json({ songs: songs.map(trashedSongToDto) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load trashed songs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
