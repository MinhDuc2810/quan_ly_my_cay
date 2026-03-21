import { PublicHeader, PublicFooter } from "@/components/layout";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  { id: 1, name: "MÌ KIM CHI THẬP CẨM", image: "/my_hai_san.png", price: "55.000đ" },
  { id: 2, name: "MÌ KIM CHI BẠCH TUỘC", image: "/my_hai_san.png", price: "49.000đ" },
  { id: 3, name: "MÌ KIM CHI CÁ HỒI", image: "/my_hai_san.png", price: "59.000đ" },
  { id: 4, name: "MÌ KIM CHI BÒ MỸ CUỘN NẤM TRỨNG", image: "/my_hai_san.png", price: "55.000đ" },
  { id: 5, name: "MÌ KIM CHI HẢI SẢN", image: "/my_hai_san.png", price: "55.000đ" },
  { id: 6, name: "MÌ LẨU THÁI THẬP CẨM", image: "/my_lau_thai.png", price: "55.000đ" },
  { id: 7, name: "MÌ LẨU THÁI HẢI SẢN", image: "/my_lau_thai.png", price: "55.000đ" },
  { id: 8, name: "LẨU KIM CHI ĐẶC BIỆT", image: "/lau.png", price: "189.000đ" },
  { id: 9, name: "LẨU THÁI HẢI SẢN", image: "/lau.png", price: "199.000đ" },
  { id: 10, name: "TOKBOKKI PHÔ MAI", image: "/my_hai_san.png", price: "45.000đ" },
];

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      
      <PublicHeader />

      <main className="flex-1 pt-24 pb-20">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          
          {/* Category Header */}
          <div className="flex justify-center mb-16">
            <div className="relative inline-block px-12 py-4 bg-gradient-to-b from-[#4a0808] to-[#2a0505] rounded-full border-[2px] border-[#c5a059] shadow-2xl">
              <h1 className="text-3xl md:text-4xl font-black text-[#c5a059] tracking-[0.2em] uppercase italic">
                MÌ KIM CHI
              </h1>
              {/* Decorative inner glow */}
              <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none"></div>
            </div>
          </div>

          {/* Menu Grid - 4 items per row, centered last row */}
          <div className="flex flex-wrap justify-center gap-8 xl:gap-10">
            {menuItems.map((item) => (
              <div key={item.id} className="group w-full sm:w-[calc(50%-2rem)] lg:w-[calc(25%-2rem)] xl:w-[320px]">
                {/* Product Card (Dark Red style as in image) */}
                <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-[#6b0f0f] to-[#3a0808] rounded-[24px] border-[1px] border-[#c5a059]/50 overflow-hidden shadow-xl transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                  
                  {/* Decorative corner glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>

                  {/* Image container */}
                  <div className="relative w-full h-[65%] p-6 flex items-center justify-center">
                    <div className="relative w-full h-full transform transition-transform duration-500 group-hover:scale-110">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  </div>

                  {/* Product Info / Label Area (Style as in image) */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%]">
                    <div className="bg-gradient-to-b from-[#4a0808]/80 to-[#1a0404]/90 backdrop-blur-sm border border-[#c5a059] rounded-xl py-3 px-4 shadow-lg text-center min-h-[70px] flex flex-col justify-center items-center">
                      <h3 className="text-[#fdf6e6] font-bold text-sm md:text-sm tracking-wider leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-[#c5a059] font-black mt-1 text-base">
                        {item.price}
                      </p>
                    </div>
                  </div>

                  {/* Corner Label or Level indicator (Optional decoration) */}
                  <div className="absolute top-5 left-5 bg-[#c5a059] text-[#2a0505] text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter">
                    Hot Seller
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
