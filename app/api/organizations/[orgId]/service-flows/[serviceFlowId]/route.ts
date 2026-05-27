import { DeleteServiceFlow } from "@backend/application/serviceFlow/DeleteServiceFlow";
import { GetServiceFlow } from "@backend/application/serviceFlow/GetServiceFlow";
import { UpdateServiceFlow } from "@backend/application/serviceFlow/UpdateServiceFlow";
import {
  parseUpdateServiceFlowBody,
  serviceFlowToDto,
} from "@backend/infrastructure/api/serviceFlowMappers";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createServiceFlowRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string; serviceFlowId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { orgId, serviceFlowId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const repository = await createServiceFlowRepository();
    const serviceFlow = await new GetServiceFlow(repository).execute(
      orgId,
      serviceFlowId,
    );

    if (!serviceFlow) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ serviceFlow: serviceFlowToDto(serviceFlow) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load service flow";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { orgId, serviceFlowId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const input = parseUpdateServiceFlowBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid service flow payload" },
        { status: 400 },
      );
    }

    const repository = await createServiceFlowRepository();
    const serviceFlow = await new UpdateServiceFlow(repository).execute(
      orgId,
      serviceFlowId,
      input,
    );

    return NextResponse.json({ serviceFlow: serviceFlowToDto(serviceFlow) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update service flow";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { orgId, serviceFlowId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const repository = await createServiceFlowRepository();
    await new DeleteServiceFlow(repository).execute(orgId, serviceFlowId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete service flow" },
      { status: 500 },
    );
  }
}
