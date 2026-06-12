"use client";

import { useState, useEffect } from "react";

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOSInstallable, setIsIOSInstallable] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Ngăn trình duyệt hiện thanh cài đặt mặc định xấu xí
      setDeferredPrompt(e); // Lưu sự kiện lại để dùng cho nút của mình
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Kiểm tra xem có phải iPhone/iPad chưa cài app không
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    if (isIOS && !isStandalone) {
      setIsIOSInstallable(true);
    }
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    // Nếu là iOS thì hiện hướng dẫn
    if (isIOSInstallable) {
      setShowIOSModal(true);
      return;
    }
    // Nếu là Android/Desktop thì gọi hàm cài đặt
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false); // Cài xong thì giấu nút đi
    }
    setDeferredPrompt(null);
  };

  return { isInstallable, isIOSInstallable, showIOSModal, setShowIOSModal, handleInstallClick };
}