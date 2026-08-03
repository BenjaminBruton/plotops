'use client'

import Link from 'next/link'
import { useState } from 'react'
import AppLayout from '../../components/layout/app-layout'

export default function Casting() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  // Mock data for casting
  const roles = [
    {
      id: 'detective-martinez',
      name: 'Detective Martinez',
      description: 'Lead detective investigating the heist. Strong, determined, with a troubled past.',
      type: 'Lead',
      ageRange: '35-45',
      gender: 'Any',
      submissions: 23,
      status: 'active'
    },
    {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      description: 'Tech expert and hacker. Brilliant but socially awkward.',
      type: 'Supporting',
      ageRange: '25-35',
      gender: 'Female',
      submissions: 18,
      status: 'active'
    },
    {
      id: 'marcus-stone',
      name: 'Marcus Stone',
      description: 'The mastermind behind the heist. Charismatic and dangerous.',
      type: 'Lead',
      ageRange: '40-55',
      gender: 'Male',
      submissions: 31,
      status: 'callback'
    }
  ]

  const castingColumns = [
    {
      id: 'submitted',
      title: 'Submitted',
      color: 'bg-status-info/10 border-status-info/20',
      count: 15
    },
    {
      id: 'reviewing',
      title: 'Under Review',
      color: 'bg-status-warning/10 border-status-warning/20',
      count: 8
    },
    {
      id: 'callback',
      title: 'Callback',
      color: 'bg-status-purple/10 border-status-purple/20',
      count: 5
    },
    {
      id: 'cast',
      title: 'Cast',
      color: 'bg-status-success/10 border-status-success/20',
      count: 3
    },
    {
      id: 'rejected',
      title: 'Rejected',
      color: 'bg-status-danger/10 border-status-danger/20',
      count: 12
    }
  ]

  const mockSubmissions = [
    {
      id: '1',
      actorName: 'Emma Rodriguez',
      role: 'Detective Martinez',
      status: 'submitted',
      submittedDate: '2024-01-15',
      headshot: null,
      experience: '10+ years',
      agency: 'CAA',
      notes: 'Strong audition tape, great emotional range'
    },
    {
      id: '2',
      actorName: 'James Wilson',
      role: 'Detective Martinez',
      status: 'reviewing',
      submittedDate: '2024-01-14',
      headshot: null,
      experience: '8 years',
      agency: 'WME',
      notes: 'Good look for the character, needs callback'
    },
    {
      id: '3',
      actorName: 'Sofia Chen',
      role: 'Sarah Chen',
      status: 'callback',
      submittedDate: '2024-01-12',
      headshot: null,
      experience: '5 years',
      agency: 'UTA',
      notes: 'Perfect for tech expert role, schedule callback'
    },
    {
      id: '4',
      actorName: 'Michael Torres',
      role: 'Marcus Stone',
      status: 'cast',
      submittedDate: '2024-01-10',
      headshot: null,
      experience: '15+ years',
      agency: 'ICM',
      notes: 'Excellent audition, perfect fit for mastermind'
    }
  ]

  const getSubmissionsForColumn = (columnId: string) => {
    return mockSubmissions.filter(submission => submission.status === columnId)
  }

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      submitted: 'border-transparent bg-status-info/20 text-status-info border-status-info/30',
      reviewing: 'border-transparent bg-status-warning/20 text-status-warning border-status-warning/30',
      callback: 'border-transparent bg-status-purple/20 text-status-purple border-status-purple/30',
      cast: 'border-transparent bg-status-success/20 text-status-success border-status-success/30',
      rejected: 'border-transparent bg-status-danger/20 text-status-danger border-status-danger/30'
    }
    return colors[status as keyof typeof colors] || colors.submitted
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Casting Management</h2>
            <p className="text-muted-foreground">Manage character roles and actor submissions for "The Heist"</p>
          </div>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2">
            + New Role
          </button>
        </div>

        {/* Roles Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {roles.map((role) => (
            <div key={role.id} className="rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-medium hover:scale-[1.02] cursor-pointer transition-all duration-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{role.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${role.type === 'Lead' ? 'border-transparent bg-primary text-primary-foreground' : 'border-transparent bg-secondary text-secondary-foreground'}`}>
                      {role.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{role.ageRange}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{role.submissions}</p>
                  <p className="text-xs text-muted-foreground">submissions</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(role.status)}`}>
                  {role.status === 'active' ? 'Accepting Submissions' : 'In Callback'}
                </span>
                <button className="text-sm text-primary hover:text-primary/80 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Casting Pipeline</h3>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                Filter
              </button>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                Export
              </button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-5 gap-4 min-h-[600px]">
            {castingColumns.map((column) => (
              <div key={column.id} className="flex flex-col">
                <div className={`rounded-lg border p-3 mb-4 ${column.color}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{column.title}</h4>
                    <span className="text-xs bg-background/50 px-2 py-1 rounded-full">
                      {column.count}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1">
                  {getSubmissionsForColumn(column.id).map((submission) => (
                    <div key={submission.id} className="rounded-lg border bg-background p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-sm">{submission.actorName}</h5>
                          <p className="text-xs text-muted-foreground">{submission.role}</p>
                        </div>
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {submission.actorName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{submission.submittedDate}</span>
                        </div>
                        <p>Experience: {submission.experience}</p>
                        <p>Agency: {submission.agency}</p>
                      </div>
                      {submission.notes && (
                        <p className="text-xs text-foreground mt-2 p-2 bg-muted/50 rounded">
                          {submission.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Add Card Placeholder */}
                  <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                    <p className="text-xs text-muted-foreground">+ Add submission</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
