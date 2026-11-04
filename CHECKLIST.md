# 🎯 MASTER CHECKLIST: Hotel AI Auto-Publisher Agent

## ✅ Primary Requirements

### 1. Scrape hotel data from travel/public sources

- [x] Menggunakan Firecrawl API (`proxy: 'stealth'`) untuk mengekstrak data dari URL hotel (Expedia, Wikipedia, Web Resmi).
- [x] Hasil scrape di-parse menjadi format JSON terstruktur oleh LLM (BUKAN markdown mentah).
- [x] UI menampilkan Nama Hotel, Lokasi, Rating, dan Fasilitas.

### 2. Generate complete blog content

- [x] LLM (OpenRouter: `openrouter/free`) menghasilkan Artikel (>3 paragraf), Tags, dan Image Prompt.
- [x] Image Assets di-generate via Pollinations.ai berdasarkan prompt dari LLM.
- [x] Gambar di-optimasi menggunakan `next/image`.

### 3. Automate scheduled publishing (every 2 hours)

- [x] Publish konten ke Dev.to menggunakan Dev.to API.
- [x] Membuat endpoint `/api/cron` yang diproteksi `CRON_SECRET`.
- [x] Instruksi `cron-job.org` tersedia untuk menembak `/api/cron` setiap 2 jam (`0 */2 * * *`).
- [x] Cron berjalan tanpa intervensi (Scrape URL acak -> Generate -> Publish).

### 4. Fully utilize AI vibe coding & Spec-Driven Development

- [x] Folder `/ai-logs` berisi _RAW_ log (Prompt, Respons AI, Error, Steering).
- [x] PRD dan dokumentasi dibuat sebelum/selama proses _coding_.

## 🔒 Security & Performance (Anti-Gagal)

- [x] **Security:** Tidak ada API Key yang pakai awalan `NEXT_PUBLIC_`.
- [x] **Security:** Validasi URL di frontend dan backend (mencegah spam/SSRF).
- [x] **Performance:** Tombol "Run Agent" di-`disabled` saat loading (mencegah _double-charge_ API).
- [x] **Stateless:** Tidak pakai database (menghindari _error schema cache_).
- [x] **No Mock Fallback:** Jika API gagal, tampilkan error ke user/cron, JANGAN publish artikel sampah.
