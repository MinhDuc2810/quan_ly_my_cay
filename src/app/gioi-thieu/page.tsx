import { PublicHeader, PublicFooter } from "@/components/layout";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans selection:bg-primary selection:text-white">
      
      <PublicHeader />

      <main className="flex-1 pt-24 pb-20">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          
          {/* Section 1: Ý NGHĨA THƯƠNG HIỆU */}
          <div className="mb-24">
            <div className="flex justify-center mb-16">
              <div className="relative inline-block px-14 py-4 bg-gradient-to-b from-[#800000] to-[#4a0000] rounded-[12px] border border-[#c5a059] shadow-xl">
                <h1 className="text-2xl md:text-3xl font-black text-[#fdf6e7] tracking-[0.15em] uppercase">
                  Ý NGHĨA THƯƠNG HIỆU
                </h1>
              </div>
            </div>

            {/* Logo Display */}
            <div className="flex flex-wrap justify-center gap-10 md:gap-20 mb-20">
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-[#800000] p-1 shadow-2xl">
                <Image src="/logo1.jpg" alt="Logo SASIN" fill className="object-contain rounded-full" />
              </div>
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-[#800000] p-1 shadow-2xl">
                <Image src="/logo1.jpg" alt="Logo SASIN 2" fill className="object-contain rounded-full" />
              </div>
            </div>

            {/* Content Cards Row 1 (3 cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <AboutCard 
                number="1. TỔNG THỂ" 
                content={[
                  { label: "Hình dạng:", text: "Logo dạng tròn, biểu trưng cho sự viên mãn, chu toàn và trọn vẹn — một nét văn hóa Á Đông rất truyền thống." },
                  { label: "Màu sắc chủ đạo:", text: "Đỏ, cam, vàng và trắng — thể hiện:" },
                  { bullet: "Đỏ:", text: "Sự cay nồng, nhiệt huyết, năng lượng và đam mê." },
                  { bullet: "Cam & vàng:", text: "Ấm áp, thân thiện, tượng trưng cho lửa và sự đậm đà trong từng tô mì." },
                  { bullet: "Trắng:", text: "Tinh khiết, tạo sự đối lập để nổi bật." },
                ]}
              />
              <AboutCard 
                number='2. NHÂN VẬT ỚT – "Linh Hồn Của Cay"' 
                content={[
                  { label: "Hình ảnh:", text: "Trái ớt đỏ được nhân cách hóa, có mắt mũi, miệng cười tự tin, giơ ngón cái 👍 — đại diện cho:" },
                  { bullet: "", text: "Cay cấp độ cao nhưng thân thiện, mời gọi khách thử thách." },
                  { bullet: "", text: "Tinh thần tươi vui — năng động — Gen Z rất phù hợp với nhóm khách hàng mục tiêu chính." },
                  { bullet: "", text: "Linh vật thương hiệu." },
                ]}
              />
              <AboutCard 
                number="3. YẾU TỐ LỬA VÀ PHƯỢNG HOÀNG" 
                content={[
                  { label: "Hai cánh lửa đỏ", text: "Bao quanh trái ớt tạo hình giống cánh phượng hoàng — biểu tượng:" },
                  { bullet: "Sức mạnh tái sinh:", text: "“ăn cay là vượt ngưỡng giới hạn bản thân”." },
                  { bullet: "Ngọn lửa đam mê", text: "Và bùng cháy thương hiệu — : “Ăn là phê – Cay là mê!”" },
                ]}
              />
            </div>

            {/* Content Cards Row 2 (2 cards centered) */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="w-full md:w-[calc(33.33%-22px)]">
                <AboutCard 
                  number="4. CHỮ SASIN & BIỂU TƯỢNG TÔ MÌ" 
                  content={[
                    { label: "Chữ “SASIN”", text: "Cách điệu vòng cung theo hình tròn, chữ O thay bằng tô mì nóng bốc khói với đôi đũa — tạo dấu ấn:" },
                    { bullet: "", text: "Gắn liền văn hóa Hàn Quốc (SASIN – thủ đô ẩm thực cay)." },
                    { bullet: "", text: "Tô mì là trái tim của thương hiệu, ngay trung tâm tên gọi." },
                    { bullet: "", text: "Biểu trưng của “Mì Cay SASIN – chuẩn Hàn, đậm vị Việt”." },
                  ]}
                />
              </div>
              <div className="w-full md:w-[calc(33.33%-22px)]">
                <AboutCard 
                  number="5. CÂU CHỮ KHẲNG ĐỊNH" 
                  content={[
                    { label: "Dòng chữ", text: "“MÌ CAY 7 CẤP ĐỘ HÀN QUỐC” rõ ràng, nổi bật:" },
                    { bullet: "", text: "Nhấn mạnh USP (Unique Selling Point) – 7 cấp độ cay là trải nghiệm nổi bật, khác biệt hóa so với các thương hiệu khác." },
                    { bullet: "", text: "“Hàn Quốc” tạo niềm tin về nguồn gốc, giúp khách hàng yên tâm về phong cách & hương vị chuẩn." },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Section 2: ĐỊNH NGHĨA THƯƠNG HIỆU */}
          <div className="pt-20 border-t border-gray-100">
            <div className="flex justify-center mb-10">
              <div className="relative inline-block px-14 py-4 bg-gradient-to-b from-[#800000] to-[#4a0000] rounded-[12px] border border-[#c5a059] shadow-xl">
                <h2 className="text-2xl md:text-3xl font-black text-[#fdf6e7] tracking-[0.15em] uppercase">
                  ĐỊNH NGHĨA THƯƠNG HIỆU
                </h2>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto bg-gradient-to-b from-[#900000] to-[#5a0000] rounded-2xl p-8 md:p-12 shadow-2xl border border-[#c5a059]/30">
              <div className="space-y-8 text-[#fdf6e7] text-lg md:text-xl leading-relaxed font-medium">
                <p>
                  Mì Cay SASIN là thương hiệu mì cay chuẩn Hàn Quốc, mang trong mình tinh thần đậm đà – thử thách – lan tỏa. Với biểu tượng trái ớt đỏ tươi, ngọn lửa rực cháy và tô mì nóng hổi, logo thể hiện trọn vẹn thông điệp: <span className="font-bold text-[#c5a059] italic">“Mỗi cấp độ là một cuộc chơi – mỗi tô mì là một câu chuyện“</span>.
                </p>
                <div className="flex gap-4 items-start">
                  <span className="text-[#c5a059] text-2xl mt-1 shrink-0">▶</span>
                  <p>
                    Đây không chỉ là món ăn, mà là hành trình khám phá khẩu vị – vượt qua giới hạn bản thân – và kết nối cộng đồng trẻ với niềm vui, năng lượng và cá tính riêng biệt. <span className="text-[#c5a059] font-bold">Mì Cay SASIN</span> — nơi vị cay trở thành thương hiệu, sự thân thiện trở thành phong cách.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function AboutCard({ number, content }: { number: string, content: any[] }) {
  return (
    <div className="bg-gradient-to-b from-[#900000] to-[#5a0000] rounded-2xl p-8 h-full shadow-2xl border border-[#c5a059]/30 transform transition-transform duration-500 hover:scale-[1.02]">
      <h3 className="text-[#fdf6e7] font-black text-xl mb-6 tracking-wide uppercase italic">
        {number}
      </h3>
      <div className="space-y-4">
        {content.map((item, idx) => (
          <div key={idx} className="flex gap-2 text-[#fdf6e7] text-[15px] leading-relaxed opacity-95">
            {item.bullet !== undefined ? (
              <div className="flex gap-2">
                <span className="text-[#c5a059] font-black shrink-0">•</span>
                <p>
                  <span className="font-bold text-[#c5a059]">{item.bullet} </span>
                  {item.text}
                </p>
              </div>
            ) : (
              <p>
                <span className="font-bold text-[#c5a059]">{item.label} </span>
                {item.text}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
