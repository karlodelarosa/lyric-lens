import { RestoreSetlist } from "@backend/application/setlist/RestoreSetlist";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createSetlistRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string; setlistId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { orgId, setlistId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const repository = await createSetlistRepository();
    await new RestoreSetlist(repository).execute(orgId, setlistId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to restore setlist" },
      { status: 500 },
    );
  }
}
