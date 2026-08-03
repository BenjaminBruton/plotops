import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { Button } from "./button"

const sidebarVariants = cva(
  "flex flex-col border-r bg-background transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background",
        dark: "bg-muted/50",
        glass: "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      },
      size: {
        default: "w-64",
        sm: "w-56",
        lg: "w-72",
        collapsed: "w-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SidebarItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  active?: boolean
  badge?: string | number
  children?: SidebarItem[]
  disabled?: boolean
}

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  items: SidebarItem[]
  collapsed?: boolean
  onToggleCollapse?: () => void
  header?: React.ReactNode
  footer?: React.ReactNode
  activeItemId?: string
  onItemClick?: (item: SidebarItem) => void
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({
    className,
    variant,
    size,
    items,
    collapsed = false,
    onToggleCollapse,
    header,
    footer,
    activeItemId,
    onItemClick,
    ...props
  }, ref) => {
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set())

    const toggleExpanded = (itemId: string) => {
      const newExpanded = new Set(expandedItems)
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId)
      } else {
        newExpanded.add(itemId)
      }
      setExpandedItems(newExpanded)
    }

    const handleItemClick = (item: SidebarItem) => {
      if (item.children && item.children.length > 0) {
        toggleExpanded(item.id)
      } else {
        onItemClick?.(item)
        item.onClick?.()
      }
    }

    const renderItem = (item: SidebarItem, level = 0) => {
      const isActive = activeItemId === item.id || item.active
      const isExpanded = expandedItems.has(item.id)
      const hasChildren = item.children && item.children.length > 0

      return (
        <div key={item.id}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-10 px-3 mb-1",
              level > 0 && "ml-4 w-[calc(100%-1rem)]",
              collapsed && level === 0 && "px-0 justify-center",
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !item.disabled && handleItemClick(item)}
            disabled={item.disabled}
          >
            {item.icon && (
              <span className={cn("flex-shrink-0", !collapsed && "mr-3")}>
                {item.icon}
              </span>
            )}
            
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">
                  {item.label}
                </span>
                
                {item.badge && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {item.badge}
                  </span>
                )}
                
                {hasChildren && (
                  <svg
                    className={cn(
                      "ml-2 h-4 w-4 transition-transform",
                      isExpanded && "rotate-90"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m9 18 6-6-6-6"
                    />
                  </svg>
                )}
              </>
            )}
          </Button>

          {/* Render children */}
          {hasChildren && !collapsed && isExpanded && (
            <div className="ml-2">
              {item.children!.map((child) => renderItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          sidebarVariants({ variant, size: collapsed ? "collapsed" : size }),
          className
        )}
        {...props}
      >
        {/* Header */}
        {header && (
          <div className={cn(
            "p-4 border-b",
            collapsed && "p-2 flex justify-center"
          )}>
            {header}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map((item) => renderItem(item))}
        </nav>

        {/* Footer */}
        {footer && (
          <div className={cn(
            "p-4 border-t mt-auto",
            collapsed && "p-2 flex justify-center"
          )}>
            {footer}
          </div>
        )}

        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="w-full"
            >
              <svg
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </Button>
          </div>
        )}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

// Specialized sidebar components for PlotOps
const PlotOpsSidebar = React.forwardRef<HTMLDivElement, Omit<SidebarProps, "items"> & {
  userRole?: "producer" | "ad" | "casting" | "scout" | "editor" | "publicist"
}>(({ userRole = "producer", ...props }, ref) => {
  const getItemsForRole = (role: string): SidebarItem[] => {
    const baseItems: SidebarItem[] = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
        ),
        href: "/dashboard",
      },
      {
        id: "projects",
        label: "Projects",
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
        href: "/projects",
      },
    ]

    const roleSpecificItems: Record<string, SidebarItem[]> = {
      producer: [
        {
          id: "script-breakdown",
          label: "Script Breakdown",
          icon: "📄",
          href: "/script-breakdown",
        },
        {
          id: "budget",
          label: "Budget & Finance",
          icon: "💰",
          href: "/budget",
        },
        {
          id: "reports",
          label: "Reports",
          icon: "📊",
          href: "/reports",
        },
      ],
      ad: [
        {
          id: "stripboard",
          label: "Stripboard",
          icon: "📅",
          href: "/stripboard",
        },
        {
          id: "call-sheets",
          label: "Call Sheets",
          icon: "🎯",
          href: "/call-sheets",
        },
        {
          id: "locations",
          label: "Locations",
          icon: "📍",
          href: "/locations",
        },
      ],
      casting: [
        {
          id: "casting",
          label: "Casting Board",
          icon: "👥",
          href: "/casting",
        },
        {
          id: "auditions",
          label: "Auditions",
          icon: "🎭",
          href: "/auditions",
        },
        {
          id: "talent",
          label: "Talent Database",
          icon: "⭐",
          href: "/talent",
        },
      ],
      scout: [
        {
          id: "locations",
          label: "Location Scout",
          icon: "📍",
          href: "/locations",
        },
        {
          id: "permits",
          label: "Permits",
          icon: "📋",
          href: "/permits",
        },
      ],
      editor: [
        {
          id: "post-production",
          label: "Post Production",
          icon: "🎞️",
          href: "/post-production",
        },
        {
          id: "assets",
          label: "Digital Assets",
          icon: "💾",
          href: "/assets",
        },
      ],
      publicist: [
        {
          id: "marketing",
          label: "Marketing",
          icon: "📢",
          href: "/marketing",
        },
        {
          id: "press",
          label: "Press & Media",
          icon: "📰",
          href: "/press",
        },
      ],
    }

    return [...baseItems, ...(roleSpecificItems[role] || [])]
  }

  return (
    <Sidebar
      ref={ref}
      items={getItemsForRole(userRole)}
      {...props}
    />
  )
})
PlotOpsSidebar.displayName = "PlotOpsSidebar"

export { Sidebar, PlotOpsSidebar, sidebarVariants }