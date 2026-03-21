"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import authService from "@/services/auth.service";
import tableService, { Table } from "@/services/table.service";
import categoryService, { Category } from "@/services/category.service";
import productService, { Product } from "@/services/product.service";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { getImageUrl } from "@/lib/utils";

export default function StaffPOS() {
  const [mounted, setMounted] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Data States
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection & Form States
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [voucherCode, setVoucherCode] = useState("");

  // Initial Fetch
  useEffect(() => {
    setMounted(true);
    const initData = async () => {
      setLoading(true);
      try {
        const [userRes, tableRes, categoryRes] = await Promise.all([
          authService.getMe(),
          tableService.getTables(),
          categoryService.getCategories({ per_page: 50 })
        ]);

        if (userRes.success) setUser(userRes.data.user);
        if (tableRes.success) setTables(tableRes.data);
        if (categoryRes.success) {
          setCategories(categoryRes.data);
          if (categoryRes.data.length > 0) {
            setSelectedCategoryId(categoryRes.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Fetch Products when Category changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedCategoryId) return;
      try {
        const res = await productService.getProducts({ 
          category_id: selectedCategoryId,
          per_page: 100 
        });
        if (res.success) setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, [selectedCategoryId]);

  const addToCart = (item: Product) => {
    if (!selectedTable) {
      alert("Vui lòng chọn bàn trên sơ đồ!");
      return;
    }
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: number) => setCart(cart.filter(i => i.id !== id));
  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!mounted) return null;

  const tableStatusColors: any = {
    AVAILABLE: "border-emerald-50 bg-white hover:border-emerald-200 hover:shadow-emerald-100",
    OCCUPIED: "border-blue-100 bg-blue-50/50 text-blue-600",
    RESERVED: "border-amber-100 bg-amber-50/50 text-amber-600",
    MAINTENANCE: "border-rose-50 bg-rose-50/30 grayscale opacity-60 text-rose-400 cursor-not-allowed",
  };

  const statusDotColors: any = {
    AVAILABLE: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]",
    OCCUPIED: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
    RESERVED: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    MAINTENANCE: "bg-rose-500",
  };

  return (
    <div className="fixed inset-0 bg-[#fcfaf2] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-gray-900 text-white flex items-center justify-between px-6 shadow-xl shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="bg-primary/20 p-2 rounded-xl border border-white/10 hover:bg-primary/40 transition-all">
             <Image src="/logo1.jpg" alt="Logo" width={24} height={24} className="rounded-full" />
          </Link>
          <div className="h-6 w-px bg-white/10"></div>
          <h1 className="text-sm font-black tracking-[3px] uppercase italic text-rose-500">Mỳ Cay SASIN POS</h1>
        </div>

        <div className="flex items-center gap-6">
           
           <Link 
             href={user?.role === "ADMIN" ? "/admin/profile" : "/staff/profile"} 
             className="text-right hidden sm:block group hover:bg-white/5 px-4 py-2 rounded-xl transition-all"
           >
              <p className="text-[11px] font-bold text-gray-400 leading-none group-hover:text-primary transition-colors">Phòng làm việc</p>
              <h4 className="text-xs font-black mt-1 uppercase tracking-wider group-hover:text-white transition-colors">{user?.username || "Nhân viên"}</h4>
           </Link>
           <button 
             onClick={() => setIsLogoutDialogOpen(true)}
             className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 p-2 rounded-xl transition-all border border-rose-500/20"
           >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
           </button>
        </div>
      </header>

      {/* POS Content */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          
          {/* Sơ đồ bàn */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100/50 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                 <h3 className="text-lg font-black uppercase tracking-tighter italic text-gray-800">Sơ đồ nhà hàng</h3>
              </div>
              <div className="flex gap-5 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 px-5 py-2.5 rounded-full border border-gray-100">
                 <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Trống</span>
                 <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Đang có khách</span>
                 <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Đã đặt</span>
                 <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Bảo trì</span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 xl:grid-cols-8 gap-3 max-h-[160px] overflow-y-auto no-scrollbar pr-1">
               {tables.map(table => (
                 <button 
                  key={table.id}
                  disabled={table.status === 'MAINTENANCE'}
                  onClick={() => setSelectedTable(table)}
                  className={`h-16 rounded-[1.25rem] border-2 transition-all flex flex-col items-center justify-center p-2 relative group shadow-sm ${
                    selectedTable?.id === table.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 
                    tableStatusColors[table.status]
                  }`}
                 >
                   <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${statusDotColors[table.status]}`}></div>
                   <span className={`text-[13px] font-black ${selectedTable?.id === table.id ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>{table.table_number}</span>
                   <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{table.capacity} Chỗ</span>
                 </button>
               ))}
            </div>
          </div>

          {/* Danh mục & Thực đơn */}
          <div className="flex-1 bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100/50 flex flex-col overflow-hidden">
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 shrink-0">
               {categories.map(cat => (
                 <button 
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-8 py-3 whitespace-nowrap rounded-2xl text-xs font-black transition-all border ${selectedCategoryId === cat.id ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white border-gray-100 text-gray-400 hover:border-primary/20 hover:text-primary/60'}`}
                 >
                   {cat.name}
                 </button>
               ))}
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
               {products.length > 0 ? products.map(item => (
                 <button 
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-gray-50/50 p-3 rounded-3xl border-2 border-transparent hover:border-primary hover:bg-white hover:shadow-xl transition-all flex flex-col items-center text-center group h-fit"
                 >
                   <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3 border border-white shadow-sm">
                     <Image src={getImageUrl(item.image_url)} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                   </div>
                   <h4 className="text-[13px] font-black text-gray-800 line-clamp-1 h-5 tracking-tight uppercase italic">{item.name}</h4>
                   <p className="text-primary font-black mt-2 text-sm">{item.price.toLocaleString()} đ</p>
                 </button>
               )) : (
                 <div className="col-span-full h-full flex items-center justify-center opacity-30 italic font-bold text-gray-400">
                    Chưa có món nào trong danh mục này...
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Right Section: Order Details */}
        <div className="w-[400px] bg-white rounded-[2rem] shadow-2xl border border-gray-100/50 flex flex-col overflow-hidden">
           <div className="p-6 bg-gray-900 text-white shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                   <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary">Biên nhận Order</h2>
                   <p className="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-widest">{new Date().toLocaleDateString('vi-VN')} | {new Date().toLocaleTimeString()}</p>
                </div>
                <div className="bg-primary px-5 py-3 rounded-2xl border border-white/10 text-center min-w-[100px] shadow-lg shadow-primary/20 rotate-2">
                   <p className="text-[8px] font-black uppercase opacity-60">Bàn Phục vụ</p>
                   <p className="text-lg font-black leading-none mt-1">{selectedTable ? selectedTable.table_number : "..."}</p>
                </div>
              </div>
           </div>

           {/* Customer Loyalty Search */}
           <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex gap-2">
              <div className="relative flex-1">
                 <input 
                  type="text" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="SĐT Khách hàng (Tích điểm)..." 
                  className="w-full bg-white border border-gray-100 pl-10 pr-4 py-3 rounded-xl text-[11px] font-bold outline-none focus:border-primary transition-all"
                 />
                 <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <button className="bg-white border border-gray-100 px-4 rounded-xl text-primary font-black text-[10px] uppercase hover:bg-primary hover:text-white transition-all">Kiểm tra</button>
           </div>

           {/* Cart List */}
           <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4 animate-in zoom-in duration-500">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.56-7.43H6.18"></path></svg>
                   </div>
                   <p className="text-gray-300 font-extrabold text-xs uppercase tracking-[3px]">Bàn đang trống món</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center group animate-in slide-in-from-right duration-300">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                       <Image src={getImageUrl(item.image_url)} alt={item.name} width={48} height={48} className="object-cover h-full w-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h5 className="text-[11px] font-black text-gray-800 truncate uppercase tracking-tight">{item.name}</h5>
                       <p className="text-[11px] font-bold text-primary italic mt-0.5">{(item.price * item.quantity).toLocaleString()} d</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-2 py-1 border border-gray-100">
                       <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-primary transition-colors p-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                       <span className="text-[11px] font-black w-4 text-center">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-primary transition-colors p-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-200 hover:text-rose-500 transition-colors">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                ))
              )}
           </div>

           {/* Voucher Input */}
           <div className="px-6 pt-4 pb-2 border-t border-gray-50">
              <div className="flex gap-2">
                 <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="Mã Voucher..." 
                      className="w-full bg-white border border-gray-100 pl-10 pr-4 py-3 rounded-xl text-[11px] font-bold outline-none focus:border-primary transition-all uppercase tracking-widest placeholder:normal-case font-mono"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-1.761 1.761a2 2 0 0 0 0 2.828l.828.828a2 2 0 0 1 0 2.828l-1.828 1.828a2 2 0 0 1-2.828 0l-.828-.828a2 2 0 0 0-2.828 0L4 16"></path><path d="m13 22-3-3"></path><path d="m9 18-3-3"></path></svg>
                 </div>
                 <button className="bg-gray-900 text-white px-5 rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all">Áp dụng</button>
              </div>
           </div>

           {/* Summary & Buttons */}
           <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-6">
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                    <span>Tổng cộng tạm tính</span>
                    <span className="text-gray-800 font-black">{subtotal.toLocaleString()} đ</span>
                 </div>
                 <div className="h-px bg-dashed border-t border-dashed border-gray-200 my-2"></div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Thành tiền</p>
                    <p className="text-3xl font-black text-primary italic leading-none mt-2 tracking-tighter">{subtotal.toLocaleString()} đ</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button className="h-14 rounded-2xl bg-white border border-gray-100 font-black text-gray-400 text-[10px] tracking-widest hover:border-primary hover:text-primary transition-all uppercase shadow-sm">
                    In Tạm Tính
                 </button>
                 <button className="h-14 rounded-2xl bg-primary text-white font-black text-xs tracking-[2px] shadow-xl shadow-primary/20 hover:bg-rose-700 transition-all uppercase active:scale-95">
                    Thanh Toán
                 </button>
              </div>
           </div>
        </div>
      </main>

      <ConfirmDialog 
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={() => authService.logout()}
        title="Xác nhận Đăng xuất"
        message="Hệ thống sẽ kết thúc phiên làm việc của bạn ngay lập tức. Bạn đã chắc chắn chưa?"
      />
    </div>
  );
}
