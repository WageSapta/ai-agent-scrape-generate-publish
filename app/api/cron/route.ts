import { NextResponse } from "next/server";
import { runAndPublish } from "@/lib/agent";
import { errorMessage } from "@/lib/errors";
import {
  getHotelSources,
  nextHotelSourceAfter,
  pickRotatedHotelUrl,
  ROTATION_INTERVAL_MS,
} from "@/lib/hotel-sources";
import { validatePublicHttpUrl } from "@/lib/server-url-safety";
import { parsePublicHttpUrl } from "@/lib/utils";

export const maxDuration = 300;

const MAX_SOURCE_ATTEMPTS = 3;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

function isParseableUrl(sourceUrl: string): boolean {
  return parsePublicHttpUrl(sourceUrl) !== null;
}

async function handleCron(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;

  // An explicit ?url= override wins; otherwise the 2-hour rotation picks the
  // source for this window, so consecutive runs scrape different URLs.
  const requestedUrl = params.get("url")?.trim();
  const rotated = pickRotatedHotelUrl();
  const primaryUrl = requestedUrl || rotated.url;
  const primaryIndex = requestedUrl ? -1 : rotated.index;

  if (!isParseableUrl(primaryUrl)) {
    return NextResponse.json(
      { success: false, error: "The cron URL is not a valid public http(s) URL.", sourceUrl: primaryUrl },
      { status: 400 },
    );
  }

  if (params.get("dryRun") === "1") {
    return NextResponse.json({
      success: true,
      dryRun: true,
      sourceUrl: primaryUrl,
      rotationIntervalHours: ROTATION_INTERVAL_MS / 3_600_000,
      totalSources: getHotelSources().length,
      configuration: {
        firecrawl: Boolean(process.env.FIRECRAWL_API_KEY),
        openrouter: Boolean(process.env.OPENROUTER_API_KEY),
        devto: Boolean(process.env.DEVTO_API_KEY),
        cronSecret: Boolean(process.env.CRON_SECRET),
      },
    });
  }

  // Build the ordered candidate list: the rotated source first, then its
  // successors as fallbacks when a scrape or publish fails.
  const candidates: Array<{ url: string; index: number }> = [{ url: primaryUrl, index: primaryIndex }];
  let cursor = primaryIndex;
  while (candidates.length < MAX_SOURCE_ATTEMPTS && cursor !== -1) {
    const next = nextHotelSourceAfter(cursor);
    if (!next) break;
    candidates.push(next);
    cursor = next.index;
  }

  const failures: Array<{ sourceUrl: string; error: string }> = [];

  for (const candidate of candidates) {
    if (!(await validatePublicHttpUrl(candidate.url))) {
      failures.push({ sourceUrl: candidate.url, error: "URL resolves to a private or inaccessible network address." });
      continue;
    }

    try {
      const { result, article } = await runAndPublish(candidate.url);

      return NextResponse.json({
        success: true,
        sourceUrl: candidate.url,
        sourceIndex: candidate.index,
        requestedSourceUrl: primaryUrl,
        attempts: failures.length + 1,
        skippedSources: failures,
        title: result.content.title,
        article,
      });
    } catch (error) {
      const message = errorMessage(error);
      console.error(`Cron run failed for ${candidate.url}:`, message);
      failures.push({ sourceUrl: candidate.url, error: message });
    }
  }

  return NextResponse.json(
    { success: false, error: "All cron source attempts failed.", failures },
    { status: 502 },
  );
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
