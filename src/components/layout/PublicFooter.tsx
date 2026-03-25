import Image from "next/image";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main footer content */}
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 xl:gap-16">

          {/* Column 1: Logo & copyright */}
          <div className="flex flex-col items-start gap-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo1.jpg"
                alt="Logo Mỳ Cay SASIN"
                width={110}
                height={110}
                className="object-contain rounded-xl shadow-sm border border-gray-100"
              />
            </Link>
            <p className="text-gray-500 text-sm font-medium">2026 © mycaysasin.vn</p>
          </div>

          {/* Column 2: Customer care */}
          <div className="flex flex-col gap-4">
            <h3 className="text-primary font-bold text-[15px]">Chăm sóc khách hàng</h3>
            <div className="flex flex-col gap-3">
              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#1a1a1a] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <span className="text-gray-800 text-[14px] font-medium">cskh@mycaysasin.vn</span>
              </div>
              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#1a1a1a] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <span className="text-gray-800 text-[14px] font-medium">1900 0131</span>
              </div>
            </div>
            <Link href="/ve-chung-toi" className="text-primary font-bold text-[14px] hover:underline mt-1">
              Về chúng tôi
            </Link>
          </div>

          {/* Column 3: Policies */}
          <div className="flex flex-col gap-4">
            <h3 className="text-primary font-bold text-[15px]">Chính sách &amp; điều khoản</h3>
            <div className="flex flex-col gap-3">
              <Link href="/dieu-khoan" className="text-gray-600 text-[14px] hover:text-primary transition-colors">
                Điều khoản dịch vụ
              </Link>
              <Link href="/chinh-sach" className="text-gray-600 text-[14px] hover:text-primary transition-colors">
                Chính sách bảo mật
              </Link>
            </div>
          </div>

          {/* Column 4: Company info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-primary font-bold text-[15px] uppercase leading-snug">
              Công ty TNHH Thương Mại Mỳ Cay SASIN
            </h3>
            <div className="text-gray-600 text-[14px] leading-relaxed">
              <span className="font-semibold text-gray-800 block mb-1">Văn phòng:</span>
             Số 54 Triều Khúc, phường Thanh Liệt, Hà Nội.
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

