import type { Metadata } from "next";
import { Inter, Quicksand, Cherry_Bomb_One, Hachi_Maru_Pop , Cute_Font } from "next/font/google";
import "./globals.css";
import { SplashScreen } from "@/components/SplashScreen";
import { Toaster } from "react-hot-toast";

// 1. Font Cherry Bomb One: Siêu mập, dễ thương (Dành cho Tiêu đề)
const cherryBomb = Cherry_Bomb_One({ 
  weight: "400", 
  subsets: ["latin"], // Hỗ trợ tiếng Anh & Romaji chuẩn
  variable: "--font-cherry" 
});

// 2. Font Quicksand: Bo tròn, mềm mại (Dành cho văn bản phụ)
const quicksand = Quicksand({ 
  subsets: ["latin", "vietnamese"], 
  weight: ["500", "600", "700"],
  variable: "--font-rounded" 
});

const hachiMaruPop = Hachi_Maru_Pop({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-hachi-maru-pop" 
});

const cuteFont = Cute_Font({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-cute" 
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Shiba Town",
  description: "Khám phá tiếng Nhật cùng bé Shiba!",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shiba Town",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${cherryBomb.variable} ${quicksand.variable} ${hachiMaruPop.variable} ${cuteFont.variable} font-sans min-h-screen text-zinc-900 antialiased`} suppressHydrationWarning>
        
        {/* ==========================================
            CUTE APP BACKGROUND: SỔ TAY CARO (GRID NOTE)
           ========================================== */}
        <div 
          className="fixed inset-0 w-full h-full -z-50"
          style={{
            // Màu nền vàng bơ sữa
            backgroundColor: "#FFFDF5",
            // Tạo họa tiết kẻ caro bằng CSS Linear Gradient (Siêu nhẹ, không vỡ nét)
            backgroundImage: `
              linear-gradient(#F3E2C6 2px, transparent 2px),
              linear-gradient(90deg, #F3E2C6 2px, transparent 2px)
            `,
            backgroundSize: "36px 36px" // Kích thước ô vuông
          }}
        />

        <main className="relative z-10 w-full min-h-screen pt-12 px-4 max-w-6xl mx-auto">
          <SplashScreen />
          {children}
        </main>

        {/* Cấu hình Toast Cute */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            className: "font-rounded font-bold border-2 border-zinc-200 shadow-sm rounded-2xl",
          }} 
        />
      </body>
    </html>
  );
}