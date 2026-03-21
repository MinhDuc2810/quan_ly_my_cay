"use client";

import React, { useState, useEffect, useCallback } from "react";
import ManagementTable from "@/components/admin/ManagementTable";
import Image from "next/image";
import userService, { UserListParams } from "@/services/user.service";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function AccountsManagement() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const [filters, setFilters] = useState<UserListParams>({
    page: 1,
    per_page: 6,
    role: "",
    username: "",
  });

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers(filters);
      if (res.success) {
        setAccounts(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Fetch users failed", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const mapRole = (role: string) => {
    switch (role) {
      case "ADMIN": return { label: "Quản trị viên", class: "bg-purple-100 text-purple-600" };
      case "STAFF": return { label: "Nhân viên", class: "bg-blue-100 text-blue-600" };
      case "CUSTOMER": return { label: "Khách hàng", class: "bg-orange-100 text-orange-600" };
      default: return { label: role, class: "bg-gray-100 text-gray-400" };
    }
  };

  const accountColumns = [
    {
      key: "username",
      label: "Người dùng",
      render: (username: string, item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 p-0.5">
            <Image src="/logo1.jpg" alt="Avatar" width={40} height={40} className="rounded-full object-cover scale-125" />
          </div>
          <div>
            <p className="font-black text-gray-800 leading-none">{username}</p>
            <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-widest">ID: {item.id}</p>
          </div>
        </div>
      )
    },
    {
      key: "role", label: "Vai trò", render: (role: string) => {
        const mapped = mapRole(role);
        return (
          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${mapped.class}`}>
            {mapped.label}
          </span>
        );
      }
    },
    {
      key: "status", label: "Trạng thái", render: (status: number) => (
        <span className={`flex items-center gap-2 font-bold ${status === 1 ? 'text-green-500' : 'text-red-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status === 1 ? 'bg-green-500' : 'bg-red-400'}`}></span>
          {status === 1 ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      )
    },
    {
      key: "created_at", label: "Ngày tạo", render: (date: string) => (
        <span className="text-gray-400 font-bold text-xs">{new Date(date).toLocaleDateString("vi-VN")}</span>
      )
    },
  ];

  const handleAdd = () => {
    setCurrentAccount(null);
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (account: any) => {
    setCurrentAccount(account);
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (account: any) => {
    setCurrentAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await userService.deleteUser(currentAccount.id);
      fetchAccounts();
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
      status: formData.get("status") === "Hoạt động" ? 1 : 0,
    };

    // console.log(">>> SUBMIT_PAYLOAD:", data); // Removed

    try {
      let result: any;
      if (currentAccount) {
        result = await userService.updateUser(currentAccount.id, data);
      } else {
        result = await userService.createUser(data);
      }
      
      // CƠ CHẾ KIỂM TRA NGHIÊM NGẶT - CHỈ ĐÓNG KHI SERVER PHẢN HỒI THÀNH CÔNG TƯỜNG MINH
      if (result && (result.success === true || result.success === "true")) {
        setIsModalOpen(false);
        fetchAccounts();
      } else {
        // Nếu không thành công, ở lại Modal và hiện lỗi
        const errorList = result?.errors ? Object.values(result.errors).flat() : [result?.message || "Dữ liệu không hợp lệ. Hãy kiểm tra lại."];
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
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
        </div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Quản lý Tài khoản</h2>
      </div>

      <ManagementTable
        title="Danh sách Tài khoản"
        description="Quản lý nhân sự, phân quyền và trạng thái hoạt động của các tài khoản trong hệ thống."
        columns={accountColumns}
        data={accounts}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(page) => setFilters({ ...filters, page })}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Tìm kiếm tài khoản (Username)..." 
              className="w-full bg-white border border-gray-200 pl-12 pr-6 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              value={filters.username}
              onChange={(e) => setFilters({ ...filters, username: e.target.value, page: 1 })}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
      </ManagementTable>

      {/* Modal CRUD Account */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
              <h3 className="text-xl font-black uppercase tracking-widest italic">{currentAccount ? "Cập nhật tài khoản" : "Cấp tài khoản mới"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-6">
              {localError && (
                <div className="p-5 bg-red-50 border-2 border-red-100 rounded-2xl animate-in shake duration-300">
                  <h4 className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    Phát hiện lỗi nhập liệu
                  </h4>
                  <p className="text-sm text-red-500 font-bold leading-relaxed whitespace-pre-line">
                    {localError}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tên đăng nhập (Username)</label>
                <input name="username" defaultValue={currentAccount?.username} required className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" placeholder="Nhập username..." />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Mật khẩu</label>
                <input name="password" type="password" required={!currentAccount} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" placeholder="Nhập mật khẩu..." />
                <p className="text-[10px] text-gray-400 font-medium italic">
                  * Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Phân quyền</label>
                  <select name="role" defaultValue={currentAccount?.role || "STAFF"} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary transition-all">
                    <option value="STAFF">Nhân viên (Staff)</option>
                    <option value="ADMIN">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</label>
                  <select name="status" defaultValue={currentAccount?.status === 0 ? "Tạm khóa" : "Hoạt động"} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary transition-all text-sm">
                    <option>Hoạt động</option>
                    <option>Tạm khóa</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">Đóng</button>
                <button type="submit" className="flex-[2] bg-primary text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-rose-700 transition-all transform hover:-translate-y-1 active:translate-y-0">
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
        title="Xóa tài khoản"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${currentAccount?.username}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}