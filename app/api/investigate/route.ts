import { NextResponse } from "next/server";

const TRUEFORGE_URL =
  process.env.TRUEFORGE_URL || "http://localhost:8790";

const AGENT_NAME = "domain-hunter";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const brand = body?.brand;

    if (!brand || typeof brand !== "string" || !brand.trim()) {
      return NextResponse.json(
        { error: "Brand name is required. Please provide a valid brand to investigate." },
        { status: 400 }
      );
    }

    // Sanitize brand: strip control characters, limit length to 100 chars
    const cleanBrand = brand.trim().replace(/[\x00-\x1F\x7F]/g, "").slice(0, 100);

    if (!cleanBrand) {
      return NextResponse.json(
        { error: "Invalid brand name provided." },
        { status: 400 }
      );
    }

    // Create a TrueForge session using the saved Domain Hunter agent.
    const sessionResponse = await fetch(
      `${TRUEFORGE_URL}/api/v1/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent: {
            name: AGENT_NAME,
          },
        }),
      }
    );

    if (!sessionResponse.ok) {
      const details = await sessionResponse.text();

      return NextResponse.json(
        {
          error: "Could not create TrueForge session",
          details,
        },
        { status: sessionResponse.status }
      );
    }

    const session = await sessionResponse.json();

    const sessionId = session?.data?.id ?? session?.id;

    if (!sessionId) {
      return NextResponse.json(
        {
          error: "TrueForge did not return a session ID",
        },
        { status: 500 }
      );
    }

    // Start the actual Domain Hunter investigation.
    const turnResponse = await fetch(
      `${TRUEFORGE_URL}/api/v1/sessions/${sessionId}/turns`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: [
            {
              type: "user.message",
              content: `Investigate the brand "${cleanBrand}".

Use the complete Domain Hunter workflow:
1. Discover candidate domains.
2. Triage their current status.
3. Review and validate the evidence.
4. Use public web research and sandbox inspection when appropriate.

Return an evidence-based investigation.

Do not contact domain owners, submit reports, request takedowns, or perform other external actions.`,
            },
          ],
          stream: true,
        }),
      }
    );

    if (!turnResponse.ok) {
      const details = await turnResponse.text();

      return NextResponse.json(
        {
          error: "Could not start TrueForge investigation",
          details,
          sessionId,
        },
        { status: turnResponse.status }
      );
    }

    if (!turnResponse.body) {
      return NextResponse.json(
        {
          error: "TrueForge returned no event stream",
          sessionId,
        },
        { status: 500 }
      );
    }

    // Pass TrueForge's SSE stream directly to the browser.
    return new Response(turnResponse.body as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-TrueForge-Session": sessionId,
      },
    });
  } catch (error) {
    console.error("Domain Hunter error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Investigation failed",
      },
      { status: 500 }
    );
  }
}