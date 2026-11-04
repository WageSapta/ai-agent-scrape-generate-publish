export interface ScrapedHotel {
  hotelName: string;
  location: string;
  address: string;
  pricePerNight: string;
  currency: string;
  rating: number | null;
  reviewCount: string;
  starRating: number | null;
  facilities: string[];
  roomTypes: string[];
  description: string;
  imageUrl: string;
  sourceImageUrl: string | null;
}

export interface GeneratedContent {
  title: string;
  excerpt: string;
  blogText: string;
  imagePrompt: string;
  socialCaption: string;
  tags: string[];
}

export interface AgentResult {
  sourceUrl: string;
  scraped: ScrapedHotel;
  content: GeneratedContent;
  imageUrl: string;
  generatedAt: string;
  publishToken: string;
}

export interface PublishedPost {
  id: number | null;
  url: string;
  title: string;
  publishedAt: string;
}

export interface PublishInput {
  token: string;
}
