'use client'

import Link from 'next/link'
import { useState } from 'react'
import AppLayout from '../../components/layout/app-layout'

export default function Stripboard() {
  const [selectedScene, setSelectedScene] = useState<string | null>(null)

  // Mock scene data
  const scenes = [
    {
      id: 'scene-1',
      number: '1',
      title: 'Opening - Bank Exterior',
      location: 'Downtown Bank',
      timeOfDay: 'day',
      type: 'exterior',
      pages: 2.5,
      cast: ['Detective Martinez', 'Bank Manager'],
      props: ['Police car', 'Crime scene tape'],
      status: 'scheduled',
      shootDate: '2024-02-15',
      estimatedTime: '4 hours'
    },
    {
      id: 'scene-2',
      number: '2A',
      title: 'Detective Office - Investigation',
      location: 'Police Station',
      timeOfDay: 'day',
      type: 'interior',
      pages: 1.8,
      cast: ['Detective Martinez', 'Captain Rodriguez'],
      props: ['Case files', 'Coffee mug', 'Whiteboard'],
      status: 'completed',
      shootDate: '2024-02-12',
      estimatedTime: '3 hours'
    },
    {
      id: 'scene-3',
      number: '3',
      title: 'Hacker Den - Planning',
      location: 'Sarah\'s Apartment',
      timeOfDay: 'night',
      type: 'interior',
      pages: 3.2,
      cast: ['Sarah Chen', 'Marcus Stone'],
      props: ['Multiple monitors', 'Server equipment', 'Energy drinks'],
      status: 'in-progress',
      shootDate: '2024-02-16',
      estimatedTime: '5 hours'
    },
    {
      id: 'scene-4',
      number: '4',
      title: 'Chase Scene - Rooftop',
      location: 'Downtown Rooftop',
      timeOfDay: 'night',
      type: 'exterior',
      pages: 4.1,
      cast: ['Detective Martinez', 'Marcus Stone', 'Stunt Double'],
      props: ['Harnesses', 'Safety equipment', 'Fog machine'],
      status: 'pending',
      shootDate: null,
      estimatedTime: '6 hours'
    },
    {
      id: 'scene-5',
      number: '5',
      title: 'Final Confrontation - Warehouse',
      location: 'Industrial Warehouse',
      timeOfDay: 'night',
      type: 'interior',
      pages: 5.5,
      cast: ['Detective Martinez', 'Sarah Chen', 'Marcus Stone'],
      props: ['Warehouse equipment', 'Dramatic lighting', 'Smoke effects'],
      status: 'pending',
      shootDate: null,
      estimatedTime: '8 hours'
    }
  ]

  const getSceneTypeColor = (type: string) => {
    return type === 'interior' 
      ? 'from-green-100 to-green-200 border-green-300 text-green-800'
      : 'from-orange-100 to-orange-200 border-orange-300 text-orange-800'
  }

  const getTimeOfDayColor = (timeOfDay: string) => {
    return timeOfDay === 'day'
      ? 'from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800'
      : 'from-blue-100 to-blue-200 border-blue-300 text-blue-800'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-status-success bg-status-success/10 border-status-success/20',
      'in-progress': 'text-status-warning bg-status-warning/10 border-status-warning/20',
      scheduled: 'text-status-info bg-status-info/10 border-status-info/20',
      pending: 'text-muted-foreground bg-muted/50 border-muted'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Production Stripboard</h2>
            <p className="text-muted-foreground">Interactive scene scheduling and production planning for "The Heist"</p>
          </div>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2">
            Generate Call Sheet
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Scenes</div>
            <div className="text-2xl font-bold">{scenes.length}</div>
            <div className="text-xs text-muted-foreground">17.1 pages total</div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Completed</div>
            <div className="text-2xl font-bold text-status-success">{scenes.filter(s => s.status === 'completed').length}</div>
            <div className="text-xs text-status-success">On schedule</div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">In Progress</div>
            <div className="text-2xl font-bold text-status-warning">{scenes.filter(s => s.status === 'in-progress').length}</div>
            <div className="text-xs text-status-warning">Shooting today</div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Remaining</div>
            <div className="text-2xl font-bold">{scenes.filter(s => s.status === 'pending').length}</div>
            <div className="text-xs text-muted-foreground">To be scheduled</div>
          </div>
        </div>

        {/* Stripboard Controls */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold">Scene Organization</h3>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                  Sort by Location
                </button>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                  Sort by Cast
                </button>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                  Sort by Time
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-8 px-3">
                Auto-Schedule
              </button>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Stripboard */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
          <h3 className="text-xl font-semibold mb-6">Scene Strips</h3>
          
          <div className="space-y-4">
            {scenes.map((scene) => (
              <div 
                key={scene.id}
                className={`bg-gradient-to-r ${getSceneTypeColor(scene.type)} rounded-lg p-4 shadow-soft hover:shadow-medium transition-all duration-200 cursor-move border-2 ${selectedScene === scene.id ? 'border-primary' : 'border-transparent'}`}
                onClick={() => setSelectedScene(selectedScene === scene.id ? null : scene.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Scene Number */}
                    <div className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center font-bold text-lg">
                      {scene.number}
                    </div>
                    
                    {/* Scene Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{scene.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {scene.location}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r ${getTimeOfDayColor(scene.timeOfDay)}`}>
                          {scene.timeOfDay === 'day' ? 'Day' : 'Night'}
                        </span>
                        <span className="text-sm">{scene.pages} pages</span>
                        <span className="text-sm">{scene.estimatedTime}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(scene.status)}`}>
                        {scene.status.replace('-', ' ').toUpperCase()}
                      </span>
                      {scene.shootDate && (
                        <span className="text-xs text-foreground/70">
                          {scene.shootDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedScene === scene.id && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Cast</h5>
                        <div className="flex flex-wrap gap-1">
                          {scene.cast.map((actor, index) => (
                            <span key={index} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-white/80 text-foreground">
                              {actor}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Props & Equipment</h5>
                        <div className="flex flex-wrap gap-1">
                          {scene.props.map((prop, index) => (
                            <span key={index} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-white/80 text-foreground">
                              {prop}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-8 px-3">
                        Edit Scene
                      </button>
                      <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                        Schedule
                      </button>
                      <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                        View Location
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Drag & Drop Hint */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <p className="text-center text-sm text-muted-foreground">
              💡 Drag and drop scene strips to reorder your shooting schedule. 
              Click on scenes to view detailed information and make adjustments.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
