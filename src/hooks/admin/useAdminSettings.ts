"use client";

import { useState, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

interface UseAdminSettingsProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Custom hook quản lý các cấu hình hệ thống (Settings) và sao lưu dữ liệu (Backup).
 * Bao gồm các tác vụ: tải cài đặt từ Firestore, chỉnh sửa cấu hình hệ thống, chạy tác vụ Backup.
 */
export function useAdminSettings({ setIsLoading }: UseAdminSettingsProps) {
  // Cài đặt hệ thống (Chế độ bảo trì, banner thông báo...)
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    announcementBanner: "Chào mừng bạn đến với Shiba Town!"
  });

  /**
   * Tải cài đặt hệ thống từ Firestore
   */
  const loadSystemSettings = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, "system_config", "settings"));
      if (snap.exists()) {
        setSystemSettings(snap.data() as any);
      }
    } catch (err) {
      console.error("Lỗi tải System Settings từ Firestore:", err);
    }
  }, []);

  /**
   * Cập nhật cài đặt hệ thống trực tiếp trên Firestore
   */
  const handleUpdateSystemSetting = useCallback(async (key: string, val: any) => {
    try {
      const newSettings = { ...systemSettings, [key]: val };
      await setDoc(doc(db, "system_config", "settings"), newSettings, { merge: true });
      setSystemSettings(newSettings);
      toast.success(`Đã cập nhật: ${key} = ${val}!`);
    } catch (err) {
      toast.error("Lỗi cập nhật Firestore settings");
    }
  }, [systemSettings]);

  /**
   * Chạy tác vụ sao lưu toàn bộ dữ liệu cấu hình hệ thống xuống tệp đĩa cứng server
   */
  const handleBackupData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "backup" })
      });
      if (!res.ok) throw new Error("Sao lưu thất bại");
      const result = await res.json();
      toast.success(result.message || "Đã sao lưu cấu hình thành công!");
    } catch (err: any) {
      toast.error(err.message || "Lỗi sao lưu");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  return {
    systemSettings,
    setSystemSettings,
    loadSystemSettings,
    handleUpdateSystemSetting,
    handleBackupData
  };
}
