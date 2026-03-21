import Image from "next/image";

const spaceBlocks = [
  {
    id: 1,
    title: "Không Gian Tổng Thể",
    description: "Mi cay SASIN tự hào sở hữu không gian rộng rãi và thoáng đãng, mang đến cảm giác thoải mái và thư giãn cho mọi thực khách. Với thiết kế hiện đại pha lẫn chút cổ điển, không gian của chúng tôi hứa hẹn sẽ mang đến cho quý khách những trải nghiệm ẩm thực tuyệt vời.",
    image: "/space_1.png",
    reverse: false,
  },
  {
    id: 2,
    title: "Nội Thất và Trang Trí",
    description: "Nội thất của nhà hàng được chọn lựa kỹ lưỡng, từ những chiếc ghế êm ái đến bàn ăn sang trọng. Mỗi góc nhỏ trong nhà hàng đều được trang trí tinh tế với những tác phẩm nghệ thuật độc đáo, ánh đèn ấm áp, tạo nên một bầu không khí thân thiện và gần gũi.",
    image: "/space_2.png",
    reverse: true,
  },
];

export default function SpaceSection() {
  return (
    <section className="py-24 bg-[#5c0b0b] relative overflow-hidden">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4a0808] via-[#5c0b0b] to-[#2a0505] z-0"></div>
      
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Section Header */}
        <div className="flex items-center justify-center mb-20 gap-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#c5a059]"></div>
          <h2 className="text-4xl md:text-5xl font-black text-[#fdf6e6] tracking-[0.2em] uppercase whitespace-nowrap drop-shadow-lg">
            KHÔNG GIAN
          </h2>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#c5a059]"></div>
        </div>

        {/* Space Blocks */}
        <div className="flex flex-col gap-24 lg:gap-32">
          {spaceBlocks.map((block) => (
            <div 
              key={block.id} 
              className={`flex flex-col ${block.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-20`}
            >
              {/* Image Side */}
              <div className="w-full lg:w-1/2 group">
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border-[4px] border-[#c5a059] shadow-[0_0_40px_rgba(0,0,0,0.5)] transform transition-transform duration-700 group-hover:scale-[1.02]">
                  <Image
                    src={block.image}
                    alt={block.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Subtle Glow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none"></div>
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full lg:w-1/2 text-left space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#c5a059] text-2xl font-bold">⇒</span>
                    <h3 className="text-[#c5a059] text-2xl md:text-3xl font-black tracking-wide uppercase italic">
                      {block.title}:
                    </h3>
                  </div>
                  <p className="text-[#fdf6e6] text-lg md:text-xl leading-relaxed font-medium italic opacity-95 first-letter:text-3xl first-letter:font-bold first-letter:text-[#c5a059]">
                    {block.description}
                  </p>
                </div>
                
                {/* Decorative Element */}
                <div className="w-20 h-1 bg-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.5)]"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
