"use client";

import React from "react";
import Slider from "react-slick";
import Image from "next/image";

// Import CSS của Slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const banners = [
  "/banner_1.png",
  "/banner_2.png",
  "/banner_3.png",
  "/banner_4.png",
];

function NextArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} !flex items-center justify-center !w-12 !h-12 !right-6 z-10 before:!content-[''] group/arrow`}
      style={{ ...style }}
      onClick={onClick}
    >
      <div className="bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full w-full h-full flex items-center justify-center transition-all border border-white/10 group-hover/arrow:scale-110">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

function PrevArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} !flex items-center justify-center !w-12 !h-12 !left-6 z-10 before:!content-[''] group/arrow`}
      style={{ ...style }}
      onClick={onClick}
    >
      <div className="bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full w-full h-full flex items-center justify-center transition-all border border-white/10 group-hover/arrow:scale-110">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
        </svg>
      </div>
    </div>
  );
}

export default function BannerSlider() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    fade: true,
    cssEase: "linear",
    pauseOnHover: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dotsClass: "slick-dots !bottom-8",
  };

  // Tránh lỗi Hydration mismatch bằng cách không render Slider trên Server
  if (!mounted) {
    return (
      <section className="relative w-full overflow-hidden bg-black h-[250px] sm:h-[350px] md:h-[450px] lg:h-[480px]">
        {/* Lớp nền mờ ảo phía sau */}
        <div className="absolute inset-0 z-0">
          <img
            src={banners[0]}
            alt="Blur Background"
            className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
          />
        </div>
        {/* Ảnh chính hiển thị trọn vẹn phía trước */}
        <div className="relative w-full h-full z-10">
          <img
            src={banners[0]}
            alt="Mỳ Cay SASIN Banner Placeholder"
            className="w-full h-full object-contain block"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-black group h-[250px] sm:h-[350px] md:h-[450px] lg:h-[480px]">
      <Slider {...settings}>
        {banners.map((src, index) => (
          <div key={index} className="relative w-full outline-none h-[250px] sm:h-[350px] md:h-[450px] lg:h-[480px]">
            {/* Lớp nền mờ phía sau để bù chiều rộng */}
            <div className="absolute inset-0 z-0 overflow-hidden">
               <img
                src={src}
                alt="Blur Backdrop"
                className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
              />
            </div>
            {/* Ảnh chính hiển thị ở giữa, đầy đủ không mất chữ */}
            <div className="relative h-full w-full z-10 flex items-center justify-center">
              <img
                src={src}
                alt={`Mỳ Cay SASIN Banner ${index + 1}`}
                className="w-full h-full object-contain block"
              />
            </div>
          </div>
        ))}
      </Slider>

      <style jsx global>{`
        .slick-dots li button:before {
          color: white !important;
          font-size: 10px !important;
          opacity: 0.5;
          transition: all 0.3s ease;
        }
        .slick-dots li.slick-active button:before {
          color: #DC2626 !important;
          opacity: 1;
          transform: scale(1.5);
        }
        .slick-dots li {
          margin: 0 4px !important;
        }
        /* Hiệu ứng ẩn hiện tên mũi tên khi không hover */
        .slick-prev, .slick-next {
          opacity: 0;
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .group:hover .slick-prev, .group:hover .slick-next {
          opacity: 1;
        }
        .slick-prev { transform: translateX(-10px); }
        .group:hover .slick-prev { transform: translateX(0); }
        .slick-next { transform: translateX(10px); }
        .group:hover .slick-next { transform: translateX(0); }
      `}</style>
    </section>
  );
}
