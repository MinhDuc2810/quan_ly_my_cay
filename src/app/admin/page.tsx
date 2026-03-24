"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dashboardService, { DashboardOverview, CustomerStats } from "@/services/dashboard.service";
import { getImageUrl } from "@/lib/utils";

export default function AdminDashboard() {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState<DashboardOverview["data"] | null>(null);
  const [customerData, setCustomerData] = useState<CustomerStats["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true);
      try {
        const [overviewRes, customerRes] = await Promise.all([
          dashboardService.getOverview(period),
          dashboardService.getCustomerStats(period)
        ]);
        
        if (overviewRes.success) setData(overviewRes.data);
        if (customerRes.success) setCustomerData(customerRes.data);
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllStats();
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
      value: `${((customerData?.new_customers || 0) + (customerData?.returning_customers || 0)).toLocaleString()}`, 
      change: `${(data?.customers?.change_percent || 0) >= 0 ? '+' : ''}${data?.customers?.change_percent || 0}%`, 
      color: "from-emerald-400 to-teal-600",
      icon: <UsersIcon />,
      trend: (data?.customers?.change_percent || 0) >= 0 ? 'up' : 'down'
    },
  ];

  const tableTotal = data ? (data.table_status.AVAILABLE + data.table_status.OCCUPIED + data.table_status.RESERVED + data.table_status.MAINTENANCE) : 0;
  
  const getPercentage = (value: number) => {
    if (tableTotal === 0) return 0;
    return (value / tableTotal) * 100;
  };

  if (loading && !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-none">Dashboard</h2>
            <div className="flex items-center gap-2 mt-1.5 focus-within:">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Tổng quan kinh doanh</p>
              {data?.date_range && (
                <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/5 rounded-md border border-primary/10 leading-none">
                  {new Date(data.date_range.from).toLocaleDateString('vi-VN')} - {new Date(data.date_range.to).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
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
              {p === 'today' ? 'Hôm nay' : p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
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
                 <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-widest bg-white/10 shrink-0`}>
                    So với kỳ trước
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
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Tăng trưởng</span>
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
                <h3 className="text-xl font-black text-gray-800 tracking-tight">Sản phẩm bán chạy</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[3px] mt-1">Dựa trên doanh số thực tế</p>
             </div>
             <button className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline px-4 py-2 bg-primary/5 rounded-xl transition-all">Chi tiết sản phẩm</button>
          </div>
          
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left pb-4 pl-4 font-mono">Rank</th>
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
                           <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary font-black italic">
                             {item.name.charAt(0).toUpperCase()}
                           </div>
                        </div>
                        <div>
                           <p className="text-sm font-black text-gray-800 uppercase tracking-tight italic leading-none">{item.name}</p>
                           <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{item.category_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 text-right">
                       <span className="text-sm font-black text-gray-800">{item.total_sold.toLocaleString()}</span>
                       <span className="text-[10px] font-bold text-gray-400 ml-1">phần</span>
                    </td>
                    <td className="py-5 text-right pr-4">
                       <p className="text-sm font-black text-primary leading-none">{item.revenue.toLocaleString()} đ</p>
                       <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-tighter group-hover:text-emerald-500 transition-colors">+{Math.round(item.revenue / (data.revenue.current || 1) * 100)}% tổng</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Status Overview */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center">
           <div className="w-full flex justify-between items-start mb-10">
             <div>
               <h3 className="text-xl font-black text-gray-800 tracking-tight">Trạng thái Bàn</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Thời gian thực</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 animate-pulse">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
             </div>
           </div>
           
           <div className="relative w-52 h-52 flex items-center justify-center mb-10">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle>
                {data && (
                  <>
                    {/* AVAILABLE */}
                    <circle 
                      cx="18" cy="18" r="16" fill="transparent" stroke="#34D399" strokeWidth="4" 
                      strokeDasharray={`${getPercentage(data.table_status.AVAILABLE)} 100`}
                    ></circle>
                    {/* OCCUPIED */}
                    <circle 
                      cx="18" cy="18" r="16" fill="transparent" stroke="#60A5FA" strokeWidth="4" 
                      strokeDasharray={`${getPercentage(data.table_status.OCCUPIED)} 100`}
                      strokeDashoffset={`-${getPercentage(data.table_status.AVAILABLE)}`}
                    ></circle>
                    {/* RESERVED */}
                    <circle 
                      cx="18" cy="18" r="16" fill="transparent" stroke="#FBBF24" strokeWidth="4" 
                      strokeDasharray={`${getPercentage(data.table_status.RESERVED)} 100`}
                      strokeDashoffset={`-${getPercentage(data.table_status.AVAILABLE + data.table_status.OCCUPIED)}`}
                    ></circle>
                    {/* MAINTENANCE */}
                    <circle 
                      cx="18" cy="18" r="16" fill="transparent" stroke="#F43F5E" strokeWidth="4" 
                      strokeDasharray={`${getPercentage(data.table_status.MAINTENANCE)} 100`}
                      strokeDashoffset={`-${getPercentage(data.table_status.AVAILABLE + data.table_status.OCCUPIED + data.table_status.RESERVED)}`}
                    ></circle>
                  </>
                )}
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                 <span className="text-4xl font-black text-gray-800 tracking-tighter leading-none">
                   {tableTotal}
                 </span>
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] mt-1">Tổng bàn</span>
              </div>
           </div>

           <div className="w-full space-y-4">
              <StatusBadge label="Bàn trống" count={data?.table_status.AVAILABLE || 0} color="bg-emerald-400" />
              <StatusBadge label="Đang phục vụ" count={data?.table_status.OCCUPIED || 0} color="bg-blue-400" />
              <StatusBadge label="Đã đặt trước" count={data?.table_status.RESERVED || 0} color="bg-amber-400" />
              <StatusBadge label="Bảo trì" count={data?.table_status.MAINTENANCE || 0} color="bg-rose-400" />
           </div>
        </div>
      </div>


      {/* Customer Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
             <h3 className="text-xl font-black text-gray-800 tracking-tight mb-6">Phân loại Khách</h3>
             <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Khách hàng mới</p>
                      <p className="text-2xl font-black text-emerald-700">{customerData?.new_customers || 0}</p>
                   </div>
                   <div className="p-2 bg-white rounded-xl text-emerald-500 shadow-sm">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
                   </div>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Khách quay lại</p>
                      <p className="text-2xl font-black text-indigo-700">{customerData?.returning_customers || 0}</p>
                   </div>
                   <div className="p-2 bg-white rounded-xl text-indigo-500 shadow-sm">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                   </div>
                </div>
             </div>
           </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-800 tracking-tight">Top Khách hàng tiêu biểu</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[3px] mt-1">Theo tổng điểm và chi tiêu</p>
              </div>
           </div>

           <div className="overflow-x-auto no-scrollbar">
             <table className="w-full">
               <thead>
                 <tr className="border-b border-gray-50 text-left">
                   <th className="pb-4 pl-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</th>
                   <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại</th>
                   <th className="pb-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Điểm tích lũy</th>
                   <th className="pb-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Số đơn hàng</th>
                   <th className="pb-4 text-right pr-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng chi tiêu</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50/50">
                 {customerData?.top_customers.map((customer) => (
                   <tr key={customer.id} className="group hover:bg-gray-50/50 transition-colors">
                     <td className="py-5 pl-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary text-xs border border-primary/10">
                              {customer.name.charAt(0)}
                           </div>
                           <span className="text-sm font-black text-gray-800 uppercase italic tracking-tight">{customer.name}</span>
                        </div>
                     </td>
                     <td className="py-5 text-sm font-bold text-gray-500 font-mono tracking-tighter">
                        {customer.phone}
                     </td>
                     <td className="py-5 text-center">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black border border-emerald-100">
                           {customer.points}
                        </span>
                     </td>
                     <td className="py-5 text-center text-sm font-black text-gray-400">
                        {customer.order_count}
                     </td>
                     <td className="py-5 text-right pr-4">
                        <span className="text-sm font-black text-primary">
                           {customer.total_spent ? `${parseInt(customer.total_spent).toLocaleString()} đ` : "0 đ"}
                        </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
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

