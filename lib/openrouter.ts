import { z } from "zod";
import { AgentError } from "@/lib/errors";
import type { GeneratedContent, ScrapedHotel } from "@/lib/types";
import { sanitizeTags } from "@/lib/utils";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 55_000;

const generatedContentSchema = z.object({
  title: z.string().min(12).max(150),
  excerpt: z.string().min(40).max(360),
  blogText: z.string().min(500),
  imagePrompt: z.string().min(30).max(1_000),
  socialCaption: z.string().min(10).max(500),
  tags: z.array(z.string()).default([]),
});

interface OpenRouterResponse {
  choices?: Array<{
    message?: { content?: string | null };
    finish_reason?: string;
  }>;
  error?: { message?: string; code?: number | string };
}

function extractJson(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) return null;

    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function buildPrompt(scraped: ScrapedHotel, sourceUrl: string): string {
  const facts = {
    name: scraped.hotelName,
    location: scraped.location,
    address: scraped.address || null,
    description: scraped.description.slice(0, 1_600),
    facilities: scraped.facilities,
    roomTypes: scraped.roomTypes,
    starRating: scraped.starRating,
    rating: scraped.rating,
    pricePerNight: scraped.pricePerNight || null,
    currency: scraped.currency || null,
    sourceUrl,
  };

  return `Tulis artikel blog perjalanan dalam BAHASA INDONESIA berdasarkan data hotel berikut.

DATA HOTEL (satu-satunya sumber fakta yang boleh dipakai):
${JSON.stringify(facts, null, 2)}

ATURAN:
- Jangan mengarang harga, rating, jumlah kamar, fasilitas, alamat, atau penghargaan yang tidak ada di data.
- Jika sebuah fakta tidak tersedia, jangan sebutkan angkanya. Gunakan deskripsi yang aman dan umum.
- Nada: editorial travel magazine yang hangat, meyakinkan, dan tidak berlebihan. Hindari kata-kata klise AI seperti "menjelajahi", "permata tersembunyi", "tak terlupakan" secara berlebihan.
- Panjang blogText 650-850 kata dalam format Markdown.
- JANGAN memakai heading H1. Mulai langsung dengan 2 paragraf pembuka, lalu 3-4 heading "## ".
- Sertakan satu bullet list berisi tips praktis (minimal 4 poin).
- Akhiri dengan paragraf penutup yang mengajak pembaca merencanakan perjalanan, tanpa menyebut harga palsu.
- Jangan menulis tautan markdown ke sumber; sistem menambahkannya otomatis.

KEMBALIKAN HANYA SATU OBJEK JSON VALID dengan bentuk:
{
  "title": "judul artikel 55-95 karakter, menarik, mengandung nama hotel",
  "excerpt": "ringkasan 1-2 kalimat, 120-180 karakter",
  "blogText": "isi artikel Markdown lengkap",
  "imagePrompt": "prompt bahasa Inggris untuk AI image generator: foto editorial sinematik properti/arsitektur/pemandangan khas hotel ini, natural light, no text, no people faces, 16:10",
  "socialCaption": "caption media sosial 1-2 kalimat dalam bahasa Indonesia dengan 3 hashtag",
  "tags": ["4 tag lowercase tanpa spasi, maksimal 20 karakter"]
}`;
}

async function requestCompletion(
  messages: Array<{ role: "system" | "user"; content: string }>,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AgentError("OPENROUTER_API_KEY is not configured on the server.", 500);
  }

  const model = "openrouter/free";
  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Hotel Atelier",
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      reasoning: { max_tokens: 1_200, exclude: true },
      temperature: 0.72,
      max_tokens: 6_000,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  }).catch((error: unknown) => {
    const detail = error instanceof Error ? error.message : "network error";
    throw new AgentError(`OpenRouter request failed: ${detail}`, 502);
  });

  const payload = (await response.json().catch(() => null)) as OpenRouterResponse | null;

  if (!response.ok || payload?.error) {
    const detail = payload?.error?.message ?? response.statusText;
    throw new AgentError(
      `The language model rejected the request (${response.status}): ${detail}`,
      502,
    );
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    const finish = payload?.choices?.[0]?.finish_reason ?? "unknown";
    throw new AgentError(
      `The language model returned no text (finish reason: ${finish}). Please retry.`,
      502,
    );
  }

  return content;
}

export async function generateContent(
  scraped: ScrapedHotel,
  sourceUrl: string,
): Promise<GeneratedContent> {
  const messages: Array<{ role: "system" | "user"; content: string }> = [
    {
      role: "system",
      content:
        "You are a senior travel editor at a print magazine. You write precise, evocative Indonesian prose and you never invent facts. You always reply with one valid JSON object and nothing else.",
    },
    { role: "user", content: buildPrompt(scraped, sourceUrl) },
  ];

  let lastError = "The model did not return usable JSON.";

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const raw = await requestCompletion(messages);
    const parsed = extractJson(raw);
    const validated = generatedContentSchema.safeParse(parsed);

    if (validated.success) {
      const data = validated.data;
      return {
        title: data.title.trim(),
        excerpt: data.excerpt.trim(),
        blogText: data.blogText.trim().replace(/^#\s+.+\n+/, ""),
        imagePrompt: data.imagePrompt.trim(),
        socialCaption: data.socialCaption.trim(),
        tags: sanitizeTags(data.tags, ["travel", "hotel", "bali", "stay"]),
      };
    }

    lastError = validated.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "response"}: ${issue.message}`)
      .join("; ");

    messages.push({ role: "user", content: "Respons sebelumnya bukan JSON yang valid sesuai skema. Kirim ulang HANYA objek JSON yang lengkap." });
  }

  throw new AgentError(`The model returned malformed content (${lastError}). Please retry.`, 502);
}
