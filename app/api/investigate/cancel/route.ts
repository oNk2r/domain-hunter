import { NextResponse } from "next/server";

const TRUEFORGE_URL =
  process.env.TRUEFORGE_URL || "http://localhost:8790";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = body?.sessionId;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Validate sessionId format (alphanumeric + hyphens only)
    if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
      return NextResponse.json(
        { error: "Invalid sessionId format" },
        { status: 400 }
      );
    }

    const cancelResponse = await fetch(
      `${TRUEFORGE_URL}/api/v1/sessions/${encodeURIComponent(sessionId)}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!cancelResponse.ok) {
      const details = await cancelResponse.text();
      return NextResponse.json(
        {
          error: "Could not cancel TrueForge session",
          details,
        },
        { status: cancelResponse.status }
      );
    }

    const result = await cancelResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Cancel failed",
      },
      { status: 500 }
    );
  }
}
