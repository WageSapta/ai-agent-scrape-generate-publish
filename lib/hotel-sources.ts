import { parsePublicHttpUrl } from "@/lib/utils";

export const DEFAULT_HOTEL_URLS = [
  "https://www.ayana.com/bali/",
  "https://www.fourseasons.com/sayan/",
  "https://www.bulgarihotels.com/en_US/bali",
  "https://www.themulia.com/",
  "https://www.aman.com/resorts/amankila",
  "https://www.potatohead.co/",
];

export function getHotelSources(): string[] {
  const configured = process.env.HOTEL_URLS?.trim();
  const raw = configured ? configured.split(/[\n,]+/) : DEFAULT_HOTEL_URLS;
  const valid = raw.map((value) => value.trim()).filter((value) => parsePublicHttpUrl(value));

  return valid.length > 0 ? valid : DEFAULT_HOTEL_URLS;
}

/**
 * Deterministic time-based rotation: each 2-hour window maps to exactly one
 * source, so consecutive cron runs scrape different URLs without shared state.
 */
export function pickRotatedHotelUrl(now: number = Date.now()): { url: string; index: number } {
  const sources = getHotelSources();
  const index = Math.floor(now / ROTATION_INTERVAL_MS) % sources.length;
  return { url: sources[index], index };
}

/**
 * The next source after `index` (wrapping around), used as a fallback when the
 * rotated URL fails to scrape or publish.
 */
export function nextHotelSourceAfter(index: number): { url: string; index: number } | null {
  const sources = getHotelSources();
  if (sources.length < 2) return null;
  const candidate = (index + 1) % sources.length;
  return { url: sources[candidate], index: candidate };
}

export const ROTATION_INTERVAL_MS = 2 * 60 * 60 * 1000;
