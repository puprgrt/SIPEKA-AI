import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "pupr";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-pupr-blue text-white border-transparent",
    secondary: "bg-muted text-slate-700 border-transparent dark:bg-slate-800 dark:text-slate-300",
    destructive: "bg-danger-50 text-danger border-danger/20 dark:bg-danger/15 dark:text-danger-light dark:border-danger/30",
    outline: "border-border text-slate-600 bg-transparent dark:text-slate-400 dark:border-slate-700",
    success: "bg-success-50 text-success border-success/20 dark:bg-success/15 dark:text-success-light dark:border-success/30",
    warning: "bg-warning-50 text-amber-700 border-warning/20 dark:bg-warning/15 dark:text-warning-light dark:border-warning/30",
    info: "bg-info-50 text-info border-info/20 dark:bg-info/15 dark:text-sky-blue-light dark:border-info/30",
    pupr: "bg-pupr-blue-50 text-pupr-blue border-pupr-blue/20 dark:bg-pupr-blue/15 dark:text-pupr-blue-100 dark:border-pupr-blue/30",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-pupr-blue/50 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
