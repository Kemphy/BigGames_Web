# 🚀 Deploy ke Vercel

## Persiapan

Aplikasi sudah siap untuk deployment ke Vercel dengan konfigurasi berikut:

- ✅ `vercel.json` - Routing configuration untuk SPA
- ✅ `.env.example` - Template environment variables
- ✅ `src/services/api.ts` - Sudah menggunakan environment variable

## Langkah-langkah Deploy

### 1. Buat Akun Vercel

- Kunjungi [vercel.com](https://vercel.com)
- Sign up dengan GitHub account Anda

### 2. Deploy via Vercel CLI (Recommended)

#### Install Vercel CLI:

```bash
npm install -g vercel
```

#### Login ke Vercel:

```bash
vercel login
```

#### Deploy:

```bash
# Deploy ke production
vercel --prod

# Atau deploy preview dulu
vercel
```

### 3. Deploy via Vercel Dashboard (Lebih Mudah)

1. **Push kode ke GitHub:**

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import di Vercel Dashboard:**

   - Login ke [vercel.com/dashboard](https://vercel.com/dashboard)
   - Klik **"Add New Project"**
   - Pilih **"Import Git Repository"**
   - Pilih repository `biggames-web`
   - Klik **"Import"**

3. **Configure Project:**

   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (sudah auto-detect)
   - **Output Directory:** `dist` (sudah auto-detect)

4. **Set Environment Variables:**
   Di bagian **"Environment Variables"**, tambahkan:

   ```
   VITE_API_BASE_URL = https://2d4ae8dc10a3.ngrok-free.app
   ```

   ⚠️ **Penting:** Ganti URL ngrok dengan backend production URL yang permanen!

5. **Deploy:**
   - Klik **"Deploy"**
   - Tunggu proses build (1-2 menit)
   - Aplikasi akan tersedia di URL: `https://your-app.vercel.app`

## ⚙️ Environment Variables

Setelah deploy, Anda bisa update environment variables di:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

### Variables yang Diperlukan:

```env
VITE_API_BASE_URL=https://your-backend-api.com
```

## 🔄 Auto-Deploy

Setiap kali Anda push ke branch `main`, Vercel akan otomatis:

- Build aplikasi
- Deploy ke production
- Memberikan preview URL untuk setiap pull request

## 🔄 Cara Update Aplikasi di Vercel

### Metode 1: Push ke GitHub (Otomatis) ⭐ Recommended

Setelah aplikasi sudah terhubung dengan Vercel, update sangat mudah:

```bash
# 1. Buat perubahan pada kode Anda
# 2. Commit changes
git add .
git commit -m "Update: deskripsi perubahan"

# 3. Push ke GitHub
git push origin main
```

**Vercel akan otomatis:**
- Detect perubahan baru
- Build aplikasi
- Deploy ke production
- Selesai dalam 1-2 menit! 🚀

### Metode 2: Deploy Manual via CLI

Jika tidak menggunakan GitHub auto-deploy:

```bash
# Di folder project
vercel --prod
```

### Metode 3: Redeploy via Dashboard

Jika ingin deploy ulang tanpa perubahan kode:

1. Buka [vercel.com/dashboard](https://vercel.com/dashboard)
2. Pilih project Anda
3. Tab **Deployments**
4. Klik titik tiga (⋯) pada deployment terbaru
5. Pilih **"Redeploy"**

### 📋 Update Environment Variables

Jika Anda mengubah environment variables (misal backend URL berubah):

1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Edit variable yang ingin diubah
3. Klik **"Save"**
4. **Redeploy** aplikasi agar perubahan diterapkan

```bash
# Atau via CLI
vercel env pull    # Download env vars
vercel env add     # Tambah env var baru
```

### 🔍 Cek Status Deployment

**Via Dashboard:**
- Vercel Dashboard → Your Project → **Deployments**
- Lihat status: Building → Ready/Error

**Via CLI:**
```bash
vercel ls          # List semua deployments
vercel inspect     # Detail deployment terakhir
```

### ⚡ Tips Update Cepat

1. **Preview dulu sebelum production:**
   ```bash
   git push origin feature-branch  # Push ke branch lain
   # Vercel akan buat preview URL otomatis
   ```

2. **Rollback jika ada masalah:**
   - Dashboard → Deployments → Pilih deployment lama
   - Klik **"Promote to Production"**

3. **Instant Rollback via CLI:**
   ```bash
   vercel rollback
   ```

## 🌐 Custom Domain (Opsional)

1. Beli domain (dari Namecheap, GoDaddy, dll)
2. Di Vercel Dashboard → Your Project → Settings → Domains
3. Add custom domain
4. Update DNS records sesuai instruksi Vercel

## 📝 Catatan Penting

### Backend API:

- ⚠️ URL ngrok (`https://2d4ae8dc10a3.ngrok-free.app`) akan berubah setiap restart
- 💡 Untuk production, gunakan backend yang sudah di-deploy ke server permanen
- 🔧 Update `VITE_API_BASE_URL` di Vercel dashboard jika backend URL berubah

### CORS:

Pastikan backend API mengizinkan requests dari domain Vercel Anda:

```python
# Backend FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-app.vercel.app",  # Tambahkan domain Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🛠️ Troubleshooting

### ❌ Images Tidak Muncul di Production

**Masalah:** Path absolut seperti `/src/assets/image.png` tidak akan berfungsi di production.

**Solusi:** ✅ Sudah diperbaiki!

- Semua images sekarang menggunakan ES Module imports
- Vite akan otomatis bundle dan optimize images
- Path akan dikonversi ke URL yang benar di production

**Contoh yang Benar:**

```tsx
// ✅ Correct - ES Module Import
import vipRoom1 from '../assets/VIP room 1.png'
<img src={vipRoom1} alt="VIP Room" />

// ❌ Wrong - Absolute Path
<img src="/src/assets/VIP room 1.png" alt="VIP Room" />
```

### Build Error:

```bash
# Test build locally
npm run build
npm run preview
```

### Routing 404:

- Sudah ditangani oleh `vercel.json`
- Semua routes akan redirect ke `index.html`

### Environment Variables tidak terdeteksi:

- Pastikan variable dimulai dengan `VITE_`
- Restart deployment setelah update env vars

### Images Tidak Ter-optimize:

- Vite otomatis mengoptimize images saat build
- Images akan di-hash untuk cache busting
- Contoh: `VIP room 1.png` → `VIP room 1-CtP_MRow.png`

## 📊 Monitoring

Setelah deploy, monitor aplikasi Anda di:

- **Analytics:** Vercel Dashboard → Analytics
- **Logs:** Vercel Dashboard → Deployments → View Function Logs
- **Performance:** Vercel Dashboard → Speed Insights

## 📝 Quick Reference: Update Workflow

```bash
# ⚡ Update workflow sehari-hari (paling sering dipakai)
git add .
git commit -m "Update fitur X"
git push origin main
# ✅ Vercel otomatis deploy dalam 1-2 menit!

# 🔧 Update environment variable
vercel env add VITE_NEW_VAR
vercel --prod  # Redeploy dengan env baru

# 🔄 Rollback ke versi sebelumnya
vercel rollback

# 📊 Cek status
vercel ls
```

## 🎉 Selesai!

Aplikasi Anda akan live di: `https://your-app-name.vercel.app`

**Update aplikasi semudah:**
1. Edit kode
2. `git push origin main`
3. Tunggu 1-2 menit
4. Live! ✨

Selamat! 🚀
