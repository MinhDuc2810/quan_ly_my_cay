"use client";

import React, { useState } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Instagram, 
  Facebook, 
  MessageSquare,
  ChevronRight
} from "lucide-react";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden bg-gray-900">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/2 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 opacity-30"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[5px] rounded-full border border-primary/30 mb-6 animate-in slide-in-from-top duration-700">
            Kết nối với SASIN
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl animate-in fade-in slide-in-from-bottom duration-1000">
            Liên hệ <span className="text-primary tracking-[-0.1em]">chúng tôi</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[2px] text-xs mt-6 max-w-2xl mx-auto leading-relaxed">
            Chúng tôi luôn lắng nghe ý kiến từ bạn. Hãy để lại thông tin hoặc ghé thăm các chi nhánh của Mỳ Cay SASIN để thưởng thức hương vị tuyệt vời nhất.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Contact Info Column */}
          <div className="lg:col-span-4 space-y-10 order-2 lg:order-1">
            <div className="space-y-8">
              <h3 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic flex items-center gap-3">
                <span className="w-10 h-1 pr-2 bg-primary rounded-full"></span> 
                Thông tin
              </h3>
              
              <div className="grid gap-6">
                {/* Contact Card 1 */}
                <div className="group p-6 rounded-[2rem] bg-gray-50 border border-gray-100 hover:bg-white hover:border-primary/20 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trụ sở chính</p>
                      <p className="text-sm font-black text-gray-800 uppercase italic leading-snug">Số 54 Triều Khúc, phường Thanh Liệt, Hà Nội</p>
                    </div>
                  </div>
                </div>

                {/* Contact Card 2 */}
                <div className="group p-6 rounded-[2rem] bg-gray-50 border border-gray-100 hover:bg-white hover:border-primary/20 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hotline Phản Hồi</p>
                      <p className="text-2xl font-black text-gray-800 italic">1900 0131</p>
                    </div>
                  </div>
                </div>

                {/* Contact Card 3 */}
                <div className="group p-6 rounded-[2rem] bg-gray-50 border border-gray-100 hover:bg-white hover:border-primary/20 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Hỗ Trợ</p>
                      <p className="text-sm font-black text-gray-800 uppercase italic">contact@sasin.com.vn</p>
                    </div>
                  </div>
                </div>

                {/* Contact Card 4 */}
                <div className="group p-6 rounded-[2rem] bg-gray-50 border border-gray-100 hover:bg-white hover:border-primary/20 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giờ Hoạt Động</p>
                      <p className="text-sm font-black text-gray-800 uppercase italic">08:00 AM - 10:00 PM</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">Làm việc tất cả các ngày trong tuần</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-10 space-y-6">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-1">Mạng xã hội</p>
               <div className="flex gap-4">
                  {[
                    { icon: <Facebook />, label: "Facebook" },
                    { icon: <Instagram />, label: "Instagram" },
                    { icon: <MessageSquare />, label: "Zalo" }
                  ].map((soc, i) => (
                    <button key={i} className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl">
                      {soc.icon}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="bg-white rounded-[3.5rem] p-8 md:p-14 shadow-2xl border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-700"></div>
              
              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-gray-800 tracking-tighter uppercase italic">Gửi phản hồi <span className="text-primary underline decoration-4 decoration-primary/20 underline-offset-8">cho chúng tôi</span></h3>
                  <p className="text-gray-400 text-sm font-bold max-w-lg italic">
                    Công thức thành công của chúng tôi là nụ cười của thực khách. Hãy chia sẻ trải nghiệm của bạn nhé!
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Họ và tên</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Nhập tên của bạn..."
                        className="w-full bg-gray-50 border border-gray-100 px-8 py-5 rounded-[2rem] font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Số điện thoại</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="Nhập số điện thoại..."
                        className="w-full bg-gray-50 border border-gray-100 px-8 py-5 rounded-[2rem] font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Chủ đề cần hỗ trợ</label>
                    <input 
                      type="text" 
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Góp ý món ăn, Dịch vụ, Đặt bàn..."
                      className="w-full bg-gray-50 border border-gray-100 px-8 py-5 rounded-[2rem] font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Lời nhắn</label>
                    <textarea 
                      rows={6}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Lời nhắn của bạn..."
                      className="w-full bg-gray-50 border border-gray-100 px-8 py-6 rounded-[2rem] font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[5px] flex items-center justify-center gap-4 hover:bg-primary shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Gửi ngay cho chúng tôi
                        <Send size={18} />
                      </>
                    )}
                  </button>

                  {success && (
                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-4 text-emerald-600 animate-in fade-in slide-in-from-top-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <p className="text-sm font-black uppercase tracking-wider">Cảm ơn bạn! Thông tin đã được gửi đi thành công.</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
