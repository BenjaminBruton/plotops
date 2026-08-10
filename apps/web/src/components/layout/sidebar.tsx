'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
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
  Clock,
  User,
  LogOut,
  ChevronUp,
  FileSignature
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
    name: 'Contracts',
    href: '/contracts',
    icon: FileSignature,
    roles: ['producer', 'admin']
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
  const router = useRouter()
  const [userEmail, setUserEmail] = React.useState<string>('')
  const [fullName, setFullName] = React.useState<string>('')
  const [organization, setOrganization] = React.useState<string>('')
  const [showUserMenu, setShowUserMenu] = React.useState(false)

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
          
          {/* User menu at bottom */}
          <li className="mt-auto">
            <div className="relative">
              {/* User dropdown trigger */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                  <User className="h-5 w-5" />
                </div>
                <span className="flex-1 text-left truncate">{displayName}</span>
                <ChevronUp className={cn(
                  "h-5 w-5 transition-transform",
                  showUserMenu ? "rotate-180" : ""
                )} />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      href="/account"
                      className="flex items-center gap-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )
}