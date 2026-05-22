import { DeleteEvent } from "@backend/application/event/DeleteEvent";
import { UpdateEvent } from "@backend/application/event/UpdateEvent";
import {
  eventToDto,
  parseUpdateEventBody,
} from "@backend/infrastructure/api/eventMappers";
import { requireUser } from "@backend/infrastructure/api/requireUser";
import { createEventRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string; eventId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId, eventId } = await context.params;
    const body = await request.json();
    const input = parseUpdateEventBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid event payload" },
        { status: 400 },
      );
    }

    const repository = await createEventRepository();
    const event = await new UpdateEvent(repository).execute(
      orgId,
      eventId,
      input,
    );

    return NextResponse.json({ event: eventToDto(event) });
  } catch {
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId, eventId } = await context.params;
    const repository = await createEventRepository();
    await new DeleteEvent(repository).execute(orgId, eventId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
