'use client'

import Link from 'next/link'
import { useState } from 'react'
import AppLayout from '../../components/layout/app-layout'

const mockScenes = [
  {
    id: 1,
    sceneNumber: "1",
    intExt: "INT",
    dayNight: "DAY",
    location: "BANK LOBBY",
    description: "The team enters the bank disguised as maintenance workers. Sarah approaches the security desk while Marcus and Jake head to the vault area.",
    pageCount: 2.5,
    estimatedDuration: 8,
    complexity: 4,
    status: "completed",
    characters: ["Sarah", "Marcus", "Jake", "Security Guard"],
    props: ["Maintenance uniforms", "Tool bags", "Fake IDs"],
    notes: "Need crowd of extras for busy bank atmosphere"
  },
  {
    id: 2,
    sceneNumber: "2",
    intExt: "INT",
    dayNight: "DAY",
    location: "BANK VAULT",
    description: "Marcus works on cracking the vault while Jake keeps watch. Tension builds as they hear footsteps approaching.",
    pageCount: 1.8,
    estimatedDuration: 6,
    complexity: 5,
    status: "in_progress",
    characters: ["Marcus", "Jake"],
    props: ["Vault cracking tools", "Walkie-talkies", "Duffel bags"],
    notes: "Complex vault set required, practical effects for drilling"
  },
  {
    id: 3,
    sceneNumber: "3",
    intExt: "EXT",
    dayNight: "DAY",
    location: "BANK PARKING LOT",
    description: "Detective Rodriguez arrives at the bank and notices the suspicious van. She calls for backup while observing the building.",
    pageCount: 1.2,
    estimatedDuration: 4,
    complexity: 2,
    status: "scheduled",
    characters: ["Detective Rodriguez"],
    props: ["Police car", "Radio", "Binoculars"],
    notes: "Need permits for street filming"
  }
]

const statusColors = {
  not_scheduled: "bg-gray-100 text-gray-800",
  scheduled: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  needs_reshoot: "bg-red-100 text-red-800"
}

const complexityColors = {
  1: "bg-green-100 text-green-800",
  2: "bg-green-100 text-green-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-orange-100 text-orange-800",
  5: "bg-red-100 text-red-800"
}

export default function ScriptBreakdown() {
  const [selectedProject, setSelectedProject] = useState("The Heist")
  const [showUpload, setShowUpload] = useState(false)

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Script Breakdown</h2>
            <p className="text-muted-foreground">AI-powered script analysis and scene breakdown for "{selectedProject}"</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option>The Heist</option>
              <option>Midnight in Paris</option>
              <option>Digital Dreams</option>
            </select>
            <button 
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-status-success text-white hover:bg-status-success/90 shadow-soft hover:shadow-medium h-10 px-4 py-2"
            >
              Upload Script
            </button>
          </div>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Upload Script</h3>
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-muted-foreground mb-4">Drag and drop your script file here</p>
                <p className="text-sm text-muted-foreground mb-4">Supports .pdf, .fdx, .txt files</p>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  Choose File
                </button>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowUpload(false)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Cancel
                </button>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-status-success text-white hover:bg-status-success/90 h-10 px-4 py-2">
                  Upload & Analyze
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Script Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Scenes</div>
            <div className="text-2xl font-bold">{mockScenes.length}</div>
            <div className="text-xs text-muted-foreground">120 pages total</div>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Completed</div>
            <div className="text-2xl font-bold text-status-success">
              {mockScenes.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round((mockScenes.filter(s => s.status === 'completed').length / mockScenes.length) * 100)}% done
            </div>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Characters</div>
            <div className="text-2xl font-bold">28</div>
            <div className="text-xs text-muted-foreground">5 leads, 23 supporting</div>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Locations</div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs text-muted-foreground">8 INT, 4 EXT</div>
          </div>
        </div>

        {/* Scene Breakdown Table */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-soft overflow-hidden mb-8">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium">Scene Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Scene</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Complexity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockScenes.map((scene) => (
                  <tr key={scene.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {scene.sceneNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {scene.intExt} • {scene.dayNight}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{scene.location}</div>
                      <div className="text-xs text-muted-foreground">{scene.pageCount} pages</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm max-w-xs truncate">
                        {scene.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Characters: {scene.characters.join(", ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {scene.estimatedDuration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${complexityColors[scene.complexity as keyof typeof complexityColors]}`}>
                        {scene.complexity}/5
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[scene.status as keyof typeof statusColors]}`}>
                        {scene.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary hover:text-primary/80 mr-3">Edit</button>
                      <button className="text-muted-foreground hover:text-foreground">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Analysis Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-semibold">AI Analysis</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Script Structure</h4>
                <div className="text-sm space-y-1">
                  <p>• 3-act structure identified</p>
                  <p>• 28 unique characters detected</p>
                  <p>• 12 distinct locations found</p>
                  <p>• Estimated 95-minute runtime</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Budget Estimates</h4>
                <div className="text-sm space-y-1">
                  <p>• High complexity scenes: 2</p>
                  <p>• Special effects required: 5 scenes</p>
                  <p>• Crowd scenes: 3</p>
                  <p>• Estimated budget: $2.1M - $2.8M</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-semibold">Breakdown Summary</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Scene Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Interior Scenes</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Exterior Scenes</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Day Scenes</span>
                    <span className="font-medium">70%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Night Scenes</span>
                    <span className="font-medium">30%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Production Notes</h4>
                <div className="text-sm space-y-1">
                  <p>• 5 scenes require permits</p>
                  <p>• 3 scenes need crowd extras</p>
                  <p>• 2 scenes require stunt coordination</p>
                  <p>• Weather-dependent: 4 exterior scenes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
