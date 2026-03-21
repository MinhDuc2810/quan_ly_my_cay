import Image from "next/image";
import Link from "next/link";

const menuItems = [
  { id: 1, title: "MÌ KIM CHI", image: "/my_hai_san.png" },
  { id: 2, title: "MÌ LẨU THÁI", image: "/my_lau_thai.png" },
  { id: 3, title: "CÁC LOẠI LẨU", image: "/lau.png" },
  { id: 4, title: "MÓN TRỘN", image: "/mon_tron.png" },
  { id: 5, title: "TOKBOKKI", image: "/tokbokki.png" },
  { id: 6, title: "MÓN GÀ SASIN", image: "/ga_ran.png" },
  { id: 7, title: "CÁC LOẠI BÁNH", image: "/cac_loai_banh.png" },
  { id: 8, title: "ĐỒ UỐNG", image: "/do_uong.png" },
];

export default function MenuSection() {
  return (
    <section className="py-20 bg-white">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Header của Section */}
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl md:text-5xl font-black text-text-main tracking-tight uppercase mb-4">
            Thực đơn của <span className="text-primary italic">SASIN</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
          <p className="mt-4 text-text-muted max-w-2xl mx-auto text-lg">
            Khám phá hương vị mỳ cay 7 cấp độ độc bản cùng các loại lẩu và món ăn kèm chuẩn vị Hàn Quốc.
          </p>
        </div>

        {/* Grid 2 dòng, mỗi dòng 4 cột (trên desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-14">
          {menuItems.map((item) => (
            <div key={item.id} className="group relative">
              {/* Thẻ Card chính */}
              <div className="relative aspect-square rounded-[32px] overflow-hidden border-[3px] border-[#c5a059] shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] cursor-pointer">
                
                {/* Ảnh sản phẩm */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />

                {/* Hiệu ứng lớp phủ khi hover để làm rõ viền */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                
                {/* Viền sáng bao quanh ảnh (Inner glow hiệu ứng như ảnh mẫu) */}
                <div className="absolute inset-0 rounded-[28px] border border-white/20 pointer-events-none"></div>
              </div>

              {/* Label tên món ở dưới (Nằm đè lên chân card) */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] z-20">
                <div className="bg-gradient-to-b from-[#fdf6e6] to-[#e8d5b1] py-3 px-6 rounded-xl shadow-lg border border-[#c5a059] text-center transform transition-transform duration-300 group-hover:-translate-y-1">
                  <span className="text-[#2a1313] font-extrabold text-sm md:text-base tracking-widest whitespace-nowrap">
                    {item.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
