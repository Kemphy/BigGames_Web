# 🖼️ Assets Image Mapping

## Daftar Gambar yang Digunakan

### 🏠 Room Images

- **VIPRoom1.jpg** → VIP Room 1 (Ruangan VIP pertama)
- **VIPRoom2.jpg** → VIP Room 2 (Ruangan VIP kedua)
- **VIPRoom3.jpg** → VIP Room 3 (Ruangan VIP ketiga)
- **RegulerRoom1.jpg** → Regular Room 1 (Ruangan reguler pertama)
- **RegulerRoom2.jpg** → Regular Room 2 (Ruangan reguler kedua)
- **SimulatorRoom.jpg** → Simulator Room (Ruangan simulator)

### 🎨 Logo & Branding

- **Logo.png** → Logo bulat (untuk favicon, navbar)
- **LogoPanjang.png** → Logo horizontal (untuk header, banner)

### 📋 Info Pages

- **CaraBooking.jpg** → Gambar panduan cara booking
- **PromoDanDiskon.jpg** → Gambar promo dan diskon
- **Lokasi.jpg** → Gambar lokasi dan kontak

### 🍔 Food & Beverage ✅ (Sudah Digunakan di FoodMenu.tsx)

- **AyamGeprek.jpg** → Menu ayam geprek
- **BurgerBeef.jpg** → Menu burger beef
- **ChickenWings.jpg** → Menu chicken wings (sayap ayam)
- **FrenchFries.jpg** → Menu kentang goreng
- **MieGoreng.jpg** → Menu mie goreng
- **NasiGoreng.jpg** → Menu nasi goreng
- **Nachos.jpg** → Menu nachos
- **Popcorn.jpg** → Menu popcorn
- **PotatoWedges.jpg** → Menu potato wedges

### 🥤 Beverages ✅ (Sudah Digunakan di FoodMenu.tsx)

- **CocaCola.jpg** → Minuman Coca Cola
- **EsJeruk.jpg** → Minuman es jeruk (jeruk peras)
- **EsTeh.jpg** → Minuman es teh manis
- **KopiSusu.jpg** → Minuman kopi susu
- **MineralWater.jpg** → Air mineral

## Penggunaan dalam Kode

### ✅ Cara yang Benar (ES Module Import)

```tsx
// Import di atas file
import vipRoom1 from '../assets/VIPRoom1.jpg'
import logo from '../assets/Logo.png'

// Gunakan dalam component
<img src={vipRoom1} alt="VIP Room 1" />
<img src={logo} alt="Logo" />
```

### ❌ Cara yang Salah (Absolute Path)

```tsx
// Ini TIDAK akan berfungsi di production
<img src="/src/assets/VIPRoom1.jpg" alt="VIP Room 1" />
<img src="/assets/VIPRoom1.jpg" alt="VIP Room 1" />
```

## File yang Sudah Diupdate

1. ✅ **src/components/ConsoleCard.tsx** - Room images untuk card
2. ✅ **src/components/Logo.tsx** - Logo images
3. ✅ **src/pages/BookingDetail.tsx** - Room detail images
4. ✅ **src/pages/Home.tsx** - FAQ section images
5. ✅ **src/pages/FoodMenu.tsx** - Food & Beverage menu images

## Catatan Penting

- ✅ Semua nama file menggunakan **PascalCase** tanpa spasi
- ✅ Format file: `.jpg` untuk photos, `.png` untuk logo
- ✅ Vite akan otomatis optimize dan bundle semua images
- ✅ Images akan di-hash untuk cache busting (contoh: `VIPRoom1-CuH-_qJi.jpg`)
- ✅ Total size images setelah build: ~8.5 MB (sudah optimized)
- ✅ **FoodMenu.tsx** menggunakan smart matching berdasarkan nama item dari backend

## Menambah Gambar Baru

Jika ingin menambah gambar baru:

1. Taruh file di folder `src/assets/`
2. Gunakan nama file **PascalCase** tanpa spasi (contoh: `NewRoomImage.jpg`)
3. Import di file yang membutuhkan:
   ```tsx
   import newRoom from "../assets/NewRoomImage.jpg";
   ```
4. Gunakan dalam component:
   ```tsx
   <img src={newRoom} alt="New Room" />
   ```

## Build Output Example

```bash
# Room Images
dist/assets/VIPRoom1-CuH-_qJi.jpg          407.13 kB
dist/assets/VIPRoom2-BpbHghS3.jpg          306.46 kB
dist/assets/VIPRoom3-BXvsXHMS.jpg          482.85 kB
dist/assets/RegulerRoom1-CYev_Lu5.jpg      465.67 kB
dist/assets/RegulerRoom2-hiAPsbNd.jpg      429.59 kB
dist/assets/SimulatorRoom-BSldS5y0.jpg     498.58 kB

# Food & Beverage Images
dist/assets/AyamGeprek-BvsdOyfG.jpg        488.02 kB
dist/assets/BurgerBeef-BwMMcQkw.jpg        557.60 kB
dist/assets/ChickenWings-BSMozPLY.jpg      478.06 kB
dist/assets/FrenchFries-CPXOIfIr.jpg       420.91 kB
dist/assets/MieGoreng-CsFIiL3T.jpg         495.58 kB
dist/assets/NasiGoreng-B7gEMBIC.jpg        572.17 kB
dist/assets/Nachos-vu1ST6rX.jpg            466.61 kB
dist/assets/Popcorn-BrMPTPLf.jpg            95.24 kB
dist/assets/PotatoWedges-DLwhsn7k.jpg      485.74 kB
dist/assets/CocaCola-tvKj95Pi.jpg          434.01 kB
dist/assets/EsJeruk-DNe6i9x2.jpg           332.74 kB
dist/assets/EsTeh-XKcXsu2E.jpg             339.03 kB
dist/assets/KopiSusu-CszXBoXT.jpg          354.52 kB
dist/assets/MineralWater-BJeM9v75.jpg      376.83 kB

# Logo & Info
dist/assets/Logo-BaPlgOFK.png            1,504.50 kB
dist/assets/LogoPanjang-BOLT5gNf.png       506.79 kB
dist/assets/CaraBooking-DMr0KDC3.jpg        89.65 kB
dist/assets/Lokasi-DFwGCqCd.jpg            286.09 kB
dist/assets/PromoDanDiskon-DMhElAWO.jpg    305.22 kB
```

## 🎯 Smart Image Matching di FoodMenu

FoodMenu.tsx menggunakan smart matching untuk menampilkan gambar:

1. **Matching by Name** - Jika nama item mengandung kata kunci (case-insensitive):

   - "ayam geprek" → AyamGeprek.jpg
   - "burger" → BurgerBeef.jpg
   - "es teh" → EsTeh.jpg
   - dll.

2. **Fallback by Category** - Jika tidak cocok, gunakan gambar sesuai kategori:

   - FOOD → Rotasi antara burger, ayam geprek, nasi goreng, mie goreng
   - BEVERAGE/DRINK → Rotasi antara es teh, es jeruk, kopi susu, coca cola
   - SNACK → Rotasi antara french fries, chicken wings, nachos, popcorn

3. **Backend Image URL** - Jika backend menyediakan `image_url`, akan digunakan prioritas pertama

Hash di nama file (`-CuH-_qJi`) akan berubah setiap kali file diupdate untuk cache busting.
