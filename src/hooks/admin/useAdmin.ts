"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

// Import các sub-hooks con
import { useAdminDecks } from "./useAdminDecks";
import { useAdminItems } from "./useAdminItems";
import { useAdminQuests } from "./useAdminQuests";
import { useAdminUsers } from "./useAdminUsers";
import { useAdminSettings } from "./useAdminSettings";

// Re-export kiểu dữ liệu từ types để tương thích ngược
export type { SystemDeck, CardData } from "@/types/flashcard";

/**
 * Hook điều phối trung tâm của trang quản trị (Admin Dashboard).
 * Kết nối các custom sub-hooks chuyên biệt để quản lý các tab giao diện khác nhau,
 * đảm bảo tính mô-đun cao, dễ bảo trì và mở rộng.
 */
export function useAdmin() {
  const user = useAppStore((state: any) => state.user);
  const loginWithGoogle = useAppStore((state: any) => state.loginWithGoogle);

  // Tab đang hoạt động trên giao diện Dashboard
  const [activeTab, setActiveTab] = useState<"decks" | "gacha_shop" | "quests" | "users" | "settings">("decks");
  // Trạng thái đang tải dùng chung cho các sub-hooks
  const [isLoading, setIsLoading] = useState(false);

  // 1. Phân hệ quản lý Bộ bài & Từ vựng (Decks & Cards)
  const decksData = useAdminDecks({ setIsLoading });

  // 2. Phân hệ quản lý Vật phẩm Gacha & Cửa hàng (Items, Gacha, Shop)
  const itemsData = useAdminItems({ setIsLoading });

  // 3. Phân hệ quản lý Nhiệm vụ hằng ngày (Daily Quests)
  const questsData = useAdminQuests({ setIsLoading });

  // 4. Phân hệ quản lý Người dùng & Chỉ số (Users stats)
  const usersData = useAdminUsers();

  // 5. Phân hệ cấu hình Hệ thống & Sao lưu (Settings & Backups)
  const settingsData = useAdminSettings({ setIsLoading });

  // Tự động tải toàn bộ cấu hình ban đầu khi gắn vào DOM
  useEffect(() => {
    decksData.loadSystemDecks();
    usersData.loadUsersStats();
    itemsData.loadGachaAndShop();
    questsData.loadDailyQuests();
    settingsData.loadSystemSettings();
    itemsData.loadTypeWeights();
  }, []);

  // Các phương thức cũ đã bị Deprecated trên Firestore nhưng cần giữ lại stub để tương thích ngược
  const handleSaveGachaPool = async () => { };
  const handleSaveShopItems = async () => { };
  const handleSaveQuests = async () => { };

  return {
    // Trạng thái dùng chung
    activeTab,
    setActiveTab,
    isLoading,
    setIsLoading,
    user,
    loginWithGoogle,

    // Tương thích ngược các phương thức cũ
    handleSaveGachaPool,
    handleSaveShopItems,
    handleSaveQuests,

    // Gom dữ liệu & Phương thức từ useAdminDecks
    ...decksData,

    // Gom dữ liệu & Phương thức từ useAdminItems
    ...itemsData,

    // Gom dữ liệu & Phương thức từ useAdminQuests
    ...questsData,

    // Gom dữ liệu & Phương thức từ useAdminUsers
    ...usersData,

    // Gom dữ liệu & Phương thức từ useAdminSettings
    ...settingsData,
  };
}
