"use client";

import { useState, useEffect, useCallback } from "react";
import ManagementTable from "@/components/admin/ManagementTable";
import tableService, { TableListParams, TableStatus } from "@/services/table.service";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { FileSpreadsheet } from "lucide-react";
import { exportToExcel } from "@/lib/export.utils";

export default function TablesManagement() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const [filters, setFilters] = useState<TableListParams>({
    page: 1,
    per_page: 6,
    search: "",
    status: "",
    min_capacity: undefined,
  });

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tableService.getTables(filters);
      if (res.success) {
        setTables(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Fetch tables failed", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleExportExcel = () => {
    const dataToExport = tables.map(t => ({
      ID: t.id,
      'Số bàn': t.table_number,
      'Sức chứa': t.capacity,
      'Trạng thái phục vụ': mapStatus(t.status).label,
      'Tình trạng': t.is_deleted ? 'Dừng hoạt động' : 'Hoạt động',
    }));
    exportToExcel(dataToExport, `Danh-sach-ban-an-${new Date().getTime()}`, 'Tables');
  };

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const mapStatus = (status: TableStatus) => {
    switch (status) {
      case "AVAILABLE": 
        return { label: "Sẵn sàng", class: "bg-green-50 text-green-600 border-green-100", dot: "bg-green-500" };
      case "OCCUPIED": 
        return { label: "Có khách", class: "bg-red-50 text-red-600 border-red-100", dot: "bg-red-500" };
      case "RESERVED": 
        return { label: "Đặt trước", class: "bg-orange-50 text-orange-600 border-orange-100", dot: "bg-orange-500" };
      case "MAINTENANCE": 
        return { label: "Bảo trì", class: "bg-gray-100 text-gray-400 border-gray-200", dot: "bg-gray-400" };
      default: 
        return { label: status, class: "bg-gray-50 text-gray-400 border-gray-100", dot: "bg-gray-300" };
    }
  };

  const tableColumns = [
    {
      key: "table_number",
      label: "Số bàn",
      render: (num: string) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-gray-200 rotate-2">
            {num}
          </div>
          <span className="font-black text-gray-800 tracking-tight">Khu vực {num.charAt(0)}</span>
        </div>
      )
    },
    { 
      key: "capacity", 
      label: "Sức chứa", 
      render: (cap: number) => (
        <div className="flex items-center gap-1.5 text-gray-500 font-bold">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M14.83 7a4 4 0 0 0-3.33-3.33"></path></svg>
          {cap} người
        </div>
      ) 
    },
    {
      key: "is_deleted",
      label: "Tình trạng",
      render: (is_deleted: number) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${
            !is_deleted
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${ !is_deleted ? "bg-emerald-500" : "bg-rose-500" }`} />
          {!is_deleted ? "Hoạt động" : "Dừng hoạt động"}
        </span>
      )
    },
    {
      key: "status", label: "Phục vụ", render: (status: TableStatus) => {
        const mapped = mapStatus(status);
        return (
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${mapped.class}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${mapped.dot} animate-pulse`}></span>
            {mapped.label}
          </span>
        );
      }
    },
  ];

  const handleAdd = () => {
    setCurrentTable(null);
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (table: any) => {
    setCurrentTable(table);
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (table: any) => {
    setCurrentTable(table);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await tableService.deleteTable(currentTable.id);
      fetchTables();
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      table_number: formData.get("table_number") as string,
      capacity: Number(formData.get("capacity")),
      status: formData.get("status") as string,
    };

    try {
      let result: any;
      if (currentTable) {
        result = await tableService.updateTable(currentTable.id, data);
      } else {
        result = await tableService.createTable(data);
      }

      if (result && (result.success === true || result.success === "true")) {
        setIsModalOpen(false);
        fetchTables();
      } else {
        const errorList = result?.errors ? Object.values(result.errors).flat() : [result?.message || "Dữ liệu không hợp lệ."];
        setLocalError(errorList.join("\n"));
      }
    } catch (err: any) {
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
          <div className="p-4 bg-gray-900 rounded-[1.5rem] text-white shadow-2xl shadow-gray-200">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Sơ đồ Bàn ăn</h2>
            <p className="text-gray-400 font-medium text-sm mt-0.5">Quản lý sức chứa và trạng thái phục vụ của nhà hàng.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleExportExcel}
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-100/50 active:scale-95 flex items-center justify-center gap-2"
          >
            <FileSpreadsheet size={20} />
            Xuất Excel
          </button>
          <button 
            onClick={handleAdd}
            className="bg-primary hover:bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 flex items-center justify-center gap-2 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Thêm Bàn mới
          </button>
        </div>
      </div>

      <ManagementTable
        title="Bảng phân phối chỗ ngồi"
        description="Theo dõi tình trạng bàn theo khu vực."
        columns={tableColumns}
        data={tables}
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
              placeholder="Tìm theo số hiệu bàn (Search)..." 
              className="w-full bg-white border border-gray-200 pl-12 pr-6 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>

          <div className="relative group">
            <input 
              type="number" 
              placeholder="Sức chứa tối thiểu (Số người)..." 
              className="w-full bg-white border border-gray-200 pl-12 pr-6 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm h-[58px]"
              value={filters.min_capacity || ""}
              onChange={(e) => setFilters({ ...filters, min_capacity: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle></svg>
          </div>

          <div className="relative group">
            <select
              className="w-full bg-white border border-gray-200 pl-12 pr-6 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm appearance-none"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as TableStatus, page: 1 })}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="AVAILABLE">AVAILABLE (Sẵn sàng)</option>
              <option value="OCCUPIED">OCCUPIED (Có khách)</option>
              <option value="RESERVED">RESERVED (Đặt trước)</option>
              <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
            </select>
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </div>
        </div>
      </ManagementTable>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="bg-gray-900 px-10 py-8 flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-black uppercase tracking-wider italic">{currentTable ? "Cập nhật thông tin bàn" : "Thiết lập bàn mới"}</h3>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">Cấu hình tham số chỗ ngồi</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-2xl transition-all active:scale-90">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-6">
              {localError && (
                <div className="p-5 bg-red-50 border-2 border-red-100 rounded-2xl animate-in shake duration-300">
                  <p className="text-sm text-red-500 font-bold leading-relaxed whitespace-pre-line">{localError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Số hiệu bàn</label>
                  <input name="table_number" defaultValue={currentTable?.table_number} required className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" placeholder="A01, B02..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Sức chứa (Người)</label>
                  <input name="capacity" type="number" defaultValue={currentTable?.capacity || 4} required className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" placeholder="4" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Trạng thái hiện tại</label>
                <select name="status" defaultValue={currentTable?.status || "AVAILABLE"} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700 outline-none focus:border-primary transition-all text-sm appearance-none">
                  <option value="AVAILABLE">Sẵn sàng phục vụ (AVAILABLE)</option>
                  <option value="OCCUPIED">Đang có khách (OCCUPIED)</option>
                  <option value="RESERVED">Đã được đặt trước (RESERVED)</option>
                  <option value="MAINTENANCE">Đang bảo trì/dọn dẹp (MAINTENANCE)</option>
                </select>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Hủy bỏ</button>
                <button type="submit" className="flex-2 bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95">Xác nhận lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa bàn ăn"
        message={`Bạn có chắc chắn muốn xóa bàn "${currentTable?.table_number}" khỏi sơ đồ? Việc này có thể ảnh hưởng đến lịch sử đặt bàn.`}
      />
    </div>
  );
}