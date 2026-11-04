const IMAGE_ENDPOINT = "https://image.pollinations.ai/prompt";
const MAX_PROMPT_LENGTH = 620;

const STYLE_SUFFIX =
  "editorial travel photography, cinematic composition, natural light, rich texture, 35mm film feel, no text, no watermark, no logos";

export function hashPrompt(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash % 1_000_000);
}

/**
 * Pollinations renders the image on first request, so we only build the URL.
 * The seed is derived from the prompt to keep regenerated runs visually stable.
 */
export function buildImageUrl(prompt: string): string {
  const base = prompt.trim().slice(0, MAX_PROMPT_LENGTH) || "luxury tropical resort in Bali";
  const fullPrompt = `${base}, ${STYLE_SUFFIX}`;
  const params = new URLSearchParams({
    width: "1280",
    height: "800",
    model: "flux",
    seed: String(hashPrompt(fullPrompt)),
    nologo: "true",
    referrer: "hotel-atelier",
  });

  return `${IMAGE_ENDPOINT}/${encodeURIComponent(fullPrompt)}?${params.toString()}`;
}
