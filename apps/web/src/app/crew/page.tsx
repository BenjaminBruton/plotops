'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../../components/layout/app-layout'
import { supabase } from '../../lib/supabase'

const DEPARTMENTS = [
  { value: 'camera', label: 'Camera' },
  { value: 'sound', label: 'Sound' },
  { value: 'grip', label: 'Grip' },
  { value: 'electric', label: 'Electric/Lighting' },
  { value: 'art', label: 'Art Department' },
  { value: 'wardrobe', label: 'Wardrobe/Costume' },
  { value: 'makeup', label: 'Hair & Makeup' },
  { value: 'props', label: 'Props' },
  { value: 'production', label: 'Production' },
  { value: 'post_production', label: 'Post-Production' },
  { value: 'other', label: 'Other' }
]

const COMMON_POSITIONS = {
  camera: ['Director of Photography', '1st AC', '2nd AC', 'Camera Operator', 'DIT'],
  sound: ['Sound Mixer', 'Boom Operator', 'Sound Assistant'],
  grip: ['Key Grip', 'Best Boy Grip', 'Dolly Grip'],
  electric: ['Gaffer', 'Best Boy Electric', 'Electrician'],
  art: ['Production Designer', 'Art Director', 'Set Decorator'],
  wardrobe: ['Costume Designer', 'Wardrobe Supervisor', 'Costumer'],
  makeup: ['Key Makeup Artist', 'Key Hair Stylist', 'Makeup Assistant'],
  props: ['Props Master', 'Assistant Props'],
  production: ['Line Producer', 'Production Manager', '1st AD', '2nd AD', 'PA'],
  post_production: ['Editor', 'Assistant Editor', 'Colorist', 'Sound Designer'],
  other: ['Other Position']
}

export default function CrewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [crewMembers, setCrewMembers] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'camera',
    position: '',
    status: 'confirmed',
    rate_type: 'daily',
    rate_amount: '',
    notes: ''
  })

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      loadCrewMembers()
    }
  }, [selectedProject])

  async function loadProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
      if (data && data.length > 0) {
        setSelectedProject(data[0].id)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCrewMembers() {
    if (!selectedProject) return

    try {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .eq('project_id', selectedProject)
        .order('department, position')

      if (error) throw error
      setCrewMembers(data || [])
    } catch (error) {
      console.error('Error loading crew:', error)
    }
  }

  async function handleAddCrew(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('crew_members')
        .insert([{
          project_id: selectedProject,
          ...formData,
          rate_amount: formData.rate_amount ? parseFloat(formData.rate_amount) : null
        }])

      if (error) throw error

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: 'camera',
        position: '',
        status: 'confirmed',
        rate_type: 'daily',
        rate_amount: '',
        notes: ''
      })
      setShowAddForm(false)
      loadCrewMembers()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function deleteCrew(id: string) {
    if (!confirm('Remove this crew member?')) return

    try {
      const { error } = await supabase
        .from('crew_members')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadCrewMembers()
    } catch (error: any) {
      alert(error.message)
    }
  }

  // Group crew by department
  const crewByDepartment = crewMembers.reduce((acc: Record<string, any[]>, member: any) => {
    if (!acc[member.department]) {
      acc[member.department] = []
    }
    acc[member.department].push(member)
    return acc
  }, {} as Record<string, any[]>)

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Crew Management</h1>
            <p className="text-muted-foreground">
              {selectedProject && projects.find(p => p.id === selectedProject) 
                ? `Crew for "${projects.find(p => p.id === selectedProject)?.title}"`
                : 'Select a project to manage crew'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background min-w-[200px]"
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 whitespace-nowrap"
            >
              + Add Crew Member
            </button>
          </div>
        </div>

        {/* Add Crew Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add Crew Member</h2>
              <form onSubmit={handleAddCrew} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Department *</label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value, position: '' })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Position *</label>
                    <select
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select a position...</option>
                      {COMMON_POSITIONS[formData.department as keyof typeof COMMON_POSITIONS]?.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rate Type</label>
                    <select
                      value={formData.rate_type}
                      onChange={(e) => setFormData({ ...formData, rate_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="flat">Flat Rate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rate Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rate_amount}
                      onChange={(e) => setFormData({ ...formData, rate_amount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border rounded-md hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Add Crew Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Department Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedDepartment(null)}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              selectedDepartment === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            All Departments ({crewMembers.length})
          </button>
          {DEPARTMENTS.map(dept => {
            const count = crewByDepartment[dept.value]?.length || 0
            return (
              <button
                key={dept.value}
                onClick={() => setSelectedDepartment(dept.value)}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${
                  selectedDepartment === dept.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {dept.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Crew List */}
        {crewMembers.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground mb-4">No crew members yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Add First Crew Member
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {DEPARTMENTS.filter(dept => 
              selectedDepartment === null || selectedDepartment === dept.value
            ).map(dept => {
              const deptCrew = crewByDepartment[dept.value] || []
              if (deptCrew.length === 0 && selectedDepartment !== null) return null

              return (
                <div key={dept.value} className="bg-card rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {dept.label} ({deptCrew.length})
                  </h3>
                  <div className="space-y-2">
                    {deptCrew.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">
                              {member.first_name} {member.last_name}
                            </h4>
                            <span className={`px-2 py-1 rounded text-xs ${
                              member.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {member.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.position}</p>
                          {(member.email || member.phone) && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {member.email && <span>{member.email}</span>}
                              {member.email && member.phone && <span> • </span>}
                              {member.phone && <span>{member.phone}</span>}
                            </p>
                          )}
                          {member.rate_amount && (
                            <p className="text-sm text-muted-foreground">
                              ${member.rate_amount} / {member.rate_type}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteCrew(member.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
