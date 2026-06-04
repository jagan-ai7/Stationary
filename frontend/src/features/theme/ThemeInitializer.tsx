import { useEffect } from "react";
import { useAppSelector } from "@/app/hooks";

export function ThemeInitializer() {
  const mode = useAppSelector((s) => s.theme.mode);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);
  return null;
}