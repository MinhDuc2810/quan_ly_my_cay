"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import authService, { User } from "@/services/auth.service";

export default function PublicHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authService.getMe();
          if (response.success) {
            setUser(response.data.user);
            setProfile(response.data.profile);
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    setIsLogoutDialogOpen(false);
    authService.logout();
    setUser(null);
    setProfile(null);
  };

  const getHomePath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "ADMIN": return "/admin";
      case "STAFF": return "/pos";
      case "CUSTOMER": return "/customer";
      default: return "/";
    }
  };

  return (
    <>
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-border fixed top-0 z-50 transition-all duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href={getHomePath()} className="flex items-center gap-2 group">
                <div className="p-1.5 bg-sidebar rounded-full group-hover:bg-primary transition-colors">
                  <Image 
                    src="/logo1.jpg" 
                    alt="Logo" 
                    width={32} 
                    height={32} 
                    className="object-contain rounded-full"
                  />
                </div>
              </Link>
            </div>
            {/* Menu */}
            <div className="hidden lg:flex lg:items-center lg:space-x-3 xl:space-x-5 whitespace-nowrap">
              <Link href={getHomePath()} className="bg-primary hover:bg-red-700 text-white px-3 py-1.5 xl:px-4 xl:py-2 rounded-md text-[13px] xl:text-[15px] font-extrabold uppercase transition-colors shadow-sm whitespace-nowrap">
                Trang Chủ
              </Link>
              
              <div className="group relative flex items-center cursor-pointer">
                <Link href="/gioi-thieu" className="text-text-main hover:text-primary px-2 py-2 text-[13px] xl:text-[15px] font-bold uppercase transition-colors flex items-center gap-1 whitespace-nowrap">
                  Giới thiệu
                </Link>
              </div>
              
              <div className="group relative flex items-center cursor-pointer">
                <Link href="/thuc-don" className="text-text-main hover:text-primary px-2 py-2 text-[13px] xl:text-[15px] font-bold uppercase transition-colors flex items-center gap-1 whitespace-nowrap">
                  Thực đơn
                  <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                </Link>
              </div>

              <Link href="/tuyen-dung" className="text-text-main hover:text-primary px-2 py-2 text-[13px] xl:text-[15px] font-bold uppercase transition-colors whitespace-nowrap">
                Tuyển dụng
              </Link>

              <Link href="/nhuong-quyen" className="text-text-main hover:text-primary px-2 py-2 text-[13px] xl:text-[15px] font-bold uppercase transition-colors whitespace-nowrap">
                Nhượng quyền
              </Link>

              <div className="group relative flex items-center cursor-pointer">
                <Link href="/tin-vui" className="text-text-main hover:text-primary px-2 py-2 text-[13px] xl:text-[15px] font-bold uppercase transition-colors flex items-center gap-1 whitespace-nowrap">
                  Tin vui
                  <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                </Link>
              </div>

              <Link href="/lien-he" className="text-text-main hover:text-primary px-2 py-2 text-[13px] xl:text-[15px] font-bold uppercase transition-colors whitespace-nowrap">
                Liên hệ
              </Link>
            </div>
            {/* Nút hành động */}
            <div className="flex items-center space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-3">
                      <Link href="/customer/profile" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                          {(profile?.name || user.username).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-text-main font-semibold text-sm hidden md:block">
                          {profile?.name || user.username}
                        </span>
                      </Link>
                      <button 
                        onClick={() => setIsLogoutDialogOpen(true)}
                        className="text-text-muted hover:text-primary transition-colors text-xs font-bold uppercase"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  ) : (
                    <Link 
                      href="/login" 
                      className="text-text-main font-semibold text-sm hover:text-primary transition-colors hidden sm:block"
                    >
                      Đăng nhập
                    </Link>
                  )}
                </>
              )}
              <Link 
                href="/customer/booking" 
                className="bg-primary hover:bg-secondary text-white px-5 py-2 rounded-full text-sm font-bold shadow-md shadow-primary/30 transition-all transform hover:-translate-y-0.5"
              >
                Đặt bàn ngay
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Dialog - Moved outside of nav */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 flex flex-col">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </div>
              <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter mb-2">Đăng xuất?</h3>
              <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">Bạn có chắc chắn muốn thoát khỏi hệ thống không?</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsLogoutDialogOpen(false)}
                  className="flex-1 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
