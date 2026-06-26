"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAppStore } from "@/store/useAppStore";

const ADMIN_EMAILS = ["nguyenatu2003@gmail.com"];

export function MaintenanceBlocker() {
  const pathname = usePathname();
  const user = useAppStore((state: any) => state.user);
  const userStats = useAppStore((state: any) => state.userStats);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementBanner, setAnnouncementBanner] = useState("");

  const isAdmin = (user && user.email && ADMIN_EMAILS.includes(user.email)) || (userStats && userStats.role === "admin");

  useEffect(() => {
    // Listen to Firestore settings in real-time
    const unsub = onSnapshot(doc(db, "system_config", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMaintenanceMode(!!data.maintenanceMode);
        setAnnouncementBanner(data.announcementBanner || "");
      }
    });

    return () => unsub();
  }, []);

  // Show announcement banner at the top if set and not in admin panel
  const showBanner = announcementBanner && !pathname?.startsWith("/admin");

  if (maintenanceMode && !isAdmin && !pathname?.startsWith("/admin")) {
    return (
      <div
        className="fixed inset-0 bg-[#FAF6EE] z-[9999] flex flex-col items-center justify-center p-6 text-center"
        style={{ fontFamily: "var(--font-rounded)" }}
      >
        <div className="bg-white border-4 border-[#8C6D58] rounded-[2rem] p-8 shadow-xl max-w-md w-full flex flex-col items-center gap-6">
          <div className="text-6xl animate-bounce">🚧</div>
          <h1 className="text-2xl font-black text-[#8C6D58]" style={{ fontFamily: "var(--font-cherry)" }}>
            BÉ SHIBA ĐANG BẢO TRÌ!
          </h1>
          <p className="text-sm text-zinc-550 font-bold">
            Thị trấn Shiba Town đang được nâng cấp để mang lại trải nghiệm học tập tốt hơn. Bé Shiba đang dọn dẹp phòng, vui lòng quay lại sau nhé! 🐶💤
          </p>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-xs font-bold w-full">
            Dự kiến hoàn thành sớm. Cảm ơn bạn đã kiên nhẫn!
          </div>
        </div>
      </div>
    );
  }

  // if (showBanner) {
  //   return (
  //     <div className="fixed top-0 left-0 right-0 h-8 bg-[#8C6D58] text-[#FAF6EE] z-[999] flex items-center overflow-hidden text-xs font-bold border-b border-[#735642]">
  //       <style dangerouslySetInnerHTML={{__html: `
  //         @keyframes marquee {
  //           0% { transform: translateX(100%); }
  //           100% { transform: translateX(-100%); }
  //         }
  //         .marquee-text {
  //           animation: marquee 25s linear infinite;
  //         }
  //       `}} />
  //       <div className="marquee-text whitespace-nowrap w-full pl-[100%]">
  //         🔔 THÔNG BÁO HỆ THỐNG: {announcementBanner}
  //       </div>
  //     </div>
  //   );
  // }

  return null;
}
