import { NextResponse } from "next/server";

const TRUEFORGE_URL =
  process.env.TRUEFORGE_URL || "http://localhost:8790";

/**
 * POST /api/investigate/approve
 *
 * Submits a human approval decision to TrueForge using the VERIFIED mechanism
 * from @truefoundry/trueforge-sdk ^0.1.3 type definitions:
 *
 * KEY FINDING: There is NO separate /approval endpoint in TrueForge.
 * Approval is submitted as a new turn with a `user.tool_approval` TurnInputItem.
 *
 * SDK types confirm:
 *   TurnInputItem = UserMessage | UserToolApprovalEvent | UserToolResponseEvent
 *   UserToolApprovalEvent = {
 *     type: "user.tool_approval",
 *     thread_id: string,
 *     tool_call_id: string,
 *     approval: { status: "allow" } | { status: "deny", reason?: string }
 *   }
 *
 * The `tool.response_required` SSE event provides the thread_id and
 * tool_calls[].id needed to submit the approval turn.
 *
 * For DENY: cancel the session turn (cleanest way to stop the agent).
 *
 * Body: {
 *   sessionId: string,
 *   decision: "allow" | "deny",
 *   threadId?: string,
 *   toolCallId?: string,
 *   reason?: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const { sessionId, decision, threadId, toolCallId, reason } = body || {};

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    if (decision !== "allow" && decision !== "deny") {
      return NextResponse.json(
        { error: "decision must be 'allow' or 'deny'" },
        { status: 400 }
      );
    }

    // ── DENY: Cancel the running session turn ─────────────────────────────
    if (decision === "deny") {
      const cancelResponse = await fetch(
        `${TRUEFORGE_URL}/api/v1/sessions/${encodeURIComponent(sessionId)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (!cancelResponse.ok) {
        const details = await cancelResponse.text();
        console.warn(`TrueForge cancel returned ${cancelResponse.status}:`, details);
        // Return ok — frontend already updated state
      }

      return NextResponse.json({ ok: true, decision: "deny" });
    }

    // ── ALLOW: Submit user.tool_approval turn ────────────────────────────
    if (threadId && toolCallId) {
      const turnResponse = await fetch(
        `${TRUEFORGE_URL}/api/v1/sessions/${encodeURIComponent(sessionId)}/turns`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: [
              {
                type: "user.tool_approval",
                thread_id: threadId,
                tool_call_id: toolCallId,
                approval: { status: "allow" },
              },
            ],
            stream: false,
          }),
        }
      );

      if (!turnResponse.ok) {
        const details = await turnResponse.text();
        console.warn(`TrueForge approval turn returned ${turnResponse.status}:`, details);
        // Non-critical — return ok so UI doesn't break
        return NextResponse.json(
          { ok: false, note: "TrueForge approval turn failed", details },
          { status: 200 }
        );
      }

      return NextResponse.json({ ok: true, decision: "allow" });
    }

    // ── FALLBACK: No tool_call context ───────────────────────────────────
    // The agent may not have paused on an approval-gated tool in this run.
    // The UI has already dismissed the modal; acknowledge client-side only.
    return NextResponse.json({
      ok: true,
      decision: "allow",
      note: "No tool_call context — approval acknowledged client-side only",
    });
  } catch (error) {
    console.error("Approval route error:", error);
    // Return 200 — UI manages its own state regardless
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
