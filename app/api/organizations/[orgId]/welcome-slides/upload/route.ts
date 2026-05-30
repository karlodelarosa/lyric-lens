import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import {
  buildWelcomeSlideStoragePath,
  getWelcomeSlideExtension,
  getWelcomeSlideMediaType,
  isAllowedWelcomeSlideMimeType,
  WELCOME_SLIDE_MAX_BYTES,
} from "@backend/domain/setlist/welcomeSlideUpload";
import { createSupabaseServerClient } from "@backend/infrastructure/supabase/server-client";
import { NextResponse } from "next/server";

const WELCOME_SLIDES_BUCKET = "welcome-slides";

type RouteContext = {
  params: Promise<{ orgId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { orgId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    if (file.size > WELCOME_SLIDE_MAX_BYTES) {
      return NextResponse.json(
        { error: "File exceeds the 20 MB limit" },
        { status: 400 },
      );
    }

    const mimeType = file.type.trim().toLowerCase();
    if (!isAllowedWelcomeSlideMimeType(mimeType)) {
      return NextResponse.json(
        { error: "Only image and video files are allowed" },
        { status: 400 },
      );
    }

    const mediaType = getWelcomeSlideMediaType(mimeType);
    const extension = getWelcomeSlideExtension(mimeType, file.name);
    if (!mediaType || !extension) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    const storagePath = buildWelcomeSlideStoragePath(orgId, extension);
    const client = await createSupabaseServerClient();
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await client.storage
      .from(WELCOME_SLIDES_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("[welcome-slides upload]", uploadError.message);
      return NextResponse.json(
        { error: "Failed to upload welcome slide" },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = client.storage
      .from(WELCOME_SLIDES_BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      welcomeSlide: {
        url: publicUrlData.publicUrl,
        type: mediaType,
      },
      storagePath,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload welcome slide";
    console.error("[welcome-slides upload]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
