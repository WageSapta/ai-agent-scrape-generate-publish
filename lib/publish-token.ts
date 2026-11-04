import { createHmac, timingSafeEqual } from "node:crypto";
import { AgentError } from "@/lib/errors";
import type { GeneratedContent } from "@/lib/types";

export interface PublishPayload extends GeneratedContent {
  imageUrl: string;
  sourceUrl: string;
  hotelName: string;
  iat: number;
}

const MAX_TOKEN_AGE_MS = 2 * 60 * 60 * 1000;

function signingSecret(): string {
  const value =
    process.env.PUBLISH_SIGNING_SECRET ||
    process.env.CRON_SECRET ||
    process.env.DEVTO_API_KEY;

  if (value) return value;
  if (process.env.NODE_ENV !== "production") return "hotel-atelier-local-signing-key";

  throw new AgentError("CRON_SECRET is not configured, so publish tokens cannot be signed.", 500);
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", signingSecret()).update(encodedPayload).digest("base64url");
}

/**
 * The browser never sends article bodies back as trusted input: the agent
 * returns a short-lived HMAC token, and /api/publish only accepts that token.
 */
export function createPublishToken(payload: PublishPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyPublishToken(token: unknown): PublishPayload | null {
  if (typeof token !== "string" || token.length < 20 || token.length > 60_000) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const encoded = token.slice(0, separator);
  const received = token.slice(separator + 1);
  const expected = sign(encoded);

  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object") return null;
  const candidate = payload as Partial<PublishPayload>;

  if (
    typeof candidate.title !== "string" ||
    typeof candidate.blogText !== "string" ||
    typeof candidate.imagePrompt !== "string" ||
    typeof candidate.socialCaption !== "string" ||
    typeof candidate.imageUrl !== "string" ||
    typeof candidate.sourceUrl !== "string" ||
    typeof candidate.hotelName !== "string" ||
    typeof candidate.iat !== "number" ||
    !Array.isArray(candidate.tags)
  ) {
    return null;
  }

  if (Date.now() - candidate.iat > MAX_TOKEN_AGE_MS) return null;

  return candidate as PublishPayload;
}
