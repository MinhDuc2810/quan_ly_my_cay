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
  const [isApplyingPoints, setIsApplyingPoints] = useState(false);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsInput, setPointsInput] = useState("");

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
          status: 1,
          category_id: selectedCategoryId,
          per_page: 100,
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
      console.log("📦 [POS] Đang chuẩn bị gửi items:", JSON.stringify(items, null, 2));

      let res;
      if (activeOrderId) {
        console.log("🔄 [POS] Cập nhật món cho đơn hàng:", activeOrderId);
        res = await orderService.updateOrderItems(activeOrderId, items);
      } else {
        const payload = {
          table_id: selectedTable.id,
          customer_id: foundCustomer?.id ?? null,
          items: items,
        };
        console.log("🆕 [POS] Gửi dữ liệu tạo đơn mới:", JSON.stringify(payload, null, 2));
        res = await orderService.createOrder(payload);
      }

      console.log("✅ [POS] Response từ server:", res);

      if (res.success) {
        // Update table status locally
        setTables(prev => prev.map(t =>
          t.id === selectedTable.id ? { ...t, status: 'OCCUPIED' as any } : t
        ));

        // Nếu là tạo đơn mới, hãy lưu lại activeOrderId từ response
        if (!activeOrderId && res.data?.id) {
          setActiveOrderId(res.data.id);
          console.log("📍 [POS] Đã lưu activeOrderId mới:", res.data.id);
        }

        const tableName = selectedTable.table_number;
        setOrderSuccess(activeOrderId ? `Đã cập nhật đơn - Bàn ${tableName}` : `Đã tạo đơn - Bàn ${tableName} đang có khách`);

        // Thay vì Reset hết, chúng ta chỉ thông báo thành công. 
        // Sau khi "In Tạm Tính", bàn đã có khách, người dùng có thể Thanh toán luôn
        setTimeout(() => setOrderSuccess(null), 3000);
      } else {
        console.error("❌ [POS] Xử lý đơn hàng thất bại:", res.message);
        alert(`Lỗi từ Server: ${res.message || 'Không rõ nguyên nhân'}`);
      }
    } catch (err: any) {
      console.error("❌ [POS] Lỗi khi gửi request:", err);
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi kết nối Server!';
      alert(`Lỗi hệ thống: ${errorMsg}`);
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

  const handleApplyPoints = async () => {
    if (!activeOrderId) {
      alert("Vui lòng in tạm tính trước khi sử dụng điểm!");
      return;
    }
    const points = Number(pointsInput);
    if (!points || points <= 0) {
      alert("Vui lòng nhập số điểm hợp lệ!");
      return;
    }

    if (foundCustomer && points > foundCustomer.points) {
      alert(`Khách hàng chỉ có ${foundCustomer.points} điểm!`);
      return;
    }

    if (!foundCustomer?.id) {
      alert("Vui lòng chọn khách hàng trước khi dùng điểm!");
      return;
    }

    setIsApplyingPoints(true);
    try {
      const res = await orderService.applyPoints(activeOrderId, points, foundCustomer.id);
      if (res.success) {
        setPointsUsed(res.data?.points_used || points);
        setPointsDiscount(res.data?.points_discount || (points * 1000));
        alert("Sử dụng điểm thành công!");
      } else {
        alert(res.message || "Không thể sử dụng điểm");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi áp dụng điểm");
    } finally {
      setIsApplyingPoints(false);
    }
  };

  const handleRemovePoints = async () => {
    if (!activeOrderId || !foundCustomer?.id) return;
    setIsApplyingPoints(true);
    try {
      const res = await orderService.removePoints(activeOrderId, foundCustomer.id);
      if (res.success) {
        setPointsUsed(0);
        setPointsDiscount(0);
        setPointsInput("");
        alert("Đã hủy sử dụng điểm");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi hủy điểm");
    } finally {
      setIsApplyingPoints(false);
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
        setPointsUsed(0);
        setPointsDiscount(0);
        setPointsInput("");
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
        setPointsUsed(0);
        setPointsDiscount(0);
        setPointsInput("");
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
          console.log("📂 [POS] Dữ liệu đơn hàng hiện tại:", res.data);
          setActiveOrderId(res.data.id);
          setHasVoucher(!!res.data.voucher_id);
          setDiscountAmount(Number(res.data.discount_amount) || 0);
          setPointsUsed(res.data.points_used || 0);
          setPointsDiscount(res.data.points_discount || 0);
          if (res.data.points_used) setPointsInput(res.data.points_used.toString());
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
      <header className="h-16 bg-gray-900 text-white flex items-center justify-between px-6 shadow-xl shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="bg-primary/20 p-2 rounded-xl border border-white/10 hover:bg-primary/40 transition-all">
            <Image src="/logo1.jpg" alt="Logo" width={24} height={24} className="rounded-full" />
          </Link>
          <div className="h-6 w-px bg-white/10"></div>
          <h1 className="text-sm font-black tracking-widest uppercase italic text-rose-500">Mỳ Cay SASIN POS</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={user?.role === "ADMIN" ? "/admin/profile" : "/pos/profile"}
            className="text-right hidden sm:block group hover:bg-white/5 px-4 py-2 rounded-xl transition-all"
          >
            <p className="text-[10px] font-bold text-gray-400 group-hover:text-primary leading-none uppercase tracking-tighter transition-colors">Nhân viên</p>
            <h4 className="text-xs font-black mt-1 uppercase italic group-hover:text-white transition-colors">{user?.username || "Sasin Staff"}</h4>
          </Link>
          <button
            onClick={() => setIsLogoutDialogOpen(true)}
            className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white p-2.5 rounded-xl transition-all border border-rose-500/20 group"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </header>

      {/* POS Content */}
      <main className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Left Section: Tables & Menu */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Sơ đồ bàn - Compact */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100/50 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest italic text-gray-800">Sơ đồ bàn</h3>
              <div className="flex gap-3 text-[8px] font-black text-gray-400 uppercase bg-gray-50/50 px-3 py-1.5 rounded-full border border-gray-100">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Trống</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Khách</span>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 xl:grid-cols-8 gap-2.5 max-h-[120px] overflow-y-auto no-scrollbar pr-1">
              {tables.map(table => (
                <button
                  key={table.id}
                  disabled={table.status === 'MAINTENANCE'}
                  onClick={() => handleTableSelect(table)}
                  className={`h-12 rounded-xl border-2 transition-all flex flex-col items-center justify-center p-1 relative group ${selectedTable?.id === table.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : tableStatusColors[table.status]}`}
                >
                  <div className={`absolute top-1.5 right-1.5 w-1 h-1 rounded-full ${statusDotColors[table.status]}`}></div>
                  <span className={`text-[12px] font-black ${selectedTable?.id === table.id ? 'text-primary' : 'group-hover:text-primary'}`}>{table.table_number}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu - Flexible */}
          <div className="flex-1 bg-white rounded-3xl p-4 shadow-sm border border-gray-100/50 flex flex-col overflow-hidden">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 shrink-0">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all border ${selectedCategoryId === cat.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/10' : 'bg-white border-gray-100 text-gray-400 hover:text-primary'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 p-1">
              {products.length > 0 ? products.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-gray-50/20 p-2.5 rounded-2xl border-2 border-transparent hover:border-primary hover:bg-white hover:shadow-xl transition-all flex flex-col items-center group h-fit"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 border border-white shadow-sm">
                    <Image src={getImageUrl(item.image_url)} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h4 className="text-[11px] font-black text-gray-800 line-clamp-1 h-4 uppercase italic tracking-tighter">{item.name}</h4>
                  <p className="text-primary font-black mt-1 text-[11px]">{item.price.toLocaleString()}đ</p>
                </button>
              )) : (
                <div className="col-span-full h-full flex items-center justify-center opacity-30 text-[10px] font-black italic uppercase">Chưa có món...</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Order Receipt */}
        <div className="w-[360px] bg-white rounded-3xl shadow-2xl border border-gray-100/50 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 bg-gray-900 text-white shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-base font-black uppercase italic tracking-tighter text-primary">Biên nhận</h2>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-[2px]">{new Date().toLocaleTimeString()} - Bàn {selectedTable?.table_number || "..."}</p>
              </div>
              <div className="bg-primary/20 border border-white/10 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] font-black italic text-primary">#{activeOrderId || "NEW"}</span>
              </div>
            </div>
          </div>

          {/* Promotion & Customer Section - Compact */}
          <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 shrink-0 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                placeholder="SĐT Khách hàng..."
                className="flex-1 bg-white border border-gray-100 px-3 py-2 rounded-xl text-[10px] font-bold outline-none focus:border-primary transition-all"
              />
            </div>

            {foundCustomer && (
              <div className="bg-white border border-emerald-100 rounded-xl p-2 flex items-center gap-2.5 animate-in slide-in-from-top-1 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-[12px] shrink-0 shadow-lg shadow-emerald-100">
                  {foundCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-800 truncate uppercase tracking-tighter italic">{foundCustomer.name}</p>
                  <p className="text-[9px] font-bold text-gray-400 leading-none">{foundCustomer.phone}</p>
                </div>
                <div className="text-right shrink-0 pr-1">
                  <p className="text-[8px] font-black text-gray-300 uppercase leading-none mb-0.5 tracking-widest">Điểm</p>
                  <p className="text-[14px] font-black text-emerald-600 leading-none">{foundCustomer.points.toLocaleString()}</p>
                </div>
              </div>
            )}

            {foundCustomer && activeOrderId && (
              <div className="flex gap-2 animate-in slide-in-from-top-1">
                <input
                  type="number"
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  disabled={pointsUsed > 0 || isApplyingPoints}
                  placeholder="Số điểm sử dụng"
                  className={`flex-1 bg-white border border-gray-100 px-3 py-2 rounded-xl text-[10px] font-black outline-none focus:border-emerald-500 transition-all ${pointsUsed > 0 ? "text-emerald-500 bg-emerald-50/30 border-emerald-100" : ""}`}
                />
                <button
                  onClick={pointsUsed > 0 ? handleRemovePoints : handleApplyPoints}
                  className={`px-3 py-2 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all ${pointsUsed > 0 ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-100'}`}
                >
                  {pointsUsed > 0 ? 'Hủy' : 'Dùng'}
                </button>
              </div>
            )}
          </div>

          {/* Cart List - Main Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar min-h-[150px] bg-[#f9f9f9]/20">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic font-black text-[9px] uppercase tracking-widest">Giờ hàng trống</div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-3 items-center group animate-in slide-in-from-right duration-200">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shrink-0 shadow-sm bg-white">
                    <Image src={getImageUrl(item.image_url)} alt={item.name} width={40} height={40} className="object-cover h-full w-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[10px] font-black text-gray-800 truncate uppercase italic tracking-tighter">{item.name}</h5>
                    <p className="text-[10px] font-bold text-primary mt-0.5">{(item.price * item.quantity).toLocaleString()}đ</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                    <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-primary p-0.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                    <span className="text-[11px] font-black w-3 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-primary p-0.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-200 hover:text-rose-500 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Bottom Toolbar: Voucher & Totals */}
          <div className="shrink-0 bg-gray-50 border-t border-gray-100 p-4 space-y-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                disabled={hasVoucher || isApplyingVoucher}
                placeholder={hasVoucher ? "Voucher đã gán" : "Mã Voucher..."}
                className={`flex-1 bg-white border border-gray-100 px-3 py-2 rounded-xl text-[10px] font-bold outline-none uppercase italic transition-all ${hasVoucher ? 'text-emerald-500 border-emerald-100 bg-emerald-50/10' : ''}`}
              />
              <button
                onClick={hasVoucher ? handleRemoveVoucher : handleApplyVoucher}
                disabled={isApplyingVoucher || (!voucherCode && !hasVoucher) || (!activeOrderId && !hasVoucher)}
                className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase transition-all shadow-sm ${hasVoucher ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-gray-900 text-white hover:bg-black'}`}
              >
                {hasVoucher ? 'Hủy' : 'Dùng'}
              </button>
            </div>

            <div className="space-y-1 px-1">
              <div className="flex justify-between text-[10px] font-black text-gray-400">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString()}đ</span>
              </div>
              {(discountAmount > 0 || pointsDiscount > 0) && (
                <div className="flex justify-between text-[10px] font-black text-emerald-500 italic">
                  <span>Ưu đãi áp dụng</span>
                  <span>-{(discountAmount + pointsDiscount).toLocaleString()}đ</span>
                </div>
              )}
              <div className="h-px border-t border-dashed border-gray-200 my-1.5"></div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-gray-400 uppercase italic leading-none">Tổng hóa đơn</span>
                <span className="text-2xl font-black text-rose-600 italic leading-none">
                  {(subtotal - discountAmount - pointsDiscount).toLocaleString()}đ
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handlePrintOrder}
                disabled={isOrdering || cart.length === 0 || !selectedTable}
                className="h-11 rounded-xl bg-white border-2 border-primary/20 text-primary font-black text-[10px] uppercase tracking-tighter hover:bg-primary/5 transition-all shadow-sm flex items-center justify-center"
              >
                In Tạm Tính
              </button>
              <button
                onClick={() => setIsPayDialogOpen(true)}
                disabled={isPaying || !activeOrderId}
                className="h-11 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-rose-700 transition-all flex items-center justify-center"
              >
                Thanh Toán
              </button>
              {activeOrderId && (
                <button
                  type="button"
                  onClick={() => setIsCancelDialogOpen(true)}
                  disabled={isCancelling}
                  className="col-span-2 h-8 rounded-lg bg-rose-50 text-rose-500 font-bold text-[9px] uppercase tracking-wider border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                >
                  Giải phóng bàn / Hủy đơn
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
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
        message="Hệ thống sẽ hủy toàn bộ món ăn, hoàn lại voucher và mở lại bàn này. Hành động này không thể hoàn tác!"
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
