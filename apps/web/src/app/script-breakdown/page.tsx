'use client'

import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/app-layout'
import { getProjects } from '../../lib/api/projects'
import { getScenes, getSceneStats, createScene, updateScene, deleteScene, type Scene } from '../../lib/api/scenes'

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
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [scenes, setScenes] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showUpload, setShowUpload] = useState(false)
  const [showCreateScene, setShowCreateScene] = useState(false)
  const [showViewScene, setShowViewScene] = useState(false)
  const [showEditScene, setShowEditScene] = useState(false)
  const [selectedScene, setSelectedScene] = useState<any | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  
  // Form state for creating/editing scenes
  const [sceneFormData, setSceneFormData] = useState({
    scene_number: '',
    scene_name: '',
    location_name: '',
    scene_type: 'int' as 'int' | 'ext' | 'int_ext',
    time_of_day: 'day' as 'day' | 'night' | 'dawn' | 'dusk' | 'magic_hour',
    page_count: '',
    description: '',
    script_notes: '',
    estimated_duration: '',
    complexity_rating: 3,
  })

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadScenes()
      loadStats()
    }
  }, [selectedProjectId])

  async function loadProjects() {
    try {
      const data = await getProjects()
      setProjects(data || [])
      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id)
      }
    } catch (err: any) {
      console.error('Failed to load projects:', err)
      setError(err.message || 'Failed to load projects')
    }
  }

  async function loadScenes() {
    if (!selectedProjectId) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await getScenes(selectedProjectId)
      setScenes(data || [])
    } catch (err: any) {
      console.error('Failed to load scenes:', err)
      setError(err.message || 'Failed to load scenes')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    if (!selectedProjectId) return
    
    try {
      const data = await getSceneStats(selectedProjectId)
      setStats(data)
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }

  function handleCreateSceneClick() {
    setSceneFormData({
      scene_number: '',
      scene_name: '',
      location_name: '',
      scene_type: 'int',
      time_of_day: 'day',
      page_count: '',
      description: '',
      script_notes: '',
      estimated_duration: '',
      complexity_rating: 3,
    })
    setShowCreateScene(true)
  }

  async function handleCreateScene(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProjectId) return
    
    try {
      setCreating(true)
      setError(null)
      
      await createScene({
        project_id: selectedProjectId,
        scene_number: sceneFormData.scene_number,
        scene_name: sceneFormData.scene_name || undefined,
        location_name: sceneFormData.location_name || undefined,
        scene_type: sceneFormData.scene_type,
        time_of_day: sceneFormData.time_of_day,
        page_count: sceneFormData.page_count ? parseFloat(sceneFormData.page_count) : undefined,
        description: sceneFormData.description || undefined,
        script_notes: sceneFormData.script_notes || undefined,
        estimated_duration: sceneFormData.estimated_duration ? parseInt(sceneFormData.estimated_duration) : undefined,
        complexity_rating: sceneFormData.complexity_rating,
      })
      
      setShowCreateScene(false)
      await loadScenes()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to create scene:', err)
      setError(err.message || 'Failed to create scene')
    } finally {
      setCreating(false)
    }
  }

  function handleViewScene(scene: any) {
    setSelectedScene(scene)
    setShowViewScene(true)
  }

  function handleEditSceneClick(scene: any) {
    setSelectedScene(scene)
    setSceneFormData({
      scene_number: scene.scene_number || '',
      scene_name: scene.scene_name || '',
      location_name: scene.location_name || '',
      scene_type: scene.scene_type || 'int',
      time_of_day: scene.time_of_day || 'day',
      page_count: scene.page_count?.toString() || '',
      description: scene.description || '',
      script_notes: scene.script_notes || '',
      estimated_duration: scene.estimated_duration?.toString() || '',
      complexity_rating: scene.complexity_rating || 3,
    })
    setShowEditScene(true)
  }

  async function handleUpdateScene(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedScene) return
    
    try {
      setUpdating(true)
      setError(null)
      
      await updateScene(selectedScene.id, {
        scene_number: sceneFormData.scene_number,
        scene_name: sceneFormData.scene_name || undefined,
        location_name: sceneFormData.location_name || undefined,
        scene_type: sceneFormData.scene_type,
        time_of_day: sceneFormData.time_of_day,
        page_count: sceneFormData.page_count ? parseFloat(sceneFormData.page_count) : undefined,
        description: sceneFormData.description || undefined,
        script_notes: sceneFormData.script_notes || undefined,
        estimated_duration: sceneFormData.estimated_duration ? parseInt(sceneFormData.estimated_duration) : undefined,
        complexity_rating: sceneFormData.complexity_rating,
      })
      
      setShowEditScene(false)
      setSelectedScene(null)
      await loadScenes()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to update scene:', err)
      setError(err.message || 'Failed to update scene')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDeleteScene(sceneId: string) {
    if (!confirm('Are you sure you want to delete this scene?')) return
    
    try {
      await deleteScene(sceneId)
      await loadScenes()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to delete scene:', err)
      setError(err.message || 'Failed to delete scene')
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  async function handleUploadScript() {
    if (!uploadedFile || !selectedProjectId) return
    
    try {
      setUploading(true)
      setError(null)
      
      // TODO: Implement actual file upload and script parsing
      // This would typically:
      // 1. Upload file to storage (Supabase Storage)
      // 2. Send to AI service for parsing
      // 3. Create scenes from parsed data
      
      alert(`File "${uploadedFile.name}" ready for upload. AI script parsing will be implemented in a future update.`)
      
      setShowUpload(false)
      setUploadedFile(null)
    } catch (err: any) {
      console.error('Failed to upload script:', err)
      setError(err.message || 'Failed to upload script')
    } finally {
      setUploading(false)
    }
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Script Breakdown</h2>
            <p className="text-muted-foreground">
              {selectedProject ? `Scene breakdown for "${selectedProject.title}"` : 'Select a project to view scenes'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Upload Script
            </button>
            <button 
              onClick={handleCreateSceneClick}
              disabled={!selectedProjectId}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Scene
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Upload Script</h3>
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-muted-foreground mb-4">
                  {uploadedFile ? `Selected: ${uploadedFile.name}` : 'Drag and drop your script file here'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">Supports .pdf, .fdx, .txt files</p>
                <input
                  type="file"
                  id="script-upload"
                  accept=".pdf,.fdx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="script-upload"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                >
                  Choose File
                </label>
              </div>
              {uploadedFile && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => {
                    setShowUpload(false)
                    setUploadedFile(null)
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUploadScript}
                  disabled={!uploadedFile || uploading}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload & Analyze'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedProjectId ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-400 text-3xl">📝</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No project selected</h3>
            <p className="text-gray-500">Select a project from the dropdown above to view its scenes</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading scenes...</p>
          </div>
        ) : (
          <>
            {/* Script Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">Total Scenes</div>
                <div className="text-2xl font-bold">{stats?.totalScenes || 0}</div>
                <div className="text-xs text-muted-foreground">{stats?.totalPages?.toFixed(1) || 0} pages total</div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">Duration</div>
                <div className="text-2xl font-bold">{stats?.totalDuration || 0} min</div>
                <div className="text-xs text-muted-foreground">Estimated runtime</div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">INT/EXT</div>
                <div className="text-2xl font-bold">{stats?.intScenes || 0}/{stats?.extScenes || 0}</div>
                <div className="text-xs text-muted-foreground">Interior / Exterior</div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">Day/Night</div>
                <div className="text-2xl font-bold">{stats?.dayScenes || 0}/{stats?.nightScenes || 0}</div>
                <div className="text-xs text-muted-foreground">Day / Night scenes</div>
              </div>
            </div>

            {/* Scene Breakdown Table */}
            {scenes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-3xl">🎬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scenes yet</h3>
                <p className="text-gray-500 mb-4">Add your first scene or upload a script to get started</p>
                <button 
                  onClick={handleCreateSceneClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add First Scene
                </button>
              </div>
            ) : (
              <div className="rounded-lg border bg-card text-card-foreground shadow-soft overflow-hidden mb-8">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium">Scene Breakdown ({scenes.length} scenes)</h3>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {scenes.map((scene) => (
                        <tr key={scene.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              {scene.scene_number}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {scene.scene_type?.toUpperCase()} • {scene.time_of_day?.toUpperCase()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{scene.location_name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{scene.page_count || 0} pages</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm max-w-xs truncate">
                              {scene.description || 'No description'}
                            </div>
                            {scene.scene_characters && scene.scene_characters.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Characters: {scene.scene_characters.map((sc: any) => sc.character?.name).filter(Boolean).join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {scene.estimated_duration || 0} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${complexityColors[(scene.complexity_rating || 1) as keyof typeof complexityColors]}`}>
                              {scene.complexity_rating || 1}/5
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                            <button 
                              onClick={() => handleViewScene(scene)}
                              className="text-primary hover:text-primary/80"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => handleEditSceneClick(scene)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteScene(scene.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Complexity Distribution */}
            {stats && stats.totalScenes > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                  <h3 className="text-lg font-semibold mb-4">Complexity Distribution</h3>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div key={level} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${complexityColors[level as keyof typeof complexityColors]}`}>
                            Level {level}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${((stats.complexityDistribution[level] || 0) / stats.totalScenes) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{stats.complexityDistribution[level] || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                  <h3 className="text-lg font-semibold mb-4">Scene Distribution</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Interior Scenes</span>
                      <span className="font-medium">{stats.intScenes} ({stats.totalScenes > 0 ? Math.round((stats.intScenes / stats.totalScenes) * 100) : 0}%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Exterior Scenes</span>
                      <span className="font-medium">{stats.extScenes} ({stats.totalScenes > 0 ? Math.round((stats.extScenes / stats.totalScenes) * 100) : 0}%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Day Scenes</span>
                      <span className="font-medium">{stats.dayScenes} ({stats.totalScenes > 0 ? Math.round((stats.dayScenes / stats.totalScenes) * 100) : 0}%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Night Scenes</span>
                      <span className="font-medium">{stats.nightScenes} ({stats.totalScenes > 0 ? Math.round((stats.nightScenes / stats.totalScenes) * 100) : 0}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Scene Modal */}
        {showCreateScene && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
              <h3 className="text-lg font-semibold mb-4">Create New Scene</h3>
              
              <form onSubmit={handleCreateScene}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scene Number *</label>
                    <input
                      type="text"
                      required
                      value={sceneFormData.scene_number}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, scene_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scene Name</label>
                    <input
                      type="text"
                      value={sceneFormData.scene_name}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, scene_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Opening Scene"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={sceneFormData.location_name}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, location_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="BANK LOBBY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scene Type *</label>
                    <select
                      value={sceneFormData.scene_type}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, scene_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="int">Interior</option>
                      <option value="ext">Exterior</option>
                      <option value="int_ext">Interior/Exterior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time of Day *</label>
                    <select
                      value={sceneFormData.time_of_day}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, time_of_day: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="day">Day</option>
                      <option value="night">Night</option>
                      <option value="dawn">Dawn</option>
                      <option value="dusk">Dusk</option>
                      <option value="magic_hour">Magic Hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
                    <input
                      type="number"
                      step="0.125"
                      value={sceneFormData.page_count}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, page_count: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (min)</label>
                    <input
                      type="number"
                      value={sceneFormData.estimated_duration}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, estimated_duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="8"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complexity (1-5)</label>
                    <select
                      value={sceneFormData.complexity_rating}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, complexity_rating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 - Very Simple</option>
                      <option value={2}>2 - Simple</option>
                      <option value={3}>3 - Moderate</option>
                      <option value={4}>4 - Complex</option>
                      <option value={5}>5 - Very Complex</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={sceneFormData.description}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe what happens in this scene..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Script Notes</label>
                    <textarea
                      value={sceneFormData.script_notes}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, script_notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Production notes, special requirements, etc."
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateScene(false)}
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
                    {creating ? 'Creating...' : 'Create Scene'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Scene Modal */}
        {showViewScene && selectedScene && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Scene {selectedScene.scene_number}</h3>
                <button
                  onClick={() => {
                    setShowViewScene(false)
                    setSelectedScene(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Scene Type</h5>
                    <p className="text-gray-900">{selectedScene.scene_type?.toUpperCase()}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Time of Day</h5>
                    <p className="text-gray-900">{selectedScene.time_of_day?.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Location</h5>
                    <p className="text-gray-900">{selectedScene.location_name || 'N/A'}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Page Count</h5>
                    <p className="text-gray-900">{selectedScene.page_count || 0} pages</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Duration</h5>
                    <p className="text-gray-900">{selectedScene.estimated_duration || 0} minutes</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Complexity</h5>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${complexityColors[(selectedScene.complexity_rating || 1) as keyof typeof complexityColors]}`}>
                      {selectedScene.complexity_rating || 1}/5
                    </span>
                  </div>
                </div>

                {selectedScene.description && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                    <p className="text-gray-900">{selectedScene.description}</p>
                  </div>
                )}

                {selectedScene.script_notes && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Script Notes</h5>
                    <p className="text-gray-900">{selectedScene.script_notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewScene(false)
                    handleEditSceneClick(selectedScene)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Scene
                </button>
                <button
                  onClick={() => {
                    setShowViewScene(false)
                    setSelectedScene(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Scene Modal - Same form as Create but with update handler */}
        {showEditScene && selectedScene && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
              <h3 className="text-lg font-semibold mb-4">Edit Scene {selectedScene.scene_number}</h3>
              
              <form onSubmit={handleUpdateScene}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scene Number *</label>
                    <input
                      type="text"
                      required
                      value={sceneFormData.scene_number}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, scene_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scene Name</label>
                    <input
                      type="text"
                      value={sceneFormData.scene_name}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, scene_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={sceneFormData.location_name}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, location_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scene Type *</label>
                    <select
                      value={sceneFormData.scene_type}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, scene_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="int">Interior</option>
                      <option value="ext">Exterior</option>
                      <option value="int_ext">Interior/Exterior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time of Day *</label>
                    <select
                      value={sceneFormData.time_of_day}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, time_of_day: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="day">Day</option>
                      <option value="night">Night</option>
                      <option value="dawn">Dawn</option>
                      <option value="dusk">Dusk</option>
                      <option value="magic_hour">Magic Hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
                    <input
                      type="number"
                      step="0.125"
                      value={sceneFormData.page_count}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, page_count: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (min)</label>
                    <input
                      type="number"
                      value={sceneFormData.estimated_duration}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, estimated_duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complexity (1-5)</label>
                    <select
                      value={sceneFormData.complexity_rating}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, complexity_rating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 - Very Simple</option>
                      <option value={2}>2 - Simple</option>
                      <option value={3}>3 - Moderate</option>
                      <option value={4}>4 - Complex</option>
                      <option value={5}>5 - Very Complex</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={sceneFormData.description}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Script Notes</label>
                    <textarea
                      value={sceneFormData.script_notes}
                      onChange={(e) => setSceneFormData({ ...sceneFormData, script_notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditScene(false)
                      setSelectedScene(null)
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
                    {updating ? 'Updating...' : 'Update Scene'}
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
