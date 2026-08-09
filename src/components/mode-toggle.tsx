import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('light')
    } else {
      // if system, check current actual theme and set opposite
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(isDark ? 'light' : 'dark')
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-xl w-9 h-9 bg-muted dark:bg-slate-800 border-border/60 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
      title="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-pupr-blue dark:text-blue-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
