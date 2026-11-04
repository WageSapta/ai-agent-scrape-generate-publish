/**
 * Public API contract for a completed hotel draft.
 *
 * `rating` is a preformatted display string (for example "9.2/10" or "5★")
 * so the UI never has to guess how a source expresses its score.
 */
export interface HotelData {
  hotelName: string;
  location: string;
  rating: string;
  facilities: string[];
  blogText: string;
  imagePrompt: string;
  imageUrl: string;
  tags: string[];
}

export type {
  AgentResult,
  GeneratedContent,
  PublishedPost,
  PublishInput,
  ScrapedHotel,
} from "@/lib/types";
