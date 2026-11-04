import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(stringValue).filter(Boolean);
}

export function numberOrNull(value: unknown): number | null {
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(stringValue(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

const PRIVATE_IPV4 =
  /^(?:0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/;

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (!host.includes(".") && !host.includes(":")) return true;
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (/\.(?:local|internal|home\.arpa)$/.test(host)) return true;
  if (PRIVATE_IPV4.test(host)) return true;

  // IPv6 loopback, link-local (fe80::/10) and unique-local (fc00::/7).
  if (host === "::1" || host === "0:0:0:0:0:0:0:1") return true;
  if (/^(?:fe[89ab]|fc|fd)[0-9a-f]{0,2}:/.test(host)) return true;

  return false;
}

/**
 * Accepts only absolute public http(s) URLs. Rejects credentials and literal
 * private/loopback hosts so the agent cannot be pointed at internal services.
 */
export function parsePublicHttpUrl(value: string): URL | null {
  const url = parseHttpUrl(value);
  if (!url || url.username || url.password) return null;
  if (isPrivateHostname(url.hostname)) return null;
  return url;
}

export function absoluteHttpUrl(value: unknown, base: string): string | null {
  const candidate = stringValue(value);
  if (!candidate) return null;

  try {
    const url = new URL(candidate, base);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function firstHttpUrl(values: unknown[], base: string): string | null {
  for (const value of values) {
    const candidates = Array.isArray(value) ? value : [value];
    for (const candidate of candidates) {
      const url = absoluteHttpUrl(candidate, base);
      if (url) return url;
    }
  }

  return null;
}

export function sanitizeTags(value: unknown, fallback = ["travel", "hotel"]): string[] {
  const tags = stringArray(value)
    .map((tag) =>
      tag
        .toLowerCase()
        .replace(/^#/, "")
        .replace(/[^a-z0-9]/g, ""),
    )
    .filter((tag) => tag.length >= 2 && tag.length <= 20);

  const unique = Array.from(new Set(tags)).slice(0, 4);
  return unique.length > 0 ? unique : fallback;
}

export function hostnameLabel(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}
