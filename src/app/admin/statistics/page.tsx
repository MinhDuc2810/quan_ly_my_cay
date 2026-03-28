"use client";

import React, { useState, useEffect } from "react";
import dashboardService, { ProductStats } from "@/services/dashboard.service";
import { getImageUrl } from "@/lib/utils";
import Image from "next/image";
import { FileSpreadsheet } from "lucide-react";
import { exportToExcel } from "@/lib/export.utils";

export default function AdminStatisticsPage() {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState<ProductStats["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getProductStats(period);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch product stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  const handleExportExcel = () => {
    if (!data) return;
    const dataToExport = data.category_stats.map(cat => ({
      'Danh mục': cat.category,
      'Số lượng món': cat.product_count,
      'Đã bán': Number(cat.total_sold),
      'Doanh thu (VNĐ)': Number(cat.revenue),
    }));
    exportToExcel(dataToExport, `Thong-ke-danh-muc-${period}-${new Date().getTime()}`, 'CategoryStats');
  };

  if (loading && !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
             </div>
             Thống kê Sản phẩm
          </h2>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2 ml-12">Phân tích tồn kho & hiệu suất kinh doanh</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm self-start md:self-center overflow-hidden">
          {["today", "week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                period === p 
                ? "bg-gray-900 text-white shadow-lg" 
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {[p === 'today' ? 'Ngày' : p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm']}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg shadow-emerald-900/20"
        >
          <FileSpreadsheet size={16} />
          Xuất báo cáo
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left: Top Products & Category Stats (2/3) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Category Stats Table */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black text-gray-800 tracking-tight italic">Doanh thu theo Danh mục</h3>
               <span className="p-2 bg-gray-50 rounded-lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 12H3"/><path d="M21 6H3"/><path d="M21 18H3"/></svg></span>
            </div>
            
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                       <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left pb-4">Danh mục</th>
                       <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center pb-4">Số lượng món</th>
                       <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center pb-4">Đã bán</th>
                       <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pb-4 pr-2">Tổng Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50/50">
                    {data?.category_stats.map((cat, i) => (
                      <tr key={i} className="group hover:bg-gray-50/20 transition-colors">
                        <td className="py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                              <span className="text-sm font-black text-gray-800 uppercase italic tracking-tight">{cat.category}</span>
                           </div>
                        </td>
                        <td className="py-5 text-center text-sm font-black text-gray-600 font-mono">{cat.product_count}</td>
                        <td className="py-5 text-center text-sm font-black text-gray-800 italic">{Number(cat.total_sold).toLocaleString()}</td>
                        <td className="py-5 text-right pr-2">
                           <span className="text-sm font-black text-primary leading-none">{Number(cat.revenue).toLocaleString()} đ</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>

          {/* Top Products Table (Simplified version for stats page) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <h3 className="text-xl font-black text-gray-800 tracking-tight italic mb-8">Top Sản phẩm Bán chạy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {data?.top_products.length ? data.top_products.map((item, i) => (
                 <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs italic shadow-lg shadow-primary/20">#{i+1}</div>
                       <div>
                          <p className="text-xs font-black text-gray-800 uppercase tracking-tight truncate max-w-[120px]">{item.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.category_name}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-primary">{item.revenue.toLocaleString()} đ</p>
                       <p className="text-[9px] font-bold text-gray-400">{item.total_sold} đã bán</p>
                    </div>
                 </div>
               )) : (
                 <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-30 italic">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Chưa có dữ liệu bán hàng cho kỳ này
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right: Low Stock Warnings (1/3) */}
        <div className="space-y-8">
           <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                       Cảnh báo Kho
                    </h3>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-[2px] mt-1">Các món sắp hết hàng</p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-500 font-bold text-xs italic shadow-inner">
                    {data?.low_stock.length || 0}
                 </div>
              </div>

              <div className="space-y-4 relative z-10 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                 {data?.low_stock.length ? data.low_stock.map(item => (
                   <div key={item.id} className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group/item">
                      <div className="flex justify-between items-start mb-4">
                         <div className="min-w-0">
                            <h4 className="text-sm font-black text-rose-100 uppercase tracking-tight truncate leading-none">{item.name}</h4>
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-2">{item.category_name}</p>
                         </div>
                         <div className="px-3 py-1 bg-rose-500 rounded-full text-[9px] font-black text-white uppercase tracking-wider shadow-lg shadow-rose-900/40">Sắp hết</div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                         <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full" 
                              style={{ width: `${(item.stock_quantity / item.min_stock) * 100}%` }}
                            ></div>
                         </div>
                         <span className="text-[10px] font-black text-white/80 font-mono italic whitespace-nowrap">
                           {item.stock_quantity} / {item.min_stock}
                         </span>
                      </div>
                      
                      <div className="mt-4 flex justify-end gap-2">
                         <button className="text-[9px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors">Bỏ qua</button>
                         <button className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">Nhập ngay</button>
                      </div>
                   </div>
                 )) : (
                   <div className="py-12 flex flex-col items-center justify-center opacity-20 text-white italic">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Kho hàng đầy đủ
                   </div>
                 )}
              </div>
              
              <div className="mt-10 pt-4 border-t border-white/5 flex items-center justify-center relative z-10">
                 <button className="text-[10px] font-black text-white/20 uppercase tracking-[4px] hover:text-primary transition-colors">Quản lý kho chi tiết</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}