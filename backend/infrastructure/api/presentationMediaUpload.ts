import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import {
  buildPresentationMediaStoragePath,
  getWelcomeSlideExtension,
  getWelcomeSlideMediaType,
  isAllowedWelcomeSlideMimeType,
  type PresentationMediaScope,
  WELCOME_SLIDE_MAX_BYTES,
} from "@backend/domain/setlist/welcomeSlideUpload";
import { createSupabaseServerClient } from "@backend/infrastructure/supabase/server-client";
import { NextResponse } from "next/server";

const PRESENTATION_MEDIA_BUCKET = "welcome-slides";

type RouteContext = {
  params: Promise<{ orgId: string }>;
};

export async function uploadPresentationMedia(
  request: Request,
  orgId: string,
  scope: PresentationMediaScope,
) {
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

  const storagePath = buildPresentationMediaStoragePath(
    orgId,
    scope,
    extension,
  );
  const client = await createSupabaseServerClient();
  const fileBuffer = await file.arrayBuffer();

  const { error: uploadError } = await client.storage
    .from(PRESENTATION_MEDIA_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error(`[${scope} upload]`, uploadError.message);
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }

  const { data: publicUrlData } = client.storage
    .from(PRESENTATION_MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  return NextResponse.json({
    slide: {
      url: publicUrlData.publicUrl,
      type: mediaType,
    },
    welcomeSlide: {
      url: publicUrlData.publicUrl,
      type: mediaType,
    },
    storagePath,
  });
}

export type UploadRouteContext = RouteContext;

export async function handlePresentationMediaUpload(
  request: Request,
  context: RouteContext,
  scope: PresentationMediaScope,
) {
  try {
    const { orgId } = await context.params;
    return uploadPresentationMedia(request, orgId, scope);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload media";
    console.error(`[${scope} upload]`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
