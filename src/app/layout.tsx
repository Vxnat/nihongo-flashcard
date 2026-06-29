import type { Metadata } from "next";
import { Inter, Quicksand, Cherry_Bomb_One, Hachi_Maru_Pop, Cute_Font, Playwrite_VN, Jua } from "next/font/google";
import "./globals.css";
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

const juaFont = Jua({
  weight: "400",
  variable: "--font-jua"
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
      <body className={`${inter.variable} ${cherryBomb.variable} ${quicksand.variable} ${hachiMaruPop.variable} ${cuteFont.variable} ${juaFont.variable} font-sans min-h-screen text-zinc-900 antialiased`} suppressHydrationWarning>

        {children}

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