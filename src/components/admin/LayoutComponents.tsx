"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import authService from "@/services/auth.service";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const sidebarMenu = [
  {
    group: "Chính", items: [
      { label: "Dashboard", href: "/admin" },
      { label: "Thống kê sản phẩm", href: "/admin/statistics" },
      { label: "Hồ sơ cá nhân", href: "/admin/profile" },
    ]
  },
  {
    group: "Sản phẩm & Khách hàng", items: [
      { label: "Món ăn & Đồ uống", href: "/admin/products" },
      { label: "Danh mục", href: "/admin/categories" },
      { label: "Khách hàng", href: "/admin/customers" },
      { label: "Tài khoản", href: "/admin/accounts" },
    ]
  },
  {
    group: "Bán hàng", items: [
      { label: "Đơn hàng", href: "/admin/orders" },
      { label: "Quản lý bàn", href: "/admin/tables" },
      { label: "Hóa đơn", href: "/admin/invoices" },
    ]
  },
  {
    group: "Ưu đãi", items: [
      // { label: "Tích điểm", href: "/admin/loyalty" },
      { label: "Voucher", href: "/admin/vouchers" },
    ]
  },
];

export function Sidebar() {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    authService.getMe().then(res => {
      if (res.success) setUser(res.data.user);
    }).catch(() => {});
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-50">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Image src="/logo1.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
        </div>
        <div>
          <h1 className="text-xl font-black text-primary tracking-tighter">MỲ CAY SASIN</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Administrator</p>
        </div>
      </div>
      {/* User Info (as in image)
      <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-50 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 p-0.5 shadow-md">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            <Image src="/logo1.jpg" alt="Admin" width={40} height={40} className="scale-125" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800">{user?.username || "Admin SASIN"}</h4>
          <p className="text-[11px] text-green-500 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
          </p>
        </div>
      </div> */}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar pb-10">
        {sidebarMenu.map((group, idx) => (
          <div key={idx} className="mb-8">
            <h5 className="px-4 text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-4">
              {group.group}
            </h5>
            <ul className="space-y-1.5">
              {group.items.map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:text-primary hover:bg-red-50 transition-all group"
                  >
                    <span className="flex-1">{item.label}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer Logout
      <div className="p-4 border-t border-gray-50">
        <button 
          onClick={() => setIsLogoutDialogOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span className="flex-1 text-left uppercase tracking-widest text-[10px]">Đăng xuất</span>
        </button>
      </div> */}

      <ConfirmDialog 
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={() => authService.logout()}
        title="Xác nhận Đăng xuất"
        message="Hệ thống sẽ kết thúc phiên làm việc của bạn ngay lập tức. Bạn đã chắc chắn chưa?"
      />
    </aside>
  );
}

export function Topbar() {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    authService.getMe().then(res => {
      if (res.success) setUser(res.data.user);
    }).catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-white/70 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-6">
        <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

      </div>

      <div className="flex items-center gap-5">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-primary transition-all focus:outline-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
        
        <div className="h-10 w-px bg-gray-100 mx-1"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <h5 className="text-[13px] font-black text-gray-800 leading-none">{user?.username || "Vua Mỳ Cay"}</h5>
            <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{user?.role || "Super Admin"}</p>
          </div>
          <Link href="/admin/profile" className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border-2 border-white hover:border-primary transition-all group">
            <Image src="/logo1.jpg" alt="Profile" width={40} height={40} className="scale-125 group-hover:scale-150 transition-transform" />
          </Link>
          <button 
            onClick={() => setIsLogoutDialogOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all focus:outline-none ml-2"
            title="Đăng xuất"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={() => authService.logout()}
        title="Xác nhận Đăng xuất"
        message="Hệ thống sẽ kết thúc phiên làm việc của bạn ngay lập tức. Bạn đã chắc chắn chưa?"
      />
    </header>
  );
}
