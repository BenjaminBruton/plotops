'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Film, 
  Users, 
  MapPin, 
  Calendar, 
  FileText, 
  Camera, 
  Settings,
  Home,
  Clapperboard,
  UserCheck,
  Clock
} from "lucide-react"

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['all']
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Film,
    roles: ['producer', 'admin']
  },
  {
    name: 'Script Breakdown',
    href: '/script-breakdown',
    icon: FileText,
    roles: ['producer', 'assistant_director', 'admin']
  },
  {
    name: 'Casting',
    href: '/casting',
    icon: Users,
    roles: ['casting_director', 'producer', 'admin']
  },
  {
    name: 'Stripboard',
    href: '/stripboard',
    icon: Calendar,
    roles: ['assistant_director', 'producer', 'admin']
  },
  {
    name: 'Locations',
    href: '/locations',
    icon: MapPin,
    roles: ['location_scout', 'assistant_director', 'producer', 'admin']
  },
  {
    name: 'Call Sheets',
    href: '/call-sheets',
    icon: Clapperboard,
    roles: ['assistant_director', 'producer', 'admin']
  },
  {
    name: 'Production',
    href: '/production',
    icon: Camera,
    roles: ['script_supervisor', 'assistant_director', 'producer', 'admin']
  },
  {
    name: 'Post Production',
    href: '/post-production',
    icon: Clock,
    roles: ['editor', 'producer', 'admin']
  }
]

interface SidebarProps {
  userRole?: string
  className?: string
}

export function Sidebar({ userRole = 'producer', className }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes('all') || item.roles.includes(userRole)
  )

  return (
    <div className={cn("flex h-full w-64 flex-col bg-gray-900", className)}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center space-x-2">
          <Film className="h-8 w-8 text-blue-400" />
          <span className="text-xl font-bold text-white">PlotOps</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-6 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                      )}
                    >
                      <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
          
          {/* Settings at bottom */}
          <li className="mt-auto">
            <Link
              href="/settings"
              className={cn(
                pathname === '/settings'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
              )}
            >
              <Settings className="h-6 w-6 shrink-0" aria-hidden="true" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}