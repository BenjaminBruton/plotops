'use client'

import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/app-layout'
import { getProjects } from '../../lib/api/projects'
import {
  getProps,
  createProp,
  updateProp,
  deleteProp,
  getPropsStats,
  type Prop,
  type PropCategory,
  type PropStatus
} from '../../lib/api/props'
import { getCharacters } from '../../lib/api/scenes'
import { getLocations } from '../../lib/api/locations'

const categoryColors: Record<PropCategory, string> = {
  prop: 'bg-blue-100 text-blue-800 border-blue-300',
  costume: 'bg-purple-100 text-purple-800 border-purple-300',
  makeup: 'bg-pink-100 text-pink-800 border-pink-300',
  set_dressing: 'bg-green-100 text-green-800 border-green-300',
  vehicle: 'bg-orange-100 text-orange-800 border-orange-300',
  weapon: 'bg-red-100 text-red-800 border-red-300',
  special_fx: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  animal: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  food: 'bg-lime-100 text-lime-800 border-lime-300',
  other: 'bg-gray-100 text-gray-800 border-gray-300',
}

const statusColors: Record<PropStatus, string> = {
  needed: 'bg-red-100 text-red-800 border-red-300',
  researching: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  sourced: 'bg-blue-100 text-blue-800 border-blue-300',
  ordered: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  purchased: 'bg-purple-100 text-purple-800 border-purple-300',
  rented: 'bg-orange-100 text-orange-800 border-orange-300',
  on_set: 'bg-green-100 text-green-800 border-green-300',
  returned: 'bg-gray-100 text-gray-800 border-gray-300',
  completed: 'bg-green-200 text-green-900 border-green-400',
}

export default function PropsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [props, setProps] = useState<Prop[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Available data for dropdowns
  const [characters, setCharacters] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState<PropCategory | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<PropStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedProp, setSelectedProp] = useState<Prop | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'prop' as PropCategory,
    description: '',
    status: 'needed' as PropStatus,
    character_id: '',
    location_id: '',
    source_type: '',
    source_name: '',
    source_contact: '',
    source_url: '',
    estimated_cost: '',
    actual_cost: '',
    rental_rate: '',
    rental_duration: '',
    deposit_amount: '',
    quantity_needed: '1',
    quantity_acquired: '0',
    size_info: '',
    color_info: '',
    materials: '',
    rental_start_date: '',
    rental_end_date: '',
    notes: '',
    special_requirements: '',
    priority: 3,
    deadline: '',
  })

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadProps()
      loadStats()
      loadCharacters()
      loadLocations()
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

  async function loadProps() {
    if (!selectedProjectId) return
    
    try {
      setLoading(true)
      const data = await getProps(selectedProjectId)
      setProps(data || [])
    } catch (err: any) {
      console.error('Failed to load props:', err)
      setError(err.message || 'Failed to load props')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    if (!selectedProjectId) return
    
    try {
      const data = await getPropsStats(selectedProjectId)
      setStats(data)
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }

  async function loadCharacters() {
    if (!selectedProjectId) return
    
    try {
      const data = await getCharacters(selectedProjectId)
      setCharacters(data || [])
    } catch (err: any) {
      console.error('Failed to load characters:', err)
    }
  }

  async function loadLocations() {
    if (!selectedProjectId) return
    
    try {
      const data = await getLocations(selectedProjectId)
      setLocations(data || [])
    } catch (err: any) {
      console.error('Failed to load locations:', err)
    }
  }

  function handleCreateClick() {
    setFormData({
      name: '',
      category: 'prop',
      description: '',
      status: 'needed',
      character_id: '',
      location_id: '',
      source_type: '',
      source_name: '',
      source_contact: '',
      source_url: '',
      estimated_cost: '',
      actual_cost: '',
      rental_rate: '',
      rental_duration: '',
      deposit_amount: '',
      quantity_needed: '1',
      quantity_acquired: '0',
      size_info: '',
      color_info: '',
      materials: '',
      rental_start_date: '',
      rental_end_date: '',
      notes: '',
      special_requirements: '',
      priority: 3,
      deadline: '',
    })
    setShowCreateModal(true)
  }

  function handleEditClick(prop: Prop) {
    setSelectedProp(prop)
    setFormData({
      name: prop.name,
      category: prop.category,
      description: prop.description || '',
      status: prop.status,
      character_id: prop.character_id || '',
      location_id: prop.location_id || '',
      source_type: prop.source_type || '',
      source_name: prop.source_name || '',
      source_contact: prop.source_contact || '',
      source_url: prop.source_url || '',
      estimated_cost: prop.estimated_cost?.toString() || '',
      actual_cost: prop.actual_cost?.toString() || '',
      rental_rate: prop.rental_rate?.toString() || '',
      rental_duration: prop.rental_duration?.toString() || '',
      deposit_amount: prop.deposit_amount?.toString() || '',
      quantity_needed: prop.quantity_needed.toString(),
      quantity_acquired: prop.quantity_acquired.toString(),
      size_info: prop.size_info || '',
      color_info: prop.color_info || '',
      materials: prop.materials || '',
      rental_start_date: prop.rental_start_date || '',
      rental_end_date: prop.rental_end_date || '',
      notes: prop.notes || '',
      special_requirements: prop.special_requirements || '',
      priority: prop.priority || 3,
      deadline: prop.deadline || '',
    })
    setShowEditModal(true)
  }

  async function handleCreateProp(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProjectId) return
    
    try {
      setCreating(true)
      setError(null)
      
      await createProp({
        project_id: selectedProjectId,
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
        status: formData.status,
        character_id: formData.character_id || undefined,
        location_id: formData.location_id || undefined,
        source_type: formData.source_type || undefined,
        source_name: formData.source_name || undefined,
        source_contact: formData.source_contact || undefined,
        source_url: formData.source_url || undefined,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined,
        actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : undefined,
        rental_rate: formData.rental_rate ? parseFloat(formData.rental_rate) : undefined,
        rental_duration: formData.rental_duration ? parseInt(formData.rental_duration) : undefined,
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : undefined,
        quantity_needed: parseInt(formData.quantity_needed),
        quantity_acquired: parseInt(formData.quantity_acquired),
        size_info: formData.size_info || undefined,
        color_info: formData.color_info || undefined,
        materials: formData.materials || undefined,
        rental_start_date: formData.rental_start_date || undefined,
        rental_end_date: formData.rental_end_date || undefined,
        notes: formData.notes || undefined,
        special_requirements: formData.special_requirements || undefined,
        priority: formData.priority,
        deadline: formData.deadline || undefined,
      })
      
      setShowCreateModal(false)
      await loadProps()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to create prop:', err)
      setError(err.message || 'Failed to create prop')
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdateProp(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProp) return
    
    try {
      setUpdating(true)
      setError(null)
      
      await updateProp(selectedProp.id, {
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
        status: formData.status,
        character_id: formData.character_id || undefined,
        location_id: formData.location_id || undefined,
        source_type: formData.source_type || undefined,
        source_name: formData.source_name || undefined,
        source_contact: formData.source_contact || undefined,
        source_url: formData.source_url || undefined,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined,
        actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : undefined,
        rental_rate: formData.rental_rate ? parseFloat(formData.rental_rate) : undefined,
        rental_duration: formData.rental_duration ? parseInt(formData.rental_duration) : undefined,
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : undefined,
        quantity_needed: parseInt(formData.quantity_needed),
        quantity_acquired: parseInt(formData.quantity_acquired),
        size_info: formData.size_info || undefined,
        color_info: formData.color_info || undefined,
        materials: formData.materials || undefined,
        rental_start_date: formData.rental_start_date || undefined,
        rental_end_date: formData.rental_end_date || undefined,
        notes: formData.notes || undefined,
        special_requirements: formData.special_requirements || undefined,
        priority: formData.priority,
        deadline: formData.deadline || undefined,
      })
      
      setShowEditModal(false)
      setSelectedProp(null)
      await loadProps()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to update prop:', err)
      setError(err.message || 'Failed to update prop')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDeleteProp(propId: string) {
    if (!confirm('Are you sure you want to delete this prop?')) return
    
    try {
      await deleteProp(propId)
      await loadProps()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to delete prop:', err)
      setError(err.message || 'Failed to delete prop')
    }
  }

  // Filter props
  const filteredProps = props.filter(prop => {
    if (filterCategory !== 'all' && prop.category !== filterCategory) return false
    if (filterStatus !== 'all' && prop.status !== filterStatus) return false
    if (searchTerm && !prop.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !prop.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Props & Costume</h2>
            <p className="text-muted-foreground">
              {selectedProject ? `Props, costumes, makeup, and set dressing for "${selectedProject.title}"` : 'Select a project'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="flex rounded-md border border-input bg-background px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            <button 
              onClick={handleCreateClick}
              disabled={!selectedProjectId}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Item
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No project selected</h3>
            <p className="text-gray-500">Select a project from the dropdown above</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading props...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="grid gap-6 md:grid-cols-4 mb-8">
                <div className="rounded-lg border bg-card shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Items</div>
                  <div className="text-2xl font-bold">{stats.totalProps}</div>
                  <div className="text-xs text-muted-foreground">${stats.totalEstimatedCost.toLocaleString()} estimated</div>
                </div>

                <div className="rounded-lg border bg-card shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">On Set</div>
                  <div className="text-2xl font-bold text-green-600">{stats.byStatus.on_set}</div>
                  <div className="text-xs text-green-600">Ready to use</div>
                </div>

                <div className="rounded-lg border bg-card shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Needed</div>
                  <div className="text-2xl font-bold text-red-600">{stats.byStatus.needed}</div>
                  <div className="text-xs text-red-600">{stats.criticalPropsNeeded} critical</div>
                </div>

                <div className="rounded-lg border bg-card shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Actual Cost</div>
                  <div className="text-2xl font-bold">${stats.totalCost.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{stats.upcomingDeadlines} deadlines this week</div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="rounded-lg border bg-card p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <input
                    type="text"
                    placeholder="Search props..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex rounded-md border border-input bg-background px-4 py-2 focus-visible:outline-none focus-visible:ring-2"
                  />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as PropCategory | 'all')}
                    className="flex rounded-md border border-input bg-background px-4 py-2 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="prop">Props</option>
                    <option value="costume">Costumes</option>
                    <option value="makeup">Makeup</option>
                    <option value="set_dressing">Set Dressing</option>
                    <option value="vehicle">Vehicles</option>
                    <option value="weapon">Weapons</option>
                    <option value="special_fx">Special FX</option>
                    <option value="animal">Animals</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as PropStatus | 'all')}
                    className="flex rounded-md border border-input bg-background px-4 py-2 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="needed">Needed</option>
                    <option value="researching">Researching</option>
                    <option value="sourced">Sourced</option>
                    <option value="ordered">Ordered</option>
                    <option value="purchased">Purchased</option>
                    <option value="rented">Rented</option>
                    <option value="on_set">On Set</option>
                    <option value="returned">Returned</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-md text-sm ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md text-sm ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    List
                  </button>
                  <span className="text-sm text-muted-foreground ml-2">
                    {filteredProps.length} of {props.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Props Grid/List */}
            {filteredProps.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No props yet</h3>
                <p className="text-gray-500 mb-4">Add your first prop to get started</p>
                <button 
                  onClick={handleCreateClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add First Item
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProps.map((prop) => (
                  <div key={prop.id} className="rounded-lg border bg-card shadow-soft p-4 hover:shadow-medium transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{prop.name}</h3>
                        <div className="flex gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[prop.category]}`}>
                            {prop.category.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[prop.status]}`}>
                            {prop.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {prop.priority && prop.priority >= 4 && (
                        <span className="text-red-500 font-bold text-sm">!</span>
                      )}
                    </div>
                    
                    {prop.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{prop.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-muted-foreground">Qty: {prop.quantity_acquired}/{prop.quantity_needed}</span>
                      {prop.estimated_cost && (
                        <span className="font-medium">${prop.estimated_cost.toLocaleString()}</span>
                      )}
                    </div>
                    
                    {prop.deadline && (
                      <div className="text-xs text-orange-600 mb-3">
                        Due: {new Date(prop.deadline).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProp(prop)
                          setShowViewModal(true)
                        }}
                        className="flex-1 px-3 py-1.5 text-sm border border-input bg-background hover:bg-accent rounded-md"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditClick(prop)}
                        className="flex-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-card shadow-soft overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProps.map((prop) => (
                      <tr key={prop.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{prop.name}</div>
                          {prop.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">{prop.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[prop.category]}`}>
                            {prop.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[prop.status]}`}>
                            {prop.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {prop.quantity_acquired}/{prop.quantity_needed}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {prop.estimated_cost ? `$${prop.estimated_cost.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-3">
                          <button 
                            onClick={() => {
                              setSelectedProp(prop)
                              setShowViewModal(true)
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleEditClick(prop)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProp(prop.id)}
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

        {/* Create Modal - Add modal JSX similar to other pages */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-xl font-semibold mb-4">Add New Prop/Item</h3>
              <form onSubmit={handleCreateProp}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as PropCategory})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="prop">Prop</option>
                      <option value="costume">Costume</option>
                      <option value="makeup">Makeup</option>
                      <option value="set_dressing">Set Dressing</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="weapon">Weapon</option>
                      <option value="special_fx">Special FX</option>
                      <option value="animal">Animal</option>
                      <option value="food">Food</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as PropStatus})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="needed">Needed</option>
                      <option value="researching">Researching</option>
                      <option value="sourced">Sourced</option>
                      <option value="ordered">Ordered</option>
                      <option value="purchased">Purchased</option>
                      <option value="rented">Rented</option>
                      <option value="on_set">On Set</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity Needed</label>
                    <input
                      type="number"
                      value={formData.quantity_needed}
                      onChange={(e) => setFormData({...formData, quantity_needed: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.estimated_cost}
                      onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Character</label>
                    <select
                      value={formData.character_id}
                      onChange={(e) => setFormData({...formData, character_id: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">None</option>
                      {characters.map(char => (
                        <option key={char.id} value={char.id}>{char.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <select
                      value={formData.location_id}
                      onChange={(e) => setFormData({...formData, location_id: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">None</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedProp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-xl font-semibold mb-4">Edit: {selectedProp.name}</h3>
              <form onSubmit={handleUpdateProp}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as PropCategory})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="prop">Prop</option>
                      <option value="costume">Costume</option>
                      <option value="makeup">Makeup</option>
                      <option value="set_dressing">Set Dressing</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="weapon">Weapon</option>
                      <option value="special_fx">Special FX</option>
                      <option value="animal">Animal</option>
                      <option value="food">Food</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as PropStatus})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="needed">Needed</option>
                      <option value="researching">Researching</option>
                      <option value="sourced">Sourced</option>
                      <option value="ordered">Ordered</option>
                      <option value="purchased">Purchased</option>
                      <option value="rented">Rented</option>
                      <option value="on_set">On Set</option>
                      <option value="returned">Returned</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity Needed</label>
                    <input
                      type="number"
                      value={formData.quantity_needed}
                      onChange={(e) => setFormData({...formData, quantity_needed: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity Acquired</label>
                    <input
                      type="number"
                      value={formData.quantity_acquired}
                      onChange={(e) => setFormData({...formData, quantity_acquired: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.estimated_cost}
                      onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Actual Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.actual_cost}
                      onChange={(e) => setFormData({...formData, actual_cost: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Deadline</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Character</label>
                    <select
                      value={formData.character_id}
                      onChange={(e) => setFormData({...formData, character_id: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">None</option>
                      {characters.map(char => (
                        <option key={char.id} value={char.id}>{char.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <select
                      value={formData.location_id}
                      onChange={(e) => setFormData({...formData, location_id: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">None</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedProp(null)
                    }}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedProp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-semibold">{selectedProp.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[selectedProp.category]}`}>
                      {selectedProp.category.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[selectedProp.status]}`}>
                      {selectedProp.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedProp(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {selectedProp.description && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">Description</h4>
                    <p className="text-gray-900">{selectedProp.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">Quantity</h4>
                    <p className="text-gray-900">{selectedProp.quantity_acquired} / {selectedProp.quantity_needed}</p>
                  </div>
                  
                  {selectedProp.priority && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Priority</h4>
                      <p className="text-gray-900">{selectedProp.priority} / 5</p>
                    </div>
                  )}

                  {selectedProp.estimated_cost && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Estimated Cost</h4>
                      <p className="text-gray-900">${selectedProp.estimated_cost.toLocaleString()}</p>
                    </div>
                  )}

                  {selectedProp.actual_cost && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Actual Cost</h4>
                      <p className="text-gray-900">${selectedProp.actual_cost.toLocaleString()}</p>
                    </div>
                  )}

                  {selectedProp.deadline && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Deadline</h4>
                      <p className="text-gray-900">{new Date(selectedProp.deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {selectedProp.notes && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">Notes</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedProp.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEditClick(selectedProp)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedProp(null)
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
