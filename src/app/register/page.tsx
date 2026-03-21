"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const res = await authService.register(formData);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(res.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
        if (err.response?.data?.errors) {
            setError(Object.values(err.response.data.errors).flat().join("\n"));
        } else {
            setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng kiểm tra lại thông tin");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf2] flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-gray-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-gray-900 to-gray-900"></div>
        <div className="z-10 flex flex-col items-center text-center scale-90">
          <div className="bg-white/5 p-8 rounded-full backdrop-blur-sm border border-white/10 shadow-2xl mb-8">
            <Image src="/logo1.jpg" alt="Logo" width={220} height={220} className="object-contain drop-shadow-xl rounded-full rotate-2" priority />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 italic tracking-tighter">Gia nhập <span className="text-primary uppercase tracking-normal">SASIN</span></h1>
          <p className="text-gray-400 text-lg max-w-md font-medium uppercase tracking-widest text-xs">Mỳ Cay 7 Cấp Độ - Trải nghiệm ẩm thực đích thực!</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-20 relative bg-white/50 backdrop-blur-3xl">
        <div className="w-full max-w-lg space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-black text-gray-800 tracking-tighter uppercase italic">Đăng ký</h2>
            <p className="mt-3 text-gray-400 font-bold uppercase tracking-[4px] text-[10px]">Tạo tài khoản khách hàng mới</p>
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
            {isSuccess && (
              <div className="bg-green-50 border-2 border-green-100 p-6 rounded-3xl text-green-600 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-200">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h4 className="font-black uppercase tracking-widest text-sm mb-1">Đăng ký thành công!</h4>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-100 p-5 rounded-3xl text-red-600 text-sm font-bold animate-in shake duration-300">
                <span className="uppercase text-[10px] block mb-1 opacity-60 tracking-widest font-black">Phát hiện lỗi</span>
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Họ và tên</label>
                    <input name="name" type="text" required value={formData.name} onChange={handleChange} className="block w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" placeholder="Nguyễn Văn A" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Số điện thoại</label>
                    <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="block w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" placeholder="0987xxx" />
                 </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Địa chỉ Email</label>
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="block w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" placeholder="customer@email.com" />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Thiết lập mật khẩu</label>
                <input name="password" type="password" required value={formData.password} onChange={handleChange} className="block w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" placeholder="••••••••" />
                <p className="text-[10px] text-gray-300 font-bold italic mt-2 ml-1">Mật khẩu cần có chữ cái, số và tối thiểu 8 ký tự.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-16 flex items-center justify-center border border-transparent text-sm font-black rounded-3xl text-white bg-gray-900 shadow-xl shadow-gray-200 hover:bg-black focus:outline-none transition-all disabled:opacity-70 disabled:grayscale uppercase tracking-[3px]"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : "Xác nhận tạo tài khoản"}
              </button>
            </div>
            
            <div className="mt-8 border-t border-gray-50 pt-8 text-center flex items-center justify-center gap-2">
              <p className="text-xs font-bold text-gray-400">Bạn đã là thành viên?</p>
              <Link href="/login" className="text-primary font-black uppercase tracking-widest text-xs hover:text-rose-700 transition-colors">
                 Đăng nhập ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
