"use client";

import { useState, useCallback } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

/**
 * Custom hook quản lý danh sách người học (Users) và cập nhật chỉ số của họ.
 * Bao gồm các tác vụ: tải danh sách user_stats từ Firestore, chỉnh sửa chỉ số người dùng trực tiếp.
 */
export function useAdminUsers() {
  const [usersStatsList, setUsersStatsList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchUserQuery, setSearchUserQuery] = useState("");

  /**
   * Tải danh sách thông số người dùng từ collection `user_stats` của Firestore
   */
  const loadUsersStats = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "user_stats"));
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setUsersStatsList(list);
    } catch (err) {
      console.error("Lỗi lấy danh sách user:", err);
    }
  }, []);

  /**
   * Cập nhật thông số học tập của người dùng trực tiếp trên Firestore
   */
  const handleUpdateUserStat = useCallback(async (userId: string, key: string, val: any) => {
    try {
      await setDoc(doc(db, "user_stats", userId), { [key]: val }, { merge: true });
      setUsersStatsList(prev => prev.map(u => u.id === userId ? { ...u, [key]: val } : u));
      setSelectedUser((prev: any) => (prev?.id === userId ? { ...prev, [key]: val } : prev));
      toast.success(`Cập nhật thành công ${key} = ${val}!`);
    } catch (err) {
      toast.error("Lỗi cập nhật Firestore");
    }
  }, []);

  return {
    usersStatsList,
    setUsersStatsList,
    selectedUser,
    setSelectedUser,
    searchUserQuery,
    setSearchUserQuery,
    loadUsersStats,
    handleUpdateUserStat
  };
}
