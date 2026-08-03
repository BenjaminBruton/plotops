import * as React from "react"
import { cn } from "../lib/utils"
import { Button } from "./button"

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  user?: {
    name: string
    email?: string
    avatar?: string
    role?: string
  }
  notifications?: {
    count: number
    items?: Array<{
      id: string
      title: string
      message: string
      time: string
      read: boolean
      type?: "info" | "success" | "warning" | "danger"
    }>
  }
  onNotificationClick?: () => void
  onUserMenuClick?: () => void
  searchProps?: {
    placeholder?: string
    onSearch?: (query: string) => void
    value?: string
  }
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ 
    className, 
    logo, 
    title, 
    subtitle, 
    actions, 
    user, 
    notifications, 
    onNotificationClick, 
    onUserMenuClick,
    searchProps,
    ...props 
  }, ref) => {
    const [searchQuery, setSearchQuery] = React.useState(searchProps?.value || "")

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)
      searchProps?.onSearch?.(value)
    }

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className
        )}
        {...props}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Left section - Logo and Title */}
          <div className="flex items-center space-x-4">
            {logo && (
              <div className="flex items-center space-x-2">
                {logo}
              </div>
            )}
            {(title || subtitle) && (
              <div className="flex flex-col">
                {title && (
                  <h1 className="text-lg font-semibold text-foreground">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Center section - Search */}
          {searchProps && (
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="search"
                  placeholder={searchProps.placeholder || "Search..."}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Right section - Actions, Notifications, User */}
          <div className="flex items-center space-x-4">
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}

            {/* Notifications */}
            {notifications && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNotificationClick}
                className="relative"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v2.25H2.25v-2.25L4.5 12V9.75a6 6 0 0 1 6-6z"
                  />
                </svg>
                {notifications.count > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
                    {notifications.count > 99 ? "99+" : notifications.count}
                  </span>
                )}
              </Button>
            )}

            {/* User Menu */}
            {user && (
              <Button
                variant="ghost"
                onClick={onUserMenuClick}
                className="flex items-center space-x-2 px-3"
              >
                <div className="flex items-center space-x-2">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium">{user.name}</span>
                    {user.role && (
                      <span className="text-xs text-muted-foreground">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m19 9-7 7-7-7"
                  />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </header>
    )
  }
)
Header.displayName = "Header"

export { Header }