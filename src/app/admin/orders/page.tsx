"use client";

import React, { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Search, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  Bike,
  Ban,
  MoreVertical
} from "lucide-react";
import orderService, { Order } from "@/services/order.service";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({
    total_pages: 1,
    current_page: 1,
  });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await orderService.getOrders({ 
        page, 
        order_code: searchQuery,
        status: statusFilter !== "ALL" ? statusFilter : undefined
      });
      if (res.success) {
        setOrders(res.data);
        setPagination({
          total_pages: res.pagination.total_pages,
          current_page: res.pagination.current_page,
        });
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchQuery, statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchOrders(newPage);
    }
  };

  const statusConfigs: any = {
    PENDING: { 
      label: "Chờ duyệt", 
      icon: <Clock size={12} />, 
      color: "bg-amber-50 text-amber-600 border-amber-100/50" 
    },
    PREPARING: { 
      label: "Đang nấu", 
      icon: <RotateCcw size={12} />, 
      color: "bg-blue-50 text-blue-600 border-blue-100/50" 
    },
    SERVED: { 
      label: "Đã phục vụ", 
      icon: <Bike size={12} />, 
      color: "bg-indigo-50 text-indigo-600 border-indigo-100/50" 
    },
    COMPLETED: { 
      label: "Hoàn tất", 
      icon: <CheckCircle2 size={12} />, 
      color: "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
    },
    CANCELLED: { 
      label: "Đã hủy", 
      icon: <Ban size={12} />, 
      color: "bg-rose-50 text-rose-600 border-rose-100/50" 
    },
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfigs[status] || statusConfigs.PENDING;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getPaymentStatus = (status: string) => {
    if (status === 'PAID') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-sm">
          Đã thanh toán
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-400">
        Chưa trả tiền
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100/50">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic flex items-center gap-3">
             <ClipboardList className="text-primary" size={32} />
             Quản lý Đơn hàng
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-[3px] text-[11px] mt-2 ml-1">Kinh doanh hôm nay: {orders.length} đơn hàng mới</p>
        </div>
        <div className="flex gap-4">
           {/* Thống kê nhanh hoặc các filter khác */}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/50 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm mã đơn hàng (mã code)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-100 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all uppercase tracking-widest font-mono"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto pb-2 lg:pb-0">
          <Filter size={16} className="text-gray-400 mr-2 shrink-0" />
          {['ALL', 'PENDING', 'PREPARING', 'SERVED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
               key={st}
               onClick={() => setStatusFilter(st)}
               className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 whitespace-nowrap ${
                 statusFilter === st ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-gray-100 text-gray-400 hover:border-primary/30 hover:text-primary/60'
               }`}
            >
               {st === 'ALL' ? 'Tất cả' : statusConfigs[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Mã Code</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Bàn / Khách</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Tổng cộng</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Thanh toán</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Ngày tạo</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px] text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-8 py-6 h-16 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : orders.length > 0 ? orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-mono font-black text-xs text-secondary bg-secondary/5 px-2.5 py-1.5 rounded-lg border border-secondary/10">
                      {order.order_code}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black text-gray-800">Bàn {order.table?.table_number || '...'}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">KH: {order.customer?.name || 'Khách vãng lai'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black text-primary italic">{order.final_amount.toLocaleString()} đ</p>
                      {order.discount_amount > 0 && (
                        <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">- {order.discount_amount.toLocaleString()} đ ưu đãi</p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {getPaymentStatus(order.payment_status)}
                  </td>
                  <td className="px-8 py-6">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-bold text-gray-800">
                      <p>{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleTimeString()}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-all" title="Xem chi tiết">
                         <Eye size={18} />
                       </button>
                       <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                         <MoreVertical size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <ClipboardList size={56} className="mb-4 text-gray-300" />
                       <p className="font-extrabold uppercase tracking-[3px] text-xs">Hiện tại chưa có đơn hàng nào...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
           <p className="text-xs font-bold text-gray-400">Trang {pagination.current_page} - Tất cả {orders.length} đơn hàng</p>
           <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-all disabled:opacity-20 shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center px-6 font-black text-xs text-gray-800 uppercase tracking-[2px]">
                {pagination.current_page} <span className="mx-2 text-gray-300">/</span> {pagination.total_pages}
              </div>
              <button 
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
                className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-all disabled:opacity-20 shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}