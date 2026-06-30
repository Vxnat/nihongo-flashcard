import { StateCreator } from "zustand";
import { AppState, AuthSlice } from "../types";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "react-hot-toast";

/**
 * Slice quản lý trạng thái xác thực và phiên đăng nhập của người dùng.
 * Tích hợp đăng nhập nhanh qua Google Sign-In của Firebase.
 */
export const createAuthSlice: StateCreator<
  AppState,
  [],
  [],
  AuthSlice
> = (set, get) => ({
  user: null,

  setUser: (user) => set({ user }),

  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      set({ user: result.user });
      toast.success("Đăng nhập thành công!");
      return result.user;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error("Đăng nhập thất bại. Bạn hãy thử lại nhé!");
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
      toast.success("Đã đăng xuất! Hẹn gặp lại bạn nhé.");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      toast.error("Đăng xuất thất bại!");
      throw error;
    }
  },
});
