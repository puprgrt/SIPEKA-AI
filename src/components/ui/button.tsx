import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "pupr" | "garut" | "success" | "warning";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
      destructive: "bg-danger text-white hover:bg-danger-light shadow-sm shadow-danger/20",
      outline: "border border-border bg-surface hover:bg-muted hover:text-slate-900 dark:bg-card dark:hover:bg-muted dark:text-slate-100 dark:border-border",
      secondary: "bg-muted text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
      ghost: "hover:bg-muted hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:text-slate-300",
      link: "text-pupr-blue underline-offset-4 hover:underline dark:text-sky-blue",
      pupr: "bg-pupr-blue text-white hover:bg-pupr-blue-light shadow-sm shadow-pupr-blue/20 active:bg-pupr-blue-dark",
      garut: "bg-garut-green text-white hover:bg-garut-green-light shadow-sm shadow-garut-green/20 active:bg-garut-green-dark",
      success: "bg-success text-white hover:bg-success-light shadow-sm shadow-success/20",
      warning: "bg-warning text-white hover:bg-warning-light shadow-sm shadow-warning/20",
    }
    
    const sizes = {
      default: "h-10 px-5 py-2",
      sm: "h-8 px-3 text-xs gap-1.5",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold",
          "ring-offset-white transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pupr-blue/50 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
