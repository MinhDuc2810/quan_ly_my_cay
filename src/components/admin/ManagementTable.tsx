import React from "react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface ManagementTableProps {
  title: string;
  description?: string;
  columns: Column[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  isLoading?: boolean;
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
  onPageChange?: (page: number) => void;
  children?: React.ReactNode;
}

export default function ManagementTable({ 
  title, 
  description, 
  columns, 
  data, 
  onAdd,
  onEdit,
  onDelete,
  isLoading,
  pagination,
  onPageChange,
  children
}: ManagementTableProps) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-50 shadow-sm space-y-8 relative overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-3">
             <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             <p className="text-[10px] font-black text-primary uppercase tracking-[3px] animate-pulse">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-gray-800 tracking-tight">{title}</h3>
          {description && <p className="text-sm font-bold text-gray-400 mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-4">
          {onAdd && (
            <button 
              onClick={onAdd}
              className="bg-primary hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Thêm mới
            </button>
          )}
        </div>
      </div>

      {children}

      {/* Table Content */}
      <div className="overflow-x-auto custom-scrollbar -mx-8 px-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-50">
              {columns.map((col) => (
                <th key={col.key} className="text-left py-5 px-4 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">
                  {col.label}
                </th>
              ))}
              <th className="text-right py-5 px-4 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length > 0 ? data.map((item, idx) => (
              <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="py-5 px-4 text-[13px] font-bold text-gray-700 whitespace-nowrap">
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                <td className="py-5 px-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit && onEdit(item)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button 
                      onClick={() => onDelete && onDelete(item)}
                      className="p-2 text-primary hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </td>
              </tr>
            )) : !isLoading && (
              <tr>
                <td colSpan={columns.length + 1} className="py-20 text-center text-gray-400 font-bold italic">
                  Chưa có dữ liệu hiển thị...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pt-4 flex items-center justify-between">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          Hiển thị <span className="text-gray-800">1 - {data.length}</span> trong số <span className="text-gray-800">{pagination?.total || data.length}</span> bản ghi
        </p>
        <div className="flex gap-2">
           <button 
            onClick={() => onPageChange && onPageChange(pagination!.current_page - 1)}
            className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:border-primary/20 transition-all disabled:opacity-30" 
            disabled={pagination?.current_page === 1}
           >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
           </button>
           
           {[...Array(pagination?.total_pages || 1)].map((_, i) => (
             <button 
              key={i}
              onClick={() => onPageChange && onPageChange(i + 1)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                (pagination?.current_page || 1) === i + 1 
                ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                : 'border border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
             >
               {i + 1}
             </button>
           ))}
 
           <button 
            onClick={() => onPageChange && onPageChange(pagination!.current_page + 1)}
            className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:border-primary/20 transition-all disabled:opacity-30" 
            disabled={pagination?.current_page === pagination?.total_pages}
           >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
           </button>
        </div>
      </div>
    </div>
  );
}
