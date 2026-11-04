# 🎯 MASTER CHECKLIST: Hotel AI Auto-Publisher Agent

## ✅ Primary Requirements

### 1. Scrape hotel data from travel/public sources

- [ ] Menggunakan Firecrawl API (`proxy: 'stealth'`) untuk mengekstrak data dari URL hotel (Expedia, Wikipedia, Web Resmi).
- [ ] Hasil scrape di-parse menjadi format JSON terstruktur oleh LLM (BUKAN markdown mentah).
- [ ] UI menampilkan Nama Hotel, Lokasi, Rating, dan Fasilitas.

### 2. Generate complete blog content

- [ ] LLM (OpenRouter: `openrouter/free`) menghasilkan Artikel (>3 paragraf), Tags, dan Image Prompt.
- [ ] Image Assets di-generate via Pollinations.ai berdasarkan prompt dari LLM.
- [ ] Gambar di-optimasi menggunakan `next/image`.

### 3. Automate scheduled publishing (every 2 hours)

- [ ] Publish konten ke Dev.to menggunakan Dev.to API.
- [ ] Membuat endpoint `/api/cron` yang diproteksi `CRON_SECRET`.
- [ ] `cron-job.org` dikonfigurasi menembak `/api/cron` setiap 2 jam (`0 */2 * * *`).
- [ ] Cron berjalan tanpa intervensi (Scrape URL acak -> Generate -> Publish).

### 4. Fully utilize AI vibe coding & Spec-Driven Development

- [ ] Folder `/ai-logs` berisi _RAW_ log (Prompt, Respons AI, Error, Steering).
- [ ] PRD dan dokumentasi dibuat sebelum/selama proses _coding_.

## 🔒 Security & Performance (Anti-Gagal)

- [ ] **Security:** Tidak ada API Key yang pakai awalan `NEXT_PUBLIC_`.
- [ ] **Security:** Validasi URL di frontend (mencegah spam/SSRF).
- [ ] **Performance:** Tombol "Run Agent" di-`disabled` saat loading (mencegah _double-charge_ API).
- [ ] **Stateless:** Tidak pakai database (menghindari _error schema cache_).
- [ ] **No Mock Fallback:** Jika API gagal, tampilkan error ke user/cron, JANGAN publish artikel sampah.
