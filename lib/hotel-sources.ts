import { parsePublicHttpUrl } from "@/lib/utils";

export const DEFAULT_HOTEL_URLS = [
  "https://www.ayana.com/bali/",
  "https://www.fourseasons.com/sayan/",
  "https://www.bulgarihotels.com/en_US/bali",
  "https://www.themulia.com/",
  "https://www.padmaresort.com/",
  "https://www.potatohead.co/",
];

export function getHotelSources(): string[] {
  const configured = process.env.HOTEL_URLS?.trim();
  const raw = configured ? configured.split(/[\n,]+/) : DEFAULT_HOTEL_URLS;
  const valid = raw.map((value) => value.trim()).filter((value) => parsePublicHttpUrl(value));

  return valid.length > 0 ? valid : DEFAULT_HOTEL_URLS;
}

export function pickRandomHotelUrl(): string {
  const sources = getHotelSources();
  return sources[Math.floor(Math.random() * sources.length)];
}
