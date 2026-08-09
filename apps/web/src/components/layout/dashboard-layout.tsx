'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: "producer" | "ad" | "casting" | "scout" | "editor" | "publicist"
  activeItemId?: string
}

export function DashboardLayout({
  children,
  userRole = "producer",
  activeItemId
}: DashboardLayoutProps) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const [userEmail, setUserEmail] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [organization, setOrganization] = React.useState('')

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        setFullName(user.user_metadata?.full_name || '')
        setOrganization(user.user_metadata?.organization || '')
      }
    }
    getUser()
  }, [])

  // Determine display name: organization > full_name > email
  const displayName = organization || fullName || userEmail || 'User'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header with user dropdown */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v8a1 1 0 01-1 1M7 4H6a1 1 0 00-1 1v8a1 1 0 001 1h1m0-10h10M7 4v10m10-10v10" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">PlotOps</span>
          </Link>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="hidden sm:inline text-foreground">{displayName}</span>
              <svg className={`h-4 w-4 text-muted-foreground transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background border border-border">
                <div className="py-1">
                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Account Settings
                  </Link>
                  <Link
                    href="/subscription"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Subscription
                  </Link>
                  <hr className="my-1 border-border" />
                  <Link
                    href="/talent/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Switch to Cast Portal
                  </Link>
                  <hr className="my-1 border-border" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Simplified sidebar */}
        <nav className={`flex flex-col border-r bg-background transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <div className={`p-4 border-b ${sidebarCollapsed ? 'p-2 flex justify-center' : ''}`}>
            {!sidebarCollapsed ? (
              <div className="text-center">
                <h3 className="font-semibold text-sm text-foreground">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  The Heist - Active Project
                </p>
              </div>
            ) : (
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="p-2 border-t mt-auto">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-10"
            >
              <svg className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </nav>
        
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}