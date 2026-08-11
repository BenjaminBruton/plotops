'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppLayout from '../../components/layout/app-layout'
import { getDashboardStats, type DashboardStats } from '../../lib/api/dashboard'
import { getCurrentUser } from '../../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('there')
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (projects.length > 0) {
      loadDashboardData()
    }
  }, [selectedProjectId, projects.length])

  async function loadProjects() {
    try {
      const { supabase } = await import('../../lib/supabase')
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  async function loadDashboardData() {
    setLoading(true)
    
    // Load user name first (independent of stats)
    try {
      const user = await getCurrentUser()
      if (user) {
        const { supabase } = await import('../../lib/supabase')
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, organization_id, organizations(name)')
          .eq('id', user.id)
          .single()
        
        console.log('📊 Profile query result:', { profile, profileError, userEmail: user.email })
        
        if (profile) {
          const firstName = profile.first_name
          const lastName = profile.last_name
          const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName
          const orgName = profile.organizations ? (profile.organizations as any).name : null
          
          // Priority: Full Name @ Organization > Full Name > Organization > Email
          if (fullName && orgName) {
            setUserName(`${fullName} @ ${orgName}`)
          } else if (fullName) {
            setUserName(fullName)
          } else if (orgName) {
            setUserName(orgName)
          } else {
            // Fallback to email username
            const emailName = user.email?.split('@')[0]
            setUserName(emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : 'User')
          }
        } else {
          // No profile found, use email
          const emailName = user.email?.split('@')[0]
          setUserName(emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : 'User')
        }
      }
    } catch (error) {
      console.error('Failed to load user name:', error)
    }
    
    // Load dashboard stats (independent of user name)
    try {
      const dashboardStats = await getDashboardStats()
      setStats(dashboardStats)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    }
    
    setLoading(false)
  }

  const selectedProject = selectedProjectId === 'all' 
    ? null 
    : projects.find(p => p.id === selectedProjectId)

  const completionPercentage = stats && stats.totalScenes > 0 
    ? Math.round((stats.completedScenes / stats.totalScenes) * 100) 
    : 0

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        {/* Header with Project Selector */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome back, {userName}</h2>
            <p className="text-muted-foreground">
              {selectedProject ? `Viewing "${selectedProject.title}" project` : 'Viewing all projects'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : (
          <>
            {/* Modern Metrics Grid - 3 cards instead of 4 */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-medium transition-all duration-200 p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Scenes Completed</p>
                    <p className="text-2xl font-bold">{stats?.completedScenes || 0}/{stats?.totalScenes || 0}</p>
                    <p className="text-xs text-status-info">{completionPercentage}% complete</p>
                  </div>
                  <svg className="h-8 w-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-medium transition-all duration-200 p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Cast Members</p>
                    <p className="text-2xl font-bold">{stats?.totalCharacters || 0}</p>
                    <p className="text-xs text-muted-foreground">{stats?.leadCharacters || 0} leads, {stats?.supportingCharacters || 0} supporting</p>
                  </div>
                  <svg className="h-8 w-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-medium transition-all duration-200 p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Locations</p>
                    <p className="text-2xl font-bold">{stats?.securedLocations || 0}/{stats?.totalLocations || 0}</p>
                    <p className="text-xs text-status-success">Secured</p>
                  </div>
                  <svg className="h-8 w-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Feature Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-medium hover:scale-[1.02] cursor-pointer transition-all duration-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Projects</h3>
            </div>
            <p className="text-muted-foreground mb-4">Manage your film projects from development to completion</p>
            <Link href="/projects" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2 w-full">
              View Projects
            </Link>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-medium hover:scale-[1.02] cursor-pointer transition-all duration-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-status-success/10 rounded-lg flex items-center justify-center text-status-success">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Script Breakdown</h3>
            </div>
            <p className="text-muted-foreground mb-4">Upload and analyze scripts with AI-powered scene breakdown</p>
            <Link href="/script-breakdown" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-status-success text-white hover:bg-status-success/90 shadow-soft hover:shadow-medium h-10 px-4 py-2 w-full">
              Upload Script
            </Link>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-medium hover:scale-[1.02] cursor-pointer transition-all duration-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-status-purple/10 rounded-lg flex items-center justify-center text-status-purple">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Casting</h3>
            </div>
            <p className="text-muted-foreground mb-4">Manage characters, actors, and casting calls</p>
            <Link href="/casting" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-status-purple text-white hover:bg-status-purple/90 shadow-soft hover:shadow-medium h-10 px-4 py-2 w-full">
              Manage Casting
            </Link>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-medium hover:scale-[1.02] cursor-pointer transition-all duration-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-status-warning/10 rounded-lg flex items-center justify-center text-status-warning">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Stripboard</h3>
            </div>
            <p className="text-muted-foreground mb-4">Interactive production scheduling and scene organization</p>
            <Link href="/stripboard" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-status-warning text-white hover:bg-status-warning/90 shadow-soft hover:shadow-medium h-10 px-4 py-2 w-full">
              View Schedule
            </Link>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-medium hover:scale-[1.02] cursor-pointer transition-all duration-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-status-danger/10 rounded-lg flex items-center justify-center text-status-danger">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Locations</h3>
            </div>
            <p className="text-muted-foreground mb-4">Scout and manage filming locations with map integration</p>
            <Link href="/locations" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-status-danger text-white hover:bg-status-danger/90 shadow-soft hover:shadow-medium h-10 px-4 py-2 w-full">
              View Locations
            </Link>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-medium hover:scale-[1.02] cursor-pointer transition-all duration-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-status-info/10 rounded-lg flex items-center justify-center text-status-info">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Budget & Finance</h3>
            </div>
            <p className="text-muted-foreground mb-4">Track expenses, manage budgets, and financial reporting</p>
            <Link href="/budget" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-status-info text-white hover:bg-status-info/90 shadow-soft hover:shadow-medium h-10 px-4 py-2 w-full">
              View Budget
            </Link>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
