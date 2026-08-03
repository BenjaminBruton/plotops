'use client'

import Link from 'next/link'
import AppLayout from '../../components/layout/app-layout'

const mockProjects = [
  {
    id: 1,
    title: "The Heist",
    description: "A thrilling crime drama about a group of unlikely allies planning the perfect heist.",
    status: "production",
    progress: 65,
    budget: 2500000,
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    scenes: { total: 120, completed: 78 },
    cast: 28,
    locations: 12
  },
  {
    id: 2,
    title: "Midnight in Paris",
    description: "A romantic comedy set in the enchanting streets of Paris during the 1920s.",
    status: "pre_production",
    progress: 25,
    budget: 1800000,
    startDate: "2024-03-01",
    endDate: "2024-08-15",
    scenes: { total: 95, completed: 0 },
    cast: 15,
    locations: 8
  },
  {
    id: 3,
    title: "Digital Dreams",
    description: "A sci-fi thriller exploring the boundaries between reality and virtual worlds.",
    status: "development",
    progress: 10,
    budget: 3200000,
    startDate: "2024-06-01",
    endDate: "2024-12-20",
    scenes: { total: 0, completed: 0 },
    cast: 0,
    locations: 0
  }
]

const statusColors = {
  development: "bg-gray-100 text-gray-800",
  pre_production: "bg-yellow-100 text-yellow-800",
  production: "bg-green-100 text-green-800",
  post_production: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800"
}

const statusLabels = {
  development: "Development",
  pre_production: "Pre-Production",
  production: "Production",
  post_production: "Post-Production",
  completed: "Completed",
  cancelled: "Cancelled"
}

export default function Projects() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Projects</h2>
            <p className="text-muted-foreground">Manage your film projects from development to completion</p>
          </div>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2">
            New Project
          </button>
        </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status as keyof typeof statusColors]}`}>
                      {statusLabels[project.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Budget:</span>
                      <div className="font-medium">${(project.budget / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Scenes:</span>
                      <div className="font-medium">{project.scenes.completed}/{project.scenes.total}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Cast:</span>
                      <div className="font-medium">{project.cast} members</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Locations:</span>
                      <div className="font-medium">{project.locations} sites</div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="text-sm text-gray-500 mb-4">
                    <div>Start: {new Date(project.startDate).toLocaleDateString()}</div>
                    <div>End: {new Date(project.endDate).toLocaleDateString()}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      View Details
                    </button>
                    <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Project Card */}
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300">
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-2xl">➕</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Project</h3>
                <p className="text-gray-500 text-sm mb-4">Start a new film production project</p>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  New Project
                </button>
              </div>
            </div>
          </div>

          {/* Project Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Projects</div>
              <div className="text-2xl font-bold text-gray-900">{mockProjects.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">In Production</div>
              <div className="text-2xl font-bold text-green-600">
                {mockProjects.filter(p => p.status === 'production').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Budget</div>
              <div className="text-2xl font-bold text-gray-900">
                ${(mockProjects.reduce((sum, p) => sum + p.budget, 0) / 1000000).toFixed(1)}M
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Avg Progress</div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(mockProjects.reduce((sum, p) => sum + p.progress, 0) / mockProjects.length)}%
              </div>
            </div>
          </div>
      </div>
    </AppLayout>
  )
}
