import { AgentError } from "@/lib/errors";
import type { PublishedPost } from "@/lib/types";
import { sanitizeTags } from "@/lib/utils";

const DEVTO_ENDPOINT = "https://dev.to/api/articles";
const REQUEST_TIMEOUT_MS = 30_000;

export interface DevToPublishInput {
  title: string;
  bodyMarkdown: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
}

interface DevToArticleResponse {
  id?: number;
  url?: string;
  title?: string;
  published_at?: string;
  publishedAt?: string;
  error?: string;
  errors?: unknown;
}

export async function publishToDevTo(input: DevToPublishInput): Promise<PublishedPost> {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    throw new AgentError("DEVTO_API_KEY is not configured on the server.", 500);
  }

  const title = input.title.trim();
  const bodyMarkdown = input.bodyMarkdown.trim();
  if (!title || !bodyMarkdown) {
    throw new AgentError("Dev.to requires a title and article body.", 400);
  }

  const response = await fetch(DEVTO_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      article: {
        title,
        body_markdown: bodyMarkdown,
        published: true,
        tags: sanitizeTags(input.tags, ["travel", "hotel"]),
        description: input.description?.slice(0, 300),
        main_image: input.imageUrl?.startsWith("https://") ? input.imageUrl : undefined,
      },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  }).catch((error: unknown) => {
    const detail = error instanceof Error ? error.message : "network error";
    throw new AgentError(`Dev.to request failed: ${detail}`, 502);
  });

  const payload = (await response.json().catch(() => null)) as DevToArticleResponse | null;

  if (!response.ok || !payload?.url) {
    const detail = payload?.error ?? payload?.errors ?? response.statusText;
    throw new AgentError(
      `Dev.to rejected the article (${response.status}): ${JSON.stringify(detail)}`,
      502,
    );
  }

  return {
    id: payload.id ?? null,
    url: payload.url,
    title: payload.title ?? title,
    publishedAt: payload.published_at ?? payload.publishedAt ?? new Date().toISOString(),
  };
}
