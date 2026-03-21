"use client";

import { useEffect, useState } from "react";
import authService, { User } from "@/services/auth.service";
import Image from "next/image";

type TabType = "PROFILE" | "VOUCHERS" | "BOOKINGS" | "POINTS";

export default function ProfileContent() {
  const [activeTab, setActiveTab] = useState<TabType>("PROFILE");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for Change Password
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // States for Update Profile
  const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Mock Data for User Management
  const vouchers = [
    { id: 1, code: "SASIN50K", discount: "50,000đ", expiry: "2026-04-15", status: "UNUSED", min_bill: "200,000đ" },
    { id: 2, code: "MYCAYLEVEL7", discount: "20,000đ", expiry: "2026-03-30", status: "UNUSED", min_bill: "100,000đ" },
    { id: 3, code: "WELCOMENEW", discount: "10%", expiry: "2026-01-01", status: "EXPIRED", min_bill: "0đ" },
  ];

  const bookings = [
    { id: 101, date: "2026-03-25", time: "18:30", guests: 4, table: "Bàn 08", status: "CONFIRMED" },
    { id: 102, date: "2026-03-10", time: "12:00", guests: 2, table: "Bàn 02", status: "COMPLETED" },
    { id: 103, date: "2026-02-14", time: "19:00", guests: 2, table: "Bàn 15", status: "CANCELLED" },
  ];

  const pointsHistory = [
    { id: 1, date: "2026-03-10", type: "EARNED", points: 45, desc: "Thanh toán hóa đơn #HD2034" },
    { id: 2, date: "2026-03-05", type: "SPENT", points: -100, desc: "Đổi Voucher Giảm 50K" },
    { id: 3, date: "2026-02-28", type: "EARNED", points: 55, desc: "Thanh toán hóa đơn #HD1982" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getMe();
        if (response.success) {
          setUser(response.data.user);
          setProfile(response.data.profile);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const openUpdateModal = () => {
    if (profile) {
      setUpdateData({
        name: profile.name || "",
        phone: profile.phone || "",
        email: profile.email || "",
      });
    }
    setIsUpdateProfileOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateMessage(null);
    
    setTimeout(() => {
      setUpdateMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
      setProfile((prev: any) => ({ ...prev, ...updateData }));
      setUpdateLoading(false);
      setTimeout(() => {
        setIsUpdateProfileOpen(false);
        setUpdateMessage(null);
      }, 1500);
    }, 1000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMessage({ type: "error", text: "Mật khẩu mới không khớp!" });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      const res = await authService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      if (res.success) {
        setPasswordMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
        setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
        setTimeout(() => {
          setIsChangePasswordOpen(false);
          setPasswordMessage(null);
        }, 2000);
      } else {
        setPasswordMessage({ type: "error", text: res.message || "Đổi mật khẩu thất bại" });
      }
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.response?.data?.message || "Lỗi hệ thống khi đổi mật khẩu" });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const isCustomer = user.role === "CUSTOMER";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[3.5rem] bg-gray-900 border border-white/5 p-10 sm:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-12">
          <div className="relative">
            <div className="w-32 h-32 sm:w-44 sm:h-44 bg-gradient-to-tr from-primary to-rose-400 rounded-[2.5rem] p-1 shadow-2xl rotate-3">
              <div className="w-full h-full bg-gray-900 rounded-[2.3rem] flex items-center justify-center overflow-hidden border-2 border-white/10">
                <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 italic">
                  {(profile?.name || user.username).charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="space-y-2">
              <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[3px] rounded-full border border-primary/20">
                {user.role === "ADMIN" ? "Quản trị viên" : user.role === "STAFF" ? "Nhân viên phục vụ" : "Khách hàng thân thiết"}
              </span>
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">{profile?.name || user.username}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> ID: {user.id}
                 </p>
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Tham gia: {new Date(user.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            {isCustomer && (
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] backdrop-blur-md">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 block">Điểm SASIN</span>
                  <div className="flex items-baseline gap-2">
                      <span className="text-primary font-black text-3xl italic tracking-tighter">{profile?.points || 0}</span>
                      <span className="text-gray-500 font-bold text-xs">Pts</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] backdrop-blur-md">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 block">Voucher Khả dụng</span>
                  <div className="flex items-baseline gap-2">
                      <span className="text-white font-black text-3xl italic tracking-tighter">{vouchers.filter(v => v.status === 'UNUSED').length}</span>
                      <span className="text-gray-500 font-bold text-xs">Mã</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Only for customers */}
      {isCustomer && (
        <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-gray-100/50 rounded-[2rem] border border-gray-100">
          {[
            { id: "PROFILE", label: "Hồ sơ cá nhân", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
            { id: "VOUCHERS", label: "Ưu đãi của tôi", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-1.761 1.761a2 2 0 0 0 0 2.828l.828.828a2 2 0 0 1 0 2.828l-1.828 1.828a2 2 0 0 1-2.828 0l-.828-.828a2 2 0 0 0-2.828 0L4 16"></path><path d="m13 22-3-3"></path><path d="m9 18-3-3"></path></svg> },
            { id: "BOOKINGS", label: "Lịch sử đặt bàn", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
            { id: "POINTS", label: "Lịch sử tích điểm", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 min-w-[160px] flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-primary shadow-lg shadow-gray-200 ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className={!isCustomer ? "" : "min-h-[500px]"}>
        {activeTab === "PROFILE" && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-6 duration-700">
             <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 flex flex-col space-y-8">
               <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">Thông tin cơ bản</h3>
               </div>
               <div className="space-y-6 flex-1">
                 <div className="space-y-1">
                   <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Số điện thoại</span>
                   <p className="px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 text-gray-800 font-bold text-lg">{profile?.phone || "Chưa cập nhật"}</p>
                 </div>
                 <div className="space-y-1">
                   <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Email</span>
                   <p className="px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 text-gray-800 font-bold text-lg">{profile?.email || "Chưa cập nhật"}</p>
                 </div>
                 <div className="space-y-1">
                   <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Tên hiển thị</span>
                   <p className="px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 text-gray-800 font-bold text-lg uppercase italic">{profile?.name || user.username}</p>
                 </div>
               </div>
               <button onClick={openUpdateModal} className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-[3px] hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200">Cập nhật thông tin</button>
             </div>

             <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 flex flex-col space-y-8">
               <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">Bảo mật tài khoản</h3>
               </div>
               <div className="flex-1 space-y-4">
                  <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 space-y-3">
                     <h4 className="font-extrabold text-amber-800 uppercase text-xs tracking-widest italic">Thay đổi mật khẩu</h4>
                     <p className="text-amber-700/60 text-[11px] font-bold leading-relaxed">Cập nhật mật khẩu định kỳ giúp bảo vệ tài khoản SASIN của bạn tốt hơn.</p>
                     <button onClick={() => setIsChangePasswordOpen(true)} className="mt-4 bg-white px-6 py-3 rounded-xl text-primary font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all">Bắt đầu thiết lập</button>
                  </div>
               </div>
             </div>
           </div>
        )}

        {isCustomer && activeTab === "VOUCHERS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-6 duration-700">
             {vouchers.map(v => (
               <div key={v.id} className={`bg-white rounded-[2.5rem] border-2 border-dashed p-8 relative overflow-hidden group ${v.status === 'EXPIRED' ? 'opacity-50 grayscale' : 'border-primary/20 hover:border-primary/40'}`}>
                  {v.status === 'EXPIRED' && <div className="absolute top-4 right-4 bg-gray-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase italic">Hết hạn</div>}
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-1.761 1.761a2 2 0 0 0 0 2.828l.828.828a2 2 0 0 1 0 2.828l-1.828 1.828a2 2 0 0 1-2.828 0l-.828-.828a2 2 0 0 0-2.828 0L4 16"></path></svg>
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-gray-800 tracking-tight italic">Giảm {v.discount}</h4>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Đơn từ {v.min_bill}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                       <span className="font-mono font-black text-lg tracking-widest text-primary">{v.code}</span>
                       <button disabled={v.status !== 'UNUSED'} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50">Sao chép</button>
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 mt-2 italic">Hết hạn: {new Date(v.expiry).toLocaleDateString('vi-VN')}</p>
                  </div>
               </div>
             ))}
          </div>
        )}

        {isCustomer && activeTab === "BOOKINGS" && (
           <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6 duration-700">
              <table className="w-full">
                 <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                       <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông tin bàn</th>
                       <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                       <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Số người</th>
                       <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {bookings.map(b => (
                       <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6 font-black text-gray-800 uppercase italic">ID #{b.id} - {b.table}</td>
                          <td className="px-8 py-6">
                             <p className="font-bold text-gray-800">{new Date(b.date).toLocaleDateString('vi-VN')}</p>
                             <p className="text-xs text-gray-400 font-medium">{b.time}</p>
                          </td>
                          <td className="px-8 py-6 font-bold text-gray-800">{b.guests} Thành viên</td>
                          <td className="px-8 py-6">
                             <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                               b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 
                               b.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                             }`}>
                               {b.status === 'CONFIRMED' ? 'Đã xác nhận' : b.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button className="text-gray-300 hover:text-primary transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {isCustomer && activeTab === "POINTS" && (
           <div className="max-w-3xl mx-auto space-y-4 animate-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center justify-between mb-6 px-4">
                 <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">Lịch sử giao dịch điểm</h3>
                 <span className="text-[10px] font-black text-primary uppercase tracking-[2px]">Cập nhật: {new Date().toLocaleDateString('vi-VN')}</span>
              </div>
              {pointsHistory.map(p => (
                 <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-5">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${p.type === 'EARNED' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                          {p.type === 'EARNED' ? '+' : '-'}
                       </div>
                       <div>
                          <p className="font-extrabold text-gray-800 tracking-tight">{p.desc}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(p.date).toLocaleDateString('vi-VN')}</p>
                       </div>
                    </div>
                    <div className={`text-xl font-black italic ${p.type === 'EARNED' ? 'text-emerald-500' : 'text-rose-500'}`}>
                       {p.points} Pts
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>

      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-md border border-white/20">
            <div className="bg-primary px-10 py-10 flex flex-col items-center text-white text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' }}>
               <h3 className="text-2xl font-black uppercase tracking-widest italic">Thiết lập lại mật khẩu</h3>
               <button onClick={() => { setIsChangePasswordOpen(false); setPasswordMessage(null); }} className="absolute top-6 right-6 text-white/50 hover:text-white transition-all"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <form onSubmit={handleChangePassword} className="p-10 space-y-6">
              {passwordMessage && <div className={`p-4 rounded-2xl text-xs font-bold ${passwordMessage.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{passwordMessage.text}</div>}
              <div className="space-y-4">
                <input type="password" required value={passwordData.old_password} onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-800 outline-none" placeholder="Mật khẩu cũ" />
                <input type="password" required value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-800 outline-none" placeholder="Mật khẩu mới" />
                <input type="password" required value={passwordData.confirm_password} onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-800 outline-none" placeholder="Xác nhận mật khẩu mới" />
              </div>
              <button type="submit" disabled={passwordLoading} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[3px] shadow-xl shadow-primary/20 active:scale-95 transition-all">
                {passwordLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isUpdateProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-md border border-white/20">
            <div className="bg-primary px-10 py-10 flex flex-col items-center text-white text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' }}>
               <h3 className="text-2xl font-black uppercase tracking-widest italic">Cập nhật hồ sơ</h3>
               <button onClick={() => { setIsUpdateProfileOpen(false); setUpdateData({ name: "", phone: "", email: "" }); setUpdateMessage(null); }} className="absolute top-6 right-6 text-white/50 hover:text-white transition-all"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-10 space-y-4">
              {updateMessage && <div className={`p-4 rounded-2xl text-xs font-bold ${updateMessage.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{updateMessage.text}</div>}
              <div className="space-y-5">
                 <div className="space-y-1">
                   <span className="text-[10px] text-gray-400 font-black uppercase ml-2 tracking-widest">Họ và tên</span>
                   <input type="text" required value={updateData.name} onChange={(e) => setUpdateData({...updateData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-7 py-4 rounded-2xl font-bold text-gray-800 outline-none" placeholder="Tên đầy đủ" />
                 </div>
                 <div className="space-y-1">
                   <span className="text-[10px] text-gray-400 font-black uppercase ml-2 tracking-widest">Số điện thoại</span>
                   <input type="tel" required value={updateData.phone} onChange={(e) => setUpdateData({...updateData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-7 py-4 rounded-2xl font-bold text-gray-800 outline-none" placeholder="SĐT" />
                 </div>
                 <div className="space-y-1">
                   <span className="text-[10px] text-gray-400 font-black uppercase ml-2 tracking-widest">Email</span>
                   <input type="email" required value={updateData.email} onChange={(e) => setUpdateData({...updateData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-7 py-4 rounded-2xl font-bold text-gray-800 outline-none" placeholder="Email" />
                 </div>
              </div>
              <button type="submit" disabled={updateLoading} className="w-full mt-4 bg-primary text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-[3px] shadow-xl shadow-primary/20 active:scale-95 transition-all">
                {updateLoading ? "Đang xử lý..." : "Lưu hồ sơ mới"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
