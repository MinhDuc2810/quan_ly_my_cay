import ProfileContent from "@/components/common/ProfileContent";

export default function AdminProfilePage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase italic">Cá nhân</h1>
        <p className="text-gray-400 font-bold uppercase tracking-[4px] text-[10px] mt-1">Thông tin quản trị viên hệ thống</p>
      </div>
      
      <ProfileContent />
    </div>
  );
}
