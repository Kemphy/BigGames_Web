export default function BookingGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
          Cara Booking
        </h1>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Step 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                1
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Login atau Register</h2>
                <p className="text-gray-300 leading-relaxed">
                  Buat akun baru atau login dengan akun yang sudah ada. Anda akan memerlukan email dan password untuk membuat akun.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                2
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Pilih Kategori Room</h2>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Di halaman utama, pilih kategori room yang Anda inginkan:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong className="text-purple-400">VIP ROOM</strong> - Ruangan premium dengan fasilitas terbaik</li>
                  <li><strong className="text-purple-400">REGULAR ROOM</strong> - Ruangan standar dengan harga terjangkau</li>
                  <li><strong className="text-purple-400">SIMULATOR</strong> - Simulasi racing dan gaming profesional</li>
                  <li><strong className="text-purple-400">F&B</strong> - Pesan makanan dan minuman</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                3
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Pilih Room dan Atur Waktu</h2>
                <p className="text-gray-300 leading-relaxed">
                  Pilih room yang Anda sukai, lalu atur tanggal, waktu mulai, dan durasi bermain (1-12 jam). Sistem akan menampilkan harga total secara otomatis.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                4
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Gunakan Promo Code (Opsional)</h2>
                <p className="text-gray-300 leading-relaxed">
                  Jika Anda memiliki kode promo, masukkan di kolom promo code untuk mendapatkan diskon spesial.
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                5
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Lakukan Pembayaran</h2>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Klik tombol "Book Now" dan pilih metode pembayaran:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong className="text-purple-400">Transfer Bank</strong> - Upload bukti transfer</li>
                  <li><strong className="text-purple-400">E-Wallet</strong> - Bayar via QRIS, GoPay, OVO, Dana</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                6
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Tunggu Konfirmasi</h2>
                <p className="text-gray-300 leading-relaxed">
                  Admin akan memverifikasi pembayaran Anda dalam 1-2 jam. Anda akan mendapat notifikasi via email dan bisa cek status di halaman Profile.
                </p>
              </div>
            </div>
          </div>

          {/* Step 7 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                ✓
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Siap Bermain!</h2>
                <p className="text-gray-300 leading-relaxed">
                  Setelah booking dikonfirmasi, datang ke BigGames sesuai waktu yang sudah Anda pilih. Tunjukkan booking ID Anda di resepsionis.
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              💡 Tips Booking
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-purple-400">•</span>
                <span>Booking minimal H-1 untuk mendapatkan slot yang Anda inginkan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400">•</span>
                <span>Weekend dan hari libur cepat penuh, book lebih awal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400">•</span>
                <span>Dapatkan 10 reward points setiap booking selesai</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400">•</span>
                <span>Gunakan AI Recommendations untuk saran room terbaik</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
