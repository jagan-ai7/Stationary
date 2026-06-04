import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toggleTheme } from "@/features/theme/themeSlice";

export default function ThemeToggle() {
  const mode = useAppSelector((s) => s.theme.mode);
  const dispatch = useAppDispatch();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => dispatch(toggleTheme())}
    >
      {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}