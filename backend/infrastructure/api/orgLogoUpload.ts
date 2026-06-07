import { requireOrgAdmin } from "@backend/infrastructure/api/requireOrgAdmin";
import {
  buildOrgLogoStoragePath,
  getOrgLogoExtension,
  isAllowedOrgLogoFile,
  ORG_LOGO_MAX_BYTES,
} from "@backend/domain/organization/orgLogoUpload";
import { createOrganizationRepository } from "@backend/infrastructure/supabase/factory";
import { organizationToDto } from "@backend/infrastructure/api/organizationMappers";
import { createSupabaseServerClient } from "@backend/infrastructure/supabase/server-client";
import { NextResponse } from "next/server";

const ORG_BRANDING_BUCKET = "org-branding";

type RouteContext = {
  params: Promise<{ orgId: string }>;
};

export async function handleOrgLogoUpload(
  request: Request,
  context: RouteContext,
) {
  try {
    const { orgId } = await context.params;
    const admin = await requireOrgAdmin(orgId);
    if (!admin) {
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

    if (file.size > ORG_LOGO_MAX_BYTES) {
      return NextResponse.json(
        { error: "File exceeds the 2 MB limit" },
        { status: 400 },
      );
    }

    const mimeType = file.type.trim().toLowerCase();
    if (!isAllowedOrgLogoFile(file)) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    const extension = getOrgLogoExtension(mimeType, file.name);
    if (!extension) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    const contentType =
      mimeType ||
      (extension === "svg"
        ? "image/svg+xml"
        : `image/${extension === "jpg" ? "jpeg" : extension}`);

    const storagePath = buildOrgLogoStoragePath(orgId, extension);
    const client = await createSupabaseServerClient();
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await client.storage
      .from(ORG_BRANDING_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[org logo upload]", uploadError.message);
      return NextResponse.json(
        { error: "Failed to upload logo" },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = client.storage
      .from(ORG_BRANDING_BUCKET)
      .getPublicUrl(storagePath);

    const logoUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
    const repository = await createOrganizationRepository();
    const organization = await repository.update(orgId, { logoUrl });

    return NextResponse.json({
      organization: organizationToDto(organization),
      logoUrl: organization.logoUrl,
      storagePath,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload logo";
    console.error("[org logo upload]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
