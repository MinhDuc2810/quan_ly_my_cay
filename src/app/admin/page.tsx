import React from "react";
import Image from "next/image";

const stats = [
  { 
    title: "Doanh thu tuần", 
    value: "15,000.000 đ", 
    change: "Tăng 60%", 
    color: "from-red-400 to-rose-600",
  },
  { 
    title: "Đơn hàng tuần", 
    value: "45,633 Đơn", 
    change: "Giảm 10%", 
    color: "from-blue-400 to-indigo-600",
  },
  { 
    title: "Khách trực tuyến", 
    value: "95,741", 
    change: "Tăng 5%", 
    color: "from-emerald-400 to-teal-600",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      {/* Header Info */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2.5 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Dashboard</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`relative overflow-hidden rounded-3xl p-8 text-white bg-gradient-to-br ${stat.color} shadow-2xl shadow-gray-200 transition-transform hover:scale-[1.02] cursor-pointer group`}
          >
            {/* Decors as in image */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>

            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-bold opacity-90">{stat.title}</h3>
              <p className="text-4xl font-black tracking-tight">{stat.value}</p>
              <div className="pt-4 flex items-center gap-2">
                <span className="text-sm font-black bg-white/20 px-3 py-1 rounded-full">{stat.change}</span>
                <span className="text-[11px] font-bold opacity-60 uppercase tracking-widest">So với tuần trước</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section (Mocked) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-50 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-gray-800 tracking-tight">Thống kê Truy cập & Doanh số</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">VN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">KR</span>
              </div>
            </div>
          </div>
          
          {/* Mock Bar Chart using CSS Grid */}
          <div className="h-80 flex items-end justify-between gap-4 px-4">
            {[45, 65, 35, 75, 55, 90, 60, 85].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full flex gap-1 justify-center items-end h-full">
                  <div className={`w-3 rounded-t-full bg-red-500 opacity-60 transition-all hover:opacity-100`} style={{ height: `${val}%` }}></div>
                  <div className={`w-3 rounded-t-full bg-blue-500 opacity-60 transition-all hover:opacity-100`} style={{ height: `${val - 15}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase">{['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-50 shadow-sm flex flex-col items-center">
          <h3 className="text-xl font-black text-gray-800 tracking-tight mb-12 self-start">Nguồn Truy cập</h3>
          
          <div className="relative w-56 h-56 flex items-center justify-center mb-10">
            {/* SVG Donut */}
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle>
              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#F87171" strokeWidth="4" strokeDasharray="40 100"></circle>
              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#60A5FA" strokeWidth="4" strokeDasharray="30 100" strokeDashoffset="-40"></circle>
              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#2DD4BF" strokeWidth="4" strokeDasharray="30 100" strokeDashoffset="-70"></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
               <span className="text-3xl font-black text-gray-800">100%</span>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Traffic</span>
            </div>
          </div>

          <div className="w-full space-y-4">
            <TrafficItem label="Máy tìm kiếm" percent="40%" color="bg-red-400" />
            <TrafficItem label="Trực tiếp" percent="30%" color="bg-blue-400" />
            <TrafficItem label="Mạng xã hội" percent="30%" color="bg-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TrafficItem({ label, percent, color }: { label: string, percent: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${color}`}></span>
        <span className="text-[13px] font-bold text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-black text-gray-400">{percent}</span>
    </div>
  );
}

// Icons
const SalesIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const OrdersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const UsersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M5 12h14"></path><path d="m18 15-6-6-6 6"></path></svg>;
