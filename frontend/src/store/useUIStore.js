import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

const initialSidebarOpen =
  typeof window !== "undefined" && window.innerWidth >= 768;

export const useUIStore = create(
  persist(
    immer((set) => ({
      theme: "system",
      fontPref: "inter",
      sidebarOpen: initialSidebarOpen,
      cmdkOpen: false,
      setTheme: (theme) => set((s) => (s.theme = theme)),
      setFontPref: (fontPref) => set((s) => (s.fontPref = fontPref)),
      toggleSidebar: () => set((s) => (s.sidebarOpen = !s.sidebarOpen)),
      toggleCmdk: () => set((s) => (s.cmdkOpen = !s.cmdkOpen)),
      setCmdk: (cmdkOpen) => set((s) => (s.cmdkOpen = cmdkOpen)),
      setSidebar: (sidebarOpen) => set((s) => (s.sidebarOpen = sidebarOpen)),
    })),
    {
      name: "ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        fontPref: state.fontPref,
      }),
    },
  ),
);
