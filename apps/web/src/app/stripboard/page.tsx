'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/app-layout'
import { getProjects } from '../../lib/api/projects'
import { 
  getScenes, 
  updateScene, 
  getCharacters, 
  getProps,
  addCharacterToScene,
  addPropToScene,
  removeCharacterFromScene,
  removePropFromScene
} from '../../lib/api/scenes'
import { exportStripboardToPDF } from '../../lib/exportStripboardPDF'
import { generateCallSheet } from '../../lib/generateCallSheet'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  getStripboardViews,
  createStripboardView,
  updateStripboardView,
  deleteStripboardView,
  StripboardView
} from '../../lib/api/stripboard-views'
import { SortableSceneItem } from '../../components/stripboard/SortableSceneItem'

export default function Stripboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [scenes, setScenes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedScene, setSelectedScene] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'scene_number' | 'location' | 'scene_type' | 'time' | 'cast_count' | 'cast_appearances' | 'custom'>('scene_number')
  const [selectedCastMember, setSelectedCastMember] = useState<string | null>(null)
  
  // Stripboard views state
  const [stripboardViews, setStripboardViews] = useState<StripboardView[]>([])
  const [currentView, setCurrentView] = useState<StripboardView | null>(null)
  const [customSceneOrder, setCustomSceneOrder] = useState<string[]>([])
  const [showSaveViewModal, setShowSaveViewModal] = useState(false)
  const [saveViewName, setSaveViewName] = useState('')
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [editingScene, setEditingScene] = useState<any | null>(null)
  const [schedulingScene, setSchedulingScene] = useState<any | null>(null)
  const [updating, setUpdating] = useState(false)
  
  // Cast and Props management
  const [availableCharacters, setAvailableCharacters] = useState<any[]>([])
  const [availableProps, setAvailableProps] = useState<any[]>([])
  const [loadingCastProps, setLoadingCastProps] = useState(false)
  
  // Form data
  const [editFormData, setEditFormData] = useState({
    scene_number: '',
    scene_name: '',
    location_name: '',
    scene_type: 'int' as 'int' | 'ext' | 'int_ext',
    time_of_day: 'day' as 'day' | 'night' | 'dawn' | 'dusk' | 'magic_hour',
    page_count: '',
    description: '',
    estimated_duration: '',
    complexity_rating: 3,
  })
  
  const [scheduleFormData, setScheduleFormData] = useState({
    shoot_date: '',
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'not_scheduled',
  })
  
  // Auto-schedule confirmation
  const [showAutoScheduleDialog, setShowAutoScheduleDialog] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadScenes()
      loadStripboardViews()
    } else {
      setScenes([])
      setStripboardViews([])
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

  async function loadStripboardViews() {
    if (!selectedProjectId) return
    
    try {
      const views = await getStripboardViews(selectedProjectId)
      setStripboardViews(views)
      // Load default view if exists
      const defaultView = views.find(v => v.is_default)
      if (defaultView) {
        setCurrentView(defaultView)
        setCustomSceneOrder(defaultView.scene_order)
        setSortBy('custom')
      }
    } catch (err: any) {
      console.error('Failed to load stripboard views:', err)
    }
  }

  async function loadCharactersAndProps() {
    if (!selectedProjectId) return
    
    try {
      setLoadingCastProps(true)
      const [chars, propsData] = await Promise.all([
        getCharacters(selectedProjectId),
        getProps(selectedProjectId)
      ])
      setAvailableCharacters(chars || [])
      setAvailableProps(propsData || [])
    } catch (err: any) {
      console.error('Failed to load characters/props:', err)
    } finally {
      setLoadingCastProps(false)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    
    const oldIndex = sortedScenes.findIndex(s => s.id === active.id)
    const newIndex = sortedScenes.findIndex(s => s.id === over.id)
    
    const newOrder = arrayMove(sortedScenes, oldIndex, newIndex)
    setCustomSceneOrder(newOrder.map(s => s.id))
    setSortBy('custom')
  }

  async function handleSaveView() {
    if (!selectedProjectId || !saveViewName.trim()) return
    
    try {
      setUpdating(true)
      if (currentView) {
        // Update existing view
        await updateStripboardView(currentView.id, {
          name: saveViewName,
          scene_order: customSceneOrder
        })
      } else {
        // Create new view
        await createStripboardView({
          project_id: selectedProjectId,
          name: saveViewName,
          scene_order: customSceneOrder,
          is_default: stripboardViews.length === 0 // First view is default
        })
      }
      await loadStripboardViews()
      setShowSaveViewModal(false)
      setSaveViewName('')
    } catch (err: any) {
      console.error('Failed to save view:', err)
      setError(err.message || 'Failed to save view')
    } finally {
      setUpdating(false)
    }
  }

  async function handleLoadView(viewId: string) {
    const view = stripboardViews.find(v => v.id === viewId)
    if (!view) return
    
    setCurrentView(view)
    setCustomSceneOrder(view.scene_order)
    setSortBy('custom')
  }

  async function handleEditClick(scene: any, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingScene(scene)
    setEditFormData({
      scene_number: scene.scene_number || '',
      scene_name: scene.scene_name || '',
      location_name: scene.location_name || '',
      scene_type: scene.scene_type || 'int',
      time_of_day: scene.time_of_day || 'day',
      page_count: scene.page_count?.toString() || '',
      description: scene.description || '',
      estimated_duration: scene.estimated_duration?.toString() || '',
      complexity_rating: scene.complexity_rating || 3,
    })
    setShowEditModal(true)
    await loadCharactersAndProps()
  }

  async function handleAddCharacter(characterId: string) {
    if (!editingScene) return
    
    try {
      setUpdating(true)
      await addCharacterToScene(editingScene.id, characterId)
      await loadScenes()
      // Update editing scene with fresh data
      const updatedScene = scenes.find(s => s.id === editingScene.id)
      if (updatedScene) setEditingScene(updatedScene)
    } catch (err: any) {
      console.error('Failed to add character:', err)
      setError(err.message || 'Failed to add character')
    } finally {
      setUpdating(false)
    }
  }

  async function handleRemoveCharacter(sceneCharacterId: string) {
    if (!editingScene) return
    
    try {
      setUpdating(true)
      await removeCharacterFromScene(sceneCharacterId)
      await loadScenes()
      // Update editing scene with fresh data
      const updatedScene = scenes.find(s => s.id === editingScene.id)
      if (updatedScene) setEditingScene(updatedScene)
    } catch (err: any) {
      console.error('Failed to remove character:', err)
      setError(err.message || 'Failed to remove character')
    } finally {
      setUpdating(false)
    }
  }

  async function handleAddProp(propId: string) {
    if (!editingScene) return
    
    try {
      setUpdating(true)
      await addPropToScene(editingScene.id, propId, 1)
      await loadScenes()
      // Update editing scene with fresh data
      const updatedScene = scenes.find(s => s.id === editingScene.id)
      if (updatedScene) setEditingScene(updatedScene)
    } catch (err: any) {
      console.error('Failed to add prop:', err)
      setError(err.message || 'Failed to add prop')
    } finally {
      setUpdating(false)
    }
  }

  async function handleRemoveProp(scenePropId: string) {
    if (!editingScene) return
    
    try {
      setUpdating(true)
      await removePropFromScene(scenePropId)
      await loadScenes()
      // Update editing scene with fresh data
      const updatedScene = scenes.find(s => s.id === editingScene.id)
      if (updatedScene) setEditingScene(updatedScene)
    } catch (err: any) {
      console.error('Failed to remove prop:', err)
      setError(err.message || 'Failed to remove prop')
    } finally {
      setUpdating(false)
    }
  }

  async function handleUpdateScene(e: React.FormEvent) {
    e.preventDefault()
    if (!editingScene) return
    
    try {
      setUpdating(true)
      setError(null)
      
      await updateScene(editingScene.id, {
        scene_number: editFormData.scene_number,
        scene_name: editFormData.scene_name || undefined,
        location_name: editFormData.location_name || undefined,
        scene_type: editFormData.scene_type,
        time_of_day: editFormData.time_of_day,
        page_count: editFormData.page_count ? parseFloat(editFormData.page_count) : undefined,
        description: editFormData.description || undefined,
        estimated_duration: editFormData.estimated_duration ? parseInt(editFormData.estimated_duration) : undefined,
        complexity_rating: editFormData.complexity_rating,
      })
      
      setShowEditModal(false)
      setEditingScene(null)
      await loadScenes()
    } catch (err: any) {
      console.error('Failed to update scene:', err)
      setError(err.message || 'Failed to update scene')
    } finally {
      setUpdating(false)
    }
  }

  function handleScheduleClick(scene: any, e: React.MouseEvent) {
    e.stopPropagation()
    setSchedulingScene(scene)
    setScheduleFormData({
      shoot_date: scene.shoot_date || '',
      status: scene.status || 'scheduled',
    })
    setShowScheduleModal(true)
  }

  async function handleScheduleScene(e: React.FormEvent) {
    e.preventDefault()
    if (!schedulingScene) return
    
    try {
      setUpdating(true)
      setError(null)
      
      // Ensure date is in YYYY-MM-DD format without timezone conversion
      const shootDate = scheduleFormData.shoot_date 
        ? scheduleFormData.shoot_date // Already in YYYY-MM-DD format from input
        : undefined
      
      await updateScene(schedulingScene.id, {
        shoot_date: shootDate,
        status: scheduleFormData.status,
      })
      
      setShowScheduleModal(false)
      setSchedulingScene(null)
      await loadScenes()
    } catch (err: any) {
      console.error('Failed to schedule scene:', err)
      setError(err.message || 'Failed to schedule scene')
    } finally {
      setUpdating(false)
    }
  }

  function handleAutoScheduleClick() {
    const scheduledScenes = scenes.filter(s => s.shoot_date)
    const allScheduled = scheduledScenes.length === scenes.length
    
    if (!allScheduled) {
      setShowAutoScheduleDialog(true)
    } else {
      applyAutoSchedule()
    }
  }

  function applyAutoSchedule() {
    // Sort scenes by shoot_date, with unscheduled scenes at the end
    const sorted = [...scenes].sort((a, b) => {
      // If both have dates, sort by date
      if (a.shoot_date && b.shoot_date) {
        return new Date(a.shoot_date).getTime() - new Date(b.shoot_date).getTime()
      }
      // If only a has a date, it comes first
      if (a.shoot_date) return -1
      // If only b has a date, it comes first
      if (b.shoot_date) return 1
      // If neither has a date, maintain scene number order
      return a.scene_number.localeCompare(b.scene_number)
    })
    
    setCustomSceneOrder(sorted.map(s => s.id))
    setSortBy('custom')
    setShowAutoScheduleDialog(false)
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const getSceneTypeColor = (type: string) => {
    if (type === 'int') {
      return 'from-green-100 to-green-200 border-green-300 text-green-800'
    } else if (type === 'ext') {
      return 'from-orange-100 to-orange-200 border-orange-300 text-orange-800'
    } else {
      return 'from-purple-100 to-purple-200 border-purple-300 text-purple-800'
    }
  }

  const getTimeOfDayColor = (timeOfDay: string) => {
    if (timeOfDay === 'day') {
      return 'from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800'
    } else if (timeOfDay === 'night') {
      return 'from-blue-100 to-blue-200 border-blue-300 text-blue-800'
    } else {
      return 'from-pink-100 to-pink-200 border-pink-300 text-pink-800'
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-status-success bg-status-success/10 border-status-success/20',
      'in-progress': 'text-status-warning bg-status-warning/10 border-status-warning/20',
      scheduled: 'text-status-info bg-status-info/10 border-status-info/20',
      pending: 'text-muted-foreground bg-muted/50 border-muted',
      not_scheduled: 'text-muted-foreground bg-muted/50 border-muted'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  // Sorting function
  const getSortedScenes = () => {
    const scenesCopy = [...scenes]
    
    switch (sortBy) {
      case 'scene_number':
        // Natural sort for scene numbers (handles "1", "2", "10", "3A" etc.)
        return scenesCopy.sort((a, b) => {
          const aNum = a.scene_number.match(/\d+/)?.[0] || '0'
          const bNum = b.scene_number.match(/\d+/)?.[0] || '0'
          const aLetter = a.scene_number.match(/[A-Za-z]+/)?.[0] || ''
          const bLetter = b.scene_number.match(/[A-Za-z]+/)?.[0] || ''
          
          if (parseInt(aNum) !== parseInt(bNum)) {
            return parseInt(aNum) - parseInt(bNum)
          }
          return aLetter.localeCompare(bLetter)
        })
      
      case 'location':
        // Sort by location name, then by scene number
        return scenesCopy.sort((a, b) => {
          const locA = (a.location_name || '').toLowerCase()
          const locB = (b.location_name || '').toLowerCase()
          if (locA !== locB) {
            return locA.localeCompare(locB)
          }
          return a.scene_number.localeCompare(b.scene_number)
        })
      
      case 'scene_type':
        // Sort by scene type (INT, EXT, INT/EXT), then scene number
        const typeOrder = { int: 0, ext: 1, int_ext: 2 }
        return scenesCopy.sort((a, b) => {
          const typeA = typeOrder[a.scene_type as keyof typeof typeOrder] ?? 3
          const typeB = typeOrder[b.scene_type as keyof typeof typeOrder] ?? 3
          if (typeA !== typeB) {
            return typeA - typeB
          }
          return a.scene_number.localeCompare(b.scene_number)
        })
      
      case 'time':
        // Sort by time of day, then scene number
        const timeOrder = { day: 0, dawn: 1, dusk: 2, magic_hour: 3, night: 4 }
        return scenesCopy.sort((a, b) => {
          const timeA = timeOrder[a.time_of_day as keyof typeof timeOrder] ?? 5
          const timeB = timeOrder[b.time_of_day as keyof typeof timeOrder] ?? 5
          if (timeA !== timeB) {
            return timeA - timeB
          }
          return a.scene_number.localeCompare(b.scene_number)
        })
      
      case 'cast_count':
        // Sort by number of cast members (most to least), then scene number
        return scenesCopy.sort((a, b) => {
          const countA = a.scene_characters?.length || 0
          const countB = b.scene_characters?.length || 0
          if (countA !== countB) {
            return countB - countA // Descending
          }
          return a.scene_number.localeCompare(b.scene_number)
        })
      
      case 'cast_appearances':
        // Sort by appearances of selected cast member
        if (!selectedCastMember) return scenesCopy
        
        return scenesCopy.sort((a, b) => {
          const hasA = a.scene_characters?.some((sc: any) => sc.character?.id === selectedCastMember) ? 1 : 0
          const hasB = b.scene_characters?.some((sc: any) => sc.character?.id === selectedCastMember) ? 1 : 0
          if (hasA !== hasB) {
            return hasB - hasA // Scenes with the character first
          }
          return a.scene_number.localeCompare(b.scene_number)
        })
      
      case 'custom':
        // Use custom scene order from drag and drop
        if (customSceneOrder.length === 0) return scenesCopy
        
        return scenesCopy.sort((a, b) => {
          const indexA = customSceneOrder.indexOf(a.id)
          const indexB = customSceneOrder.indexOf(b.id)
          
          // If both are in the custom order, sort by their position
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB
          }
          // If only one is in custom order, it comes first
          if (indexA !== -1) return -1
          if (indexB !== -1) return 1
          // If neither is in custom order, maintain original order
          return 0
        })
      
      default:
        return scenesCopy
    }
  }

  // Get all unique characters from scenes for the cast member selector
  const getAllCharacters = () => {
    const characterMap = new Map()
    scenes.forEach(scene => {
      scene.scene_characters?.forEach((sc: any) => {
        if (sc.character?.id && sc.character?.name) {
          if (!characterMap.has(sc.character.id)) {
            const appearances = scenes.filter(s => 
              s.scene_characters?.some((c: any) => c.character?.id === sc.character.id)
            ).length
            characterMap.set(sc.character.id, {
              id: sc.character.id,
              name: sc.character.name,
              appearances
            })
          }
        }
      })
    })
    return Array.from(characterMap.values()).sort((a, b) => b.appearances - a.appearances)
  }

  const sortedScenes = getSortedScenes()
  const allCharacters = getAllCharacters()

  // Calculate stats from scenes
  const totalPages = scenes.reduce((sum, scene) => sum + (scene.page_count || 0), 0)
  const completedScenes = scenes.filter(s => s.status === 'completed').length
  const inProgressScenes = scenes.filter(s => s.status === 'in_progress' || s.status === 'in-progress').length
  const scheduledScenes = scenes.filter(s => s.status === 'scheduled').length
  const remainingScenes = scenes.filter(s => s.status === 'pending' || s.status === 'not_scheduled').length

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Production Stripboard</h2>
            <p className="text-muted-foreground">
              {selectedProject ? `Interactive scene scheduling and production planning for "${selectedProject.title}"` : 'Select a project to view stripboard'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="flex rounded-md border bg-background px-4 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            <button 
              onClick={() => {
                if (selectedProject) {
                  generateCallSheet(scenes, selectedProject.title)
                }
              }}
              disabled={!selectedProjectId || scenes.filter(s => s.shoot_date).length === 0}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={scenes.filter(s => s.shoot_date).length === 0 ? 'Schedule scenes to generate call sheets' : 'Generate actor call sheets by shoot date'}
            >
              Generate Call Sheet
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
              <span className="text-gray-400 text-3xl">🎬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No project selected</h3>
            <p className="text-gray-500">Select a project from the dropdown above to view its stripboard</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading scenes...</p>
          </div>
        ) : scenes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-400 text-3xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scenes yet</h3>
            <p className="text-gray-500">Add scenes to your project to build the stripboard</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">Total Scenes</div>
                <div className="text-2xl font-bold">{scenes.length}</div>
                <div className="text-xs text-muted-foreground">{totalPages.toFixed(1)} pages total</div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">Completed</div>
                <div className="text-2xl font-bold text-status-success">{completedScenes}</div>
                <div className="text-xs text-status-success">On schedule</div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">In Progress</div>
                <div className="text-2xl font-bold text-status-warning">{inProgressScenes}</div>
                <div className="text-xs text-status-warning">Shooting today</div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">Remaining</div>
                <div className="text-2xl font-bold">{remainingScenes}</div>
                <div className="text-xs text-muted-foreground">To be scheduled</div>
              </div>
            </div>

            {/* Stripboard Controls */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <h3 className="font-semibold">Scene Organization</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <button 
                  onClick={() => { setSortBy('scene_number'); setSelectedCastMember(null); }}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input h-8 px-3 ${
                    sortBy === 'scene_number' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Scene Order
                </button>
                <button 
                  onClick={() => { setSortBy('location'); setSelectedCastMember(null); }}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input h-8 px-3 ${
                    sortBy === 'location' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Location
                </button>
                <button 
                  onClick={() => { setSortBy('scene_type'); setSelectedCastMember(null); }}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input h-8 px-3 ${
                    sortBy === 'scene_type' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  INT/EXT
                </button>
                <button 
                  onClick={() => { setSortBy('time'); setSelectedCastMember(null); }}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input h-8 px-3 ${
                    sortBy === 'time' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Time of Day
                </button>
                <button 
                  onClick={() => { setSortBy('cast_count'); setSelectedCastMember(null); }}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input h-8 px-3 ${
                    sortBy === 'cast_count' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Cast Size
                </button>
                {allCharacters.length > 0 && (
                  <select
                    value={selectedCastMember || ''}
                    onChange={(e) => {
                      setSelectedCastMember(e.target.value || null);
                      if (e.target.value) setSortBy('cast_appearances');
                    }}
                    className={`flex h-8 rounded-md border border-input px-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      sortBy === 'cast_appearances' ? 'bg-primary text-primary-foreground' : 'bg-background'
                    }`}
                  >
                    <option value="">Sort by Cast Member...</option>
                    {allCharacters.map(char => (
                      <option key={char.id} value={char.id}>
                        {char.name} ({char.appearances} scenes)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAutoScheduleClick}
                disabled={scenes.length === 0}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Auto-Schedule
              </button>
              <button 
                onClick={() => exportStripboardToPDF(sortedScenes, { 
                  projectTitle: selectedProject?.title || 'Production Stripboard',
                  includeDetails: true,
                  sortMethod: sortBy
                })}
                disabled={scenes.length === 0}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export PDF
              </button>
            </div>
            </div>
          </div>

            {/* Interactive Stripboard */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Scene Strips</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Strip Color Legend:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-6 rounded bg-gradient-to-r from-green-100 to-green-200 border border-green-300"></div>
                    <span className="text-xs">INT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-6 rounded bg-gradient-to-r from-orange-100 to-orange-200 border border-orange-300"></div>
                    <span className="text-xs">EXT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-6 rounded bg-gradient-to-r from-purple-100 to-purple-200 border border-purple-300"></div>
                    <span className="text-xs">INT/EXT</span>
                  </div>
                </div>
              </div>
              
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortedScenes.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {sortedScenes.map((scene) => (
                      <SortableSceneItem
                        key={scene.id}
                        scene={scene}
                        isSelected={selectedScene === scene.id}
                        onSelect={() => setSelectedScene(selectedScene === scene.id ? null : scene.id)}
                        onEdit={(e) => handleEditClick(scene, e)}
                        onSchedule={(e) => handleScheduleClick(scene, e)}
                        getSceneTypeColor={getSceneTypeColor}
                        getTimeOfDayColor={getTimeOfDayColor}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Drag & Drop Hint */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
              <p className="text-center text-sm text-muted-foreground">
                💡 Drag and drop scene strips to reorder your shooting schedule. 
                Click on scenes to view detailed information and make adjustments.
              </p>
            </div>
          </>
        )}

      {/* Edit Scene Modal */}
        {showEditModal && editingScene && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Edit Scene {editingScene.scene_number}</h3>
              
              <form onSubmit={handleUpdateScene}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scene Number *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.scene_number}
                      onChange={(e) => setEditFormData({ ...editFormData, scene_number: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scene Name</label>
                    <input
                      type="text"
                      value={editFormData.scene_name}
                      onChange={(e) => setEditFormData({ ...editFormData, scene_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editFormData.location_name}
                      onChange={(e) => setEditFormData({ ...editFormData, location_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scene Type *</label>
                    <select
                      value={editFormData.scene_type}
                      onChange={(e) => setEditFormData({ ...editFormData, scene_type: e.target.value as any })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="int">Interior</option>
                      <option value="ext">Exterior</option>
                      <option value="int_ext">Interior/Exterior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time of Day *</label>
                    <select
                      value={editFormData.time_of_day}
                      onChange={(e) => setEditFormData({ ...editFormData, time_of_day: e.target.value as any })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      value={editFormData.page_count}
                      onChange={(e) => setEditFormData({ ...editFormData, page_count: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (min)</label>
                    <input
                      type="number"
                      value={editFormData.estimated_duration}
                      onChange={(e) => setEditFormData({ ...editFormData, estimated_duration: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complexity (1-5)</label>
                    <select
                      value={editFormData.complexity_rating}
                      onChange={(e) => setEditFormData({ ...editFormData, complexity_rating: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Cast Management */}
                  <div className="col-span-2 mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Cast</h4>
                    
                    {/* Current Cast */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Characters</label>
                      <div className="flex flex-wrap gap-2">
                        {editingScene.scene_characters && editingScene.scene_characters.length > 0 ? (
                          editingScene.scene_characters.map((sc: any) => (
                            <span key={sc.id} className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm">
                              {sc.character?.name || 'Unknown'}
                              <button
                                type="button"
                                onClick={() => handleRemoveCharacter(sc.id)}
                                disabled={updating}
                                className="ml-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No characters assigned</span>
                        )}
                      </div>
                    </div>

                    {/* Add Cast */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Character</label>
                      {loadingCastProps ? (
                        <div className="text-sm text-gray-500">Loading characters...</div>
                      ) : (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddCharacter(e.target.value)
                              e.target.value = ''
                            }
                          }}
                          disabled={updating}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="">Select a character to add...</option>
                          {availableCharacters
                            .filter(char => !editingScene.scene_characters?.some((sc: any) => sc.character?.id === char.id))
                            .map(char => (
                              <option key={char.id} value={char.id}>
                                {char.name} {char.character_type ? `(${char.character_type})` : ''}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Props Management */}
                  <div className="col-span-2 mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Props & Equipment</h4>
                    
                    {/* Current Props */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Props</label>
                      <div className="flex flex-wrap gap-2">
                        {editingScene.scene_props && editingScene.scene_props.length > 0 ? (
                          editingScene.scene_props.map((sp: any) => (
                            <span key={sp.id} className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm">
                              {sp.prop?.name || 'Unknown'} {sp.quantity > 1 ? `(×${sp.quantity})` : ''}
                              <button
                                type="button"
                                onClick={() => handleRemoveProp(sp.id)}
                                disabled={updating}
                                className="ml-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No props assigned</span>
                        )}
                      </div>
                    </div>

                    {/* Add Props */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Prop</label>
                      {loadingCastProps ? (
                        <div className="text-sm text-gray-500">Loading props...</div>
                      ) : (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddProp(e.target.value)
                              e.target.value = ''
                            }
                          }}
                          disabled={updating}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="">Select a prop to add...</option>
                          {availableProps
                            .filter(prop => !editingScene.scene_props?.some((sp: any) => sp.prop?.id === prop.id))
                            .map(prop => (
                              <option key={prop.id} value={prop.id}>
                                {prop.name} {prop.category ? `(${prop.category})` : ''}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingScene(null)
                    }}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={updating}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Auto-Schedule Confirmation Dialog */}
        {showAutoScheduleDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Auto-Schedule Confirmation</h3>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Not all scenes have been scheduled. Do you still want to organize currently scheduled scenes by their shoot dates?
                  </p>
                  <p className="text-xs text-yellow-700 mt-2">
                    Scheduled scenes: <strong>{scenes.filter(s => s.shoot_date).length} of {scenes.length}</strong>
                  </p>
                </div>
                
                <p className="text-sm text-gray-600">
                  Scenes with shoot dates will be organized chronologically. Unscheduled scenes will appear at the end in their current scene number order.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowAutoScheduleDialog(false)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={applyAutoSchedule}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Scene Modal */}
        {showScheduleModal && schedulingScene && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Schedule Scene {schedulingScene.scene_number}</h3>
              
              <form onSubmit={handleScheduleScene}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shoot Date</label>
                    <input
                      type="date"
                      value={scheduleFormData.shoot_date}
                      onChange={(e) => {
                        const newData = { ...scheduleFormData, shoot_date: e.target.value }
                        // Auto-set status to 'scheduled' when a date is selected
                        if (e.target.value && scheduleFormData.status === 'not_scheduled') {
                          newData.status = 'scheduled'
                        }
                        setScheduleFormData(newData)
                      }}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={scheduleFormData.status}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, status: e.target.value as any })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="not_scheduled">Not Scheduled</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Scene:</strong> {schedulingScene.scene_name || `Scene ${schedulingScene.scene_number}`}
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>Location:</strong> {schedulingScene.location_name || 'No location'}
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>Estimated Duration:</strong> {schedulingScene.estimated_duration || 0} minutes
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowScheduleModal(false)
                      setSchedulingScene(null)
                    }}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={updating}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Saving...' : 'Save Schedule'}
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
