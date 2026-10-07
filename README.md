# ifs24056-pabwe2026-nextjs — Rumpi

Aplikasi cerita singkat (PABWE 2026) berbasis **Next.js App Router + TypeScript + Tailwind CSS v4 + Redux Toolkit**,
memakai REST API Delcom (`https://open-api.delcom.org/api/v1`).

## Perintah

```bash
bun install          # pasang dependensi
bun run dev          # development  -> http://localhost:3000
bun run build        # build produksi
bun run start        # jalankan hasil build
bun run lint         # ESLint
bun run test         # Vitest + coverage (threshold 100%)
```

## Halaman

| Path | Akses | Isi |
| --- | --- | --- |
| `/auth/login` | publik | Login |
| `/auth/register` | publik | Registrasi |
| `/` | login | Linimasa, cari, tulis postingan, suka |
| `/mine` | login | Postingan saya, hapus semua |
| `/users` | login | Daftar pengguna + pencarian |
| `/profile` | login | Ubah profil, foto, kata sandi |
| `/posts/[postId]` | login | Detail, suka, komentar, ubah/hapus, ubah cover |

## Optimasi Lighthouse / Axe

- Font sistem (tanpa webfont), CSS disisipkan ke HTML (`experimental.inlineCss`), tanpa library dialog eksternal.
- Judul halaman, heading, dan kerangka navigasi dirender di server; hanya data yang dimuat di klien.
- Satu `<main>`, skip link, label pada semua input, pesan galat `role="alert"`, target sentuh >= 44px, kontras >= 4.5:1.
- Gambar memakai `width`/`height` + `loading="lazy"`; `preconnect` ke API Delcom.
