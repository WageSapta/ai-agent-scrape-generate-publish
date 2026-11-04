# 🏨 Hotel AI Auto-Publisher Agent (Track B)

Proyek ini adalah implementasi AI Agent otonom yang melakukan scraping data hotel, menghasilkan konten blog & gambar menggunakan AI, dan mempublikasikannya secara otomatis ke Dev.to. Dibangun dengan pendekatan **Spec-Driven Development** dan **AI Vibe Coding**.

## 🔗 Deliverables Links (Wajib)

- **Deployed Web App:** https://ai-agent-scrape-generate-publish.vercel.app/
- **Live Social Media Post (Dev.to):** https://dev.to/wxgx
- **Raw AI Coding Logs:** Lihat folder [`ai-logs/readable`](https://github.com/WageSapta/ai-agent-scrape-generate-publish/tree/main/ai-logs/readable).

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Shadcn UI, Framer Motion
- **Scraping:** Firecrawl API
- **AI Text:** OpenRouter (`openrouter/free`)
- **AI Image:** Pollinations.ai
- **Publishing:** Dev.to API
- **Scheduler:** `cron-job.org`
- _(Arsitektur tanpa database untuk performa dan kesederhanaan maksimal)._

## 🚀 How to Run Locally

1. Clone repositori ini: `git clone https://github.com/WageSapta/ai-agent-scrape-generate-publish`
2. Install dependencies: `npm install`
3. Buat file `.env.local` dan masukkan API Keys (Firecrawl, OpenRouter, Devto, Cron Secret).
4. Jalankan server: `npm run dev`

## ⏱️ cron-job.org Setup

Konfigurasi cron-job.org untuk menjalankan otomasi setiap 2 jam:

1. Buat cron job baru dengan URL produksi:
   `https://YOUR-DEPLOYMENT.vercel.app/api/cron`
2. Pilih HTTP method `GET`.
3. Schedule expression: `0 */2 * * *` (menjalankan setiap dua jam).
4. Tambahkan request header:
   `Authorization: Bearer YOUR_CRON_SECRET`
5. Pastikan semua environment variable produksi sudah diisi: Firecrawl, OpenRouter, Dev.to, dan `CRON_SECRET`.

## 🧠 AI Vibe Coding Notes

Seluruh pengembangan kode (UI dan Backend) diinstruksikan melalui AI Agent (Cursor). Proses iterasi (Prompt, AI Response, Errors, Steering) didokumentasikan secara transparan di dalam folder `/ai-logs`.
