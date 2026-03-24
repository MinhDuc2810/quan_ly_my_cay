import ProfileContent from "@/components/common/ProfileContent";
import Link from "next/link";

export default function StaffProfilePage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 py-8">
      <div className="max-w-6xl mx-auto mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase italic">Cá nhân</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[4px] text-[10px] mt-1">Thông tin nhân viên vận hành hệ thống</p>
        </div>
        <Link 
          href="/pos" 
          className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Quay lại POS
        </Link>
      </div>

      <ProfileContent />
    </div>
  );
}
