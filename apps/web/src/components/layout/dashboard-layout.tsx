'use client'

import React from 'react'

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
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Simplified header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v8a1 1 0 01-1 1M7 4H6a1 1 0 00-1 1v8a1 1 0 001 1h1m0-10h10M7 4v10m10-10v10" />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">PlotOps</span>
            </div>
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