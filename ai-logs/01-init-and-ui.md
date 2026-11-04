Mulai sekarang, kamu adalah Senior Software Engineer yang bertugas membangun proyek ini dengan standar Enterprise-grade Security & High Performance. Sebelum menulis kode, tolong baca file TASK.md dan PRD.md di folder ini untuk memahami konteks kita.

Lakukan instruksi berikut secara berurutan (kamu bisa mengeksekusi terminal commands secara otomatis):

1. Inisialisasi Project: Jalankan perintah npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm (lewati jika folder sudah terinisialisasi).
2. Install Dependencies: Jalankan npm install framer-motion sonner lucide-react @mendable/firecrawl-js dan inisialisasi Shadcn UI + komponennya: npx shadcn@latest add button input card badge skeleton.
3. SECURITY - Environment Variables: Buat file .env.local. PENTING: Jangan pernah menggunakan awalan NEXT_PUBLIC_ untuk API Keys. Variabelnya harus: FIRECRAWL_API_KEY="", OPENROUTER_API_KEY="", DEVTO_API_KEY="", CRON_SECRET="".
4. PERFORMANCE - Next.js Config: Update next.config.js untuk mengizinkan optimasi gambar dari luar: images: { remotePatterns: [{ protocol: 'https', hostname: 'image.pollinations.ai' }] }.
5. Types: Buat file types/index.ts. Definisikan interface HotelData: hotelName (string), location (string), rating (string), facilities (string[]), blogText (string), imagePrompt (string), imageUrl (string), tags (string[]).
6. UI Frontend (app/page.tsx):

Gunakan Dark Mode minimalis (Shadcn UI, Framer Motion, Lucide Icons).

Header: Judul "Hotel AI Auto-Publisher" dengan ikon Sparkles.

Input Section: Shadcn Input ber-ikon Link dan Button "Run Agent".

SECURITY - Input Validation: Saat tombol diklik, validasi URL menggunakan new URL(url). Jika bukan http/https, tampilkan toast error (sonner) dan batalkan.*

PERFORMANCE - Button State: Saat isLoading === true, tombol harus disabled (teks berubah jadi "Processing...") agar tidak terjadi spam API.*

Grid 3 Kolom (Card):

Jika isLoading true, tampilkan Shadcn Skeleton di ketiga kolom.

Jika data ada, gunakan Framer Motion untuk fade-in.

Kolom 1 (Data Hotel): Render hotelName, location (ikon MapPin), rating (ikon Star), dan facilities menggunakan Shadcn Badge. JANGAN render JSON mentah.

Kolom 2 (Konten AI): Tampilkan gambar dengan <Image /> Next.js (class object-cover), dan teks artikel dengan whitespace-pre-wrap overflow-y-auto max-h-[400px].

Kolom 3 (Action): Tombol "Publish to Dev.to".

State: url, isLoading, data (HotelData | null), isPublishing, publishedUrl.

Buat fungsi handleRunAgent (fetch ke /api/agent) dan handlePublish (fetch ke /api/publish).

Eksekusi semua perintah terminal dan tulis kodenya. Pastikan tidak ada error TypeScript dan beri tahu saya jika UI sudah siap dijalankan dengan npm run dev.