# 🏨 Hotel AI Auto-Publisher Agent (Track B)

Proyek ini adalah implementasi AI Agent otonom yang melakukan scraping data hotel, menghasilkan konten blog & gambar menggunakan AI, dan mempublikasikannya secara otomatis ke Dev.to. Dibangun dengan pendekatan **Spec-Driven Development** dan **AI Vibe Coding**.

## 🔗 Deliverables Links (Wajib)

- **Deployed Web App:** [MASUKKAN_LINK_VERCEL_DISINI]
- **Live Social Media Post (Dev.to):** [MASUKKAN_LINK_ARTIKEL_DEVTO_DISINI]
- **Raw AI Coding Logs:** Lihat folder [`/ai-logs`](./ai-logs) di repositori ini.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Shadcn UI, Framer Motion
- **Scraping:** Firecrawl API
- **AI Text:** OpenRouter (`openrouter/free`)
- **AI Image:** Pollinations.ai
- **Publishing:** Dev.to API
- **Scheduler:** `cron-job.org`
- _(Arsitektur tanpa database untuk performa dan kesederhanaan maksimal)._

## 🚀 How to Run Locally

1. Clone repositori ini: `git clone [LINK_REPO_KAMU]`
2. Install dependencies: `npm install`
3. Buat file `.env.local` dan masukkan API Keys (Firecrawl, OpenRouter, Devto, Cron Secret).
4. Jalankan server: `npm run dev`

## 🧠 AI Vibe Coding Notes

Seluruh pengembangan kode (UI dan Backend) diinstruksikan melalui AI Agent (Cursor). Proses iterasi (Prompt, AI Response, Errors, Steering) didokumentasikan secara transparan di dalam folder `/ai-logs`.
