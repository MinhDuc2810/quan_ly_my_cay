"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dashboardService, { DashboardOverview } from "@/services/dashboard.service";
import { getImageUrl } from "@/lib/utils";

export default function AdminDashboard() {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState<DashboardOverview["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getOverview(period);
        console.log("[Dashboard] Phản hồi từ Server:", res);
        if (res.success) {
          setData(res.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch dashboard overview", err);
        console.error("Chi tiết lỗi:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [period]);

  const stats = [
    { 
      title: "Doanh thu", 
      value: `${(data?.revenue?.current || 0).toLocaleString()} đ`, 
      change: `${(data?.revenue?.change_percent || 0) >= 0 ? '+' : ''}${data?.revenue?.change_percent || 0}%`, 
      color: "from-red-400 to-rose-600",
      icon: <SalesIcon />,
      trend: (data?.revenue?.change_percent || 0) >= 0 ? 'up' : 'down'
    },
    { 
      title: "Đơn hàng", 
      value: `${(data?.orders?.current || 0).toLocaleString()} Đơn`, 
      change: `${(data?.orders?.change_percent || 0) >= 0 ? '+' : ''}${data?.orders?.change_percent || 0}%`, 
      color: "from-blue-400 to-indigo-600",
      icon: <OrdersIcon />,
      trend: (data?.orders?.change_percent || 0) >= 0 ? 'up' : 'down'
    },
    { 
      title: "Khách hàng", 
      value: `${(data?.customers?.current || 0).toLocaleString()}`, 
      change: `${(data?.customers?.change_percent || 0) >= 0 ? '+' : ''}${data?.customers?.change_percent || 0}%`, 
      color: "from-emerald-400 to-teal-600",
      icon: <UsersIcon />,
      trend: (data?.customers?.change_percent || 0) >= 0 ? 'up' : 'down'
    },
  ];

  if (loading && !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-none">Dashboard</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Tổng quan kinh doanh</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm shrink-0 overflow-hidden">
          {["today", "week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                period === p 
                ? "bg-gray-900 text-white shadow-lg" 
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {[p === 'today' ? 'Hôm nay' : p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm']}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`relative overflow-hidden rounded-[2.5rem] p-8 text-white bg-gradient-to-br ${stat.color} shadow-2xl shadow-gray-200 transition-all hover:-translate-y-1 cursor-pointer group`}
          >
            {/* Decor Circles */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/10">
                    {stat.icon}
                 </div>
                 <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-widest bg-white/10`}>
                    {period === 'today' ? 'Ngày' : period === 'week' ? 'Tuần' : period === 'month' ? 'Tháng' : 'Năm'}
                 </span>
              </div>
              <h3 className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">{stat.title}</h3>
              <p className="text-3xl font-black tracking-tight mb-6">{stat.value}</p>
              
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-400/20 text-emerald-50' : 'bg-rose-400/20 text-rose-50'}`}>
                   {stat.trend === 'up' ? (
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                   ) : (
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                   )}
                   {stat.change}
                </div>
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">So với trước</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-xl font-black text-gray-800 tracking-tight">Sản phẩm bán chạy nhất</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[3px] mt-1">Sắp xếp theo doanh thu</p>
             </div>
             <button className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline px-4 py-2 bg-primary/5 rounded-xl transition-all">Xem tất cả</button>
          </div>
          
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left pb-4 pl-4 font-mono">STT</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left pb-4">Sản phẩm</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pb-4">Đã bán</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pb-4 pr-4">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {data?.top_products.map((item, i) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 pl-4 text-xs font-black text-gray-300 font-mono italic">#{i + 1}</td>
                    <td className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-400 text-xs shadow-inner shrink-0 overflow-hidden border-2 border-white">
                           {/* Placeholder if no image */}
                           <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary font-black italic">S {i + 1}</div>
                        </div>
                        <div>
                           <p className="text-sm font-black text-gray-800 uppercase tracking-tight italic leading-none">{item.name}</p>
                           <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{item.category_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 text-right">
                       <span className="text-sm font-black text-gray-800">{item.total_sold.toLocaleString()}</span>
                       <span className="text-[10px] font-bold text-gray-400 ml-1">tô</span>
                    </td>
                    <td className="py-5 text-right pr-4">
                       <p className="text-sm font-black text-primary leading-none">{item.revenue.toLocaleString()} đ</p>
                       <p className="text-[9px] font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase mt-1 tracking-tighter">Cực phẩm!</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Status Overview */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center">
           <h3 className="text-xl font-black text-gray-800 tracking-tight mb-10 self-start">Trạng thái Bàn</h3>
           
           <div className="relative w-56 h-56 flex items-center justify-center mb-10">
              {/* SVG Donut Chart */}
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle>
                {data && (
                  <>
                    {/* AVAILABLE */}
                    <circle 
                      cx="18" cy="18" r="16" fill="transparent" stroke="#34D399" strokeWidth="4" 
                      strokeDasharray={`${(data.table_status.AVAILABLE / (data.table_status.AVAILABLE + data.table_status.OCCUPIED + data.table_status.RESERVED + data.table_status.MAINTENANCE)) * 100} 100`}
                    ></circle>
                    {/* OCCUPIED */}
                    <circle 
                      cx="18" cy="18" r="16" fill="transparent" stroke="#60A5FA" strokeWidth="4" 
                      strokeDasharray={`${(data.table_status.OCCUPIED / (data.table_status.AVAILABLE + data.table_status.OCCUPIED + data.table_status.RESERVED + data.table_status.MAINTENANCE)) * 100} 100`}
                      strokeDashoffset={`-${(data.table_status.AVAILABLE / (data.table_status.AVAILABLE + data.table_status.OCCUPIED + data.table_status.RESERVED + data.table_status.MAINTENANCE)) * 100}`}
                    ></circle>
                  </>
                )}
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                 <span className="text-4xl font-black text-gray-800 tracking-tighter">
                   {data ? (data.table_status.AVAILABLE + data.table_status.OCCUPIED + data.table_status.RESERVED + data.table_status.MAINTENANCE) : 0}
                 </span>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] leading-none">Tổng bàn</span>
              </div>
           </div>

           <div className="w-full space-y-4">
              <StatusBadge label="Bàn trống" count={data?.table_status.AVAILABLE || 0} color="bg-emerald-400" />
              <StatusBadge label="Đang có khách" count={data?.table_status.OCCUPIED || 0} color="bg-blue-400" />
              <StatusBadge label="Đã đặt trước" count={data?.table_status.RESERVED || 0} color="bg-amber-400" />
              <StatusBadge label="Bảo trì" count={data?.table_status.MAINTENANCE || 0} color="bg-rose-400" />
           </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="flex items-center justify-between group cursor-default">
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${color} group-hover:scale-125 transition-transform shadow-lg shadow-gray-100`}></span>
        <span className="text-[13px] font-bold text-gray-600 uppercase tracking-tight italic">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-gray-800">{count}</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Bàn</span>
      </div>
    </div>
  );
}

// Stats Preview Icons (Local mapping)
const SalesIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const OrdersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>;
const UsersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

