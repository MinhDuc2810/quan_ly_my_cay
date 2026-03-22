"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import { Sidebar, Topbar } from "@/components/admin/LayoutComponents";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await authService.getMe();
        if (res.success && res.data.user.role === "ADMIN") {
          setLoading(false);
        } else {
          // Redirect based on role if not admin
          const role = res.data.user.role;
          if (role === "STAFF") router.push("/pos");
          else router.push("/");
        }
      } catch (error) {
        console.error("Admin check failed", error);
        router.push("/login");
      }
    };
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfaf2]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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