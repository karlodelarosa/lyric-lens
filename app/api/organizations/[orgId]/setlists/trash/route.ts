import { ListTrashedSetlists } from "@backend/application/setlist/ListTrashedSetlists";
import { trashedSetlistToDto } from "@backend/infrastructure/api/setlistMappers";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createSetlistRepository } from "@backend/infrastructure/supabase/factory";
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

    const repository = await createSetlistRepository();
    const setlists = await new ListTrashedSetlists(repository).execute(orgId);

    return NextResponse.json({ setlists: setlists.map(trashedSetlistToDto) });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load trashed setlists";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
