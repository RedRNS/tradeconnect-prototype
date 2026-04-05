# TradeConnect Prototype

TradeConnect adalah prototype web app untuk membantu UMKM menyiapkan ekspor: dari onboarding profil, discovery buyer, asisten komunikasi deal, sampai kalkulator readiness dan dokumen.

## Cara Install

```bash
npm install
```

## Cara Menjalankan

```bash
npm run dev
```

Aplikasi akan berjalan di URL lokal dari Vite (umumnya `http://localhost:5173`).

## Fitur Utama

- Dashboard landing pasca-onboarding dengan metrik, rekomendasi buyer, timeline deal, peluang pasar, dan checklist kesiapan.
- Onboarding 4-step wizard:
  - Verifikasi NIB simulasi OSS RBA
  - Profil produk + AI HS code classifier simulasi
  - Kapabilitas ekspor
  - Review & submit profile score
- Buyer discovery dengan aksi `Hubungi`, confetti untuk kontak pertama, dan feedback toast.
- AI Deal Communication Assistant (simulasi RAG):
  - Inbox email buyer
  - Generate draft respons dengan loading bertahap
  - Editable draft + penjelasan AI + proteksi floor price
- Deal Readiness 3 tab:
  - Kalkulator harga ekspor (EXW/FOB/CFR/CIF)
  - Deteksi red flag transaksi
  - Checklist dokumen ekspor interaktif
- Global polish:
  - Skeleton loading
  - Empty state elegan
  - Transition halaman dengan framer-motion
  - Toast notification dengan react-hot-toast
  - 404 page
  - Footer prototype di setiap halaman

## Stack Teknologi

- React + Vite
- Tailwind CSS v3
- React Router v6
- Zustand
- Axios
- Lucide React
- Framer Motion
- React Hot Toast
- Canvas Confetti
- Font Inter (Google Fonts)
