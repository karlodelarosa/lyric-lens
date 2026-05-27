import { CreateServiceFlow } from "@backend/application/serviceFlow/CreateServiceFlow";
import { ListServiceFlows } from "@backend/application/serviceFlow/ListServiceFlows";
import {
  parseCreateServiceFlowBody,
  serviceFlowListItemToDto,
  serviceFlowToDto,
} from "@backend/infrastructure/api/serviceFlowMappers";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createServiceFlowRepository } from "@backend/infrastructure/supabase/factory";
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

    const repository = await createServiceFlowRepository();
    const serviceFlows = await new ListServiceFlows(repository).execute(orgId);

    return NextResponse.json({
      serviceFlows: serviceFlows.map(serviceFlowListItemToDto),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load service flows";
    console.error("[service-flows GET]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { orgId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const input = parseCreateServiceFlowBody(body);

    if (!input) {
      return NextResponse.json(
        { error: "Invalid service flow payload" },
        { status: 400 },
      );
    }

    const repository = await createServiceFlowRepository();
    const serviceFlow = await new CreateServiceFlow(repository).execute(
      orgId,
      member.userId,
      input,
    );

    return NextResponse.json(
      { serviceFlow: serviceFlowToDto(serviceFlow) },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create service flow";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
