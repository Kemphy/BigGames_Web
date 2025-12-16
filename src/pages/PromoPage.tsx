import Footer from "../components/Footer"

export default function PromoPage() {
  const promos = [
    {
      code: "FIRSTGAME",
      title: "First Timer Bonus",
      discount: "30%",
      description: "Diskon 30% untuk booking pertama Anda",
      validUntil: "31 Desember 2025",
      terms: ["Minimal booking 2 jam", "Berlaku untuk semua room", "Hanya untuk user baru"]
    },
    {
      code: "WEEKEND50",
      title: "Weekend Special",
      discount: "50K",
      description: "Potongan Rp 50.000 untuk booking weekend",
      validUntil: "Setiap weekend",
      terms: ["Sabtu & Minggu", "Minimal booking 3 jam", "Semua kategori room"]
    },
    {
      code: "GROUPFUN",
      title: "Group Booking",
      discount: "20%",
      description: "Diskon 20% untuk booking 2 room atau lebih",
      validUntil: "Berlaku selamanya",
      terms: ["Minimal 2 room", "Waktu booking bersamaan", "Tidak bisa digabung promo lain"]
    },
    {
      code: "MIDNIGHT",
      title: "Midnight Gaming",
      discount: "40%",
      description: "Diskon 40% untuk booking jam 00.00 - 06.00",
      validUntil: "Setiap hari",
      terms: ["Jam 00.00 - 06.00 WIB", "Minimal 2 jam", "VIP & Regular Room"]
    },
    {
      code: "LONGGAME",
      title: "Marathon Gamer",
      discount: "25%",
      description: "Diskon 25% untuk booking 6 jam atau lebih",
      validUntil: "Berlaku selamanya",
      terms: ["Minimal 6 jam", "Semua room kecuali simulator", "Bisa untuk weekday & weekend"]
    },
    {
      code: "BIRTHDAY",
      title: "Birthday Special",
      discount: "50%",
      description: "Diskon 50% di bulan ulang tahun Anda",
      validUntil: "Bulan lahir Anda",
      terms: ["Tunjukkan KTP saat datang", "1x booking per bulan lahir", "Maksimal 4 jam"]
    }
  ]

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-16 min-h-[calc(100vh-4rem)]">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
          Promo & Diskon
        </h1>
        <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Dapatkan pengalaman gaming terbaik dengan berbagai promo menarik dari BigGames
        </p>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {promos.map((promo, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-500/50 transition-all hover:transform hover:scale-105"
            >
              {/* Discount Badge */}
              <div className="inline-block bg-gradient-to-r from-blue-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                {promo.discount} OFF
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-2">{promo.title}</h3>
              
              {/* Description */}
              <p className="text-gray-300 mb-4">{promo.description}</p>

              {/* Promo Code */}
              <div className="bg-black/30 rounded-lg p-3 mb-4 border border-blue-500/30">
                <p className="text-xs text-gray-400 mb-1">Kode Promo:</p>
                <p className="text-xl font-mono font-bold text-blue-400">{promo.code}</p>
              </div>

              {/* Valid Until */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Berlaku hingga: {promo.validUntil}</span>
              </div>

              {/* Terms */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-gray-400 mb-2">Syarat & Ketentuan:</p>
                <ul className="space-y-1">
                  {promo.terms.map((term, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>



        {/* Loyalty Program */}
        <div className="mt-12 max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
            ⭐ Reward Points Program
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Kumpulkan poin setiap kali bermain dan dapatkan benefit eksklusif
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400 mb-2">+10 pts</div>
              <p className="text-white font-semibold">Setiap booking selesai</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-pink-400 mb-2">+5 pts</div>
              <p className="text-white font-semibold">Setiap order F&B</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
