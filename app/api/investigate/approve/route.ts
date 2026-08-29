import { NextResponse } from "next/server";

const TRUEFORGE_URL =
  process.env.TRUEFORGE_URL || "http://localhost:8790";

/**
 * POST /api/investigate/approve
 *
 * Proxies a human approval decision (approve | reject) back to TrueForge.
 * TrueForge's approval API resumes or cancels a paused agent turn.
 *
 * Body: { sessionId: string, decision: "approve" | "reject" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const { sessionId, decision } = body || {};

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    if (decision !== "approve" && decision !== "reject") {
      return NextResponse.json(
        { error: "decision must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // TrueForge approval endpoint — resumes or cancels the paused turn.
    // The exact endpoint may vary by TrueForge version; adjust if needed.
    const approvalResponse = await fetch(
      `${TRUEFORGE_URL}/api/v1/sessions/${sessionId}/approval`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      }
    );

    if (!approvalResponse.ok) {
      // Non-critical — the frontend has already updated its state.
      // Log the error but return 200 so the UI doesn't break.
      const details = await approvalResponse.text();
      console.warn(
        `TrueForge approval endpoint returned ${approvalResponse.status}:`,
        details
      );
      return NextResponse.json(
        { ok: false, note: "TrueForge approval endpoint returned an error", details },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true, decision });
  } catch (error) {
    console.error("Approval route error:", error);
    // Return 200 — the UI manages its own approval state regardless.
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
