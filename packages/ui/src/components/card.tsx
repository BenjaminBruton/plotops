import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "shadow-soft hover:shadow-medium",
        interactive: "shadow-soft hover:shadow-medium hover:scale-[1.02] cursor-pointer",
        elevated: "shadow-medium hover:shadow-strong",
        flat: "shadow-none border-0",
        glass: "bg-white/10 backdrop-blur-md border-white/20",
        "glass-dark": "bg-black/10 backdrop-blur-md border-white/10",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Specialized card components for PlotOps
const MetricCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
    value: string | number
    change?: string
    changeType?: "positive" | "negative" | "neutral"
    icon?: React.ReactNode
  }
>(({ className, title, value, change, changeType = "neutral", icon, ...props }, ref) => (
  <Card ref={ref} className={cn("metric-card", className)} {...props}>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="metric-label">{title}</p>
        <p className="metric-value">{value}</p>
        {change && (
          <p className={cn(
            "metric-change",
            changeType === "positive" && "metric-change-positive",
            changeType === "negative" && "metric-change-negative"
          )}>
            {change}
          </p>
        )}
      </div>
      {icon && (
        <div className="text-2xl opacity-60">
          {icon}
        </div>
      )}
    </div>
  </Card>
))
MetricCard.displayName = "MetricCard"

const StatusCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    status: "success" | "warning" | "danger" | "info" | "purple" | "orange" | "teal" | "lime"
    title: string
    description?: string
  }
>(({ className, status, title, description, children, ...props }, ref) => (
  <Card 
    ref={ref} 
    className={cn(
      "border-l-4",
      status === "success" && "border-l-status-success bg-status-success/5",
      status === "warning" && "border-l-status-warning bg-status-warning/5",
      status === "danger" && "border-l-status-danger bg-status-danger/5",
      status === "info" && "border-l-status-info bg-status-info/5",
      status === "purple" && "border-l-status-purple bg-status-purple/5",
      status === "orange" && "border-l-status-orange bg-status-orange/5",
      status === "teal" && "border-l-status-teal bg-status-teal/5",
      status === "lime" && "border-l-status-lime bg-status-lime/5",
      className
    )} 
    {...props}
  >
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    {children && <CardContent>{children}</CardContent>}
  </Card>
))
StatusCard.displayName = "StatusCard"

const FeatureCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon: React.ReactNode
    title: string
    description: string
    action?: React.ReactNode
  }
>(({ className, icon, title, description, action, ...props }, ref) => (
  <Card ref={ref} variant="interactive" className={className} {...props}>
    <CardHeader>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    {action && (
      <CardFooter>
        {action}
      </CardFooter>
    )}
  </Card>
))
FeatureCard.displayName = "FeatureCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  MetricCard,
  StatusCard,
  FeatureCard,
  cardVariants,
}