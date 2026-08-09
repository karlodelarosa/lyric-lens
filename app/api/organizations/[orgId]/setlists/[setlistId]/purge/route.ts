import { PurgeSetlist } from "@backend/application/setlist/PurgeSetlist";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createSetlistRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string; setlistId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { orgId, setlistId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const repository = await createSetlistRepository();
    await new PurgeSetlist(repository).execute(orgId, setlistId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to permanently delete setlist" },
      { status: 500 },
    );
  }
}
