// store/uiStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

const initialSidebarOpen =
  typeof window !== "undefined" && window.innerWidth >= 768;

export const useUIStore = create(
  devtools(
    persist(
      immer((set) => ({
        // State
        theme: "system",
        fontPref: "inter",
        sidebarOpen: initialSidebarOpen,
        cmdkOpen: false,
        aiPanelOpen: false,
        noteListOpen: true,
        // Actions
        setTheme: (theme) =>
          set(
            (s) => {
              s.theme = theme;
            },
            false,
            "ui/setTheme",
          ),

        setFontPref: (fontPref) =>
          set(
            (s) => {
              s.fontPref = fontPref;
            },
            false,
            "ui/setFontPref",
          ),

        toggleSidebar: () =>
          set(
            (s) => {
              s.sidebarOpen = !s.sidebarOpen;
            },
            false,
            "ui/toggleSidebar",
          ),

        setSidebar: (sidebarOpen) =>
          set(
            (s) => {
              s.sidebarOpen = sidebarOpen;
            },
            false,
            "ui/setSidebar",
          ),

        toggleCmdk: () =>
          set(
            (s) => {
              s.cmdkOpen = !s.cmdkOpen;
            },
            false,
            "ui/toggleCmdk",
          ),

        setCmdk: (cmdkOpen) =>
          set(
            (s) => {
              s.cmdkOpen = cmdkOpen;
            },
            false,
            "ui/setCmdk",
          ),

        toggleAiPanel: () =>
          set(
            (s) => {
              s.aiPanelOpen = !s.aiPanelOpen;
            },
            false,
            "ui/toggleAiPanel",
          ),

        setAiPanel: (aiPanelOpen) =>
          set(
            (s) => {
              s.aiPanelOpen = aiPanelOpen;
            },
            false,
            "ui/setAiPanel",
          ),

        toggleNoteList: () =>
          set(
            (s) => {
              s.noteListOpen = !s.noteListOpen;
            },
            false,
            "ui/toggleNoteList",
          ),

        setNoteList: (noteListOpen) =>
          set(
            (s) => {
              s.noteListOpen = noteListOpen;
            },
            false,
            "ui/setNoteList",
          ),
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
    { name: "UIStore" }, // ← label in DevTools
  ),
);
