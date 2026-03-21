"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage(null);

    try {
      const res = await authService.forgotPassword(forgotEmail);
      if (res.success) {
        setForgotMessage({ type: "success", text: res.message || "Liên kết khôi phục đã được gửi vào Email của bạn!" });
        setTimeout(() => {
          setIsForgotModalOpen(false);
          setForgotEmail("");
          setForgotMessage(null);
        }, 3000);
      } else {
        setForgotMessage({ type: "error", text: res.message || "Không thể gửi email khôi phục." });
      }
    } catch (err: any) {
      setForgotMessage({ type: "error", text: err.response?.data?.message || "Lỗi kết nối Server!" });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loginRes = await authService.login(formData);
      
      if (loginRes.success) {
        const userRes = await authService.getMe();
        const user = userRes.data.user;
        
        // Kiểm tra trạng thái tài khoản (Status 1: Active, 0: Locked/Inactive)
        if (user.status !== 1) {
          localStorage.removeItem("token"); // Xóa token vừa lưu để ngăn truy cập trái phép
          setError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!");
          setLoading(false);
          return;
        }

        const role = user.role;
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "STAFF") {
          router.push("/pos");
        } else {
          router.push("/customer");
        }
      } else {
        setError(loginRes.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf2] flex flex-col md:flex-row font-sans">
      <div className="hidden md:flex md:w-1/2 bg-gray-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-gray-900 to-gray-900"></div>
        <div className="z-10 flex flex-col items-center text-center">
          <div className="bg-white/5 p-8 rounded-full backdrop-blur-sm border border-white/10 shadow-2xl mb-8 translate-y-[-10px] animate-in zoom-in-50 duration-500">
            <Image src="/logo1.jpg" alt="Logo" width={200} height={200} className="object-contain drop-shadow-xl rounded-full" priority />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 italic tracking-tighter">Mỳ Cay <span className="text-primary uppercase tracking-normal">SASIN</span></h1>
          <p className="text-gray-400 text-lg max-w-md font-medium">Hệ thống quản trị nhà hàng chuyên nghiệp, hiện đại và tối ưu toàn diện.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-10 duration-700">
          <div className="text-center md:hidden mb-10">
            <div className="inline-block p-4 bg-gray-900 rounded-full backdrop-blur-sm shadow-lg mb-4">
              <Image src="/logo1.jpg" alt="Logo" width={80} height={80} className="object-contain rounded-full" />
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Đăng nhập</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">Quản lý hệ thống Mỳ Cay của bạn</p>
          </div>

          <div className="hidden md:block mb-10">
            <h2 className="text-5xl font-black text-gray-800 tracking-tighter uppercase italic">Đăng nhập</h2>
            <p className="mt-3 text-gray-400 font-bold uppercase tracking-widest text-[11px]">Chào mừng trở lại!</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-700 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Tên đăng nhập / Số điện thoại</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-primary transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input name="username" type="text" required value={formData.username} onChange={handleChange} className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-gray-800 font-bold placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm" placeholder="User123..." />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Mật khẩu truy cập</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-primary transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input name="password" type="password" required value={formData.password} onChange={handleChange} className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-gray-800 font-bold placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary border-gray-200 rounded-lg cursor-pointer accent-primary" />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer">Ghi nhớ tôi</label>
              </div>
              <button 
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs font-black text-primary uppercase tracking-widest hover:text-rose-700 transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-14 flex items-center justify-center border border-transparent text-sm font-black rounded-2xl text-white bg-primary shadow-xl shadow-primary/20 hover:bg-rose-700 focus:outline-none transition-all disabled:opacity-70 disabled:grayscale uppercase tracking-[2px] active:scale-95"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : "Xác nhận Đăng nhập"}
            </button>
            
            <div className="mt-10 border-t border-gray-100 pt-8 flex items-center justify-center bg-transparent">
              <p className="text-xs font-bold text-gray-400">
                Bạn chưa có tài khoản?{" "}
                <Link href="/register" className="text-primary font-black uppercase tracking-widest hover:text-rose-700 transition-colors ml-1">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300 px-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="bg-primary px-10 py-10 flex flex-col items-center text-white text-center relative overflow-hidden group">
               <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
               <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center mb-6 backdrop-blur-lg border border-white/30 rotate-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
               </div>
               <h3 className="text-2xl font-black uppercase tracking-widest italic">Quên mật khẩu?</h3>
               <p className="text-white/70 text-xs font-bold uppercase tracking-[3px] mt-2">Đừng lo, chúng tôi sẽ hỗ trợ bạn!</p>

               <button 
                onClick={() => setIsForgotModalOpen(false)} 
                className="absolute top-6 right-6 text-white/50 hover:text-white hover:rotate-90 transition-all active:scale-90"
               >
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>
            </div>

            <form onSubmit={handleForgotSubmit} className="p-10 space-y-6">
              <div className="space-y-4">
                 <p className="text-gray-400 text-sm font-medium text-center leading-relaxed">Vui lòng nhập <span className="text-gray-800 font-black italic">Số điện thoại</span> đã đăng ký. Chúng tôi sẽ hỗ trợ bạn khôi phục lại mật khẩu.</p>
                 
                 {forgotMessage && (
                   <div className={`p-4 rounded-2xl border-2 text-xs font-bold animate-in zoom-in-95 duration-300 ${forgotMessage.type === "success" ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"}`}>
                      {forgotMessage.text}
                   </div>
                 )}

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Số điện thoại</label>
                    <input 
                      type="tel" 
                      required 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm" 
                      placeholder="0912 xxx xxx" 
                    />
                 </div>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button 
                  type="submit" 
                  disabled={forgotLoading}
                  className="w-full bg-primary hover:bg-rose-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[3px] shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale"
                >
                  {forgotLoading ? (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <>
                      Gửi xác nhận
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  disabled={forgotLoading}
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-800 transition-colors"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}