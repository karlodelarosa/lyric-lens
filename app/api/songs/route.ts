import { NextResponse } from "next/server";
import { withTenantQuery } from "../../../lib/backend/tenancy/query";

export async function GET() {
  const result = await withTenantQuery(async ({ supabase, tenant }) => {
    const { data, error } = await supabase
      .from("songs")
      .select("id, title, artist, created_at")
      .eq("company_id", tenant.companyId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  });

  if (!result.ok) {
    return result.response;
  }

  return NextResponse.json({ data: result.data });
}
