"use client";

import { useState, useEffect, useCallback } from "react";
import ManagementTable from "@/components/admin/ManagementTable";
import categoryService, { CategoryListParams } from "@/services/category.service";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CategoryListParams>({
    page: 1,
    per_page: 6,
    search: "",
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories(filters);
      if (res.success) {
        setCategories(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Fetch categories failed", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const categoryColumns = [
    {
      key: "name",
      label: "Tên danh mục",
      render: (name: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-black text-xs">{name.charAt(0).toUpperCase()}</span>
          </div>
          <span className="font-black text-gray-800 leading-none">{name}</span>
        </div>
      )
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      render: (date: string) => (
        <span className="text-gray-400 font-bold text-xs">{new Date(date).toLocaleDateString("vi-VN")}</span>
      )
    },
  ];

  const handleAdd = () => {
    setCurrentCategory(null);
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: any) => {
    setCurrentCategory(category);
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category: any) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await categoryService.deleteCategory(currentCategory.id);
      fetchCategories();
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
    };

    try {
      let result: any;
      if (currentCategory) {
        result = await categoryService.updateCategory(currentCategory.id, data);
      } else {
        result = await categoryService.createCategory(data);
      }

      if (result && (result.success === true || result.success === "true")) {
        setIsModalOpen(false);
        fetchCategories();
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
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Quản lý Danh mục</h2>
          <p className="text-gray-400 font-medium text-sm mt-1">Quản lý nhóm món ăn: Mỳ cay, Đồ uống, Khai vị...</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-primary hover:bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 flex items-center justify-center gap-2 group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Thêm Danh mục
        </button>
      </div>

      <ManagementTable
        title="Danh sách Phân loại"
        description="Quản lý cấu trúc thực đơn của quán."
        columns={categoryColumns}
        data={categories}
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
              placeholder="Tìm kiếm danh mục nhanh..." 
              className="w-full bg-white border border-gray-200 pl-12 pr-6 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
      </ManagementTable>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-primary to-rose-600 px-10 py-8 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">{currentCategory ? "Cập nhật Danh mục" : "Danh mục Mới"}</h3>
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mt-1">Thông tin chi tiết nhóm món</p>
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
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tên danh mục</label>
                <input name="name" defaultValue={currentCategory?.name} required className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" placeholder="Mỳ cay, Đồ uống..." />
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
        title="Xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${currentCategory?.name}"? Điều này có thể ảnh hưởng đến các sản phẩm thuộc danh mục này.`}
      />
    </div>
  );
}