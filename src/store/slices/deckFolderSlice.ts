import { StateCreator } from "zustand";
import { AppState, DeckFolderSlice, CustomDeck, DeckFolder } from "../types";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Slice quản lý các bộ thẻ tự tạo (Custom Decks) và các thư mục phân loại (Folders).
 * Hỗ trợ các hành động CRUD đồng bộ trực tiếp lên Firestore hoặc lưu tạm localStorage.
 */
export const createDeckFolderSlice: StateCreator<
  AppState,
  [],
  [],
  DeckFolderSlice
> = (set, get) => ({
  customDecks: [],
  isLoadingDecks: true,
  folders: [],

  loadCustomDecks: async (uid) => {
    set({ isLoadingDecks: true });
    if (uid) {
      try {
        const q = query(collection(db, "decks"), where("userId", "==", uid));
        const snapshot = await getDocs(q);
        const decks: CustomDeck[] = [];
        snapshot.forEach((doc) => decks.push(doc.data() as CustomDeck));
        // Sắp xếp bộ thẻ theo thời gian tạo mới nhất lên trước
        decks.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

        // Tự động tải bộ bài mẫu khi đăng nhập lần đầu (không có bộ bài nào)
        const localFlagKey = `has_loaded_default_deck_${uid}`;
        if (decks.length === 0 && !localStorage.getItem(localFlagKey)) {
          try {
            const res = await fetch("/data/templates/default_decks.json");
            if (res.ok) {
              const cards = await res.json();
              const targetId = `custom_default_n5_core_${uid}`;
              const defaultDeck: CustomDeck = {
                id: targetId,
                title: "N5 Vocabulary Core",
                description: "Bộ từ vựng N5 thiết yếu để bạn bắt đầu hành trình ✨",
                level: "N5",
                count: cards.length,
                cards: cards,
                isCustom: true,
                createdAt: new Date().toISOString(),
              };

              // Lưu lên Firestore
              await setDoc(doc(db, "decks", targetId), {
                ...defaultDeck,
                userId: uid,
                creatorName: "Hệ thống",
              });

              decks.push(defaultDeck);
              localStorage.setItem(localFlagKey, "true");
            }
          } catch (fetchErr) {
            console.error("Lỗi tự động tải bộ bài mẫu:", fetchErr);
          }
        }

        // Tự động tải bộ bài Kanji mẫu khi không có bộ bài Kanji nào
        const localKanjiFlagKey = `has_loaded_default_kanji_${uid}`;
        const hasKanjiDeck = decks.some((d) => d.type === "kanji");
        if (!hasKanjiDeck && !localStorage.getItem(localKanjiFlagKey)) {
          try {
            const targetId = `custom_default_kanji_radicals_${uid}`;
            const res = await fetch("/data/configs/kanji_radicals.json");
            if (res.ok) {
              const radicals = await res.json();
              const defaultKanjiDeck: CustomDeck = {
                id: targetId,
                title: "214 Bộ Thủ",
                description: "Nền tảng cấu tạo nên mọi chữ Hán.",
                type: "kanji",
                level: "Cơ bản",
                count: radicals.length,
                cards: [],
                kanjiList: radicals,
                folderId: "kanji",
                isCustom: true,
                createdAt: new Date().toISOString(),
              };

              // Lưu lên Firestore
              await setDoc(doc(db, "decks", targetId), {
                ...defaultKanjiDeck,
                userId: uid,
                creatorName: "Hệ thống",
              });

              decks.push(defaultKanjiDeck);
              localStorage.setItem(localKanjiFlagKey, "true");
            }
          } catch (kanjiErr) {
            console.error("Lỗi tự động tải bộ bài Hán tự mẫu:", kanjiErr);
          }
        }

        set({ customDecks: decks, isLoadingDecks: false });
      } catch (error) {
        console.error("Lỗi lấy danh sách custom decks:", error);
        set({ isLoadingDecks: false });
      }
    } else {
      const stored = JSON.parse(localStorage.getItem("custom_decks") || "[]") as CustomDeck[];

      // Tự động tải cho khách truy cập lần đầu
      const localFlagKey = "has_loaded_default_deck_guest";
      if (stored.length === 0 && !localStorage.getItem(localFlagKey)) {
        try {
          const res = await fetch("/data/templates/default_decks.json");
          if (res.ok) {
            const cards = await res.json();
            const defaultDeck: CustomDeck = {
              id: "custom_default_n5_core",
              title: "N5 Vocabulary Core",
              description: "Bộ từ vựng N5 thiết yếu để bạn bắt đầu hành trình ✨",
              level: "N5",
              count: cards.length,
              cards: cards,
              isCustom: true,
              createdAt: new Date().toISOString(),
            };
            stored.push(defaultDeck);
            localStorage.setItem("custom_decks", JSON.stringify(stored));
            localStorage.setItem(localFlagKey, "true");
          }
        } catch (fetchErr) {
          console.error("Lỗi tự động tải bộ bài mẫu cho khách:", fetchErr);
        }
      }

      // Tự động tải bộ bài Kanji cho khách
      const localKanjiFlagKey = "has_loaded_default_kanji_guest";
      const hasKanjiDeck = stored.some((d) => d.type === "kanji");
      if (!hasKanjiDeck && !localStorage.getItem(localKanjiFlagKey)) {
        try {
          const res = await fetch("/data/kanji_radicals.json");
          if (res.ok) {
            const radicals = await res.json();
            const defaultKanjiDeck: CustomDeck = {
              id: "custom_default_kanji_radicals",
              title: "214 Bộ Thủ",
              description: "Nền tảng cấu tạo nên mọi chữ Hán.",
              type: "kanji",
              level: "Cơ bản",
              count: radicals.length,
              cards: [],
              kanjiList: radicals,
              folderId: "kanji",
              isCustom: true,
              createdAt: new Date().toISOString(),
            };
            stored.push(defaultKanjiDeck);
            localStorage.setItem("custom_decks", JSON.stringify(stored));
            localStorage.setItem(localKanjiFlagKey, "true");
          }
        } catch (kanjiErr) {
          console.error("Lỗi tự động tải bộ bài Hán tự mẫu cho khách:", kanjiErr);
        }
      }

      set({ customDecks: stored, isLoadingDecks: false });
    }
  },

  addCustomDeck: async (deck) => {
    const currentDecks = get().customDecks;
    const updated = [deck, ...currentDecks];
    set({ customDecks: updated });

    const uid = get().user?.uid;
    if (uid) {
      await setDoc(doc(db, "decks", deck.id), { ...deck, userId: uid });
    } else {
      localStorage.setItem("custom_decks", JSON.stringify(updated));
    }
  },

  deleteCustomDeck: async (id) => {
    const currentDecks = get().customDecks;
    const updated = currentDecks.filter((d) => d.id !== id);
    set({ customDecks: updated });

    const uid = get().user?.uid;
    if (uid) {
      await deleteDoc(doc(db, "decks", id));
    } else {
      localStorage.setItem("custom_decks", JSON.stringify(updated));
    }
  },

  updateCustomDeck: async (updatedDeck) => {
    const currentDecks = get().customDecks;
    const updatedDecks = currentDecks.map((deck) =>
      deck.id === updatedDeck.id ? updatedDeck : deck
    );
    set({ customDecks: updatedDecks });

    const uid = get().user?.uid;
    if (uid) {
      await setDoc(doc(db, "decks", updatedDeck.id), updatedDeck, {
        merge: true,
      });
    } else {
      localStorage.setItem("custom_decks", JSON.stringify(updatedDecks));
    }
  },

  loadFolders: async (uid) => {
    if (uid) {
      try {
        const q = query(collection(db, "folders"), where("userId", "==", uid));
        const snapshot = await getDocs(q);
        const folders: DeckFolder[] = [];
        snapshot.forEach((doc) => folders.push(doc.data() as DeckFolder));
        // Sắp xếp thư mục theo thứ tự thời gian tạo
        folders.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        set({ folders });
      } catch (error) {
        console.error("Lỗi lấy danh sách thư mục:", error);
      }
    } else {
      const stored = JSON.parse(localStorage.getItem("deck_folders") || "[]");
      set({ folders: stored });
    }
  },

  addFolder: async (folder) => {
    const currentFolders = get().folders;
    const updated = [...currentFolders, folder];
    set({ folders: updated });

    const uid = get().user?.uid;
    if (uid) {
      await setDoc(doc(db, "folders", folder.id), { ...folder, userId: uid });
    } else {
      localStorage.setItem("deck_folders", JSON.stringify(updated));
    }
  },

  deleteFolder: async (id) => {
    const currentFolders = get().folders;
    const updatedFolders = currentFolders.filter((f) => f.id !== id);

    // Tìm tất cả decks nằm trong folder bị xóa để reset folderId về null
    const currentDecks = get().customDecks;
    const decksInFolder = currentDecks.filter((d) => d.folderId === id);
    const updatedDecks = currentDecks.map((d) =>
      d.folderId === id ? { ...d, folderId: null } : d
    );

    set({ folders: updatedFolders, customDecks: updatedDecks });

    const uid = get().user?.uid;
    if (uid) {
      const batchPromises = [
        deleteDoc(doc(db, "folders", id)),
        ...decksInFolder.map((d) =>
          setDoc(doc(db, "decks", d.id), { folderId: null }, { merge: true })
        ),
      ];
      await Promise.all(batchPromises);
    } else {
      localStorage.setItem("deck_folders", JSON.stringify(updatedFolders));
      localStorage.setItem("custom_decks", JSON.stringify(updatedDecks));
    }
  },

  updateFolder: async (id, data) => {
    const currentFolders = get().folders;
    const updatedFolders = currentFolders.map((f) =>
      f.id === id ? { ...f, ...data } : f
    );
    set({ folders: updatedFolders });

    const uid = get().user?.uid;
    if (uid) {
      await setDoc(doc(db, "folders", id), data, { merge: true });
    } else {
      localStorage.setItem("deck_folders", JSON.stringify(updatedFolders));
    }
  },

  moveDeckToFolder: async (deckId, folderId) => {
    const currentDecks = get().customDecks;
    const updatedDecks = currentDecks.map((d) =>
      d.id === deckId ? { ...d, folderId } : d
    );
    set({ customDecks: updatedDecks });

    const uid = get().user?.uid;
    if (uid) {
      await setDoc(doc(db, "decks", deckId), { folderId }, { merge: true });
    } else {
      localStorage.setItem("custom_decks", JSON.stringify(updatedDecks));
    }
  },
});
