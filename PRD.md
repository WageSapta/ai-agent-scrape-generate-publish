# PRD: Hotel AI Auto-Publisher Agent (Track B)

## 1. Project Overview

Aplikasi Single Page (Next.js) yang bertindak sebagai AI Agent otonom. Agent akan melakukan scraping data hotel dari URL yang diberikan, menganalisisnya menggunakan LLM, membuat artikel blog beserta gambar AI, dan mempublikasikannya ke Dev.to secara manual maupun otomatis (terjadwal).

## 2. Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, Shadcn UI, Framer Motion (Animasi).
- **Scraping:** Firecrawl API.
- **AI Text & Analysis:** OpenRouter API (Model: `openrouter/free`).
- **AI Image:** Pollinations.ai.
- **Publishing:** Dev.to API.
- **Database:** TIDAK ADA (Stateless Architecture).
- **Automation:** `cron-job.org` (menembak API Route Next.js).

## 3. User Flow (Manual)

1. User memasukkan URL hotel (misal: Website Resmi Hotel / Wikipedia / Expedia) di UI.
2. UI memvalidasi URL dan memanggil API `/api/agent`.
3. Agent (Backend) melakukan Scrape (Firecrawl) -> Generate JSON (OpenRouter) -> Generate Image (Pollinations).
4. UI menampilkan 3 kolom (Data Hotel, Artikel & Gambar, Tombol Publish).
5. User klik "Publish", data dikirim ke `/api/publish` dan tayang di Dev.to.

## 4. Cron Flow (Auto-Publish Tiap 2 Jam)

1. `cron-job.org` memanggil GET `/api/cron` dengan Header `Authorization: Bearer [CRON_SECRET]`.
2. API memvalidasi token.
3. API memilih 1 URL Hotel secara acak dari _array_ yang sudah ditentukan.
4. API menjalankan proses yang sama (Scrape -> Generate) dan langsung mem-publish ke Dev.to tanpa perlu interaksi UI.
