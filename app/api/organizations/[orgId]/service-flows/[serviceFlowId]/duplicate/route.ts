import { DuplicateServiceFlow } from "@backend/application/serviceFlow/DuplicateServiceFlow";
import { serviceFlowToDto } from "@backend/infrastructure/api/serviceFlowMappers";
import { requireOrgMember } from "@backend/infrastructure/api/requireOrgAdmin";
import { createServiceFlowRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string; serviceFlowId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { orgId, serviceFlowId } = await context.params;
    const member = await requireOrgMember(orgId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const repository = await createServiceFlowRepository();
    const serviceFlow = await new DuplicateServiceFlow(repository).execute(
      orgId,
      member.userId,
      serviceFlowId,
    );

    return NextResponse.json(
      { serviceFlow: serviceFlowToDto(serviceFlow) },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to duplicate service flow";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
