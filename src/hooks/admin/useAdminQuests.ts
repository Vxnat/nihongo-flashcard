"use client";

import { useState, useCallback } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

interface UseAdminQuestsProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Custom hook quản lý các nhiệm vụ ngày (Daily Quests).
 * Bao gồm các tác vụ: tải danh sách nhiệm vụ từ Firestore, CRUD nhiệm vụ.
 */
export function useAdminQuests({ setIsLoading }: UseAdminQuestsProps) {
  const [dailyQuests, setDailyQuests] = useState<any[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<any | null>(null);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [questSearch, setQuestSearch] = useState<string>("");

  /**
   * Tải danh sách nhiệm vụ hằng ngày từ Firestore
   */
  const loadDailyQuests = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "daily_quests"));
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setDailyQuests(list);
    } catch (e) {
      console.error("Lỗi tải nhiệm vụ từ Firestore:", e);
    }
  }, []);

  /**
   * Khởi tạo form tạo nhiệm vụ mới
   */
  const handleCreateQuest = useCallback(() => {
    setSelectedQuest({
      id: `q_new_${Date.now()}`,
      title: "",
      target: 10,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      reward: 1
    });
    setIsQuestModalOpen(true);
  }, []);

  /**
   * Mở modal chỉnh sửa nhiệm vụ
   */
  const handleEditQuest = useCallback((quest: any) => {
    setSelectedQuest({ ...quest });
    setIsQuestModalOpen(true);
  }, []);

  /**
   * Lưu thông tin nhiệm vụ lên Firestore (Tạo mới hoặc Cập nhật)
   */
  const handleSaveQuest = useCallback(async (updatedQuest: any) => {
    if (!updatedQuest.id || !updatedQuest.title) {
      toast.error("Vui lòng điền đầy đủ ID và Tên nhiệm vụ!");
      return;
    }

    setIsLoading(true);
    try {
      await setDoc(doc(db, "daily_quests", updatedQuest.id), updatedQuest);
      setDailyQuests(prev => {
        const exists = prev.some(q => q.id === updatedQuest.id);
        return exists ? prev.map(q => q.id === updatedQuest.id ? updatedQuest : q) : [...prev, updatedQuest];
      });
      setIsQuestModalOpen(false);
      toast.success("Đã lưu nhiệm vụ lên Firestore!");
    } catch (err: any) {
      toast.error("Lỗi khi lưu nhiệm vụ: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  /**
   * Xóa nhiệm vụ khỏi hệ thống
   */
  const handleDeleteQuest = useCallback(async (questId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này?")) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "daily_quests", questId));
      setDailyQuests(prev => prev.filter(q => q.id !== questId));
      toast.success("Đã xóa nhiệm vụ khỏi Firestore!");
    } catch (err: any) {
      toast.error("Lỗi khi xóa nhiệm vụ: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  // Derived filtered quests list
  const filteredQuests = dailyQuests.filter(quest => {
    if (questSearch) {
      const searchLower = questSearch.toLowerCase();
      const matchTitle = quest.title && quest.title.toLowerCase().includes(searchLower);
      const matchId = quest.id && quest.id.toLowerCase().includes(searchLower);
      if (!matchTitle && !matchId) return false;
    }
    return true;
  });

  return {
    dailyQuests,
    setDailyQuests,
    selectedQuest,
    setSelectedQuest,
    isQuestModalOpen,
    setIsQuestModalOpen,
    questSearch,
    setQuestSearch,
    filteredQuests,
    loadDailyQuests,
    handleCreateQuest,
    handleEditQuest,
    handleSaveQuest,
    handleDeleteQuest
  };
}
