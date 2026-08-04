'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppLayout from '../../components/layout/app-layout'
import { getProjects, createProject, updateProject, getProjectStats } from '../../lib/api/projects'

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
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    logline: '',
    status: 'development' as const,
  })
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: '',
    slug: '',
    logline: '',
    genre: '',
    status: 'development',
  })

  useEffect(() => {
    loadProjects()
    loadOrganization()
  }, [])

  async function loadOrganization() {
    try {
      const { supabase } = await import('../../lib/supabase')
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single()
      
      if (!error && data) {
        setOrganizationId(data.id)
      }
    } catch (err) {
      console.error('Failed to load organization:', err)
    }
  }

  async function loadProjects() {
    try {
      setLoading(true)
      setError(null)
      const data = await getProjects()
      setProjects(data || [])
    } catch (err: any) {
      console.error('Failed to load projects:', err)
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    
    if (!organizationId) {
      setError('No organization found. Please create an organization first.')
      return
    }
    
    try {
      setCreating(true)
      setError(null)
      
      // Generate slug from title if not provided
      const slug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-')
      
      await createProject({
        ...formData,
        slug,
        organization_id: organizationId
      })
      
      // Reset form and close modal
      setFormData({
        title: '',
        slug: '',
        logline: '',
        status: 'development',
      })
      setShowCreateModal(false)
      
      // Reload projects
      await loadProjects()
    } catch (err: any) {
      console.error('Failed to create project:', err)
      setError(err.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  function handleViewProject(project: any) {
    setSelectedProject(project)
    setShowViewModal(true)
  }

  function handleEditProject(project: any) {
    setSelectedProject(project)
    setEditFormData({
      title: project.title || '',
      slug: project.slug || '',
      logline: project.logline || '',
      genre: project.genre || '',
      status: project.status || 'development',
    })
    setShowEditModal(true)
  }

  async function handleUpdateProject(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedProject) return
    
    try {
      setUpdating(true)
      setError(null)
      
      await updateProject(selectedProject.id, editFormData as any)
      
      // Close modal
      setShowEditModal(false)
      setSelectedProject(null)
      
      // Reload projects
      await loadProjects()
    } catch (err: any) {
      console.error('Failed to update project:', err)
      setError(err.message || 'Failed to update project')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Projects</h2>
            <p className="text-muted-foreground">Manage your film projects from development to completion</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2"
          >
            New Project
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-400 text-3xl">🎬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first film project</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Your First Project
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[project.status as keyof typeof statusLabels] || project.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.logline || 'No description'}</p>
                    
                    {/* Progress Bar */}
                    {project.progress_percentage !== null && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Project Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Genre:</span>
                        <div className="font-medium">{project.genre || 'Not set'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Slug:</span>
                        <div className="font-medium text-xs truncate">{project.slug}</div>
                      </div>
                    </div>

                    {/* Timeline */}
                    {(project.start_date || project.end_date) && (
                      <div className="text-sm text-gray-500 mb-4">
                        {project.start_date && <div>Start: {new Date(project.start_date).toLocaleDateString()}</div>}
                        {project.end_date && <div>End: {new Date(project.end_date).toLocaleDateString()}</div>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewProject(project)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleEditProject(project)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Project Card */}
              <div 
                onClick={() => setShowCreateModal(true)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400"
              >
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
                <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">In Production</div>
                <div className="text-2xl font-bold text-green-600">
                  {projects.filter(p => p.status === 'production').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Pre-Production</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {projects.filter(p => p.status === 'pre_production').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Development</div>
                <div className="text-2xl font-bold text-gray-600">
                  {projects.filter(p => p.status === 'development').length}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
              
              <form onSubmit={handleCreateProject}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="The Heist"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (URL-friendly name)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="the-heist (auto-generated if empty)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logline / Description
                    </label>
                    <textarea
                      value={formData.logline}
                      onChange={(e) => setFormData({ ...formData, logline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="A thrilling crime drama about..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="development">Development</option>
                      <option value="pre_production">Pre-Production</option>
                      <option value="production">Production</option>
                      <option value="post_production">Post-Production</option>
                    </select>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Project Modal (Read-Only) */}
        {showViewModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Project Details</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedProject(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Title & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.title}</h4>
                    <p className="text-sm text-gray-500">Slug: {selectedProject.slug}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedProject.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[selectedProject.status as keyof typeof statusLabels] || selectedProject.status}
                  </span>
                </div>

                {/* Logline */}
                {selectedProject.logline && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Logline</h5>
                    <p className="text-gray-900">{selectedProject.logline}</p>
                  </div>
                )}

                {/* Synopsis */}
                {selectedProject.synopsis && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Synopsis</h5>
                    <p className="text-gray-900">{selectedProject.synopsis}</p>
                  </div>
                )}

                {/* Project Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Genre</h5>
                    <p className="text-gray-900">{selectedProject.genre || 'Not set'}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Budget Range</h5>
                    <p className="text-gray-900">{selectedProject.budget_range || 'Not set'}</p>
                  </div>
                  {selectedProject.start_date && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Start Date</h5>
                      <p className="text-gray-900">{new Date(selectedProject.start_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedProject.end_date && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">End Date</h5>
                      <p className="text-gray-900">{new Date(selectedProject.end_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* Progress */}
                {selectedProject.progress_percentage !== null && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-700 mb-2">
                      <h5 className="font-medium">Progress</h5>
                      <span className="font-semibold">{selectedProject.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all" 
                        style={{ width: `${selectedProject.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Created:</span> {new Date(selectedProject.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span> {new Date(selectedProject.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEditProject(selectedProject)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Project
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedProject(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {showEditModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
              
              <form onSubmit={handleUpdateProject}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="The Heist"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (URL-friendly name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.slug}
                      onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="the-heist"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logline / Description
                    </label>
                    <textarea
                      value={editFormData.logline}
                      onChange={(e) => setEditFormData({ ...editFormData, logline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="A thrilling crime drama about..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <input
                      type="text"
                      value={editFormData.genre}
                      onChange={(e) => setEditFormData({ ...editFormData, genre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Action, Drama, Comedy, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="development">Development</option>
                      <option value="pre_production">Pre-Production</option>
                      <option value="production">Production</option>
                      <option value="post_production">Post-Production</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedProject(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Update Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
