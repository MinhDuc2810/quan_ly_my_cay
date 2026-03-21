import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Quản lý Mỳ Cay SASIN",
  description: "Hệ thống quản lý nhà hàng Mỳ Cay SASIN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-background min-h-screen relative`}>
        {/* Lớp nền vân giấy/mịn nhẹ để tăng sự cao cấp cho toàn bộ site */}
        <div className="fixed inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] z-[-1]"></div>
        {children}
      </body>
    </html>
  );
}
