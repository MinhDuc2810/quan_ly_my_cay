"use client";

import { PublicHeader, PublicFooter } from "@/components/layout";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import productService, { Product } from "@/services/product.service";
import categoryService, { Category } from "@/services/category.service";
import { getImageUrl } from "@/lib/utils";

function MenuContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products by category if categoryId exists
        const productRes = await productService.getProducts({
          category_id: categoryId || undefined
        });
        
        if (productRes.success) {
          setProducts(productRes.data);
        }

        // Fetch category info to show header name
        if (categoryId) {
          const catRes = await categoryService.getAllCategories();
          if (catRes.success) {
            const found = catRes.data.find(c => c.id === Number(categoryId));
            setCurrentCategory(found || null);
          }
        } else {
          setCurrentCategory(null);
        }
      } catch (error) {
        console.error("Failed to fetch menu data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  return (
    <main className="flex-1 pt-24 pb-20 min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Category Header */}
        <div className="flex justify-center mb-16">
          <div className="relative inline-block px-12 py-4 bg-gradient-to-b from-[#4a0808] to-[#2a0505] rounded-full border-[2px] border-[#c5a059] shadow-2xl">
            <h1 className="text-xl md:text-3xl font-black text-[#c5a059] tracking-[0.2em] uppercase italic text-center">
              {currentCategory ? currentCategory.name : "THỰC ĐƠN TẤT CẢ"}
            </h1>
            <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none"></div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex flex-wrap justify-center gap-8 xl:gap-10">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full sm:w-[calc(50%-2rem)] lg:w-[calc(25%-2rem)] xl:w-[320px] animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 rounded-[24px]"></div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((item) => (
              <div key={item.id} className="group w-full sm:w-[calc(50%-2rem)] lg:w-[calc(25%-2rem)] xl:w-[320px]">
                <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-[#6b0f0f] to-[#3a0808] rounded-[24px] border-[1px] border-[#c5a059]/50 overflow-hidden shadow-xl transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>

                  <div className="relative w-full h-[65%] p-6 flex items-center justify-center">
                    <div className="relative w-full h-full transform transition-transform duration-500 group-hover:scale-110">
                      <Image
                        src={getImageUrl(item.image_url)}
                        alt={item.name}
                        fill
                        className="object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%]">
                    <div className="bg-gradient-to-b from-[#4a0808]/80 to-[#1a0404]/90 backdrop-blur-sm border border-[#c5a059] rounded-xl py-3 px-4 shadow-lg text-center min-h-[70px] flex flex-col justify-center items-center">
                      <h3 className="text-[#fdf6e6] font-bold text-[12px] md:text-sm tracking-wider leading-snug uppercase">
                        {item.name}
                      </h3>
                      <p className="text-[#c5a059] font-black mt-1 text-base">
                        {item.price.toLocaleString()}đ
                      </p>
                    </div>
                  </div>

                  {item.status === 0 && (
                    <div className="absolute top-5 left-5 bg-gray-500 text-white text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter">
                      Hết món
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center w-full">
              <p className="text-[#c5a059] font-bold italic text-lg uppercase tracking-widest opacity-50">Chưa có món ăn nào trong danh mục này</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      <PublicHeader />
      <Suspense fallback={<div className="min-h-screen pt-24 text-center">Đang tải thực đơn...</div>}>
        <MenuContent />
      </Suspense>
      <PublicFooter />
    </div>
  );
}
