import { handlePresentationMediaUpload } from "@backend/infrastructure/api/presentationMediaUpload";

type RouteContext = {
  params: Promise<{ orgId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  return handlePresentationMediaUpload(request, context, "announcements");
}
