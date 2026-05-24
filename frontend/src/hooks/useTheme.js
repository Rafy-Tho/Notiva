import { useEffect } from "react";
import { useUIStore } from "../store/useUIStore";

/** Applies theme (light/dark/system) and font preference to <html>. */
export function useTheme() {
  const theme = useUIStore((s) => s.theme);
  const font = useUIStore((s) => s.fontPref);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (mode) => {
      root.classList.toggle("dark", mode === "dark");
    };
    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mql.matches ? "dark" : "light");
      const onChange = (e) => apply(e.matches ? "dark" : "light");
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    apply(theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("font-sans", "font-mono", "font-serif-pref");
    if (font === "mono") root.classList.add("font-mono");
    else if (font === "serif") root.classList.add("font-serif-pref");
    else root.classList.add("font-sans");
  }, [font]);
}
