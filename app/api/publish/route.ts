import { NextResponse } from "next/server";
import { publishFromToken } from "@/lib/agent";
import { errorMessage } from "@/lib/errors";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { token?: unknown } | null;

    if (typeof body?.token !== "string" || !body.token) {
      return NextResponse.json(
        { error: "A publish token is required. Run the agent first." },
        { status: 400 },
      );
    }

    const article = await publishFromToken(body.token);
    return NextResponse.json({ success: true, article });
  } catch (error) {
    const message = errorMessage(error);
    const isTokenIssue = message.includes("Publish token");
    console.error("Publish failed:", message);

    return NextResponse.json({ error: message }, { status: isTokenIssue ? 400 : 502 });
  }
}
