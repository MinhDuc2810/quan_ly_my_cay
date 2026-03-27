"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import tableService, { Table } from "@/services/table.service";
import categoryService, { Category } from "@/services/category.service";
import productService, { Product } from "@/services/product.service";
import customerService, { Customer } from "@/services/customer.service";
import orderService from "@/services/order.service";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { getImageUrl } from "@/lib/utils";

export default function StaffPOS() {
  const router = useRouter();
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
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [hasVoucher, setHasVoucher] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Initial Fetch
  useEffect(() => {
    setMounted(true);
    const initData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const [userRes, tableRes, categoryRes] = await Promise.all([
          authService.getMe(),
          tableService.getTables(),
          categoryService.getCategories({ per_page: 50 })
        ]);

        if (userRes.success) {
          const role = userRes.data.user.role;
          if (role !== "STAFF" && role !== "ADMIN") {
            router.push("/");
            return;
          }
          setUser(userRes.data.user);
        } else {
          router.push("/login");
          return;
        }

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
  }, [router]);

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

  const handleCustomerPhoneChange = async (value: string) => {
    setCustomerPhone(value);
    if (value.length < 8) {
      setFoundCustomer(null);
      return;
    }
    setCustomerSearchLoading(true);
    try {
      const res = await customerService.searchByPhone(value);
      if (res.success && res.data.length > 0) {
        setFoundCustomer(res.data[0]);
      } else {
        setFoundCustomer(null);
      }
    } catch {
      setFoundCustomer(null);
    } finally {
      setCustomerSearchLoading(false);
    }
  };

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

  const handlePrintOrder = async () => {
    if (!selectedTable) {
      alert("Vui lòng chọn bàn trước khi in tạm tính!");
      return;
    }
    if (cart.length === 0) {
      alert("Giỏ hàng đang trống, vui lòng chọn món!");
      return;
    }
    setIsOrdering(true);
    try {
      const items = cart.map(i => ({ product_id: i.id, quantity: i.quantity }));

      let res;
      if (activeOrderId) {
        console.log("[POS ORDER] Cập nhật đơn hàng:", activeOrderId);
        res = await orderService.updateOrderItems(activeOrderId, items);
      } else {
        const payload = {
          table_id: selectedTable.id,
          customer_id: foundCustomer?.id ?? null,
          items: items,
        };
        console.log("[POS ORDER] Gửi dữ liệu tạo đơn mới:", payload);
        res = await orderService.createOrder(payload);
      }

      console.log("[POS ORDER] Response từ server:", res);

      if (res.success) {
        // Update table status locally
        setTables(prev => prev.map(t =>
          t.id === selectedTable.id ? { ...t, status: 'OCCUPIED' as any } : t
        ));
        const tableName = selectedTable.table_number;
        // Reset order info
        setCart([]);
        setSelectedTable(null);
        setCustomerPhone('');
        setFoundCustomer(null);
        setVoucherCode('');
        setActiveOrderId(null);
        setOrderSuccess(activeOrderId ? `Đã cập nhật đơn - Bàn ${tableName}` : `Đã tạo đơn - Bàn ${tableName} đang có khách`);
        setTimeout(() => setOrderSuccess(null), 4000);
      } else {
        console.warn("[POS ORDER] Tạo đơn thất bại:", res.message);
        alert(res.message || 'Tạo đơn thất bại');
      }
    } catch (err: any) {
      console.error("[POS ORDER] Lỗi API:", err);
      console.error("[POS ORDER] Chi tiết lỗi:", err.response?.data);
      alert(err.response?.data?.message || 'Lỗi kết nối Server!');
    } finally {
      setIsOrdering(false);
    }
  };

  if (!mounted) return null;

  const tableStatusColors: any = {
    AVAILABLE: "border-emerald-50 bg-white hover:border-emerald-200 hover:shadow-emerald-100",
    OCCUPIED: "border-blue-100 bg-blue-50/50 text-blue-600",
    RESERVED: "border-amber-100 bg-amber-50/50 text-amber-600",
    MAINTENANCE: "border-rose-50 bg-rose-50/30 grayscale opacity-60 text-rose-400 cursor-not-allowed",
  };

  const handleApplyVoucher = async () => {
    if (!activeOrderId) {
      alert("Vui lòng in tạm tính trước khi áp dụng voucher!");
      return;
    }
    if (!voucherCode) return;

    setIsApplyingVoucher(true);
    console.log("[VOUCHER] Đang áp dụng voucher:", voucherCode, "cho order:", activeOrderId);
    try {
      const res = await orderService.applyVoucher(activeOrderId, voucherCode);
      console.log("[VOUCHER] Phản hồi từ server:", res);
      if (res.success) {
        setHasVoucher(true);
        // If API returns the updated amounts, use them
        if (res.data?.discount_amount !== undefined) {
          setDiscountAmount(Number(res.data.discount_amount));
        } else {
          // If not returned, we might need to re-fetch or rely on the next update
          // For now, let's assume it returns { data: { discount_amount, ... } }
        }
        alert("Áp dụng voucher thành công!");
      } else {
        console.warn("[VOUCHER] Áp dụng thất bại:", res.message);
        alert(res.message || "Mã voucher không hợp lệ");
      }
    } catch (err: any) {
      console.error("[VOUCHER] Lỗi API khi áp dụng:", err.response?.data || err);
      alert(err.response?.data?.message || "Lỗi áp dụng voucher");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = async () => {
    if (!activeOrderId) return;
    setIsApplyingVoucher(true);
    console.log("[VOUCHER] Đang yêu cầu hủy voucher cho đơn hàng:", activeOrderId);
    try {
      const res = await orderService.removeVoucher(activeOrderId);
      console.log("[VOUCHER] Phản hồi từ server khi hủy:", res);
      if (res.success) {
        setHasVoucher(false);
        setVoucherCode("");
        setDiscountAmount(0);
        alert("Đã hủy voucher");
      }
    } catch (err: any) {
      console.error("[VOUCHER] Lỗi API khi hủy voucher:", err.response?.data || err);
      alert(err.response?.data?.message || "Lỗi hủy voucher");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!activeOrderId) return;
    setIsCancelling(true);
    console.log("[POS ORDER] Đang hủy đơn hàng:", activeOrderId);
    try {
      const res = await orderService.cancelOrder(activeOrderId);
      console.log("[POS ORDER] Response hủy đơn:", res);
      if (res.success) {
        setOrderSuccess("Đã hủy đơn hàng và giải phóng bàn!");
        setTimeout(() => setOrderSuccess(null), 3000);
        // Reset states locally
        setCart([]);
        setSelectedTable(null);
        setActiveOrderId(null);
        setHasVoucher(false);
        setDiscountAmount(0);
        setCustomerPhone("");
        setFoundCustomer(null);
        setVoucherCode("");

        // Refresh table list to reflect AVAILABLE status
        const tableRes = await tableService.getTables();
        if (tableRes.success) setTables(tableRes.data);
      }
    } catch (err: any) {
      console.error("[POS ORDER] Lỗi hủy đơn:", err.response?.data || err);
      setOrderError(err.response?.data?.message || "Lỗi không thể hủy đơn!");
      setTimeout(() => setOrderError(null), 3000);
    } finally {
      setIsCancelling(false);
      setIsCancelDialogOpen(false);
    }
  };

  const handlePayOrder = async () => {
    if (!activeOrderId) return;
    setIsPaying(true);
    console.log("[PAYMENT] Đang thanh toán đơn hàng:", activeOrderId);
    try {
      const payload = {
        payment_method: 'CASH', // Default to CASH for now
        customer_id: foundCustomer?.id || null
      };
      console.log("[PAYMENT] Payload gửi đi:", payload);
      const res = await orderService.payOrder(activeOrderId, payload);
      console.log("[PAYMENT] Response thanh toán:", res);
      if (res.success) {
        setOrderSuccess(`Thanh toán thành công!`);
        setTimeout(() => setOrderSuccess(null), 4000);

        // Reset POS
        setCart([]);
        setSelectedTable(null);
        setActiveOrderId(null);
        setHasVoucher(false);
        setDiscountAmount(0);
        setCustomerPhone("");
        setFoundCustomer(null);
        setVoucherCode("");

        // Refresh tables
        const tableRes = await tableService.getTables();
        if (tableRes.success) setTables(tableRes.data);
      }
    } catch (err: any) {
      console.error("[PAYMENT] Lỗi thanh toán:", err.response?.data || err);
      setOrderError(err.response?.data?.message || "Lỗi khi xử lý thanh toán!");
      setTimeout(() => setOrderError(null), 3000);
    } finally {
      setIsPaying(false);
      setIsPayDialogOpen(false);
    }
  };

  const statusDotColors: any = {
    AVAILABLE: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]",
    OCCUPIED: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
    RESERVED: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    MAINTENANCE: "bg-rose-500",
  };

  const handleTableSelect = async (table: Table) => {
    setSelectedTable(table);
    setCart([]);
    setFoundCustomer(null);
    setCustomerPhone("");
    setActiveOrderId(null);
    setHasVoucher(false);
    setDiscountAmount(0);

    if (table.status === 'OCCUPIED') {
      try {
        const res = await orderService.getActiveOrderByTable(table.id);
        if (res.success && res.data) {
          setActiveOrderId(res.data.id);
          setHasVoucher(!!res.data.voucher_id);
          setDiscountAmount(Number(res.data.discount_amount) || 0);
          if (res.data.voucher_id) {
            // If the order has a voucher, we could potentially show its code if the API returned it
            // For now, at least we know to show the "Huỷ" button
          }
          // Map order items to cart format (Product + quantity)
          const mappedCart = res.data.items?.map((item: any) => ({
            ...item.product,
            price: item.price, // use price from order item
            quantity: item.quantity,
          })) || [];
          setCart(mappedCart);

          if (res.data.customer_id) {
            try {
              const customerRes = await customerService.getCustomerById(res.data.customer_id);
              if (customerRes.success) {
                setFoundCustomer(customerRes.data);
                setCustomerPhone(customerRes.data.phone);
              }
            } catch (err) {
              console.warn("[POS] Không thể tải thông tin khách hàng ID:", res.data.customer_id);
            }
          }

          console.log("[POS]Loaded active order ID:", res.data.id, "for table:", table.table_number);
        }
      } catch (err) {
        console.error("Failed to load active order:", err);
      }
    }
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
            href={user?.role === "ADMIN" ? "/admin/profile" : "/pos/profile"}
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
                  onClick={() => handleTableSelect(table)}
                  className={`h-16 rounded-[1.25rem] border-2 transition-all flex flex-col items-center justify-center p-2 relative group shadow-sm ${selectedTable?.id === table.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' :
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
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                  placeholder="SĐT Khách hàng (Tích điểm)..."
                  className="w-full bg-white border border-gray-100 pl-10 pr-4 py-3 rounded-xl text-[11px] font-bold outline-none focus:border-primary transition-all"
                />
                {customerSearchLoading ? (
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                ) : (
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                )}
              </div>
              {customerPhone && (
                <button
                  onClick={() => { setCustomerPhone(''); setFoundCustomer(null); }}
                  className="bg-white border border-gray-100 px-3 rounded-xl text-gray-400 font-black text-[10px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Customer Info Card */}
            {foundCustomer && (
              <div className="mt-3 bg-white border border-emerald-100 rounded-2xl p-3 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-emerald-200">
                  {foundCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-black text-gray-800 truncate">{foundCustomer.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 truncate">{foundCustomer.email || foundCustomer.phone}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tích điểm</p>
                  <p className="text-lg font-black text-emerald-500 leading-none">{foundCustomer.points.toLocaleString()}</p>
                </div>
              </div>
            )}

            {customerPhone.length >= 8 && !customerSearchLoading && !foundCustomer && (
              <p className="mt-2 text-[10px] font-bold text-gray-400 italic text-center">Không tìm thấy khách hàng với SĐT này</p>
            )}
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
          <div className="px-6 pt-4 pb-2 border-t border-gray-50 bg-gray-50/30">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  disabled={hasVoucher || isApplyingVoucher}
                  placeholder={hasVoucher ? "Đã áp dụng Voucher" : "Mã Voucher..."}
                  className={`w-full bg-white border border-gray-100 pl-10 pr-4 py-3 rounded-xl text-[11px] font-black outline-none focus:border-primary transition-all uppercase tracking-widest placeholder:normal-case font-mono ${hasVoucher ? 'text-emerald-500 border-emerald-100 bg-emerald-50/30 shadow-inner' : ''}`}
                />
                {isApplyingVoucher ? (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2"><svg className="text-primary animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></div>
                ) : (
                  <svg className={`absolute left-3 top-1/2 -translate-y-1/2 ${hasVoucher ? 'text-emerald-500' : 'text-gray-300'}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-1.761 1.761a2 2 0 0 0 0 2.828l.828.828a2 2 0 0 1 0 2.828l-1.828 1.828a2 2 0 0 1-2.828 0l-.828-.828a2 2 0 0 0-2.828 0L4 16"></path><path d="m13 22-3-3"></path><path d="m9 18-3-3"></path></svg>
                )}
              </div>

              {hasVoucher ? (
                <button
                  onClick={handleRemoveVoucher}
                  disabled={isApplyingVoucher}
                  className="bg-rose-50 border border-rose-100 px-4 rounded-xl text-rose-500 font-black text-[10px] hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest shadow-sm"
                >
                  Hủy
                </button>
              ) : (
                <button
                  onClick={handleApplyVoucher}
                  disabled={isApplyingVoucher || !voucherCode || !activeOrderId}
                  className="bg-gray-900 border border-gray-800 px-4 rounded-xl text-white font-black text-[10px] hover:bg-primary hover:border-primary transition-all uppercase tracking-widest shadow-lg shadow-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Áp dụng
                </button>
              )}
            </div>
            {!activeOrderId && voucherCode && (
              <p className="text-[9px] font-bold text-gray-400 mt-2 italic text-center">* Áp dụng sau khi in tạm tính (ACTIVE)</p>
            )}
          </div>

          {/* Summary & Buttons */}
          <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <span>Tổng cộng tạm tính</span>
                <span className="text-gray-800 font-black">{subtotal.toLocaleString()} đ</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-500 font-bold text-[10px] uppercase tracking-widest mt-1">
                  <span>Voucher giảm giá</span>
                  <span className="font-black">- {discountAmount.toLocaleString()} đ</span>
                </div>
              )}
              <div className="h-px bg-dashed border-t border-dashed border-gray-200 my-2"></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Thành tiền</p>
                <p className="text-3xl font-black text-primary italic leading-none mt-2 tracking-tighter">
                  {(subtotal - discountAmount).toLocaleString()} đ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {activeOrderId && (
                <button
                  type="button"
                  onClick={() => setIsCancelDialogOpen(true)}
                  disabled={isCancelling}
                  className="col-span-2 h-10 mb-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  Hủy đơn hiện tại
                </button>
              )}
              <button
                onClick={handlePrintOrder}
                disabled={isOrdering || cart.length === 0 || !selectedTable}
                className="h-14 rounded-2xl bg-white border border-gray-100 font-black text-gray-400 text-[10px] tracking-widest hover:border-primary hover:text-primary transition-all uppercase shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isOrdering && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                )}
                In Tạm Tính
              </button>
              <button
                onClick={() => setIsPayDialogOpen(true)}
                disabled={isPaying || !activeOrderId}
                className="h-14 rounded-2xl bg-primary text-white font-black text-xs tracking-[2px] shadow-xl shadow-primary/20 hover:bg-rose-700 transition-all uppercase active:scale-95 disabled:opacity-40 disabled:grayscale flex items-center justify-center gap-2"
              >
                {isPaying && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                )}
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

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelOrder}
        title="Xác nhận Hủy Đơn"
        message="Hệ thống sẽ hủy toàn bộ xón ăn, hoàn lại voucher và mở lại bàn này. Hành động này không thể hoàn tác!"
      />

      <ConfirmDialog
        isOpen={isPayDialogOpen}
        onClose={() => setIsPayDialogOpen(false)}
        onConfirm={handlePayOrder}
        title="Xác nhận Thanh Toán"
        message={`Xác nhận thanh toán cho Bàn ${selectedTable?.table_number}? Hệ thống sẽ hoàn tất đơn hàng và cộng điểm tích lũy cho khách hàng.`}
      />

      {/* Success Notification */}
      {orderSuccess && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-200 font-black text-sm flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {orderSuccess}
        </div>
      )}
    </div>
  );
}
