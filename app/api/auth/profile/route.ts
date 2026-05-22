import { UpdateProfile } from "@backend/application/auth/UpdateProfile";
import { requireUser } from "@backend/infrastructure/api/requireUser";
import { createAuthRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const displayName =
      typeof body?.displayName === "string" ? body.displayName.trim() : "";

    if (!displayName) {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 },
      );
    }

    const repository = await createAuthRepository();
    const updated = await new UpdateProfile(repository).execute({ displayName });

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        displayName: updated.displayName,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
