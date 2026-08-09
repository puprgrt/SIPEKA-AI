import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

function Skeleton({ className, variant = "rectangular", ...props }: SkeletonProps) {
  const variants = {
    text: "h-4 rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  }

  return (
    <div
      className={cn(
        "bg-slate-200/70 dark:bg-slate-700/50",
        "relative overflow-hidden",
        "after:absolute after:inset-0",
        "after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent",
        "after:animate-shimmer after:bg-[length:200%_100%]",
        "dark:after:via-white/5",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[20px] border border-border/40 bg-white dark:bg-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" variant="text" />
        <Skeleton className="h-10 w-10" variant="circular" />
      </div>
      <Skeleton className="h-8 w-20" variant="text" />
      <Skeleton className="h-3 w-32" variant="text" />
    </div>
  )
}

export { Skeleton, SkeletonCard }
