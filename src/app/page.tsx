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
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
