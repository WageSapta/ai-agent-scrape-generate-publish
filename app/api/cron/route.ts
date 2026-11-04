import { NextResponse } from "next/server";
import { runAndPublish } from "@/lib/agent";
import { errorMessage } from "@/lib/errors";
import { pickRandomHotelUrl } from "@/lib/hotel-sources";

export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    // Fail closed in production. Local development may run without a secret.
    return process.env.NODE_ENV !== "production";
  }

  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

async function handleCron(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const sourceUrl = params.get("url")?.trim() || pickRandomHotelUrl();

  if (params.get("dryRun") === "1") {
    return NextResponse.json({
      success: true,
      dryRun: true,
      sourceUrl,
      configuration: {
        firecrawl: Boolean(process.env.FIRECRAWL_API_KEY),
        openrouter: Boolean(process.env.OPENROUTER_API_KEY),
        devto: Boolean(process.env.DEVTO_API_KEY),
        cronSecret: Boolean(process.env.CRON_SECRET),
      },
    });
  }

  try {
    const { result, article } = await runAndPublish(sourceUrl);

    return NextResponse.json({
      success: true,
      sourceUrl,
      title: result.content.title,
      article,
    });
  } catch (error) {
    const message = errorMessage(error);
    console.error("Cron run failed:", message);
    return NextResponse.json({ success: false, sourceUrl, error: message }, { status: 502 });
  }
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
