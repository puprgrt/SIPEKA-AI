import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  subtitle?: string;
  accentColor?: "blue" | "green" | "amber" | "red" | "sky";
  className?: string;
}

const accentMap = {
  blue: {
    bar: "bg-pupr-blue",
    iconBg: "bg-pupr-blue-50 dark:bg-pupr-blue/15",
    iconColor: "text-pupr-blue dark:text-pupr-blue-100",
    trendPositive: "text-success bg-success-50 dark:bg-success/15",
    trendNegative: "text-danger bg-danger-50 dark:bg-danger/15",
  },
  green: {
    bar: "bg-garut-green",
    iconBg: "bg-garut-green-50 dark:bg-garut-green/15",
    iconColor: "text-garut-green dark:text-garut-green-light",
    trendPositive: "text-success bg-success-50 dark:bg-success/15",
    trendNegative: "text-danger bg-danger-50 dark:bg-danger/15",
  },
  amber: {
    bar: "bg-warning",
    iconBg: "bg-warning-50 dark:bg-warning/15",
    iconColor: "text-amber-600 dark:text-warning-light",
    trendPositive: "text-success bg-success-50 dark:bg-success/15",
    trendNegative: "text-danger bg-danger-50 dark:bg-danger/15",
  },
  red: {
    bar: "bg-danger",
    iconBg: "bg-danger-50 dark:bg-danger/15",
    iconColor: "text-danger dark:text-danger-light",
    trendPositive: "text-success bg-success-50 dark:bg-success/15",
    trendNegative: "text-danger bg-danger-50 dark:bg-danger/15",
  },
  sky: {
    bar: "bg-sky-blue",
    iconBg: "bg-info-50 dark:bg-sky-blue/15",
    iconColor: "text-sky-blue dark:text-sky-blue-light",
    trendPositive: "text-success bg-success-50 dark:bg-success/15",
    trendNegative: "text-danger bg-danger-50 dark:bg-danger/15",
  },
}

export function StatCard({ title, value, icon: Icon, trend, subtitle, accentColor = "blue", className }: StatCardProps) {
  const colors = accentMap[accentColor];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-[20px] border border-border/60 bg-white dark:bg-card",
      "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300",
      "group",
      className
    )}>
      {/* Accent bar */}
      <div className={cn("absolute top-0 left-0 w-1 h-full", colors.bar)} />
      
      <div className="p-6 pl-7">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white font-mono animate-counter" data-mono>
              {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
            </h3>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            colors.iconBg
          )}>
            <Icon size={22} className={colors.iconColor} />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span className={cn(
              "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold",
              trend.positive ? colors.trendPositive : colors.trendNegative
            )}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  )
}
