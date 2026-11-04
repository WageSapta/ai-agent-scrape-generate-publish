import { publishToDevTo } from "@/lib/devto";
import { scrapeHotel } from "@/lib/firecrawl";
import { composeArticleMarkdown } from "@/lib/markdown";
import { generateContent } from "@/lib/openrouter";
import { buildImageUrl } from "@/lib/pollinations";
import { createPublishToken, verifyPublishToken } from "@/lib/publish-token";
import type { AgentResult, PublishedPost } from "@/lib/types";

export function buildArticleMarkdown(result: AgentResult): string {
  return composeArticleMarkdown({
    hotelName: result.scraped.hotelName,
    location: result.scraped.location,
    excerpt: result.content.excerpt,
    blogText: result.content.blogText,
    sourceUrl: result.sourceUrl,
    imageUrl: result.imageUrl,
  });
}

export async function runAgent(url: string): Promise<AgentResult> {
  const scraped = await scrapeHotel(url);
  const content = await generateContent(scraped, url);
  const imageUrl = buildImageUrl(content.imagePrompt);
  const generatedAt = new Date().toISOString();

  const publishToken = createPublishToken({
    ...content,
    imageUrl,
    sourceUrl: url,
    hotelName: scraped.hotelName,
    iat: Date.now(),
  });

  return {
    sourceUrl: url,
    scraped,
    content,
    imageUrl,
    generatedAt,
    publishToken,
  };
}

export async function publishResult(result: AgentResult): Promise<PublishedPost> {
  return publishToDevTo({
    title: result.content.title,
    bodyMarkdown: buildArticleMarkdown(result),
    description: result.content.excerpt,
    imageUrl: result.imageUrl,
    tags: result.content.tags,
  });
}

export async function publishFromToken(token: unknown): Promise<PublishedPost> {
  const payload = verifyPublishToken(token);
  if (!payload) {
    throw new Error("Publish token is invalid or older than 2 hours. Run the agent again.");
  }

  return publishToDevTo({
    title: payload.title,
    bodyMarkdown: composeArticleMarkdown({
      hotelName: payload.hotelName,
      excerpt: payload.excerpt,
      blogText: payload.blogText,
      sourceUrl: payload.sourceUrl,
      imageUrl: payload.imageUrl,
    }),
    description: payload.excerpt,
    imageUrl: payload.imageUrl,
    tags: payload.tags,
  });
}

export async function runAndPublish(url: string) {
  const result = await runAgent(url);
  const article = await publishResult(result);
  return { result, article };
}
