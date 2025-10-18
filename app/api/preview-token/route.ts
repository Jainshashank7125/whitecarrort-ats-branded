import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Simple preview token generator endpoint.
// POST /api/preview-token with JSON { companyId }
// Returns { token, expiresAt }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId } = body || {};

    if (!companyId)
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    // Create a short-lived preview token stored in a lightweight table (or use signed JWT)
    // For scaffold, we'll create a signed token using base64 (not production-safe).
    const payload = `${companyId}:${user.id}:${Date.now()}`;
    const token = Buffer.from(payload).toString("base64");
    const expiresAt = Date.now() + 1000 * 60 * 15; // 15 minutes

    return NextResponse.json({ token, expiresAt });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "failed" },
      { status: 500 }
    );
  }
}
