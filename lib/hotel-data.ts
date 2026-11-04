import type { AgentResult } from "@/lib/types";
import type { HotelData } from "@/types";

function formatRating(result: AgentResult): string {
  if (result.scraped.rating !== null) {
    return `${result.scraped.rating.toFixed(1)}/10`;
  }
  if (result.scraped.starRating !== null) {
    return `${result.scraped.starRating.toFixed(0)}★`;
  }
  return "Not rated";
}

/**
 * Adapts the richer agent result to the public `HotelData` contract so a
 * consumer (export, webhook, future client) does not depend on internals.
 */
export function toHotelData(result: AgentResult): HotelData {
  return {
    hotelName: result.scraped.hotelName,
    location: result.scraped.location,
    rating: formatRating(result),
    facilities: result.scraped.facilities,
    blogText: result.content.blogText,
    imagePrompt: result.content.imagePrompt,
    imageUrl: result.imageUrl,
    tags: result.content.tags,
  };
}
