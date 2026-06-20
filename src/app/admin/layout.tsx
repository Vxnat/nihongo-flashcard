import React from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen w-full bg-[#FAF6EE] text-zinc-800">
      {children}
    </div>
  );
}
