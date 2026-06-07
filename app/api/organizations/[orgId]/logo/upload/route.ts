import { handleOrgLogoUpload } from "@backend/infrastructure/api/orgLogoUpload";

type RouteContext = {
  params: Promise<{ orgId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  return handleOrgLogoUpload(request, context);
}
