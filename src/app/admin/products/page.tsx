"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ManagementTable from "@/components/admin/ManagementTable";
import productService, { ProductListParams } from "@/services/product.service";
import categoryService from "@/services/category.service";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import api from "@/lib/axios";
import { getImageUrl } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProductListParams>({
    page: 1,
    per_page: 6,
    name: "",
    category_id: "",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts(filters);
      if (res.success) {
        setProducts(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Fetch products failed", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error("Fetch categories failed", err);
      }
    };
    fetchCategories();
  }, []);

  const productColumns = [
    {
      key: "image_url",
      label: "Hình ảnh",
      render: (url: string) => {
        let imageUrl = url ? (url.includes("|") ? url.split("|")[0] : url) : "/placeholder.png";

        // Handle relative paths from backend
        if (imageUrl.startsWith("/uploads")) {
          imageUrl = `https://seoul-spicy-production.up.railway.app${imageUrl}`;
        }

        return (
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
            <Image src={imageUrl} alt="Product" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
        );
      }
    },
    { key: "name", label: "Tên món ăn", render: (name: string) => <span className="font-black text-gray-800 tracking-tight leading-none">{name}</span> },
    {
      key: "category",
      label: "Danh mục",
      render: (cat: any) => (
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20">
          {cat?.name || "N/A"}
        </span>
      )
    },
    {
      key: "price",
      label: "Giá bán",
      render: (price: number) => <span className="font-bold text-gray-700">{price.toLocaleString("vi-VN")} đ</span>
    },
    {
      key: "stock_quantity",
      label: "Tồn kho",
      render: (stock: number) => <span className="font-black text-gray-500">{stock}</span>
    },
    {
      key: "status", label: "Trạng thái", render: (status: number) => (
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status === 1 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-400'}`}></span>
          <span className={`text-xs font-bold ${status === 1 ? 'text-green-600' : 'text-red-400'}`}>{status === 1 ? "Sẵn có" : "Tạm ngưng"}</span>
        </span>
      )
    },
  ];

  const handleAdd = () => {
    setCurrentProduct(null);
    setLocalError(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setCurrentProduct(product);
    setLocalError(null);
    setImagePreview(product.image_url);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: any) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await productService.deleteProduct(currentProduct.id);
      fetchProducts();
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      // Hiển thị preview cho ảnh đầu tiên
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const formElement = e.target as HTMLFormElement;
    const formDataPayload = new FormData();

    // Ánh xạ các trường theo format yêu cầu của Backend
    formDataPayload.append("category_id", (formElement.elements.namedItem("category_id") as HTMLSelectElement).value);
    formDataPayload.append("name", (formElement.elements.namedItem("name") as HTMLInputElement).value);
    formDataPayload.append("price", (formElement.elements.namedItem("price") as HTMLInputElement).value);
    formDataPayload.append("description", (formElement.elements.namedItem("description") as HTMLTextAreaElement).value);
    formDataPayload.append("stock_quantity", (formElement.elements.namedItem("stock_quantity") as HTMLInputElement).value || "0");
    formDataPayload.append("min_stock", (formElement.elements.namedItem("min_stock") as HTMLInputElement).value || "0");
    formDataPayload.append("status", (formElement.elements.namedItem("status") as HTMLSelectElement).value === "Sẵn có" ? "1" : "0");

    // Thêm các file ảnh (Gửi dưới dạng mảng images[])
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formDataPayload.append("images", file);
      });
    }

    // Dev Log: Dữ liệu gửi đi
    console.log("--- DỮ LIỆU GỬI LÊN ---");
    formDataPayload.forEach((value, key) => {
      console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
    });

    try {
      let result: any;
      if (currentProduct) {
        result = await productService.updateProduct(currentProduct.id, formDataPayload);
      } else {
        result = await productService.createProduct(formDataPayload);
      }

      console.log("--- KẾT QUẢ TRẢ VỀ ---", result);

      if (result && (result.success === true || result.success === "true" || result.status === 200 || result.status === 201)) {
        setIsModalOpen(false);
        setSelectedFiles([]);
        setImagePreview(null);
        fetchProducts();
      } else {
        const errorList = result?.errors ? Object.values(result.errors).flat() : [result?.message || "Dữ liệu không hợp lệ."];
        setLocalError(errorList.join("\n"));
      }
    } catch (err: any) {
      console.error("Save product failed:", err);
      if (err.response?.data?.errors) {
        setLocalError(Object.values(err.response.data.errors).flat().join("\n"));
      } else {
        setLocalError(err.response?.data?.message || err.message || "Lỗi kết nối Server!");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary rounded-[1.5rem] text-white shadow-xl shadow-primary/20 rotate-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Thực đơn Nhà hàng</h2>
            <p className="text-gray-400 font-medium text-sm mt-0.5">Quản lý toàn bộ Món ăn & Đồ uống Mỳ Cay SASIN.</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary hover:bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 flex items-center justify-center gap-2 group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Thêm Món mới
        </button>
      </div>

      <ManagementTable
        title="Bảng thực đơn"
        description="Giá cả, hình ảnh và trạng thái phục vụ."
        columns={productColumns}
        data={products}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(page) => setFilters({ ...filters, page })}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100/50">
          <div className="relative group">
            <input
              type="text"
              placeholder="Tìm tên món ăn..."
              className="w-full bg-white border border-gray-200 pl-12 pr-6 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value, page: 1 })}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>

          <div className="relative group">
            <select
              className="w-full bg-white border border-gray-200 pl-12 pr-6 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm appearance-none"
              value={filters.category_id}
              onChange={(e) => setFilters({ ...filters, category_id: e.target.value, page: 1 })}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </div>
        </div>
      </ManagementTable>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] border border-white/20 animate-in zoom-in-95 duration-300 custom-scrollbar">
            <div className="bg-gradient-to-r from-primary to-rose-600 px-10 py-8 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">{currentProduct ? "Cập nhật Món ăn" : "Tạo Món mới"}</h3>
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mt-1">Thông tin chi tiết thực đơn</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-2xl transition-all active:scale-90">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-6">
              {localError && (
                <div className="p-5 bg-red-50 border-2 border-red-100 rounded-2xl animate-in shake duration-300">
                  <h4 className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Phát hiện lỗi nhập liệu
                  </h4>
                  <p className="text-sm text-red-500 font-bold leading-relaxed whitespace-pre-line">{localError}</p>
                </div>
              )}

              {/* Image Upload */}
              <div className="flex flex-col items-center gap-4 bg-gray-50/50 p-8 rounded-3xl border-2 border-dashed border-gray-100 group transition-all hover:bg-white hover:border-primary/20">
                <div className="relative w-40 h-40 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                  {imagePreview ? (
                    <img src={getImageUrl(imagePreview)} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      <p className="text-[10px] font-black uppercase tracking-widest mt-2">Chưa có ảnh</p>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-white border border-gray-100 px-8 py-3 rounded-2xl text-xs font-black text-primary shadow-sm hover:bg-primary hover:text-white transition-all active:scale-95 uppercase tracking-widest">
                  Chọn ảnh sản phẩm
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {selectedFiles.length > 0 && (
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
                    Đã chọn {selectedFiles.length} ảnh
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tên món ăn / Đồ uống</label>
                <input name="name" defaultValue={currentProduct?.name} required className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" placeholder="Ví dụ: Mỳ Cay Bò Mỹ..." />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Danh mục</label>
                  <select name="category_id" defaultValue={currentProduct?.category_id} required className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:border-primary outline-none transition-all text-sm">
                    <option value="">Chọn danh mục...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Giá bán (VNĐ)</label>
                  <input name="price" type="number" defaultValue={currentProduct?.price} required className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:border-primary outline-none transition-all" placeholder="55000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Số lượng tồn kho</label>
                  <input name="stock_quantity" type="number" defaultValue={currentProduct?.stock_quantity || 0} required className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:border-primary outline-none transition-all" placeholder="100" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tồn tối thiểu (Cảnh báo)</label>
                  <input name="min_stock" type="number" defaultValue={currentProduct?.min_stock || 10} required className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:border-primary outline-none transition-all" placeholder="10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Trạng thái phục vụ</label>
                <select name="status" defaultValue={currentProduct?.status === 0 ? "Tạm ngưng" : "Sẵn có"} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary transition-all text-sm">
                  <option>Sẵn có</option>
                  <option>Tạm ngưng</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Mô tả đặc điểm</label>
                <textarea name="description" defaultValue={currentProduct?.description} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:border-primary outline-none transition-all min-h-[100px] resize-none" placeholder="Hãy mô tả một chút về món ăn này..." />
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all">Hủy bỏ</button>
                <button type="submit" className="flex-2 bg-primary hover:bg-rose-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95">Xác nhận lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa món ăn"
        message={`Bạn có chắc chắn muốn xóa "${currentProduct?.name}" khỏi thực đơn? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}
