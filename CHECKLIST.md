# 🎯 MASTER CHECKLIST: Hotel AI Auto-Publisher Agent (Track B)

## ✅ Primary Requirements (Wajib Terpenuhi)
- [x] **1. Scrape hotel data from travel/public sources:**
  - Menggunakan Firecrawl API dengan parameter `proxy: 'stealth'`.
  - Timeout diatur minimal 60 detik (60.000 ms) untuk memastikan halaman berat termuat dengan baik.
  - Data diekstrak dan diubah menjadi format JSON terstruktur (Nama, Lokasi, Rating, Fasilitas) oleh LLM, bukan markdown mentah.
- [x] **2. Generate complete blog content (copywriting & visual assets):**
  - Copywriting artikel dan Image Prompt dibuat oleh OpenRouter (dipaksa menggunakan model `openrouter/free`).
  - Gambar (Visual Assets) di-generate menggunakan Pollinations.ai berdasarkan prompt LLM.
- [x] **3. Automate scheduled publishing (every 2 hours):**
  - Publish otomatis ke Dev.to API.
  - Dijadwalkan setiap 2 jam menggunakan `cron-job.org` yang menembak endpoint `/api/cron`.
  - Endpoint `/api/cron` diproteksi dengan `Authorization: Bearer <CRON_SECRET>`.
- [x] **4. Fully utilize AI vibe coding & Spec-Driven Development:**
  - Proyek dibangun dengan pendekatan Spesifikasi (PRD.md).
  - 100% kode di-generate melalui AI Agent.
  - Raw AI logs asli (format JSON) disimpan di folder `/ai-logs/01-raw-transcript.json`.

## 🔒 Security & Performance (Enterprise Grade)
- [x] **Security:** API Key (Firecrawl, OpenRouter, Dev.to) diamankan di server-side, tidak menggunakan prefix `NEXT_PUBLIC_`.
- [x] **Security:** Validasi URL di frontend & backend menggunakan `new URL()` dan **DNS Lookup Validation** (mencegah serangan SSRF & DNS Rebinding).
- [x] **Security:** Tombol "Run Agent" di-`disabled` saat proses berjalan untuk mencegah *double-charge* API.
- [x] **Performance:** Menggunakan `next/image` dan mendaftarkan `remotePatterns` untuk optimasi gambar Pollinations.
- [x] **Performance:** Arsitektur *Stateless* (tanpa database) untuk meminimalisir waktu loading.

## 📦 Deliverables (Wajib Disubmit)
- [x] Code repository link (GitHub Public).
- [x] Deployed web app link (Vercel Live).
- [x] Live social media shared post links (Dev.to URL).
- [x] Raw AI coding agent logs (File `.json` di folder `/ai-logs`).