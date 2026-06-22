"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAdminAuthComponent(props: P) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
          // toast.error("Vui lòng đăng nhập tài khoản Admin!");
          router.push("/");
          return;
        }

        try {
          const snap = await getDoc(doc(db, "user_stats", currentUser.uid));
          const data = snap.data();
          const role = data?.role || "user";

          if (role === "admin") {
            setIsAdmin(true);
            setIsChecking(false);
          } else {
            // toast.error("Bạn không có quyền truy cập trang quản trị!");
            router.push("/");
          }
        } catch (err) {
          console.error("Lỗi xác thực quyền admin:", err);
          toast.error("Lỗi xác thực quyền hạn!");
          router.push("/");
        }
      });

      return () => unsub();
    }, [router]);

    if (isChecking || !isAdmin) {
      return (
        <div className="min-h-screen bg-[#FAF6EE] flex flex-col items-center justify-center p-6 text-center" style={{ fontFamily: "var(--font-rounded)" }}>
          <div className="flex flex-col items-center gap-2">
            <img src="/images/mascot/mascot-hi.gif" className="w-16 h-16 animate-bounce" />
            <p className="text-xs font-black text-[#8C6D58] animate-pulse">Đang xác thực quyền Admin...</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
