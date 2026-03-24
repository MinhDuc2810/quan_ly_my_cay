import { PublicHeader, PublicFooter } from "@/components/layout";
import BannerSlider from "@/components/home/BannerSlider";
import MenuSection from "@/components/home/MenuSection";
import SpaceSection from "@/components/home/SpaceSection";
import Link from "next/link";

export default function CustomerHomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header handled by PublicHeader with auth state */}
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
