import { CreateSong } from "@backend/application/song/CreateSong";
import { ListSongs } from "@backend/application/song/ListSongs";
import {
  parseCreateSongBody,
  songToDto,
} from "@backend/infrastructure/api/songMappers";
import { requireUser } from "@backend/infrastructure/api/requireUser";
import { createSongRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await context.params;
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
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await context.params;
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
      user.id,
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
