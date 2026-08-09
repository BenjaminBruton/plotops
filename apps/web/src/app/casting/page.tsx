'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/app-layout'
import { getProjects } from '../../lib/api/projects'
import { getCharacters } from '../../lib/api/characters'
import { 
  getActors, 
  createActor, 
  assignActorToCharacter,
  removeActorFromCharacter,
  getCharacterCastingByCharacterId,
  type Actor,
  type ActorInput,
  type CharacterCasting
} from '../../lib/api/casting'
import {
  publishCastingCall,
  getProjectCastingCall,
  type CrewPosition
} from '../../lib/api/public-casting'
import { getBasicProject } from '../../lib/api/projects'
import {
  getAuditionsByStage,
  createAudition,
  moveAuditionStage,
  deleteAudition,
  type AuditionStage,
  type AuditionWithDetails
} from '../../lib/api/auditions'

interface Character {
  id: string
  name: string
  description?: string
  age_range?: string
  gender?: string
  ethnicity?: string
  character_type?: string
  wardrobe_notes?: string
  makeup_notes?: string
  special_requirements?: string
}

interface CharacterWithCasting extends Character {
  casting?: (CharacterCasting & { actor?: Actor }) | null
}

export default function Casting() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [characters, setCharacters] = useState<CharacterWithCasting[]>([])
  const [actors, setActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(true)
  const [showActorModal, setShowActorModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showApplicantModal, setShowApplicantModal] = useState(false)
  const [showEditAuditionModal, setShowEditAuditionModal] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [selectedAudition, setSelectedAudition] = useState<AuditionWithDetails | null>(null)
  const [currentProject, setCurrentProject] = useState<any>(null)
  const [charactersCollapsed, setCharactersCollapsed] = useState(false)
  const [auditionsByStage, setAuditionsByStage] = useState<Record<AuditionStage, AuditionWithDetails[]>>({
    submitted: [],
    reviewing: [],
    callback: [],
    cast: [],
    rejected: []
  })
  const [applicantForm, setApplicantForm] = useState<{
    actorId: string
    characterId: string
    stage: AuditionStage
    notes: string
  }>({
    actorId: '',
    characterId: '',
    stage: 'submitted',
    notes: ''
  })
  const [newActor, setNewActor] = useState<ActorInput>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age_range: ''
  })
  
  // Publish form state
  const [publishForm, setPublishForm] = useState({
    isAnonymous: false,
    selectedCharacters: [] as string[],
    crewPositions: [] as CrewPosition[]
  })

  useEffect(() => {
    loadProjects()
    loadActors()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadCharacters()
      loadAuditions()
    }
  }, [selectedProjectId])

  async function loadProjects() {
    try {
      setLoading(true)
      const data = await getProjects()
      setProjects(data || [])
      // Auto-select first project if available
      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCharacters() {
    if (!selectedProjectId) return
    
    try {
      const data = await getCharacters(selectedProjectId)
      
      // Load casting info for each character
      const charactersWithCasting = await Promise.all(
        (data || []).map(async (char: Character) => {
          try {
            const casting = await getCharacterCastingByCharacterId(char.id)
            return { ...char, casting }
          } catch {
            return char
          }
        })
      )
      
      setCharacters(charactersWithCasting)
    } catch (error) {
      console.error('Failed to load characters:', error)
    }
  }

  async function loadActors() {
    try {
      const data = await getActors()
      setActors(data || [])
    } catch (error) {
      console.error('Failed to load actors:', error)
    }
  }

  async function loadAuditions() {
    if (!selectedProjectId) return
    
    try {
      const data = await getAuditionsByStage(selectedProjectId)
      setAuditionsByStage(data)
    } catch (error) {
      console.error('Failed to load auditions:', error)
    }
  }

  async function handleAddApplicant() {
    if (!selectedProjectId || !applicantForm.actorId || !applicantForm.characterId) return
    
    try {
      await createAudition({
        project_id: selectedProjectId,
        actor_id: applicantForm.actorId,
        character_id: applicantForm.characterId,
        stage: applicantForm.stage,
        notes: applicantForm.notes
      })
      
      await loadAuditions()
      setShowApplicantModal(false)
      setApplicantForm({
        actorId: '',
        characterId: '',
        stage: 'submitted',
        notes: ''
      })
    } catch (error) {
      console.error('Failed to add applicant:', error)
      alert('Failed to add applicant to audition pipeline')
    }
  }

  async function handleMoveAudition(auditionId: string, newStage: AuditionStage) {
    try {
      await moveAuditionStage(auditionId, newStage)
      await loadAuditions()
    } catch (error) {
      console.error('Failed to move audition:', error)
      alert('Failed to move applicant')
    }
  }

  async function handleDeleteAudition(auditionId: string) {
    if (!confirm('Remove this applicant from the audition pipeline?')) return
    
    try {
      await deleteAudition(auditionId)
      await loadAuditions()
    } catch (error) {
      console.error('Failed to delete audition:', error)
      alert('Failed to remove applicant')
    }
  }

  async function handleCreateActor() {
    try {
      await createActor(newActor)
      await loadActors()
      setShowActorModal(false)
      setNewActor({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        age_range: ''
      })
    } catch (error) {
      console.error('Failed to create actor:', error)
      alert('Failed to create actor')
    }
  }

  async function handleAssignActor(actorId: string) {
    if (!selectedCharacter) return
    
    try {
      await assignActorToCharacter({
        character_id: selectedCharacter.id,
        actor_id: actorId,
        contract_signed: false
      })
      await loadCharacters()
      setShowAssignModal(false)
      setSelectedCharacter(null)
    } catch (error: any) {
      console.error('Failed to assign actor:', error)
      const errorMessage = error?.message || 'Unknown error'
      const errorDetails = error?.details || error?.hint || ''
      alert(`Failed to assign actor to role:\n\n${errorMessage}\n${errorDetails}`)
    }
  }

  async function handleRemoveActor(characterId: string) {
    if (!confirm('Are you sure you want to remove this actor from the role?')) return
    
    try {
      await removeActorFromCharacter(characterId)
      await loadCharacters()
    } catch (error) {
      console.error('Failed to remove actor:', error)
      alert('Failed to remove actor')
    }
  }

  const openAssignModal = (character: Character) => {
    setSelectedCharacter(character)
    setShowAssignModal(true)
  }

  // Kanban board stages
  const auditionStages = [
    { id: 'submitted', title: 'Submitted', color: 'bg-blue-50 border-blue-200' },
    { id: 'reviewing', title: 'Under Review', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'callback', title: 'Callback', color: 'bg-purple-50 border-purple-200' },
    { id: 'cast', title: 'Cast', color: 'bg-green-50 border-green-200' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-50 border-red-200' }
  ]

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Casting Management</h2>
            <p className="text-muted-foreground">Assign actors to character roles</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Project Selector */}
            {projects.length > 0 && (
              <select
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            )}
            <button 
              onClick={() => setShowPublishModal(true)}
              disabled={!selectedProjectId || characters.length === 0}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-medium h-10 px-4 py-2"
            >
              📢 Publish Casting Call
            </button>
            <button 
              onClick={() => setShowActorModal(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2"
            >
              + Add Actor
            </button>
          </div>
        </div>

        {/* Characters Grid */}
        {characters.length === 0 ? (
          <div className="text-center py-12 mb-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-400 text-3xl">🎭</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No characters yet</h3>
            <p className="text-gray-500 mb-4">Import characters from your script breakdown to start casting</p>
            <Link 
              href="/script-breakdown"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Script Breakdown
            </Link>
          </div>
        ) : (
          <div className="mb-8">
            {/* Collapsible Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">Character Roles</h3>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-muted">
                  {characters.length} {characters.length === 1 ? 'Role' : 'Roles'}
                </span>
              </div>
              <button
                onClick={() => setCharactersCollapsed(!charactersCollapsed)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {charactersCollapsed ? (
                  <>
                    <span>Show Characters</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Hide Characters</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Collapsible Content */}
            {!charactersCollapsed && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <div key={character.id} className="rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-medium transition-all duration-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{character.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {character.character_type && (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-primary text-primary-foreground">
                          {character.character_type}
                        </span>
                      )}
                      {character.age_range && (
                        <span className="text-xs text-muted-foreground">{character.age_range}</span>
                      )}
                      {character.gender && (
                        <span className="text-xs text-muted-foreground">{character.gender}</span>
                      )}
                    </div>
                    {character.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{character.description}</p>
                    )}
                  </div>
                </div>

                {/* Casting Status */}
                {character.casting?.actor ? (
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">CAST</span>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        character.casting.contract_signed
                          ? 'border-transparent bg-status-success/20 text-status-success'
                          : 'border-transparent bg-status-warning/20 text-status-warning'
                      }`}>
                        {character.casting.contract_signed ? 'Signed' : 'Unsigned'}
                      </span>
                    </div>
                    <p className="font-medium text-sm">
                      {character.casting.actor.first_name} {character.casting.actor.last_name}
                    </p>
                    {character.casting.actor.email && (
                      <p className="text-xs text-muted-foreground mt-1">{character.casting.actor.email}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted/20 rounded-lg p-3 mb-3 border-2 border-dashed border-muted-foreground/25">
                    <p className="text-sm text-muted-foreground text-center">No actor assigned</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {character.casting?.actor ? (
                    <>
                      <button 
                        onClick={() => openAssignModal(character)}
                        className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      >
                        Change Actor
                      </button>
                      <button 
                        onClick={() => handleRemoveActor(character.id)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-destructive hover:text-destructive-foreground h-9 px-3"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => openAssignModal(character)}
                      className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                    >
                      Assign Actor
                    </button>
                  )}
                </div>
              </div>
            ))}
              </div>
            )}
          </div>
        )}

        {/* Audition Pipeline Kanban Board */}
        {characters.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Audition Pipeline</h3>
              <button 
                onClick={() => setShowApplicantModal(true)}
                disabled={actors.length === 0 || characters.length === 0}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-10 px-4"
              >
                + Add Applicant
              </button>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="grid grid-cols-5 gap-4 min-h-[400px]">
                {auditionStages.map((stage) => (
                  <div key={stage.id} className="flex flex-col">
                    <div className={`rounded-lg border p-3 mb-4 ${stage.color}`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{stage.title}</h4>
                        <span className="text-xs bg-white px-2 py-1 rounded-full font-medium">
                          {auditionsByStage[stage.id as AuditionStage]?.length || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Auditions display */}
                    <div className="flex-1 space-y-3">
                      {auditionsByStage[stage.id as AuditionStage]?.length > 0 ? (
                        auditionsByStage[stage.id as AuditionStage].map((audition) => {
                          const currentStageIndex = auditionStages.findIndex(s => s.id === audition.stage)
                          const canMoveLeft = currentStageIndex > 0
                          const canMoveRight = currentStageIndex < auditionStages.length - 1
                          
                          return (
                            <div key={audition.id} className="rounded-lg border bg-background p-3 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {audition.actor?.first_name} {audition.actor?.last_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {audition.character?.name}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteAudition(audition.id)}
                                  className="text-muted-foreground hover:text-destructive text-xs"
                                  title="Remove from pipeline"
                                >
                                  ✕
                                </button>
                              </div>
                              {audition.notes && (
                                <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-2">{audition.notes}</p>
                              )}
                              {/* Quick move buttons */}
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                                <button
                                  onClick={() => canMoveLeft && handleMoveAudition(audition.id, auditionStages[currentStageIndex - 1].id as AuditionStage)}
                                  disabled={!canMoveLeft}
                                  className="flex-1 text-xs px-2 py-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={canMoveLeft ? `Move to ${auditionStages[currentStageIndex - 1].title}` : 'Cannot move left'}
                                >
                                  ←
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAudition(audition)
                                    setShowEditAuditionModal(true)
                                  }}
                                  className="flex-1 text-xs px-2 py-1 rounded hover:bg-accent font-medium"
                                  title="Edit audition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => canMoveRight && handleMoveAudition(audition.id, auditionStages[currentStageIndex + 1].id as AuditionStage)}
                                  disabled={!canMoveRight}
                                  className="flex-1 text-xs px-2 py-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={canMoveRight ? `Move to ${auditionStages[currentStageIndex + 1].title}` : 'Cannot move right'}
                                >
                                  →
                                </button>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                          <p className="text-sm text-muted-foreground">No auditions yet</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stage.id === 'submitted' ? 'Click "Add Applicant" to start' : 'Drag cards here'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Actor Modal */}
        {showActorModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Add New Actor</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input
                      type="text"
                      value={newActor.first_name}
                      onChange={(e) => setNewActor({ ...newActor, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={newActor.last_name}
                      onChange={(e) => setNewActor({ ...newActor, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={newActor.email || ''}
                    onChange={(e) => setNewActor({ ...newActor, email: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newActor.phone || ''}
                    onChange={(e) => setNewActor({ ...newActor, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Age Range</label>
                  <input
                    type="text"
                    value={newActor.age_range || ''}
                    onChange={(e) => setNewActor({ ...newActor, age_range: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., 25-35"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowActorModal(false)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateActor}
                  disabled={!newActor.first_name || !newActor.last_name}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-10 px-4"
                >
                  Add Actor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Publish Casting Call Modal */}
        {showPublishModal && selectedProjectId && (
          <PublishCastingCallModal
            projectId={selectedProjectId}
            characters={characters}
            onClose={() => setShowPublishModal(false)}
            onSuccess={() => {
              setShowPublishModal(false)
              alert('Casting call published successfully! It is now visible on the public job board.')
            }}
          />
        )}

        {/* Assign Actor Modal */}
        {showAssignModal && selectedCharacter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-2">Assign Actor to {selectedCharacter.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">Select an actor from the list or add a new one</p>
              
              <div className="space-y-2 mb-4">
                {actors.map((actor) => (
                  <div
                    key={actor.id}
                    onClick={() => handleAssignActor(actor.id)}
                    className="p-4 border border-input rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {actor.first_name} {actor.last_name}
                          {actor.stage_name && <span className="text-sm text-muted-foreground ml-2">({actor.stage_name})</span>}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          {actor.age_range && <span>{actor.age_range}</span>}
                          {actor.email && <span>{actor.email}</span>}
                        </div>
                      </div>
                      <button className="text-primary hover:text-primary/80 font-medium text-sm">
                        Select →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedCharacter(null)
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Audition Modal */}
        {showEditAuditionModal && selectedAudition && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Edit Audition</h3>
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-3 border">
                  <p className="text-sm font-medium">
                    {selectedAudition.actor?.first_name} {selectedAudition.actor?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedAudition.character?.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    value={selectedAudition.stage}
                    onChange={(e) => setSelectedAudition({ ...selectedAudition, stage: e.target.value as AuditionStage })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="reviewing">Under Review</option>
                    <option value="callback">Callback</option>
                    <option value="cast">Cast</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={selectedAudition.notes || ''}
                    onChange={(e) => setSelectedAudition({ ...selectedAudition, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={4}
                    placeholder="Add notes about this audition..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => {
                    setShowEditAuditionModal(false)
                    setSelectedAudition(null)
                  }} 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await moveAuditionStage(selectedAudition.id, selectedAudition.stage)
                      await loadAuditions()
                      setShowEditAuditionModal(false)
                      setSelectedAudition(null)
                    } catch (error) {
                      console.error('Failed to update audition:', error)
                      alert('Failed to update audition')
                    }
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Applicant Modal */}
        {showApplicantModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Add Applicant to Pipeline</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Actor *</label>
                  <select
                    value={applicantForm.actorId}
                    onChange={(e) => setApplicantForm({ ...applicantForm, actorId: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Choose an actor...</option>
                    {actors.map((actor) => (
                      <option key={actor.id} value={actor.id}>
                        {actor.first_name} {actor.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Character *</label>
                  <select
                    value={applicantForm.characterId}
                    onChange={(e) => setApplicantForm({ ...applicantForm, characterId: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Choose a character...</option>
                    {characters.map((char) => (
                      <option key={char.id} value={char.id}>{char.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Initial Stage</label>
                  <select
                    value={applicantForm.stage}
                    onChange={(e) => setApplicantForm({ ...applicantForm, stage: e.target.value as AuditionStage })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="reviewing">Under Review</option>
                    <option value="callback">Callback</option>
                    <option value="cast">Cast</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea
                    value={applicantForm.notes}
                    onChange={(e) => setApplicantForm({ ...applicantForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={3}
                    placeholder="Add any notes about this audition..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowApplicantModal(false)} 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddApplicant}
                  disabled={!applicantForm.actorId || !applicantForm.characterId}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-10 px-4"
                >
                  Add to Pipeline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

// Publish Casting Call Modal Component
function PublishCastingCallModal({
  projectId,
  characters,
  onClose,
  onSuccess
}: {
  projectId: string
  characters: CharacterWithCasting[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    isAnonymous: false,
    description: '',
    selectedCharacters: [] as string[],
    crewPositions: [] as { role: string; count: number }[],
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  })

  const availableCrewRoles = [
    'Production Assistant', 'Grip', 'Director', 'Director of Photography',
    'Producer', 'Electrician', 'Practical Effects', 'SFX', 'Makeup Artist',
    'Assistant Director', 'Script Supervisor', 'Sound Mixer', 'Boom Operator',
    'Gaffer', 'Key Grip', 'Art Director', 'Production Designer', 'Wardrobe',
    'Hair Stylist', 'Editor', 'Colorist', 'VFX Artist', 'Composer'
  ]

  useEffect(() => {
    loadProjectData()
  }, [projectId])

  async function loadProjectData() {
    try {
      setLoading(true)
      console.log('Loading project data for projectId:', projectId)
      const data = await getBasicProject(projectId)
      console.log('Project data loaded:', data)
      
      if (!data) {
        console.error('getProject returned null/undefined')
        alert('Failed to load project data. The project may not exist.')
        return
      }
      
      setProject(data)
      // Pre-fill description with project logline/synopsis
      setFormData(prev => ({
        ...prev,
        description: data.synopsis || data.logline || ''
      }))
    } catch (error: any) {
      console.error('Failed to load project:', error)
      alert(`Failed to load project: ${error?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleCharacter = (characterId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCharacters: prev.selectedCharacters.includes(characterId)
        ? prev.selectedCharacters.filter(id => id !== characterId)
        : [...prev.selectedCharacters, characterId]
    }))
  }

  const toggleCrewRole = (role: string) => {
    setFormData(prev => {
      const exists = prev.crewPositions.find(p => p.role === role)
      if (exists) {
        return {
          ...prev,
          crewPositions: prev.crewPositions.filter(p => p.role !== role)
        }
      } else {
        return {
          ...prev,
          crewPositions: [...prev.crewPositions, { role, count: 1 }]
        }
      }
    })
  }

  const updateCrewCount = (role: string, count: number) => {
    setFormData(prev => ({
      ...prev,
      crewPositions: prev.crewPositions.map(p =>
        p.role === role ? { ...p, count } : p
      )
    }))
  }

  async function handlePublish() {
    if (!project) {
      console.error('No project data available')
      alert('Error: Project data not loaded')
      return
    }
    
    console.log('Publishing casting call with data:', {
      project_id: projectId,
      title: formData.isAnonymous ? 'Film Production Casting Call' : project.title,
      is_anonymous: formData.isAnonymous,
      description: formData.description,
      selectedCharacters: formData.selectedCharacters,
      crewPositions: formData.crewPositions
    })
    
    try {
      setSubmitting(true)
      
      const result = await publishCastingCall({
        project_id: projectId,
        title: formData.isAnonymous ? 'Film Production Casting Call' : project.title,
        is_anonymous: formData.isAnonymous,
        description: formData.description,
        logline: project.logline,
        shooting_start_date: project.start_date,
        shooting_end_date: project.end_date,
        shooting_locations: [], // Would come from locations table in future
        crew_positions: formData.crewPositions,
        character_ids: formData.selectedCharacters,
        contact_name: formData.contactName,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone
      })
      
      console.log('Casting call published successfully:', result)
      onSuccess()
    } catch (error: any) {
      console.error('Failed to publish casting call:', error)
      
      // Display detailed error message
      const errorMessage = error?.message || 'Unknown error'
      const errorDetails = error?.details || error?.hint || ''
      const errorCode = error?.code || ''
      
      alert(`Failed to publish casting call:\n\n${errorMessage}\n\nDetails: ${errorDetails}\n\nCode: ${errorCode}\n\nCheck browser console for more info.`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg shadow-lg p-6">
          <p>Loading project data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full my-8">
        <div className="p-6 border-b sticky top-0 bg-background z-10 rounded-t-lg">
          <h3 className="text-2xl font-semibold">Publish Casting Call</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Make your project visible on the public job board for actors and crew to apply
          </p>
        </div>
        
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Project Info */}
          <div className="bg-muted/30 rounded-lg p-4 border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{project?.title}</h4>
                {project?.logline && (
                  <p className="text-sm text-muted-foreground mt-1">{project.logline}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  {project?.genre && (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      {project.genre}
                    </span>
                  )}
                  {project?.start_date && (
                    <span className="text-muted-foreground">
                      📅 Shooting: {new Date(project.start_date).toLocaleDateString()}
                      {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString()}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-input"
            />
            <div className="flex-1">
              <label htmlFor="anonymous" className="font-medium cursor-pointer">
                Post Anonymously
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Hide the film title and your production company name from the public listing
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-2">Description / Synopsis</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]"
              placeholder="Describe your project, shooting schedule, and what you're looking for..."
            />
          </div>

          {/* Contact Information */}
          <div className="bg-muted/30 rounded-lg p-4 border">
            <h4 className="font-semibold mb-3">Contact Information</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Provide contact details for actors and crew to reach you
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name *</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="casting@production.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Characters Selection */}
          <div>
            <h4 className="font-semibold mb-3">Characters Open for Casting</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Select which character roles you want to include in the public casting call
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {characters.map((character) => (
                <div
                  key={character.id}
                  onClick={() => toggleCharacter(character.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.selectedCharacters.includes(character.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.selectedCharacters.includes(character.id)}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{character.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {character.character_type && <span>{character.character_type}</span>}
                        {character.age_range && <span>• {character.age_range}</span>}
                        {character.gender && <span>• {character.gender}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crew Positions */}
          <div>
            <h4 className="font-semibold mb-3">Crew Positions Needed</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Select which crew positions you're hiring for
            </p>
            <div className="grid gap-2 md:grid-cols-3">
              {availableCrewRoles.map((role) => {
                const position = formData.crewPositions.find(p => p.role === role)
                return (
                  <div key={role} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`crew-${role}`}
                      checked={!!position}
                      onChange={() => toggleCrewRole(role)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`crew-${role}`} className="flex-1 text-sm cursor-pointer">
                      {role}
                    </label>
                    {position && (
                      <input
                        type="number"
                        min="1"
                        value={position.count}
                        onChange={(e) => updateCrewCount(role, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-input rounded text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/30 rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">Publishing Summary</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>✓ {formData.selectedCharacters.length} character role(s) selected</p>
              <p>✓ {formData.crewPositions.length} crew position(s) selected</p>
              <p>✓ Visible on public job board at /jobs</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-background rounded-b-lg">
          <button
            onClick={onClose}
            disabled={submitting}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={submitting || (formData.selectedCharacters.length === 0 && formData.crewPositions.length === 0) || !formData.contactName || !formData.contactEmail}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed h-10 px-6"
          >
            {submitting ? 'Publishing...' : '📢 Publish Casting Call'}
          </button>
        </div>
      </div>
    </div>
  )
}
