import React from "react";
import { Sidebar, Topbar } from "@/components/admin/LayoutComponents";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fcfaf2]">
      {/* Texture nền vân giấy mịn để đồng bộ với theme chung */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] z-[-1]"></div>
      
      <Sidebar />
      
      <div className="ml-64 flex flex-col min-h-screen">
        <Topbar />
        
        <main className="p-8 pt-28 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}