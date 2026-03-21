"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ManagementTable from "@/components/admin/ManagementTable";
import customerService, { CustomerListParams } from "@/services/customer.service";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CustomerListParams>({
    page: 1,
    per_page: 6,
    name: "",
    phone: "",
    email: "",
  });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.getCustomers(filters);
      if (res.success) {
        setCustomers(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Fetch customers failed", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const customerColumns = [
    {
      key: "name",
      label: "Khách hàng",
      render: (name: string, item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 p-0.5 bg-white">
            <Image src="/logo1.jpg" alt="Avatar" width={40} height={40} className="rounded-full object-cover scale-125 opacity-80" />
          </div>
          <div>
            <p className="font-black text-gray-800 leading-none">{name}</p>
            <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-widest">USER: {item.user?.username || "N/A"}</p>
          </div>
        </div>
      )
    },
    { key: "phone", label: "Điện thoại", render: (phone: string) => <span className="font-bold text-gray-700">{phone}</span> },
    { key: "email", label: "Email", render: (email: string) => <span className="text-gray-500 font-medium text-sm">{email || "---"}</span> },
    {
      key: "points",
      label: "Điểm thưởng",
      render: (points: number) => (
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span className="font-black text-amber-600">{points.toLocaleString()} pts</span>
        </div>
      )
    },
    {
      key: "created_at",
      label: "Ngày tham gia",
      render: (date: string) => (
        <span className="text-gray-400 font-bold text-xs">{new Date(date).toLocaleDateString("vi-VN")}</span>
      )
    },
  ];

  const handleAdd = () => {
    setCurrentCustomer(null);
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: any) => {
    setCurrentCustomer(customer);
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (customer: any) => {
    setCurrentCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await customerService.deleteCustomer(currentCustomer.id);
      fetchCustomers();
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      points: Number(formData.get("points") || 0),
    };

    try {
      let result: any;
      if (currentCustomer) {
        result = await customerService.updateCustomer(currentCustomer.id, data);
      } else {
        result = await customerService.createCustomer(data);
      }

      if (result && (result.success === true || result.success === "true")) {
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        const errorList = result?.errors ? Object.values(result.errors).flat() : [result?.message || "Dữ liệu không hợp lệ."];
        setLocalError(errorList.join("\n"));
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errorList = Object.values(err.response.data.errors).flat();
        setLocalError(errorList.join("\n"));
      } else {
        setLocalError(err.response?.data?.message || err.message || "Lỗi kết nối Server!");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Quản lý Khách hàng</h2>
          <p className="text-gray-400 font-medium text-sm mt-1">Thông tin thành viên và tích lũy điểm thưởng Mỳ Cay SASIN.</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary hover:bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 flex items-center justify-center gap-2 group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Thêm Khách hàng
        </button>
      </div>

      <ManagementTable
        title="Danh sách Thành viên"
        description="Theo dõi thông tin chi tiết các khách hàng trung thành của hệ thống."
        columns={customerColumns}
        data={customers}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(page) => setFilters({ ...filters, page })}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
          <div className="relative group">
            <input
              type="text"
              placeholder="Tìm theo tên..."
              className="w-full bg-white border border-gray-200 pl-12 pr-6 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value, page: 1 })}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <div className="relative group">
            <input
              type="text"
              placeholder="Số điện thoại..."
              className="w-full bg-white border border-gray-200 pl-12 pr-6 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              value={filters.phone}
              onChange={(e) => setFilters({ ...filters, phone: e.target.value, page: 1 })}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </div>
          <div className="relative group">
            <input
              type="text"
              placeholder="Tìm theo email..."
              className="w-full bg-white border border-gray-200 pl-12 pr-6 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value, page: 1 })}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
        </div>
      </ManagementTable>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-primary to-rose-600 px-10 py-8 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">{currentCustomer ? "Cập nhật Khách hàng" : "Thêm Khách hàng mới"}</h3>
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mt-1">Thông tin chi tiết thành viên</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-2xl transition-all active:scale-90"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-6">
              {localError && (
                <div className="p-5 bg-red-50 border-2 border-red-100 rounded-2xl animate-in shake duration-300">
                  <h4 className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    Phát hiện lỗi
                  </h4>
                  <p className="text-sm text-red-500 font-bold leading-relaxed whitespace-pre-line">
                    {localError}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Họ và tên</label>
                <input name="name" defaultValue={currentCustomer?.name} required className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" placeholder="Nhập tên khách hàng..." />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại</label>
                <input name="phone" defaultValue={currentCustomer?.phone} required className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" placeholder="Nhập số điện thoại..." />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Email</label>
                <input name="email" type="email" defaultValue={currentCustomer?.email} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" placeholder="Nhập địa chỉ email..." />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Mật khẩu</label>
                  <input name="password" type="password" required={!currentCustomer} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" placeholder="Mật khẩu mới..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Điểm tích lũy</label>
                  <input name="points" type="number" defaultValue={currentCustomer?.points || 0} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" placeholder="0" />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-primary hover:bg-rose-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa khách hàng"
        message={`Bạn có chắc chắn muốn xóa khách hàng "${currentCustomer?.name}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}