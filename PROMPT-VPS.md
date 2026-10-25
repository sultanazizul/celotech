Tolong pasang website Celotechan v16 di subdomain celotech.sazporto.com dari GitHub. Sekarang subdomain itu masih nampilin halaman "Segera hadir" (atau versi sebelumnya).

Repo: https://github.com/sultanazizul/celotech.git

Langkah:
1. Clone: `git clone https://github.com/sultanazizul/celotech.git ~/celotech`. Kalau sudah pernah di-clone: `cd ~/celotech && git pull`.
   Repo-nya private. Kalau VPS belum punya akses GitHub, login dulu (`gh auth login`) atau pasang deploy key read-only untuk repo ini. Kalau butuh aku, tanya.
2. Cari konfigurasi web server yang sekarang melayani celotech.sazporto.com, misalnya `sudo grep -Rl "celotech.sazporto.com" /etc/nginx/`. Catat folder root-nya, baris listen/ssl/sertifikat, dan redirect yang sudah ada.
3. Backup sebelum ganti apa pun:
   - folder root halaman yang sekarang → salin ke /var/www/celotech-placeholder-backup-<tanggal>
   - file konfigurasi nginx-nya → salin jadi <nama-file>.bak-<tanggal>
   Jangan hapus yang lama.
4. Pasang rilisnya: `sudo bash ~/celotech/deploy.sh /var/www/celotech`
   (cek checksum semua file, salin ke /var/www/celotech/releases/<waktu>/, arahkan /var/www/celotech/current ke sana).
5. `sudo cp ~/celotech/nginx/celotech-headers.conf /etc/nginx/snippets/`
6. Ubah server block celotech.sazporto.com supaya mengikuti ~/celotech/nginx/celotech.sazporto.com.conf: `root /var/www/celotech/current`, blok `map $arg_v $celotech_cache`, gzip, location cache, dan halaman 404.
   PERTAHANKAN baris listen 443 / ssl_certificate / redirect yang sudah ada (situsnya di belakang Cloudflare). Jangan ubah server block domain lain.
   Kalau web server-nya bukan nginx, terapkan hal yang sama di server itu: root ke /var/www/celotech/current, header cache yang sama, dan file .mp4 harus bisa di-request per byte-range.
7. `sudo nginx -t && sudo systemctl reload nginx`
8. Cek dari luar: `bash ~/celotech/verify.sh https://celotech.sazporto.com`
   Kalau hasilnya "page is not the new site yet", cek apakah Cloudflare nge-cache HTML (Cache Rule / Page Rule "Cache Everything"). Kalau iya, purge cache untuk celotech.sazporto.com, lalu jalankan verify lagi.
9. Laporkan singkat: folder root yang dipakai, isi server block final, lokasi backup, dan output verify.sh.

Update berikutnya cukup: `cd ~/celotech && git pull && sudo bash deploy.sh /var/www/celotech && bash verify.sh https://celotech.sazporto.com`.

Kalau ada langkah yang gagal, berhenti dan laporkan error-nya. Jangan hapus apa pun selain rilis lama di /var/www/celotech/releases yang diatur deploy.sh.
