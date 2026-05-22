import { CreateSong } from "@backend/application/song/CreateSong";
import { ListSongs } from "@backend/application/song/ListSongs";
import {
  parseCreateSongBody,
  songToDto,
} from "@backend/infrastructure/api/songMappers";
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
    const songs = await new ListSongs(repository).execute(orgId);

    return NextResponse.json({
      songs: songs.map(songToDto),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load songs" },
      { status: 500 },
    );
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
    const input = parseCreateSongBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid song payload" },
        { status: 400 },
      );
    }

    const repository = await createSongRepository();
    const song = await new CreateSong(repository).execute(
      orgId,
      member.userId,
      input,
    );

    return NextResponse.json({ song: songToDto(song) }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create song" },
      { status: 500 },
    );
  }
}
