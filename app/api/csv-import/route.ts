import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/csv-import
// Payload: { companyId, jobs: [...] }
// This endpoint is a scaffold for server-side validation and bulk insert.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, jobs } = body || {};

    if (!companyId || !Array.isArray(jobs)) {
      return NextResponse.json(
        { error: "companyId and jobs[] are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    // NOTE: server-side validation, sanitization and transaction-based insert
    // should be implemented here. For the scaffold, respond with accepted rows count.
    return NextResponse.json({ accepted: jobs.length });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "failed" },
      { status: 500 }
    );
  }
}
