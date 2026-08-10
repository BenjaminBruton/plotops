'use client'

import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/app-layout'
import { getProjects } from '../../lib/api/projects'
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationStats,
  uploadLocationPhoto,
  type Location,
  type LocationStatus
} from '../../lib/api/locations'
import { getScenes } from '../../lib/api/scenes'

const statusColors = {
  scouting: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  pending_approval: 'bg-blue-100 text-blue-800 border-blue-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  secured: 'bg-purple-100 text-purple-800 border-purple-300',
  unavailable: 'bg-gray-100 text-gray-800 border-gray-300',
}

export default function LocationsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<LocationStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  
  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location_type: '',
    description: '',
    status: 'scouting' as LocationStatus,
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    cost_per_day: '',
    parking_info: '',
    power_available: false,
    power_info: '',
    restroom_available: false,
    restroom_info: '',
    catering_space: false,
    wifi_available: false,
    cell_service_quality: '',
    permits_required: false,
    permit_notes: '',
    noise_restrictions: false,
    time_restrictions: '',
    scout_notes: '',
    pros: '',
    cons: '',
    scout_rating: 0,
  })

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadLocations()
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
      setLoading(false)
    } catch (err: any) {
      console.error('Failed to load projects:', err)
      setError(err.message || 'Failed to load projects')
      setLoading(false)
    }
  }

  async function loadLocations() {
    if (!selectedProjectId) return
    
    try {
      setLoading(true)
      const data = await getLocations(selectedProjectId)
      setLocations(data || [])
    } catch (err: any) {
      console.error('Failed to load locations:', err)
      setError(err.message || 'Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    if (!selectedProjectId) return
    
    try {
      const data = await getLocationStats(selectedProjectId)
      setStats(data)
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }

  function handleCreateClick() {
    setFormData({
      name: '',
      location_type: '',
      description: '',
      status: 'scouting',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'USA',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      cost_per_day: '',
      parking_info: '',
      power_available: false,
      power_info: '',
      restroom_available: false,
      restroom_info: '',
      catering_space: false,
      wifi_available: false,
      cell_service_quality: '',
      permits_required: false,
      permit_notes: '',
      noise_restrictions: false,
      time_restrictions: '',
      scout_notes: '',
      pros: '',
      cons: '',
      scout_rating: 0,
    })
    setShowCreateModal(true)
  }

  function handleEditClick(location: Location) {
    setSelectedLocation(location)
    setFormData({
      name: location.name || '',
      location_type: location.location_type || '',
      description: location.description || '',
      status: location.status,
      address_line1: location.address_line1 || '',
      address_line2: location.address_line2 || '',
      city: location.city || '',
      state: location.state || '',
      zip_code: location.zip_code || '',
      country: location.country || 'USA',
      contact_name: location.contact_name || '',
      contact_phone: location.contact_phone || '',
      contact_email: location.contact_email || '',
      cost_per_day: location.cost_per_day?.toString() || '',
      parking_info: location.parking_info || '',
      power_available: location.power_available || false,
      power_info: location.power_info || '',
      restroom_available: location.restroom_available || false,
      restroom_info: location.restroom_info || '',
      catering_space: location.catering_space || false,
      wifi_available: location.wifi_available || false,
      cell_service_quality: location.cell_service_quality || '',
      permits_required: location.permits_required || false,
      permit_notes: location.permit_notes || '',
      noise_restrictions: location.noise_restrictions || false,
      time_restrictions: location.time_restrictions || '',
      scout_notes: location.scout_notes || '',
      pros: location.pros || '',
      cons: location.cons || '',
      scout_rating: location.scout_rating || 0,
    })
    setShowEditModal(true)
  }

  async function handleCreateLocation(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProjectId) return
    
    try {
      setCreating(true)
      setError(null)
      
      await createLocation({
        project_id: selectedProjectId,
        name: formData.name,
        location_type: formData.location_type || undefined,
        description: formData.description || undefined,
        status: formData.status,
        address_line1: formData.address_line1 || undefined,
        address_line2: formData.address_line2 || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zip_code: formData.zip_code || undefined,
        country: formData.country,
        contact_name: formData.contact_name || undefined,
        contact_phone: formData.contact_phone || undefined,
        contact_email: formData.contact_email || undefined,
        cost_per_day: formData.cost_per_day ? parseFloat(formData.cost_per_day) : undefined,
        parking_info: formData.parking_info || undefined,
        power_available: formData.power_available,
        power_info: formData.power_info || undefined,
        restroom_available: formData.restroom_available,
        restroom_info: formData.restroom_info || undefined,
        catering_space: formData.catering_space,
        wifi_available: formData.wifi_available,
        cell_service_quality: formData.cell_service_quality || undefined,
        permits_required: formData.permits_required,
        permit_notes: formData.permit_notes || undefined,
        noise_restrictions: formData.noise_restrictions,
        time_restrictions: formData.time_restrictions || undefined,
        scout_notes: formData.scout_notes || undefined,
        pros: formData.pros || undefined,
        cons: formData.cons || undefined,
        scout_rating: formData.scout_rating || undefined,
        scouted_date: new Date().toISOString().split('T')[0],
      })
      
      setShowCreateModal(false)
      await loadLocations()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to create location:', err)
      setError(err.message || 'Failed to create location')
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdateLocation(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedLocation) return
    
    try {
      setUpdating(true)
      setError(null)
      
      await updateLocation(selectedLocation.id, {
        name: formData.name,
        location_type: formData.location_type || undefined,
        description: formData.description || undefined,
        status: formData.status,
        address_line1: formData.address_line1 || undefined,
        address_line2: formData.address_line2 || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zip_code: formData.zip_code || undefined,
        country: formData.country,
        contact_name: formData.contact_name || undefined,
        contact_phone: formData.contact_phone || undefined,
        contact_email: formData.contact_email || undefined,
        cost_per_day: formData.cost_per_day ? parseFloat(formData.cost_per_day) : undefined,
        parking_info: formData.parking_info || undefined,
        power_available: formData.power_available,
        power_info: formData.power_info || undefined,
        restroom_available: formData.restroom_available,
        restroom_info: formData.restroom_info || undefined,
        catering_space: formData.catering_space,
        wifi_available: formData.wifi_available,
        cell_service_quality: formData.cell_service_quality || undefined,
        permits_required: formData.permits_required,
        permit_notes: formData.permit_notes || undefined,
        noise_restrictions: formData.noise_restrictions,
        time_restrictions: formData.time_restrictions || undefined,
        scout_notes: formData.scout_notes || undefined,
        pros: formData.pros || undefined,
        cons: formData.cons || undefined,
        scout_rating: formData.scout_rating || undefined,
      })
      
      setShowEditModal(false)
      setSelectedLocation(null)
      await loadLocations()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to update location:', err)
      setError(err.message || 'Failed to update location')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDeleteLocation(locationId: string) {
    if (!confirm('Are you sure you want to delete this location?')) return
    
    try {
      await deleteLocation(locationId)
      await loadLocations()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to delete location:', err)
      setError(err.message || 'Failed to delete location')
    }
  }

  async function handleImportFromScenes() {
    if (!selectedProjectId) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Get all scenes for the project
      const scenes = await getScenes(selectedProjectId)
      
      console.log('Scenes fetched:', scenes)
      
      if (!scenes || scenes.length === 0) {
        alert('No scenes found for this project. Please parse a script first.')
        setLoading(false)
        return
      }
      
      // Extract unique location names - try multiple field names
      const locationNames = new Set<string>()
      scenes.forEach((scene: any) => {
        // Try different possible location field names
        const locationValue = scene.location || scene.location_name || scene.int_ext
        
        console.log('Scene location value:', locationValue, 'Full scene:', scene)
        
        if (locationValue && typeof locationValue === 'string' && locationValue.trim()) {
          locationNames.add(locationValue.trim())
        }
      })
      
      console.log('Extracted location names:', Array.from(locationNames))
      
      if (locationNames.size === 0) {
        alert(`Found ${scenes.length} scenes but no location data. The scenes may need location information added.`)
        setLoading(false)
        return
      }
      
      // Create locations for each unique name
      let imported = 0
      for (const locationName of locationNames) {
        // Check if location already exists
        const existing = locations.find(l => l.name.toLowerCase() === locationName.toLowerCase())
        if (!existing) {
          await createLocation({
            project_id: selectedProjectId,
            name: locationName,
            status: 'scouting',
            description: `Imported from script breakdown`,
          })
          imported++
        }
      }
      
      alert(`Successfully imported ${imported} new locations from scenes (${locationNames.size - imported} already existed)`)
      await loadLocations()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to import locations:', err)
      setError(err.message || 'Failed to import locations from scenes')
    } finally {
      setLoading(false)
    }
  }

  // Filter locations
  const filteredLocations = locations.filter(location => {
    if (filterStatus !== 'all' && location.status !== filterStatus) return false
    if (searchTerm && !location.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !location.city?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !location.address_line1?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Location Scouting</h2>
            <p className="text-muted-foreground">
              {selectedProject ? `Locations for "${selectedProject.title}"` : 'Select a project to scout locations'}
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
              onClick={handleImportFromScenes}
              disabled={!selectedProjectId}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background hover:bg-accent h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import from Scenes
            </button>
            <button 
              onClick={handleCreateClick}
              disabled={!selectedProjectId}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Location
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

        {!selectedProjectId ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-400 text-3xl">📍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No project selected</h3>
            <p className="text-gray-500">Select a project from the dropdown above to manage locations</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading locations...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="grid gap-6 md:grid-cols-4 mb-8">
                <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Locations</div>
                  <div className="text-2xl font-bold">{stats.totalLocations}</div>
                  <div className="text-xs text-muted-foreground">Avg rating: {stats.averageRating}★</div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Secured</div>
                  <div className="text-2xl font-bold text-green-600">{stats.byStatus.secured}</div>
                  <div className="text-xs text-green-600">Ready to shoot</div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Approved</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.byStatus.approved}</div>
                  <div className="text-xs text-blue-600">Pending contracts</div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Scouting</div>
                  <div className="text-2xl font-bold">{stats.byStatus.scouting}</div>
                  <div className="text-xs text-muted-foreground">Under review</div>
                </div>
              </div>
            )}

            {/* Filters and View Toggle */}
            <div className="rounded-lg border bg-card p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as LocationStatus | 'all')}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="scouting">Scouting</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="secured">Secured</option>
                    <option value="rejected">Rejected</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-md text-sm ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-md text-sm ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    List
                  </button>
                  <span className="text-sm text-muted-foreground ml-2">
                    {filteredLocations.length} of {locations.length} locations
                  </span>
                </div>
              </div>
            </div>

            {/* Locations Grid/List */}
            {filteredLocations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-3xl">🗺️</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No locations yet</h3>
                <p className="text-gray-500 mb-4">Start scouting by adding your first location</p>
                <button 
                  onClick={handleCreateClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add First Location
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLocations.map((location) => (
                  <div key={location.id} className="rounded-lg border bg-card shadow-soft overflow-hidden hover:shadow-medium transition-shadow">
                    {/* Photo placeholder */}
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-6xl">📸</span>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{location.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[location.status]}`}>
                          {location.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      {location.location_type && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {location.location_type}
                        </div>
                      )}
                      
                      {location.city && location.state && (
                        <div className="text-sm text-muted-foreground mb-3">
                          📍 {location.city}, {location.state}
                        </div>
                      )}
                      
                      {location.scout_rating && location.scout_rating > 0 && (
                        <div className="flex items-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < location.scout_rating! ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs mb-3">
                        {location.power_available && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">⚡ Power</span>}
                        {location.parking_info && <span className="px-2 py-1 bg-green-100 text-green-700 rounded">🅿️ Parking</span>}
                        {location.wifi_available && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">📶 WiFi</span>}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedLocation(location)
                            setShowViewModal(true)
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-input bg-background hover:bg-accent rounded-md"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditClick(location)}
                          className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-card shadow-soft overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredLocations.map((location) => (
                      <tr key={location.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{location.name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {location.city && location.state ? `${location.city}, ${location.state}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {location.location_type || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {location.scout_rating ? (
                            <div className="flex">
                              {[...Array(location.scout_rating)].map((_, i) => (
                                <span key={i} className="text-yellow-400">★</span>
                              ))}
                            </div>
                          ) : 'Not rated'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[location.status]}`}>
                            {location.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-3">
                          <button 
                            onClick={() => {
                              setSelectedLocation(location)
                              setShowViewModal(true)
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleEditClick(location)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteLocation(location.id)}
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
            )}
          </>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-background border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Add New Location</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <form onSubmit={handleCreateLocation} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Location Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="e.g., Downtown Warehouse"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Location Type</label>
                      <select
                        value={formData.location_type}
                        onChange={(e) => setFormData({...formData, location_type: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select type</option>
                        <option value="studio">Studio</option>
                        <option value="practical">Practical Location</option>
                        <option value="exterior">Exterior</option>
                        <option value="interior">Interior</option>
                        <option value="public">Public Space</option>
                        <option value="private">Private Property</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Brief description of the location..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as LocationStatus})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="scouting">Scouting</option>
                        <option value="pending_approval">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="secured">Secured</option>
                        <option value="rejected">Rejected</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Address Line 1</label>
                      <input
                        type="text"
                        value={formData.address_line1}
                        onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Street address"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Address Line 2</label>
                      <input
                        type="text"
                        value={formData.address_line2}
                        onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Apt, suite, unit, etc. (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Zip Code</label>
                      <input
                        type="text"
                        value={formData.zip_code}
                        onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Name</label>
                      <input
                        type="text"
                        value={formData.contact_name}
                        onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Logistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cost per Day ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cost_per_day}
                        onChange={(e) => setFormData({...formData, cost_per_day: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cell Service Quality</label>
                      <select
                        value={formData.cell_service_quality}
                        onChange={(e) => setFormData({...formData, cell_service_quality: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select quality</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Parking Info</label>
                      <textarea
                        value={formData.parking_info}
                        onChange={(e) => setFormData({...formData, parking_info: e.target.value})}
                        rows={2}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Parking availability, spots, restrictions..."
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.power_available}
                        onChange={(e) => setFormData({...formData, power_available: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">⚡ Power Available</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.restroom_available}
                        onChange={(e) => setFormData({...formData, restroom_available: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">🚻 Restrooms</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.catering_space}
                        onChange={(e) => setFormData({...formData, catering_space: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">🍽️ Catering Space</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.wifi_available}
                        onChange={(e) => setFormData({...formData, wifi_available: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">📶 WiFi</span>
                    </label>
                  </div>
                </div>

                {/* Permits & Restrictions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Permits & Restrictions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permits_required}
                        onChange={(e) => setFormData({...formData, permits_required: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">Permits Required</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.noise_restrictions}
                        onChange={(e) => setFormData({...formData, noise_restrictions: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">Noise Restrictions</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Permit Notes</label>
                    <textarea
                      value={formData.permit_notes}
                      onChange={(e) => setFormData({...formData, permit_notes: e.target.value})}
                      rows={2}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Restrictions</label>
                    <input
                      type="text"
                      value={formData.time_restrictions}
                      onChange={(e) => setFormData({...formData, time_restrictions: e.target.value})}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="e.g., No shooting after 8pm"
                    />
                  </div>
                </div>

                {/* Photos */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Photos</h4>
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Photos</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {selectedFiles.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p className="font-medium">{selectedFiles.length} file(s) selected:</p>
                        <ul className="list-disc list-inside mt-1">
                          {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Select multiple photos (JPEG, PNG, WebP, HEIC up to 10MB each)
                    </p>
                  </div>
                </div>

                {/* Scout Notes */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Scout Notes</h4>
                  <div>
                    <label className="block text-sm font-medium mb-2">Scout Rating</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData({...formData, scout_rating: rating})}
                          className={`text-3xl ${formData.scout_rating >= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                        >
                          ★
                        </button>
                      ))}
                      {formData.scout_rating > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, scout_rating: 0})}
                          className="text-sm text-muted-foreground hover:text-foreground ml-4"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pros</label>
                      <textarea
                        value={formData.pros}
                        onChange={(e) => setFormData({...formData, pros: e.target.value})}
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="What's great about this location..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cons</label>
                      <textarea
                        value={formData.cons}
                        onChange={(e) => setFormData({...formData, cons: e.target.value})}
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Potential issues or concerns..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Scout Notes</label>
                    <textarea
                      value={formData.scout_notes}
                      onChange={(e) => setFormData({...formData, scout_notes: e.target.value})}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="General observations and notes..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-input bg-background hover:bg-accent rounded-md text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Location'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal (same structure as Create) */}
        {showEditModal && selectedLocation && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-background border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Edit Location</h3>
                <button onClick={() => {
                  setShowEditModal(false)
                  setSelectedLocation(null)
                }} className="text-muted-foreground hover:text-foreground">
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <form onSubmit={handleUpdateLocation} className="p-6 space-y-6">
                {/* Copy ALL form fields from Create Modal */}
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Location Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Location Type</label>
                      <select
                        value={formData.location_type}
                        onChange={(e) => setFormData({...formData, location_type: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select type</option>
                        <option value="studio">Studio</option>
                        <option value="practical">Practical Location</option>
                        <option value="exterior">Exterior</option>
                        <option value="interior">Interior</option>
                        <option value="public">Public Space</option>
                        <option value="private">Private Property</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as LocationStatus})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="scouting">Scouting</option>
                        <option value="pending_approval">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="secured">Secured</option>
                        <option value="rejected">Rejected</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Address Line 1</label>
                      <input
                        type="text"
                        value={formData.address_line1}
                        onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Address Line 2</label>
                      <input
                        type="text"
                        value={formData.address_line2}
                        onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Zip Code</label>
                      <input
                        type="text"
                        value={formData.zip_code}
                        onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Name</label>
                      <input
                        type="text"
                        value={formData.contact_name}
                        onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Logistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cost per Day ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cost_per_day}
                        onChange={(e) => setFormData({...formData, cost_per_day: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cell Service Quality</label>
                      <select
                        value={formData.cell_service_quality}
                        onChange={(e) => setFormData({...formData, cell_service_quality: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select quality</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Parking Info</label>
                      <textarea
                        value={formData.parking_info}
                        onChange={(e) => setFormData({...formData, parking_info: e.target.value})}
                        rows={2}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.power_available}
                        onChange={(e) => setFormData({...formData, power_available: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">⚡ Power Available</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.restroom_available}
                        onChange={(e) => setFormData({...formData, restroom_available: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">🚻 Restrooms</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.catering_space}
                        onChange={(e) => setFormData({...formData, catering_space: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">🍽️ Catering Space</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.wifi_available}
                        onChange={(e) => setFormData({...formData, wifi_available: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">📶 WiFi</span>
                    </label>
                  </div>
                </div>

                {/* Permits & Restrictions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Permits & Restrictions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permits_required}
                        onChange={(e) => setFormData({...formData, permits_required: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">Permits Required</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.noise_restrictions}
                        onChange={(e) => setFormData({...formData, noise_restrictions: e.target.checked})}
                        className="rounded border-input"
                      />
                      <span className="text-sm">Noise Restrictions</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Permit Notes</label>
                    <textarea
                      value={formData.permit_notes}
                      onChange={(e) => setFormData({...formData, permit_notes: e.target.value})}
                      rows={2}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Restrictions</label>
                    <input
                      type="text"
                      value={formData.time_restrictions}
                      onChange={(e) => setFormData({...formData, time_restrictions: e.target.value})}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Photos */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Photos</h4>
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Photos</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {selectedFiles.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p className="font-medium">{selectedFiles.length} file(s) selected:</p>
                        <ul className="list-disc list-inside mt-1">
                          {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Select multiple photos (JPEG, PNG, WebP, HEIC up to 10MB each)
                    </p>
                  </div>
                </div>

                {/* Scout Notes */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Scout Notes</h4>
                  <div>
                    <label className="block text-sm font-medium mb-2">Scout Rating</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData({...formData, scout_rating: rating})}
                          className={`text-3xl ${formData.scout_rating >= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                        >
                          ★
                        </button>
                      ))}
                      {formData.scout_rating > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, scout_rating: 0})}
                          className="text-sm text-muted-foreground hover:text-foreground ml-4"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pros</label>
                      <textarea
                        value={formData.pros}
                        onChange={(e) => setFormData({...formData, pros: e.target.value})}
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cons</label>
                      <textarea
                        value={formData.cons}
                        onChange={(e) => setFormData({...formData, cons: e.target.value})}
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Scout Notes</label>
                    <textarea
                      value={formData.scout_notes}
                      onChange={(e) => setFormData({...formData, scout_notes: e.target.value})}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedLocation(null)
                    }}
                    className="px-4 py-2 border border-input bg-background hover:bg-accent rounded-md text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Location'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedLocation && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-background border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-2xl font-bold">{selectedLocation.name}</h3>
                <button onClick={() => {
                  setShowViewModal(false)
                  setSelectedLocation(null)
                }} className="text-muted-foreground hover:text-foreground">
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[selectedLocation.status]}`}>
                    {selectedLocation.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {selectedLocation.scout_rating && selectedLocation.scout_rating > 0 && (
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-2xl ${i < selectedLocation.scout_rating! ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {selectedLocation.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedLocation.description}</p>
                  </div>
                )}

                {(selectedLocation.address_line1 || selectedLocation.city) && (
                  <div>
                    <h4 className="font-semibold mb-2">Address</h4>
                    <p className="text-muted-foreground">
                      {selectedLocation.address_line1 && <>{selectedLocation.address_line1}<br/></>}
                      {selectedLocation.address_line2 && <>{selectedLocation.address_line2}<br/></>}
                      {selectedLocation.city && selectedLocation.state && 
                        `${selectedLocation.city}, ${selectedLocation.state} ${selectedLocation.zip_code || ''}`}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {selectedLocation.power_available && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">⚡ Power</span>}
                  {selectedLocation.parking_info && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">🅿️ Parking</span>}
                  {selectedLocation.wifi_available && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">📶 WiFi</span>}
                  {selectedLocation.restroom_available && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">🚻 Restrooms</span>}
                  {selectedLocation.catering_space && <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">🍽️ Catering</span>}
                </div>

                {(selectedLocation.pros || selectedLocation.cons) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLocation.pros && (
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">Pros</h4>
                        <p className="text-sm text-muted-foreground">{selectedLocation.pros}</p>
                      </div>
                    )}
                    {selectedLocation.cons && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-600">Cons</h4>
                        <p className="text-sm text-muted-foreground">{selectedLocation.cons}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedLocation(null)
                    }}
                    className="px-4 py-2 border border-input bg-background hover:bg-accent rounded-md text-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      handleEditClick(selectedLocation)
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm"
                  >
                    Edit Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
