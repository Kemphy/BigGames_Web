# Force Redeploy Vercel - Clear Cache

## Masalah
Website Vercel masih menggunakan build lama yang ter-cache dengan ngrok URL.

## Solusi: Force Redeploy dengan Clear Cache

### Opsi 1: Via Vercel Dashboard (RECOMMENDED)

1. **Buka Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Pilih Project** → `big-games-web`

3. **Deployments Tab**
   - Klik tab "Deployments"
   - Pilih deployment terakhir (paling atas)

4. **Redeploy dengan Force**
   - Klik tombol **"..."** (three dots di kanan)
   - Pilih **"Redeploy"**
   - ✅ **CENTANG**: "Use existing Build Cache" → **UNCHECK/DISABLE ini!**
   - Klik **"Redeploy"**

### Opsi 2: Trigger via Git Push

```bash
# Commit kosong untuk trigger rebuild
git commit --allow-empty -m "Force rebuild for Vercel"
git push
```

### Opsi 3: Via Vercel CLI (jika sudah install)

```bash
# Install Vercel CLI jika belum
npm i -g vercel

# Login
vercel login

# Force redeploy without cache
vercel --prod --force
```

## Verifikasi Environment Variable

Pastikan di **Vercel Dashboard → Settings → Environment Variables**:

```
Name:  VITE_API_BASE_URL
Value: https://biggames-backend-28c1e4c25e4b.herokuapp.com

✅ Production: CHECKED
✅ Preview: CHECKED  
✅ Development: CHECKED
```

## Setelah Redeploy

1. **Tunggu deployment selesai** (2-3 menit)
2. **Clear browser cache**:
   - Chrome: `Ctrl + Shift + Delete` → Clear cache
   - Atau buka Incognito/Private window
3. **Hard refresh**: `Ctrl + F5` atau `Ctrl + Shift + R`
4. **Test login** dan cek Network tab (F12)
   - Request harus ke: `https://biggames-backend-28c1e4c25e4b.herokuapp.com/api/auth/login`
   - Bukan ke ngrok!

## Troubleshooting

### Masih pakai ngrok setelah redeploy?

**Cek di Vercel Deployment Logs:**
1. Dashboard → Deployments → Click latest deployment
2. Lihat "Build Logs"
3. Cari: `VITE_API_BASE_URL`
4. Pastikan nilainya: `https://biggames-backend-28c1e4c25e4b.herokuapp.com`

Jika tidak ada atau masih ngrok:
- Environment variable belum tersimpan dengan benar
- Redeploy lagi setelah memastikan env variable sudah di-set

### CORS Error dari Heroku?

Pastikan backend Heroku sudah enable CORS untuk domain Vercel:
```python
# Backend Python (FastAPI)
origins = [
    "https://big-games-web.vercel.app",
    "https://*.vercel.app",  # Untuk preview deployments
]
```

## Quick Commands

```bash
# Check current deployment
vercel ls

# Redeploy production
vercel --prod

# View logs
vercel logs
```
