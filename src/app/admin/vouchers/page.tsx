"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  Ticket,
  CheckCircle2,
  XCircle,
  X // added for modal close
} from "lucide-react";
import voucherService, { Voucher } from "@/services/voucher.service";

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDiscountType, setFilterDiscountType] = useState<string>("");
  const [pagination, setPagination] = useState({
    total_pages: 1,
    current_page: 1,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'PERCENTAGE',
    discount_value: 0,
    min_order_amount: 0,
    max_discount: 0,
    usage_limit: 0,
    start_date: '',
    expired_at: '',
    status: 1 as 1 | 0
  });

  const fetchVouchers = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, search: searchQuery };
      if (filterStatus !== '') params.status = Number(filterStatus);
      if (filterDiscountType !== '') params.discount_type = filterDiscountType;
      const res = await voucherService.getVouchers(params);
      if (res.success) {
        setVouchers(res.data);
        setPagination({
          total_pages: res.pagination.total_pages,
          current_page: res.pagination.current_page,
        });
      }
    } catch (error) {
      console.error("Failed to fetch vouchers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [searchQuery, filterStatus, filterDiscountType]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchVouchers(newPage);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'PERCENTAGE',
      discount_value: 0,
      min_order_amount: 0,
      max_discount: 0,
      usage_limit: 0,
      start_date: '',
      expired_at: '',
      status: 1
    });
    setSelectedId(null);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (voucher: Voucher) => {
    setFormData({
      code: voucher.code,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      min_order_amount: voucher.min_order_amount,
      max_discount: voucher.max_discount || 0,
      usage_limit: voucher.usage_limit || 0,
      start_date: formatDateForInput(voucher.start_date),
      expired_at: formatDateForInput(voucher.expired_at),
      status: voucher.status
    });
    setSelectedId(voucher.id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa voucher này không?")) {
      try {
        await voucherService.deleteVoucher(id);
        fetchVouchers(pagination.current_page);
      } catch (error) {
        console.error("Lỗi xóa voucher", error);
        alert("Có lỗi xảy ra khi xóa");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formatToYYYYMMDDHHmmss = (dateStr: string) => {
        if (!dateStr) return '';
        // dateStr from datetime-local is 'YYYY-MM-DDTHH:mm'
        return dateStr.replace('T', ' ') + ':00';
      };

      const payload: any = {
        ...formData,
        start_date: formatToYYYYMMDDHHmmss(formData.start_date),
        expired_at: formatToYYYYMMDDHHmmss(formData.expired_at),
        discount_value: Number(formData.discount_value),
        min_order_amount: Number(formData.min_order_amount),
        max_discount: Number(formData.max_discount),
        usage_limit: Number(formData.usage_limit),
      };

      if (payload.discount_type !== 'PERCENTAGE') {
        delete payload.max_discount;
      }

      if (modalMode === 'create') {
        await voucherService.createVoucher(payload);
      } else {
        if (selectedId) await voucherService.updateVoucher(selectedId, payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchVouchers(pagination.current_page);
    } catch (error: any) {
      console.error("Lỗi lưu voucher", error.response?.data || error);
      const errorMsg = error.response?.data?.message || 
                       JSON.stringify(error.response?.data?.errors) || 
                       "Có lỗi xảy ra khi lưu";
      alert("Lỗi: " + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100/50">
          <CheckCircle2 size={12} /> Hoạt động
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100/50">
        <XCircle size={12} /> Tạm khóa
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100/50">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic flex items-center gap-3">
             <Ticket className="text-primary" size={32} />
             Quản lý Voucher
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-[3px] text-[11px] mt-2 ml-1">Tạo và quản lý các chương trình ưu đãi mã giảm giá</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3"
        >
          <Plus size={18} /> Tạo mã mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/50 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm mã voucher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-100 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all uppercase tracking-widest"
          />
        </div>
        <select
          value={filterDiscountType}
          onChange={e => setFilterDiscountType(e.target.value)}
          className="bg-gray-50/50 border border-gray-100 px-5 py-3.5 rounded-2xl text-sm font-bold outline-none focus:border-primary cursor-pointer w-full md:w-52"
        >
          <option value="">Tất cả loại giảm</option>
          <option value="PERCENTAGE">Phần trăm (%)</option>
          <option value="FIXED">Tiền mặt (VNĐ)</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-50/50 border border-gray-100 px-5 py-3.5 rounded-2xl text-sm font-bold outline-none focus:border-primary cursor-pointer w-full md:w-48"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="1">Đang hoạt động</option>
          <option value="0">Tạm khóa</option>
        </select>
        {(filterStatus !== '' || filterDiscountType !== '') && (
          <button
            onClick={() => { setFilterStatus(''); setFilterDiscountType(''); }}
            className="flex items-center gap-2 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-gray-500 hover:text-primary hover:bg-primary/5 border border-gray-100 transition-all whitespace-nowrap"
          >
            <X size={14} /> Xóa lọc
          </button>
        )}
      </div>

      {/* Voucher Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Mã Code</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Giảm giá</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Điều kiện</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Hạn dùng</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Lượt dùng</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-8 py-6 h-16 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : vouchers.length > 0 ? vouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="bg-primary/5 text-primary px-4 py-2 rounded-xl font-black text-xs uppercase tracking-[2.5px] border border-primary/10 block w-fit shadow-sm">
                      {voucher.code}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black text-gray-800">
                        {voucher.discount_type === 'PERCENTAGE' 
                          ? `${voucher.discount_value}%` 
                          : `${voucher.discount_value.toLocaleString()} đ`}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Giảm trực tiếp</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-600">
                    Bill từ {voucher.min_order_amount.toLocaleString()} đ
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-xs font-bold text-gray-800">Từ: {new Date(voucher.start_date).toLocaleDateString('vi-VN')}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Đến: {new Date(voucher.expired_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${voucher.usage_limit ? (voucher.used_count / voucher.usage_limit) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] font-black text-gray-800">{voucher.used_count}/{voucher.usage_limit || '∞'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {getStatusBadge(voucher.status)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleOpenEdit(voucher)} 
                         className="p-2 text-gray-400 hover:text-primary hover:bg-emerald-50 rounded-lg transition-all" 
                         title="Sửa"
                       >
                         <Edit2 size={16} />
                       </button>
                       <button 
                         onClick={() => handleDelete(voucher.id)} 
                         className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                         title="Xóa"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <Ticket size={48} className="mb-4" />
                       <p className="font-extrabold uppercase tracking-[3px] text-xs">Chưa có mã voucher nào...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination bar */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
           <p className="text-xs font-bold text-gray-400">Đang hiển thị {vouchers.length} kết quả bản ghi</p>
           <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-all disabled:opacity-20"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center px-4 font-black text-xs text-gray-800 uppercase tracking-widest">
                Trang {pagination.current_page} / {pagination.total_pages}
              </div>
              <button 
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
                className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-all disabled:opacity-20"
              >
                <ChevronRight size={20} />
              </button>
           </div>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-800 uppercase italic">
                {modalMode === 'create' ? "Tạo Voucher Mới" : "Cập Nhật Voucher"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mã Code *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none uppercase font-bold text-sm"
                    placeholder="VD: SUMMER2024"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: Number(e.target.value) as 0|1})}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold"
                  >
                    <option value={1}>Hoạt động</option>
                    <option value={0}>Tạm khóa</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loại giảm giá</label>
                  <select 
                    value={formData.discount_type} 
                    onChange={e => setFormData({...formData, discount_type: e.target.value})}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold"
                  >
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED">Tiền mặt (VNĐ)</option>
                  </select>
                </div>s

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {formData.discount_type === 'PERCENTAGE' ? "Mức giảm (%) *" : "Mức giảm (VNĐ) *"}
                  </label>
                  <input 
                    required 
                    type="number" 
                    value={formData.discount_value} 
                    onChange={e => setFormData({...formData, discount_value: Number(e.target.value)})}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold"
                    min={0}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đơn tối thiểu (VNĐ) *</label>
                  <input 
                    required 
                    type="number" 
                    value={formData.min_order_amount} 
                    onChange={e => setFormData({...formData, min_order_amount: Number(e.target.value)})}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold"
                    min={0}
                  />
                </div>

                {formData.discount_type === 'PERCENTAGE' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Giảm tối đa (VNĐ)</label>
                    <input 
                      type="number" 
                      value={formData.max_discount} 
                      onChange={e => setFormData({...formData, max_discount: Number(e.target.value)})}
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold"
                      min={0}
                    />
                  </div>
                ) : (
                  <div className="hidden md:block"></div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Giới hạn sử dụng</label>
                  <input 
                    type="number" 
                    value={formData.usage_limit} 
                    onChange={e => setFormData({...formData, usage_limit: Number(e.target.value)})}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold"
                    min={0}
                  />
                </div>
                
                <div className="space-y-1"></div> {/* Spacer */}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày bắt đầu *</label>
                  <input 
                    required 
                    type="datetime-local" 
                    value={formData.start_date} 
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày hết hạn *</label>
                  <input 
                    required 
                    type="datetime-local" 
                    value={formData.expired_at} 
                    onChange={e => setFormData({...formData, expired_at: e.target.value})}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold"
                  />
                </div>

              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-rose-700 active:scale-95 transition-all uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <span className="animate-spin text-lg leading-none">⏳</span>}
                  Lưu Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}