"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Search,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  CalendarCheck,
} from "lucide-react";
import bookingService, { Booking } from "@/services/booking.service";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "Chờ xác nhận", className: "bg-amber-50 text-amber-600 border-amber-100" },
  CONFIRMED: { label: "Đã xác nhận",  className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  CANCELLED: { label: "Đã hủy",       className: "bg-red-50 text-red-500 border-red-100" },
  COMPLETED: { label: "Hoàn thành",   className: "bg-blue-50 text-blue-600 border-blue-100" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total: 0 });

  // Detail / confirm state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, per_page: 10 };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      const res = await bookingService.getAllBookings(params);
      if (res.success) {
        let data: Booking[] = res.data;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          data = data.filter((b: Booking) =>
            b.customer?.name?.toLowerCase().includes(q) ||
            b.customer?.phone?.toLowerCase().includes(q)
          );
        }
        setBookings(data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Fetch bookings failed", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, searchQuery]);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  const handleStatusUpdate = async (booking: Booking, newStatus: string) => {
    setIsUpdating(true);
    try {
      await bookingService.updateBookingStatus(booking.id, newStatus);
      setSelectedBooking(prev => prev ? { ...prev, status: newStatus as any } : null);
      await fetchBookings(pagination.current_page);
    } catch (err) {
      console.error("Update status failed", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await bookingService.deleteBooking(id);
      setDeleteId(null);
      await fetchBookings(pagination.current_page);
    } catch (err) {
      console.error("Delete booking failed", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusCounts = {
    ALL: bookings.length,
    PENDING: bookings.filter(b => b.status === "PENDING").length,
    CONFIRMED: bookings.filter(b => b.status === "CONFIRMED").length,
    CANCELLED: bookings.filter(b => b.status === "CANCELLED").length,
    COMPLETED: bookings.filter(b => b.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <CalendarDays size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
              Quản lý Đặt bàn
            </h1>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
              {pagination.total > 0 ? `${pagination.total} lịch hẹn` : "Danh sách đặt bàn trước"}
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchBookings(1)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-xs uppercase tracking-wider transition-all active:scale-95"
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100 space-y-5">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest border transition-all ${
                statusFilter === s
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-gray-50 text-gray-400 border-gray-100 hover:border-primary/20 hover:text-primary"
              }`}
            >
              {s === "ALL"
                ? `Tất cả (${statusCounts.ALL})`
                : `${STATUS_LABELS[s].label} (${statusCounts[s]})`}
            </button>
          ))}
        </div>

        {/* Search + Date */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Tìm theo tên / số điện thoại khách..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-700 outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
          <div className="relative">
            <CalendarDays size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-700 outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all w-full sm:w-auto"
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="px-4 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-xs transition-all"
            >
              Xóa ngày
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100">
        {loading ? (
          <div className="py-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary opacity-30" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-32 text-center">
            <CalendarCheck size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="font-bold text-gray-300 uppercase italic tracking-widest text-sm">
              Không có lịch đặt bàn nào
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày & Giờ</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Bàn</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-gray-400 italic">#{booking.id}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-black text-gray-800 tracking-tight">
                        {booking.customer?.name || `KH #${booking.customer_id}`}
                      </p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">
                        {booking.customer?.phone || ""}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-primary shrink-0" />
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            {new Date(booking.booking_date).toLocaleDateString("vi-VN")}
                          </p>
                          <p className="text-xs text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                            <Clock size={11} /> {booking.booking_time}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex items-center gap-1 font-black text-gray-700">
                        <Users size={14} className="text-gray-400" />
                        {booking.number_of_guests}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-gray-600">
                        {booking.table ? `Bàn ${booking.table.table_number}` : "Tự sắp xếp"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_LABELS[booking.status]?.className ?? ""}`}>
                        {STATUS_LABELS[booking.status]?.label ?? booking.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => { setSelectedBooking(booking); setIsDetailOpen(true); }}
                          className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-primary hover:text-white text-gray-400 flex items-center justify-center transition-all"
                          title="Chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(booking.id)}
                          className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-300 flex items-center justify-center transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="px-8 py-6 flex items-center justify-between border-t border-gray-50">
            <p className="text-xs font-bold text-gray-400">
              Trang {pagination.current_page} / {pagination.total_pages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => fetchBookings(pagination.current_page - 1)}
                className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-primary hover:text-white text-gray-400 disabled:opacity-30 flex items-center justify-center transition-all"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                disabled={pagination.current_page >= pagination.total_pages}
                onClick={() => fetchBookings(pagination.current_page + 1)}
                className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-primary hover:text-white text-gray-400 disabled:opacity-30 flex items-center justify-center transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {isDetailOpen && selectedBooking && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-300 overflow-hidden">
            {/* Modal Header */}
            <div className="px-10 py-8 bg-gradient-to-r from-primary to-rose-700 text-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Chi tiết đặt bàn</h2>
                <p className="text-white/70 text-xs font-bold uppercase mt-1">#{selectedBooking.id}</p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Khách hàng</p>
                  <p className="font-black text-gray-800">{selectedBooking.customer?.name || `KH #${selectedBooking.customer_id}`}</p>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">{selectedBooking.customer?.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lịch hẹn</p>
                  <p className="font-black text-gray-800">{new Date(selectedBooking.booking_date).toLocaleDateString("vi-VN")}</p>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">{selectedBooking.booking_time}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số khách</p>
                  <p className="font-black text-gray-800 text-xl">{selectedBooking.number_of_guests} người</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bàn</p>
                  <p className="font-black text-gray-800">{selectedBooking.table ? `Bàn ${selectedBooking.table.table_number}` : "Tự sắp xếp"}</p>
                </div>
              </div>

              {/* Note */}
              {selectedBooking.note && (
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Ghi chú</p>
                  <p className="text-sm font-bold text-amber-700">{selectedBooking.note}</p>
                </div>
              )}

              {/* Current Status */}
              <div className="flex items-center gap-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Trạng thái hiện tại:</p>
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_LABELS[selectedBooking.status]?.className}`}>
                  {STATUS_LABELS[selectedBooking.status]?.label}
                </span>
              </div>

              {/* Status Update Buttons */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Cập nhật trạng thái:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { status: "CONFIRMED", label: "Xác nhận", icon: <CheckCircle2 size={14} />, color: "bg-emerald-500 hover:bg-emerald-600 text-white" },
                    { status: "COMPLETED", label: "Hoàn thành", icon: <CalendarCheck size={14} />, color: "bg-blue-500 hover:bg-blue-600 text-white" },
                    { status: "CANCELLED", label: "Hủy bỏ", icon: <XCircle size={14} />, color: "bg-red-500 hover:bg-red-600 text-white" },
                  ].map(btn => (
                    <button
                      key={btn.status}
                      disabled={isUpdating || selectedBooking.status === btn.status}
                      onClick={() => handleStatusUpdate(selectedBooking, btn.status)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 ${btn.color}`}
                    >
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">Xóa đặt bàn?</h3>
            <p className="text-gray-400 font-bold text-sm">Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa lịch hẹn này không?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isDeleting}
                className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
