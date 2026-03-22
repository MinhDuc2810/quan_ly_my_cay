"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import authService from "@/services/auth.service";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await authService.getMe();
        if (res.success) {
          const role = res.data.user.role;
          if (role === "ADMIN") {
            router.push("/admin");
          } else if (role === "STAFF") {
            router.push("/pos");
          } else if (role === "CUSTOMER") {
            setLoading(false);
          } else {
            router.push("/login"); // Fallback
          }
        } else {
           router.push("/login");
        }
      } catch (error) {
        console.error("Auth verification failed", error);
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <div className="customer-layout">{children}</div>;
}