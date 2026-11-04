import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";
import { AgentError, errorMessage, errorStatus } from "@/lib/errors";
import { parsePublicHttpUrl } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      throw new AgentError("A hotel URL is required.", 400);
    }
    if (!parsePublicHttpUrl(url)) {
      throw new AgentError(
        "Enter a public http(s) URL, for example https://www.ayana.com/bali/",
        400,
      );
    }

    const result = await runAgent(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Agent run failed:", errorMessage(error));
    return NextResponse.json({ error: errorMessage(error) }, { status: errorStatus(error) });
  }
}
