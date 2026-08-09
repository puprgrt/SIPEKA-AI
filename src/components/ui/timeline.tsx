import { cn } from "@/lib/utils"

interface TimelineItem {
  title: string;
  description: string;
  time: string;
  status?: "success" | "danger" | "warning" | "info" | "default";
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const statusColors = {
  success: "bg-success ring-success/20",
  danger: "bg-danger ring-danger/20 animate-pulse",
  warning: "bg-warning ring-warning/20",
  info: "bg-sky-blue ring-sky-blue/20",
  default: "bg-pupr-blue ring-pupr-blue/20",
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex gap-4 group">
          {/* Timeline line + dot */}
          <div className="relative flex flex-col items-center pt-1.5">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full ring-4 z-10 shrink-0",
              "ring-white dark:ring-card",
              statusColors[item.status || "default"]
            )} />
            {i !== items.length - 1 && (
              <div className="w-px flex-1 bg-border/80 dark:bg-slate-700/60 mt-1" />
            )}
          </div>

          {/* Content */}
          <div className={cn(
            "pb-6 flex-1 min-w-0",
            i === items.length - 1 && "pb-0"
          )}>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight group-hover:text-pupr-blue transition-colors">
              {item.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {item.description}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium font-mono" data-mono>
              {item.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
