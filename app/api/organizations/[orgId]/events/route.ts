import { CreateEvent } from "@backend/application/event/CreateEvent";
import { ListEvents } from "@backend/application/event/ListEvents";
import {
  eventToDto,
  parseCreateEventBody,
} from "@backend/infrastructure/api/eventMappers";
import { requireUser } from "@backend/infrastructure/api/requireUser";
import { createEventRepository } from "@backend/infrastructure/supabase/factory";
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
    const repository = await createEventRepository();
    const events = await new ListEvents(repository).execute(orgId);

    return NextResponse.json({
      events: events.map(eventToDto),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load events" },
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
    const input = parseCreateEventBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid event payload" },
        { status: 400 },
      );
    }

    const repository = await createEventRepository();
    const event = await new CreateEvent(repository).execute(
      orgId,
      user.id,
      input,
    );

    return NextResponse.json({ event: eventToDto(event) }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
