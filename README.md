# Celotech site

Website **Celotechan · Guide Studio Animasi AI** untuk [celotech.sazporto.com](https://celotech.sazporto.com).
Situs statis: HTML, video, dan gambar. Nggak ada build step di server.

## Isi repo
| Bagian | Isinya |
|---|---|
| `site/` | Web root: `index.html`, `assets/` (video & gambar), `vendor/three.r128.min.js`, favicon, `og.jpg`, `robots.txt`, `sitemap.xml`, `404.html`. Semua file lokal pakai `?v=hash`, jadi aman di-cache lama. |
| `deploy.sh` | Cek `SHA256SUMS`, salin `site/` ke `/var/www/celotech/releases/<waktu>/`, pindahkan symlink `current`, reload nginx, simpan 5 rilis terakhir. |
| `verify.sh` | Cek website live dari luar: halaman, semua file, byte-range video, 404. |
| `nginx/` | Server block `celotech.sazporto.com` + header keamanan. |
| `SHA256SUMS` | Checksum semua file di `site/`. |
| `PROMPT-VPS.md` | Prompt siap tempel untuk sesi Claude Code "web celotechan" di VPS. |

## Pasang pertama kali (di VPS)
```bash
git clone https://github.com/sultanazizul/celotech.git ~/celotech
sudo bash ~/celotech/deploy.sh /var/www/celotech
```
Lalu arahkan server block `celotech.sazporto.com` ke `/var/www/celotech/current` sesuai `nginx/celotech.sazporto.com.conf` (baris SSL/Cloudflare yang sudah ada tetap dipakai). Langkah lengkapnya ada di `PROMPT-VPS.md`.

## Update
```bash
cd ~/celotech && git pull && sudo bash deploy.sh /var/www/celotech && bash verify.sh https://celotech.sazporto.com
```

## Rollback
```bash
ls /var/www/celotech/releases/
sudo ln -sfn /var/www/celotech/releases/<rilis-sebelumnya> /var/www/celotech/current && sudo systemctl reload nginx
```

## Riwayat
- **v16** (25 Okt 2026): video Perkenalan v3 (46 detik: fun fact full pakai kode, tanpa coding/Blender, CTA bongkar dari nol) dan checklist-nya. Video Bukti diputar langsung di halaman lewat player pop-up (EP00 lewat embed Instagram, filenya belum ada). Gaya "Lukisan Minyak" menggantikan "Wayang Kulit". Favicon, preview link (og.jpg), 404, robots, sitemap. Dicek di lebar 360 sampai 1920 px.
