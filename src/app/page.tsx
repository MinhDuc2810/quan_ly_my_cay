"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import { PublicHeader, PublicFooter } from "@/components/layout";
import BannerSlider from "@/components/home/BannerSlider";
import MenuSection from "@/components/home/MenuSection";
import SpaceSection from "@/components/home/SpaceSection";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success) {
            const role = res.data.user.role;
            if (role === "ADMIN") {
              router.push("/admin");
              return;
            } else if (role === "STAFF") {
              router.push("/pos");
              return;
            }
          }
        } catch (error) {
          console.error("Auth check failed", error);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navbar Mỏng nhẹ */}
      <PublicHeader />

      {/* Banner Section - Slider */}
      <main className="flex-1 pt-14 xl:pt-16">
        <BannerSlider />

        {/* Section Thực Đơn */}
        <MenuSection />

        {/* Section Không Gian */}
        <SpaceSection />

        {/* Khung Khuyến Mãi Ngang */}
        <section id="khuyen-mai" className="py-20 bg-gray-50/50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="text-center mb-16">
              <h2 className="text-secondary font-bold tracking-wide uppercase">Không Thể Bỏ Lỡ</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-text-main sm:text-4xl">
                Khuyến mãi đang diễn ra
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-background rounded-2xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="h-48 bg-gradient-to-r from-orange-400 to-primary relative overflow-hidden flex items-center justify-center">
                  <span className="text-white font-black text-6xl opacity-20 rotate-12 group-hover:scale-110 transition-transform">SALE</span>
                  <div className="absolute font-extrabold text-white text-3xl drop-shadow-md">Giảm 50%</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-text-main mb-2">Combo Đôi Bạn Sinh Viên</h3>
                  <p className="text-text-muted text-sm mb-4">Áp dụng từ thứ 2 đến thứ 5 hàng tuần. Cần xuất trình thẻ sinh viên.</p>
                  <button className="text-primary font-bold hover:text-secondary inline-flex items-center">
                    Lấy mã ưu đãi <span className="ml-1">→</span>
                  </button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-background rounded-2xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="h-48 bg-gradient-to-r from-yellow-400 to-orange-500 relative overflow-hidden flex items-center justify-center">
                  <span className="text-white font-black text-6xl opacity-20 -rotate-12 group-hover:scale-110 transition-transform">HOT</span>
                  <div className="absolute font-extrabold text-white text-3xl drop-shadow-md">Tặng Topping</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-text-main mb-2">Đại Tiệc Cấp Độ 7</h3>
                  <p className="text-text-muted text-sm mb-4">Chinh phục thành công bát mỳ cấp độ 7: Tặng ngay voucher 100K và full topping.</p>
                  <button className="text-primary font-bold hover:text-secondary inline-flex items-center">
                    Chi tiết <span className="ml-1">→</span>
                  </button>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-background rounded-2xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="h-48 bg-sidebar relative overflow-hidden flex items-center justify-center">
                  <span className="text-white font-black text-6xl opacity-10 rotate-6 group-hover:scale-110 transition-transform">NEW</span>
                  <div className="absolute font-extrabold text-accent text-3xl drop-shadow-md">Món Tráng Miệng</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-text-main mb-2">Free Trà Sữa Thái</h3>
                  <p className="text-text-muted text-sm mb-4">Khi bill thanh toán từ 300K, bạn sẽ nhận được 2 ly trà sữa Thái giải nhiệt cực đã.</p>
                  <button className="text-primary font-bold hover:text-secondary inline-flex items-center">
                    Xem Menu <span className="ml-1">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
