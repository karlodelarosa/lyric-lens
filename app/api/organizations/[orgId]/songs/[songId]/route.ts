import { DeleteSong } from "@backend/application/song/DeleteSong";
import { UpdateSong } from "@backend/application/song/UpdateSong";
import {
  parseUpdateSongBody,
  songToDto,
} from "@backend/infrastructure/api/songMappers";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createSongRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string; songId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { orgId, songId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const input = parseUpdateSongBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid song payload" },
        { status: 400 },
      );
    }

    const repository = await createSongRepository();
    const song = await new UpdateSong(repository).execute(orgId, songId, input);

    return NextResponse.json({ song: songToDto(song) });
  } catch {
    return NextResponse.json(
      { error: "Failed to update song" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { orgId, songId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
