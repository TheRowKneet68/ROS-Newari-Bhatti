"use client";

import { useEffect, useState } from "react";

export default function PopupNotice() {
  const [popup, setPopup] = useState<any>(null);
  const [open, setOpen] = useState(true);
  const [visible, setVisible] = useState(false);

  // Fetch popup
  useEffect(() => {
    const loadPopup = async () => {
      try {
        const res = await fetch("/api/popup/get");
        const data = await res.json();

        if (data?.is_active) {
          setPopup(data);
          setTimeout(() => setVisible(true), 50); // smooth entry
        }
      } catch (err) {
        console.error("Popup fetch failed:", err);
      }
    };

    loadPopup();
  }, []);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  // ESC close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setOpen(false), 200); // wait for animation
  };

  if (!popup || !open) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 transition-all duration-300 ${
        visible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative transition-all duration-300 ${
          visible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (glass style) */}
        <button
          onClick={handleClose}
          className="
            absolute -top-3 -right-3 
            w-9 h-9 
            rounded-full 
            bg-white/20 backdrop-blur-md 
            text-white text-lg 
            flex items-center justify-center 
            shadow-lg 
            hover:bg-white/30 
            transition
          "
        >
          ✕
        </button>

        {/* Image */}
        <img
          src={popup.image_url}
          alt="Popup"
          className="
            w-auto h-auto
            max-w-[90vw] max-h-[70vh]
            md:max-w-[85vw] md:max-h-[85vh]
            rounded-2xl 
            shadow-[0_20px_60px_rgba(0,0,0,0.6)]
          "
        />
      </div>
    </div>
  );
}