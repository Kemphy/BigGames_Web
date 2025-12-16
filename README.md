# 🎮 BigGames - Sistem Reservasi Ruangan Gaming

<div align="center">
  <img src="src/assets/Logo1-Photoroom.png" alt="Logo BigGames" width="200"/>
  
  [![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.18-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## 📋 Tentang Proyek

**BigGames** adalah platform reservasi ruangan gaming modern yang memungkinkan pengguna untuk:

- 🎯 Memesan ruangan gaming (PS5, VIP, Simulator) dengan mudah
- 🍔 Memesan makanan & minuman untuk diantar ke ruangan
- 💳 Melakukan pembayaran online dengan berbagai metode
- 🎫 Menggunakan kode promo untuk diskon
- 👤 Mengelola profil dan riwayat booking
- 👨‍💼 Dashboard admin untuk mengelola reservasi dan pesanan F&B

## ✨ Fitur Utama

### 🔐 Autentikasi & Otorisasi

- Login dan Register dengan validasi
- Akses berbasis peran (User, Admin, Finance)
- Protected routes dengan middleware
- Manajemen sesi dengan token JWT

### 🎮 Sistem Reservasi Ruangan

- **3 Kategori Ruangan:**
  - 🎮 Regular Room (PS5 standar)
  - 👑 VIP Room (pengalaman gaming premium)
  - 🏎️ Simulator Room (simulator balap)
- Pengecekan ketersediaan secara real-time
- Sistem pemilihan slot waktu
- Dukungan booking multi-jam
- Pilihan add-ons (controller tambahan, snack, dll)

### 🍕 Makanan & Minuman

- Menu lengkap dengan 3 kategori (Food, Drink/Beverage, Snack)
- 21 gambar placeholder yang bervariasi
- Sistem keranjang dengan manajemen kuantitas
- Pesan langsung atau terhubung dengan reservasi
- Pelacakan pesanan secara real-time

### 💰 Pembayaran & Promo

- Berbagai metode pembayaran (Transfer Bank, E-wallet, QRIS)
- Upload bukti pembayaran
- Sistem verifikasi admin
- Kode promo dengan validasi
- Sistem poin reward

### 📊 Dashboard Admin

- **Statistik Real-time:**
  - Pendapatan hari ini
  - Total booking
  - Pembayaran tertunda
  - Booking aktif
  - Pesanan F&B
- **Manajemen Reservasi:**
  - Lihat/Edit/Hapus reservasi
  - Update status (Pending → Confirmed → Completed)
  - Batalkan reservasi
  - Filter & pencarian
  - Pengurutan tabel (Customer, Date/Time, Total, Status)
- **Manajemen Pesanan F&B:**
  - Lihat/Edit/Hapus pesanan
  - Update status (Pending → Cooking → Delivering → Completed)
  - Filter berdasarkan status
  - Pengurutan tabel
- **Tampilan Jadwal Harian:**
  - Visualisasi kalender
  - Ringkasan ketersediaan ruangan
  - Timeline booking

### 🔔 Notifikasi

- Notifikasi Toast (bukan alert browser!)
- 4 tipe notifikasi: Success, Error, Warning, Info
- Auto-dismiss dengan animasi
- Animasi slide-in yang halus

### 🎨 UI/UX Modern

- Tema gelap dengan efek gradient
- Desain glass morphism
- Responsif untuk semua perangkat
- Animasi & transisi yang halus
- Loading states & skeleton
- Error handling yang ramah pengguna

## 🛠️ Teknologi yang Digunakan

### Frontend

- **React 19.2.0** - Library UI
- **TypeScript** - Keamanan tipe data
- **Vite 7.2.4** - Build tool & dev server
- **React Router DOM 6.30** - Routing sisi klien
- **Tailwind CSS 4.1.18** - Framework CSS utility-first

### Manajemen State

- React Context API (AuthContext, BookingContext)
- Custom hooks untuk logika yang dapat digunakan kembali

### Integrasi API

- API client bergaya Axios
- Integrasi RESTful API
- Middleware error handling
- Interceptor Request/Response

## 📦 Prasyarat

Pastikan Anda sudah menginstall:

- **Node.js** >= 18.x
- **npm** >= 9.x atau **yarn** >= 1.22.x
- **Git** untuk version control

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/Kemphy/BigGames_Web.git
cd BigGames_Web
```

### 2. Install Dependensi

```bash
npm install
# atau
yarn install
```

### 3. Konfigurasi Environment

Buat file `.env` di root directory:

```env
VITE_API_BASE_URL=https://backend-api-anda.com
VITE_APP_NAME=BigGames
```

### 4. Setup Backend API

Pastikan backend API sudah berjalan. Backend membutuhkan endpoint berikut:

**Auth:**

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

**Rooms:**

- `GET /api/rooms`
- `GET /api/rooms/:id`
- `GET /api/rooms/:id/slots?date=YYYY-MM-DD`

**Reservations:**

- `POST /api/reservations`
- `GET /api/reservations/me`
- `POST /api/reservations/:id/cancel`

**Food & Beverage:**

- `GET /api/menu-items`
- `POST /api/fb/orders`
- `GET /api/fb/orders/me`
- `POST /api/fb/orders/:id/cancel`

**Admin:**

- `GET /api/admin/reservations`
- `PUT /api/admin/reservations/:id`
- `PUT /api/admin/reservations/:id/status`
- `POST /api/admin/reservations/:id/cancel`
- `DELETE /api/admin/reservations/:id`
- `GET /api/admin/fb/orders`
- `POST /api/admin/fb/orders/:id/status`

**Payments:**

- `POST /api/payments`
- `GET /api/payments/:id`
- `POST /api/payments/:id/upload-proof`

**Promo:**

- `POST /api/promos/validate`

### 5. Setup Assets

Pastikan gambar sudah ada di `src/assets/`:

**Ruangan:**

- `VIP room 1.png`
- `VIP room 2.png`
- `VIP room 3.png`
- `Reguler room 1.png`
- `Reguler room 2.png`
- `Simulator room.png`

**Logo:**

- `Logo1-Photoroom.png`
- `logo panjang-Photoroom (1).png`

**FAQ Section:**

- `Cara booking.png`
- `Promo dan diskon.png`
- `Lokasi.png`

## 🏃‍♂️ Menjalankan Proyek

### Mode Development

```bash
npm run dev
# atau
yarn dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### Build untuk Production

```bash
npm run build
# atau
yarn build
```

### Preview Build Production

```bash
npm run preview
# atau
yarn preview
```

### Lint Kode

```bash
npm run lint
# atau
yarn lint
```

## 📁 Struktur Proyek

```
biggames-web/
├── public/                      # File statis
├── src/
│   ├── assets/                  # Gambar, logo, foto ruangan
│   │   ├── VIP room 1.png
│   │   ├── VIP room 2.png
│   │   ├── VIP room 3.png
│   │   ├── Reguler room 1.png
│   │   ├── Reguler room 2.png
│   │   ├── Simulator room.png
│   │   ├── Logo1-Photoroom.png
│   │   ├── logo panjang-Photoroom (1).png
│   │   ├── Cara booking.png
│   │   ├── Promo dan diskon.png
│   │   └── Lokasi.png
│   ├── components/              # Komponen yang dapat digunakan kembali
│   │   ├── ConsoleCard.tsx      # Komponen kartu ruangan
│   │   ├── Footer.tsx           # Komponen footer
│   │   ├── Logo.tsx             # Komponen logo
│   │   ├── Navbar.tsx           # Navigation bar
│   │   ├── RequireAdmin.tsx     # Pengaman rute admin
│   │   └── Toast.tsx            # Notifikasi toast
│   ├── context/                 # React Context
│   │   ├── AuthContext.tsx      # State autentikasi
│   │   └── BookingContext.tsx   # State booking
│   ├── layouts/                 # Komponen layout
│   │   ├── AdminLayout.tsx      # Layout dashboard admin
│   │   └── MainLayout.tsx       # Layout aplikasi utama
│   ├── pages/                   # Komponen halaman
│   │   ├── Admin.tsx            # Dashboard admin
│   │   ├── Booking.tsx          # Daftar booking
│   │   ├── BookingDetail.tsx    # Halaman booking ruangan
│   │   ├── BookingGuide.tsx     # Panduan booking
│   │   ├── FoodCheckout.tsx     # Checkout F&B
│   │   ├── FoodMenu.tsx         # Menu F&B
│   │   ├── FoodSuccess.tsx      # Sukses pesan F&B
│   │   ├── Home.tsx             # Halaman landing
│   │   ├── LocationContact.tsx  # Lokasi & kontak
│   │   ├── Login.tsx            # Halaman login
│   │   ├── Payment.tsx          # Halaman pembayaran
│   │   ├── Profile.tsx          # Profil pengguna
│   │   ├── PromoPage.tsx        # Daftar promo
│   │   ├── Register.tsx         # Halaman register
│   │   └── Success.tsx          # Sukses booking
│   ├── services/                # Layanan API
│   │   ├── admin.service.ts     # Panggilan API admin
│   │   ├── ai.service.ts        # Rekomendasi AI
│   │   ├── api.ts               # API client dasar
│   │   ├── auth.service.ts      # Autentikasi
│   │   ├── bookings.ts          # Bookings (deprecated)
│   │   ├── consoles.ts          # Consoles (deprecated)
│   │   ├── food.service.ts      # API F&B
│   │   ├── payment.service.ts   # API pembayaran
│   │   ├── promo.service.ts     # API promo
│   │   ├── reservation.service.ts # API reservasi
│   │   └── room.service.ts      # API ruangan
│   ├── types/                   # Tipe TypeScript
│   │   ├── api.ts               # Tipe API
│   │   ├── booking.ts           # Tipe booking
│   │   └── food.ts              # Tipe F&B
│   ├── App.tsx                  # Komponen aplikasi utama
│   ├── index.css                # Style global
│   └── main.tsx                 # Entry point
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.cjs
├── README.md
├── tailwind.config.cjs
├── tsconfig.json
└── vite.config.js
```

## 🎯 Implementasi Fitur Utama

### Sistem Notifikasi Toast

```typescript
// Penggunaan dalam komponen
import Toast from "../components/Toast";

const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(
  null
);

const showToast = (
  message: string,
  type: "success" | "error" | "warning" | "info"
) => {
  setToast({ message, type });
};

// Render
{
  toast && (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  );
}
```

### Pengurutan Tabel

Dashboard admin memiliki header tabel yang dapat diurutkan:

- Klik header untuk mengurutkan
- Toggle ascending/descending
- Indikator visual (panah)
- Mendukung berbagai jenis field (tanggal, angka, string)

### Modal Konfirmasi

Semua tombol aksi menggunakan modal konfirmasi:

- Approve/Reject pembayaran
- Complete/Cancel reservasi
- Hapus record
- Background blur + desain card modern

### Pemetaan Gambar

Gambar ruangan otomatis dipetakan berdasarkan nama:

```typescript
const getDefaultImage = (category: string, roomName: string) => {
  const name = roomName.toLowerCase();
  if (category === "VIP") {
    if (name.includes("vip 1")) return "/src/assets/VIP room 1.png";
    if (name.includes("vip 2")) return "/src/assets/VIP room 2.png";
    if (name.includes("vip 3")) return "/src/assets/VIP room 3.png";
  }
  // ... dst
};
```

## 🎨 Palet Warna

### Tombol Aksi

- **Complete/Approve**: `bg-green-100 text-green-700` (Hijau Pucat)
- **View/Edit**: `bg-blue-100 text-blue-700` (Biru Pucat)
- **Cancel**: `bg-orange-100 text-orange-700` (Oranye Pucat)
- **Delete/Reject**: `bg-red-100 text-red-700` (Merah Pucat)

### Warna Status

- **Confirmed**: Hijau
- **Pending/Waiting**: Kuning
- **Completed**: Biru
- **Cancelled/Rejected**: Merah

## 🔒 Keamanan

- Autentikasi token JWT
- Protected routes dengan RequireAdmin
- Kontrol akses berbasis peran
- Validasi & sanitasi input
- Konfigurasi CORS
- Environment variables untuk data sensitif

## 📱 Desain Responsif

- Pendekatan mobile-first
- Breakpoint:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- UI ramah sentuh untuk mobile
- Gambar dioptimalkan untuk berbagai ukuran layar

## 🐛 Masalah yang Diketahui & Solusi

### Resolusi Modul TypeScript untuk Gambar dengan Spasi

**Masalah:** Cannot find module '../assets/VIP room 1.png'

**Solusi:** Gunakan path langsung tanpa import:

```typescript
// ❌ Jangan
import VIPRoom1 from "../assets/VIP room 1.png";

// ✅ Gunakan
const imageUrl = "/src/assets/VIP room 1.png";
```

### CORS Error saat Update Reservasi

**Masalah:** Kebijakan CORS memblokir request PUT

**Solusi:** Backend perlu mengkonfigurasi CORS headers:

```python
# Contoh FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📚 Dokumentasi API

Dokumentasi API lengkap tersedia di:

- `API_INTEGRATION.md` - Panduan integrasi API
- `AI_RECOMMENDATIONS.md` - Dokumentasi fitur AI

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/FiturKeren`)
3. Commit perubahan (`git commit -m 'Menambahkan fitur keren'`)
4. Push ke branch (`git push origin feature/FiturKeren`)
5. Buka Pull Request

### Standar Coding

- Gunakan TypeScript untuk keamanan tipe
- Ikuti aturan ESLint
- Gunakan functional components dengan hooks
- Tulis commit message yang bermakna
- Tambahkan komentar untuk logika yang kompleks

## 📝 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

## 👥 Tim

- **Developer** - [@Kemphy](https://github.com/Kemphy)

## 📞 Kontak

BigGames - info@biggames.com

Link Proyek: [https://github.com/Kemphy/BigGames_Web](https://github.com/Kemphy/BigGames_Web)

## 🙏 Ucapan Terima Kasih

- [Dokumentasi React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Heroicons](https://heroicons.com/) - Ikon SVG

---

<div align="center">
  Dibuat dengan ❤️ oleh Tim Compeeps NJ
</div>
