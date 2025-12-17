# Vercel Deployment Setup

## ⚠️ PENTING: Set Environment Variable di Vercel

Website masih menggunakan URL lama karena **environment variable belum di-set di Vercel**.

### Langkah-langkah:

1. **Buka Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Login dengan akun yang ter-connect ke GitHub

2. **Pilih Project**
   - Cari project: `big-games-web` atau `biggames-web`
   - Klik project tersebut

3. **Masuk ke Settings**
   - Klik tab **"Settings"** di navbar atas
   - Pilih menu **"Environment Variables"** di sidebar kiri

4. **Tambah/Update Environment Variable**
   - Klik tombol **"Add New"** atau **"Edit"** jika sudah ada
   - Isi sebagai berikut:
     ```
     Name:  VITE_API_BASE_URL
     Value: https://biggames-backend-28c1e4c25e4b.herokuapp.com
     ```
   - **Environment**: Pilih semua (Production, Preview, Development)
   - Klik **"Save"**

5. **Redeploy**
   - Setelah menyimpan environment variable
   - Klik tab **"Deployments"**
   - Pilih deployment terakhir (yang paling atas)
   - Klik tombol **"..."** (three dots) → **"Redeploy"**
   - Atau push commit baru ke GitHub untuk trigger auto-deploy

### Verifikasi

Setelah deployment selesai:
1. Buka website: https://big-games-web.vercel.app
2. Buka Developer Console (F12)
3. Coba login
4. Periksa Network tab - pastikan request ke:
   ```
   https://biggames-backend-28c1e4c25e4b.herokuapp.com/api/auth/login
   ```
   Bukan ke ngrok lagi!

### Screenshot Lokasi Settings

```
Dashboard → Project → Settings → Environment Variables
```

### Troubleshooting

**Masalah**: Masih pakai URL lama setelah redeploy
- **Solusi**: Hapus cache browser (Ctrl + Shift + Delete) dan hard refresh (Ctrl + F5)

**Masalah**: CORS error
- **Solusi**: Pastikan backend Heroku sudah enable CORS untuk `https://big-games-web.vercel.app`

---

## Current Configuration

### Backend API
- Production: `https://biggames-backend-28c1e4c25e4b.herokuapp.com`
- Docs: `https://biggames-backend-28c1e4c25e4b.herokuapp.com/docs`

### Frontend
- Production: `https://big-games-web.vercel.app`
- Repository: Connected to GitHub auto-deploy

### Files yang Sudah Diupdate
✅ `src/services/api.ts` - Fallback URL
✅ `vite.config.js` - Development proxy
✅ `.env.example` - Example environment
✅ All documentation files
