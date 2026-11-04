export interface ArticleParts {
  hotelName: string;
  location?: string;
  excerpt: string;
  blogText: string;
  sourceUrl: string;
  imageUrl: string;
}

/**
 * Shared by the server (Dev.to payload) and the browser (copy button) so the
 * preview and the published article never drift apart.
 */
export function composeArticleMarkdown(parts: ArticleParts): string {
  const caption = parts.location ? `${parts.hotelName} — ${parts.location}` : parts.hotelName;
  const hero = parts.imageUrl ? `![${caption}](${parts.imageUrl})\n\n` : "";
  const body = parts.blogText.trim().replace(/^#\s+.+\n+/, "");
  const source = `**Sumber:** [${parts.hotelName}](${parts.sourceUrl})`;

  return [
    hero + `> ${parts.excerpt}`,
    body,
    "---",
    source,
    "*Artikel ini disusun oleh Hotel Atelier, agen editorial AI yang membaca halaman resmi properti sebelum menulis.*",
  ].join("\n\n");
}
