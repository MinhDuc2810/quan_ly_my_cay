"use client";

import { PublicHeader, PublicFooter } from "@/components/layout";
import { useState, useEffect } from "react";
import Image from "next/image";
import bookingService from "@/services/booking.service";
import { useRouter } from "next/navigation";
import { Calendar, Users, Clock, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";

export default function CustomerBookingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    booking_date: "",
    booking_time: "",
    number_of_guests: 2,
    table_id: null as number | null,
    note: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [minDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "number_of_guests" ? parseInt(value) || 1 : 
              name === "table_id" ? (value === "" ? null : parseInt(value)) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const res = await bookingService.createBooking(formData);
      if (res.success) {
        setSubmitStatus({
          type: "success",
          message: "Đặt bàn thành công! Chúng tôi sẽ sớm liên hệ xác nhận."
        });
        setTimeout(() => router.push("/customer/profile"), 3000);
      } else {
        setSubmitStatus({
          type: "error",
          message: res.message || "Đặt bàn thất bại, vui lòng kiểm tra lại thông tin."
        });
      }
    } catch (err: any) {
      setSubmitStatus({
        type: "error",
        message: err.response?.data?.message || "Lỗi kết nối Server!"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans selection:bg-primary selection:text-white">
      <PublicHeader />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section / Page Header */}
          <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary font-black text-[10px] uppercase tracking-[3px]">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span> 
              Thanh xuân này đừng để lỡ nhau
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase italic drop-shadow-sm">
              Đặt bàn trực tuyến
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-[4px] text-xs md:text-sm max-w-2xl mx-auto leading-loose">
               Chọn vị trí yêu thích của bạn — thưởng thức món mì cay chuẩn vị SASIN trong không gian hiện đại và riêng tư.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Visuals/Info */}
            <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
               <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl border-2 border-gray-100/50 group">
                  <Image 
                    src="/space_1.png" 
                    alt="Space SASIN" 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-10 left-10 text-white space-y-2">
                    <p className="text-white/70 font-bold uppercase tracking-widest text-xs">Mỳ Cay 7 Cấp Độ SASIN</p>
                  </div>
               </div>
            </div>

            {/* Right Column: The Form */}
            <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-6 duration-1000">
              <div className="bg-white rounded-[3.5rem] p-8 md:p-14 shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-10">
                
                {submitStatus.type === "success" ? (
                  <div className="py-20 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                      <CheckCircle2 size={48} strokeWidth={3} />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Đặt bàn thành công!</h3>
                       <p className="text-gray-400 font-bold text-sm leading-relaxed">{submitStatus.message}</p>
                    </div>
                    <button 
                      onClick={() => router.push("/customer/profile")}
                      className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[3px] hover:bg-black transition-all"
                    >
                      Quay lại hồ sơ
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {submitStatus.type === "error" && (
                      <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex gap-4 items-center animate-in shake duration-500">
                         <div className="text-rose-500 shrink-0"><AlertCircle size={24} /></div>
                         <p className="text-sm font-bold text-rose-500">{submitStatus.message}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {/* Date Select */}
                       <div className="space-y-3">
                          <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                             <Calendar size={14} className="text-primary" /> Ngày đặt bàn
                          </label>
                          <input 
                            type="date" 
                            name="booking_date"
                            min={minDate}
                            required
                            value={formData.booking_date}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50/50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-800 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" 
                          />
                       </div>

                       {/* Time Select */}
                       <div className="space-y-3">
                          <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                             <Clock size={14} className="text-primary" /> Giờ đón khách
                          </label>
                          <select 
                            name="booking_time"
                            required
                            value={formData.booking_time}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50/50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-800 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm appearance-none"
                          >
                             <option value="">Chọn khung giờ...</option>
                             {Array.from({ length: 14 }).map((_, i) => {
                               const hour = 10 + i;
                               return (
                                 <optgroup key={hour} label={`${hour}:00`}>
                                   <option value={`${hour}:00`}>{hour}:00</option>
                                   <option value={`${hour}:30`}>{hour}:30</option>
                                 </optgroup>
                               );
                             })}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          <Users size={14} className="text-primary" /> Số lượng người
                       </label>
                       <input 
                         type="number" 
                         name="number_of_guests"
                         required
                         min="1"
                         max="50"
                         value={formData.number_of_guests}
                         onChange={handleInputChange}
                         className="w-full bg-gray-50/50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-800 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm" 
                         placeholder="Ví dụ: 2"
                       />
                    </div>

                    <div className="space-y-3">
                       <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          <MessageSquare size={14} className="text-primary" /> Yêu cầu đặc biệt (Ghi chú)
                       </label>
                       <textarea 
                          name="note"
                          value={formData.note}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50/50 border border-gray-100 px-6 py-4 rounded-3xl font-bold text-gray-800 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm min-h-[120px] resize-none"
                          placeholder="Nhà hàng có tổ chức sinh nhật hoặc yêu cầu ghế trẻ em không? Hãy ghi chú lại đây nhé..."
                       />
                    </div>

                    <div className="pt-6">
                       <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-rose-700 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[4px] shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:grayscale flex items-center justify-center gap-3 group"
                       >
                         {isSubmitting ? (
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                         ) : (
                            <>
                              Xác nhận gửi thông tin
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-2 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </>
                         )}
                       </button>
                       <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                          * Nhân viên nhà hàng sẽ gọi điện xác nhận trong vòng 15-30 phút.
                       </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}