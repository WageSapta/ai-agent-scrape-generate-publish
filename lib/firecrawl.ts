import { AgentError } from "@/lib/errors";
import type { ScrapedHotel } from "@/lib/types";
import {
  firstHttpUrl,
  numberOrNull,
  parsePublicHttpUrl,
  stringArray,
  stringValue,
} from "@/lib/utils";
import { validatePublicHttpUrl } from "@/lib/server-url-safety";

const FIRECRAWL_ENDPOINT = "https://api.firecrawl.dev/v2/scrape";
const REQUEST_TIMEOUT_MS = 60_000;

const hotelSchema = {
  type: "object",
  properties: {
    hotelName: { type: "string", description: "The official property name." },
    location: { type: "string", description: "City / region and country." },
    address: { type: "string", description: "Street address, if present." },
    pricePerNight: { type: "string", description: "Displayed nightly rate, if present." },
    currency: { type: "string", description: "Currency code shown on the page." },
    rating: { type: "number", description: "Guest rating out of 10, if present." },
    reviewCount: { type: "string", description: "Number of reviews, if present." },
    starRating: { type: "number", description: "Official star rating, if present." },
    facilities: {
      type: "array",
      items: { type: "string" },
      description: "Amenities and facilities listed on the page.",
    },
    roomTypes: {
      type: "array",
      items: { type: "string" },
      description: "Room, suite or villa categories.",
    },
    description: {
      type: "string",
      description: "A concise summary of the property, in the page's own language.",
    },
    imageUrl: { type: "string", description: "Main hero image URL." },
  },
  required: ["hotelName", "location", "description"],
} as const;

interface FirecrawlResponse {
  success?: boolean;
  error?: string;
  data?: {
    json?: Record<string, unknown>;
    markdown?: string;
    metadata?: Record<string, unknown>;
    images?: unknown[];
  };
}

function metadataValue(metadata: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = stringValue(metadata[key]);
    if (value) return value;
  }
  return "";
}

function markdownImage(markdown: string): string | null {
  const match = markdown.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/i);
  return match?.[1] ?? null;
}

export async function scrapeHotel(url: string): Promise<ScrapedHotel> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new AgentError("FIRECRAWL_API_KEY is not configured on the server.", 500);
  }
  if (!parsePublicHttpUrl(url) || !(await validatePublicHttpUrl(url))) {
    throw new AgentError("Please provide a valid public http(s) hotel URL.", 400);
  }

  const response = await fetch(FIRECRAWL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: [
        {
          type: "json",
          prompt:
            "Extract the hotel profile exactly as presented on the page. Never invent prices, ratings, facilities or room types. Leave fields empty when the page does not state them.",
          schema: hotelSchema,
        },
        "markdown",
      ],
      onlyMainContent: true,
      proxy: "stealth",
      timeout: REQUEST_TIMEOUT_MS,
      waitFor: 1200,
      blockAds: true,
      removeBase64Images: true,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS + 15_000),
    cache: "no-store",
  }).catch((error: unknown) => {
    const detail = error instanceof Error ? error.message : "network error";
    throw new AgentError(`Firecrawl request failed: ${detail}`, 502);
  });

  const payload = (await response.json().catch(() => null)) as FirecrawlResponse | null;

  if (!response.ok || !payload?.success) {
    const detail = payload?.error ?? (await Promise.resolve(response.statusText));
    throw new AgentError(`Firecrawl could not read this page (${response.status}): ${detail}`, 502);
  }

  const data = payload.data;
  if (!data) {
    throw new AgentError("Firecrawl returned an empty result for this page.", 502);
  }

  const json = data.json ?? {};
  const metadata = data.metadata ?? {};
  const markdown = stringValue(data.markdown);
  const description =
    stringValue(json.description) ||
    metadataValue(metadata, "description", "og:description", "twitter:description");
  const siteName = metadataValue(metadata, "og:site_name", "application-name");
  const hotelName = stringValue(json.hotelName) || siteName || new URL(url).hostname;
  const location =
    stringValue(json.location) ||
    metadataValue(metadata, "og:locale:alternate", "locale") ||
    metadataValue(metadata, "og:country-name");

  const imageUrl = firstHttpUrl(
    [
      json.imageUrl,
      metadata["og:image"],
      metadata["twitter:image"],
      data.images?.[0],
      markdownImage(markdown),
    ],
    url,
  );

  if (!description && !markdown) {
    throw new AgentError(
      "This page did not expose readable hotel content. Try the property's official homepage.",
      422,
    );
  }

  return {
    hotelName,
    location: location || "Location not listed",
    address: stringValue(json.address),
    pricePerNight: stringValue(json.pricePerNight),
    currency: stringValue(json.currency),
    rating: numberOrNull(json.rating),
    reviewCount: stringValue(json.reviewCount),
    starRating: numberOrNull(json.starRating),
    facilities: stringArray(json.facilities).slice(0, 10),
    roomTypes: stringArray(json.roomTypes).slice(0, 8),
    description: description || markdown.slice(0, 900),
    imageUrl: imageUrl ?? "",
    sourceImageUrl: imageUrl,
  };
}
