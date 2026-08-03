import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-status-success text-white hover:bg-status-success/80",
        warning: "border-transparent bg-status-warning text-white hover:bg-status-warning/80",
        info: "border-transparent bg-status-info text-white hover:bg-status-info/80",
        purple: "border-transparent bg-status-purple text-white hover:bg-status-purple/80",
        orange: "border-transparent bg-status-orange text-white hover:bg-status-orange/80",
        teal: "border-transparent bg-status-teal text-white hover:bg-status-teal/80",
        lime: "border-transparent bg-status-lime text-white hover:bg-status-lime/80",
        // Film industry specific variants
        "scene-day": "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        "scene-night": "border-transparent bg-blue-600 text-white hover:bg-blue-700",
        "scene-interior": "border-transparent bg-green-600 text-white hover:bg-green-700",
        "scene-exterior": "border-transparent bg-orange-600 text-white hover:bg-orange-700",
        // Casting status variants
        "casting-submitted": "border-transparent bg-status-info/20 text-status-info border-status-info/30",
        "casting-reviewing": "border-transparent bg-status-warning/20 text-status-warning border-status-warning/30",
        "casting-callback": "border-transparent bg-status-purple/20 text-status-purple border-status-purple/30",
        "casting-cast": "border-transparent bg-status-success/20 text-status-success border-status-success/30",
        "casting-rejected": "border-transparent bg-status-danger/20 text-status-danger border-status-danger/30",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  icon?: React.ReactNode
}

function Badge({ className, variant, size, dot, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {icon && (
        <span className="mr-1">{icon}</span>
      )}
      {children}
    </div>
  )
}

// Specialized badge components for PlotOps
interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "success" | "warning" | "danger" | "info" | "purple" | "orange" | "teal" | "lime"
}

function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const variantMap = {
    success: "success" as const,
    warning: "warning" as const,
    danger: "destructive" as const,
    info: "info" as const,
    purple: "purple" as const,
    orange: "orange" as const,
    teal: "teal" as const,
    lime: "lime" as const,
  }
  
  return <Badge variant={variantMap[status]} {...props} />
}

interface PriorityBadgeProps extends Omit<BadgeProps, "variant"> {
  priority: "low" | "medium" | "high" | "urgent"
}

function PriorityBadge({ priority, ...props }: PriorityBadgeProps) {
  const variantMap = {
    low: "success" as const,
    medium: "warning" as const,
    high: "orange" as const,
    urgent: "destructive" as const,
  }
  
  return <Badge variant={variantMap[priority]} {...props} />
}

interface SceneBadgeProps extends Omit<BadgeProps, "variant"> {
  type: "day" | "night" | "interior" | "exterior"
}

function SceneBadge({ type, ...props }: SceneBadgeProps) {
  const variantMap = {
    day: "scene-day" as const,
    night: "scene-night" as const,
    interior: "scene-interior" as const,
    exterior: "scene-exterior" as const,
  }
  
  return <Badge variant={variantMap[type]} {...props} />
}

interface CastingStatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "submitted" | "reviewing" | "callback" | "cast" | "rejected"
}

function CastingStatusBadge({ status, ...props }: CastingStatusBadgeProps) {
  const variantMap = {
    submitted: "casting-submitted" as const,
    reviewing: "casting-reviewing" as const,
    callback: "casting-callback" as const,
    cast: "casting-cast" as const,
    rejected: "casting-rejected" as const,
  }
  
  return <Badge variant={variantMap[status]} {...props} />
}

export { 
  Badge, 
  StatusBadge, 
  PriorityBadge, 
  SceneBadge, 
  CastingStatusBadge, 
  badgeVariants 
}