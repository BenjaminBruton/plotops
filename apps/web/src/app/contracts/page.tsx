'use client'

import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/app-layout'
import { getProjects } from '../../lib/api/projects'
import { 
  getContracts, 
  createContract, 
  updateContract, 
  deleteContract,
  getContractStats,
  type Contract,
  type ContractType,
  type ContractStatus 
} from '../../lib/api/contracts'
import { getActors } from '../../lib/api/casting'
import { getCharacters } from '../../lib/api/scenes'

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-300',
  pending_signature: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  signed: 'bg-blue-100 text-blue-800 border-blue-300',
  countersigned: 'bg-purple-100 text-purple-800 border-purple-300',
  executed: 'bg-green-100 text-green-800 border-green-300',
  expired: 'bg-red-100 text-red-800 border-red-300',
  terminated: 'bg-red-100 text-red-800 border-red-300',
}

const typeColors = {
  actor: 'bg-blue-50 text-blue-700',
  crew: 'bg-green-50 text-green-700',
  vendor: 'bg-purple-50 text-purple-700',
  location: 'bg-orange-50 text-orange-700',
  other: 'bg-gray-50 text-gray-700',
}

export default function ContractsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [filterType, setFilterType] = useState<ContractType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<ContractStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  
  // Available data for dropdowns
  const [actors, setActors] = useState<any[]>([])
  const [characters, setCharacters] = useState<any[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    contract_type: 'actor' as ContractType,
    title: '',
    description: '',
    actor_id: '',
    character_id: '',
    vendor_name: '',
    contracting_party_name: '',
    contracting_party_email: '',
    contracting_party_phone: '',
    status: 'draft' as ContractStatus,
    start_date: '',
    end_date: '',
    contract_amount: '',
    currency: 'USD',
    payment_schedule: '',
    notes: '',
    terms_and_conditions: '',
  })

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadContracts()
      loadStats()
      loadActors()
      loadCharacters()
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

  async function loadContracts() {
    if (!selectedProjectId) return
    
    try {
      setLoading(true)
      const data = await getContracts(selectedProjectId)
      setContracts(data || [])
    } catch (err: any) {
      console.error('Failed to load contracts:', err)
      setError(err.message || 'Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    if (!selectedProjectId) return
    
    try {
      const data = await getContractStats(selectedProjectId)
      setStats(data)
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }

  async function loadActors() {
    try {
      const data = await getActors()
      setActors(data || [])
    } catch (err: any) {
      console.error('Failed to load actors:', err)
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

  function handleCreateClick() {
    setFormData({
      contract_type: 'actor',
      title: '',
      description: '',
      actor_id: '',
      character_id: '',
      vendor_name: '',
      contracting_party_name: '',
      contracting_party_email: '',
      contracting_party_phone: '',
      status: 'draft',
      start_date: '',
      end_date: '',
      contract_amount: '',
      currency: 'USD',
      payment_schedule: '',
      notes: '',
      terms_and_conditions: '',
    })
    setShowCreateModal(true)
  }

  function handleEditClick(contract: Contract) {
    setSelectedContract(contract)
    setFormData({
      contract_type: contract.contract_type,
      title: contract.title,
      description: contract.description || '',
      actor_id: contract.actor_id || '',
      character_id: contract.character_id || '',
      vendor_name: contract.vendor_name || '',
      contracting_party_name: contract.contracting_party_name,
      contracting_party_email: contract.contracting_party_email || '',
      contracting_party_phone: contract.contracting_party_phone || '',
      status: contract.status,
      start_date: contract.start_date || '',
      end_date: contract.end_date || '',
      contract_amount: contract.contract_amount?.toString() || '',
      currency: contract.currency || 'USD',
      payment_schedule: contract.payment_schedule || '',
      notes: contract.notes || '',
      terms_and_conditions: contract.terms_and_conditions || '',
    })
    setShowEditModal(true)
  }

  async function handleCreateContract(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProjectId) return
    
    try {
      setCreating(true)
      setError(null)
      
      await createContract({
        project_id: selectedProjectId,
        contract_type: formData.contract_type,
        title: formData.title,
        description: formData.description || undefined,
        actor_id: formData.actor_id || undefined,
        character_id: formData.character_id || undefined,
        vendor_name: formData.vendor_name || undefined,
        contracting_party_name: formData.contracting_party_name,
        contracting_party_email: formData.contracting_party_email || undefined,
        contracting_party_phone: formData.contracting_party_phone || undefined,
        status: formData.status,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        contract_amount: formData.contract_amount ? parseFloat(formData.contract_amount) : undefined,
        currency: formData.currency,
        payment_schedule: formData.payment_schedule || undefined,
        notes: formData.notes || undefined,
        terms_and_conditions: formData.terms_and_conditions || undefined,
      })
      
      setShowCreateModal(false)
      await loadContracts()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to create contract:', err)
      setError(err.message || 'Failed to create contract')
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdateContract(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedContract) return
    
    try {
      setUpdating(true)
      setError(null)
      
      await updateContract(selectedContract.id, {
        contract_type: formData.contract_type,
        title: formData.title,
        description: formData.description || undefined,
        actor_id: formData.actor_id || undefined,
        character_id: formData.character_id || undefined,
        vendor_name: formData.vendor_name || undefined,
        contracting_party_name: formData.contracting_party_name,
        contracting_party_email: formData.contracting_party_email || undefined,
        contracting_party_phone: formData.contracting_party_phone || undefined,
        status: formData.status,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        contract_amount: formData.contract_amount ? parseFloat(formData.contract_amount) : undefined,
        currency: formData.currency,
        payment_schedule: formData.payment_schedule || undefined,
        notes: formData.notes || undefined,
        terms_and_conditions: formData.terms_and_conditions || undefined,
      })
      
      setShowEditModal(false)
      setSelectedContract(null)
      await loadContracts()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to update contract:', err)
      setError(err.message || 'Failed to update contract')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDeleteContract(contractId: string) {
    if (!confirm('Are you sure you want to delete this contract?')) return
    
    try {
      await deleteContract(contractId)
      await loadContracts()
      await loadStats()
    } catch (err: any) {
      console.error('Failed to delete contract:', err)
      setError(err.message || 'Failed to delete contract')
    }
  }

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    if (filterType !== 'all' && contract.contract_type !== filterType) return false
    if (filterStatus !== 'all' && contract.status !== filterStatus) return false
    if (searchTerm && !contract.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !contract.contracting_party_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !contract.contract_number?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Contracts</h2>
            <p className="text-muted-foreground">
              {selectedProject ? `Contract management for "${selectedProject.title}"` : 'Select a project to manage contracts'}
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
              onClick={handleCreateClick}
              disabled={!selectedProjectId}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Contract
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
              <span className="text-gray-400 text-3xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No project selected</h3>
            <p className="text-gray-500">Select a project from the dropdown above to manage contracts</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading contracts...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="grid gap-6 md:grid-cols-4 mb-8">
                <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Contracts</div>
                  <div className="text-2xl font-bold">{stats.totalContracts}</div>
                  <div className="text-xs text-muted-foreground">${stats.totalValue.toLocaleString()} total value</div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Executed</div>
                  <div className="text-2xl font-bold text-status-success">{stats.byStatus.executed}</div>
                  <div className="text-xs text-status-success">Fully signed</div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Pending</div>
                  <div className="text-2xl font-bold text-status-warning">{stats.byStatus.pending}</div>
                  <div className="text-xs text-status-warning">Awaiting signature</div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Draft</div>
                  <div className="text-2xl font-bold">{stats.byStatus.draft}</div>
                  <div className="text-xs text-muted-foreground">Not sent yet</div>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="rounded-lg border bg-card p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <input
                    type="text"
                    placeholder="Search contracts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as ContractType | 'all')}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="actor">Actor</option>
                    <option value="crew">Crew</option>
                    <option value="vendor">Vendor</option>
                    <option value="location">Location</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as ContractStatus | 'all')}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="pending_signature">Pending Signature</option>
                    <option value="signed">Signed</option>
                    <option value="executed">Executed</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredContracts.length} of {contracts.length} contracts
                </div>
              </div>
            </div>

            {/* Contracts Table */}
            {filteredContracts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-3xl">📝</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
                <p className="text-gray-500 mb-4">Create your first contract to get started</p>
                <button 
                  onClick={handleCreateClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create First Contract
                </button>
              </div>
            ) : (
              <div className="rounded-lg border bg-card shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contract #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Party</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Dates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {filteredContracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{contract.contract_number || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium">{contract.title}</div>
                            {contract.description && (
                              <div className="text-xs text-muted-foreground max-w-xs truncate">{contract.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[contract.contract_type]}`}>
                              {contract.contract_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">{contract.contracting_party_name}</div>
                            {contract.contracting_party_email && (
                              <div className="text-xs text-muted-foreground">{contract.contracting_party_email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {contract.contract_amount 
                                ? `$${contract.contract_amount.toLocaleString()}`
                                : 'Not specified'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[contract.status]}`}>
                              {contract.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {contract.start_date && (
                              <div>Start: {new Date(contract.start_date).toLocaleDateString()}</div>
                            )}
                            {contract.end_date && (
                              <div className="text-muted-foreground">End: {new Date(contract.end_date).toLocaleDateString()}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                            <button 
                              onClick={() => {
                                setSelectedContract(contract)
                                setShowViewModal(true)
                              }}
                              className="text-primary hover:text-primary/80"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => handleEditClick(contract)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteContract(contract.id)}
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
          </>
        )}

        {/* Create Contract Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Create New Contract</h3>
              
              <form onSubmit={handleCreateContract}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Contract Type */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type *</label>
                    <select
                      required
                      value={formData.contract_type}
                      onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as ContractType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="actor">Actor</option>
                      <option value="crew">Crew</option>
                      <option value="vendor">Vendor</option>
                      <option value="location">Location</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Title */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Actor Agreement - John Doe"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of the contract"
                    />
                  </div>

                  {/* Actor (if type is actor) */}
                  {formData.contract_type === 'actor' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Actor</label>
                        <select
                          value={formData.actor_id}
                          onChange={(e) => setFormData({ ...formData, actor_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Actor</option>
                          {actors.map(actor => (
                            <option key={actor.id} value={actor.id}>
                              {actor.stage_name || `${actor.first_name} ${actor.last_name}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Character</label>
                        <select
                          value={formData.character_id}
                          onChange={(e) => setFormData({ ...formData, character_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Character</option>
                          {characters.map(char => (
                            <option key={char.id} value={char.id}>{char.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Vendor Name (if type is vendor) */}
                  {formData.contract_type === 'vendor' && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                      <input
                        type="text"
                        value={formData.vendor_name}
                        onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Company or vendor name"
                      />
                    </div>
                  )}

                  {/* Contracting Party */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contracting Party Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.contracting_party_name}
                      onChange={(e) => setFormData({ ...formData, contracting_party_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Person or company signing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.contracting_party_email}
                      onChange={(e) => setFormData({ ...formData, contracting_party_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.contracting_party_phone}
                      onChange={(e) => setFormData({ ...formData, contracting_party_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ContractStatus })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending_signature">Pending Signature</option>
                      <option value="signed">Signed</option>
                      <option value="countersigned">Countersigned</option>
                      <option value="executed">Executed</option>
                    </select>
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Financial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.contract_amount}
                      onChange={(e) => setFormData({ ...formData, contract_amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Schedule</label>
                    <textarea
                      value={formData.payment_schedule}
                      onChange={(e) => setFormData({ ...formData, payment_schedule: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 50% upfront, 50% on completion"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Internal notes about this contract"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                    <textarea
                      value={formData.terms_and_conditions}
                      onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contract terms and conditions"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create Contract'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Contract Modal - Same as Create but with update */}
        {showEditModal && selectedContract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Edit Contract: {selectedContract.contract_number}</h3>
              
              <form onSubmit={handleUpdateContract}>
                {/* Same form fields as create modal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type *</label>
                    <select
                      required
                      value={formData.contract_type}
                      onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as ContractType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="actor">Actor</option>
                      <option value="crew">Crew</option>
                      <option value="vendor">Vendor</option>
                      <option value="location">Location</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {formData.contract_type === 'actor' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Actor</label>
                        <select
                          value={formData.actor_id}
                          onChange={(e) => setFormData({ ...formData, actor_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Actor</option>
                          {actors.map(actor => (
                            <option key={actor.id} value={actor.id}>
                              {actor.stage_name || `${actor.first_name} ${actor.last_name}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Character</label>
                        <select
                          value={formData.character_id}
                          onChange={(e) => setFormData({ ...formData, character_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Character</option>
                          {characters.map(char => (
                            <option key={char.id} value={char.id}>{char.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {formData.contract_type === 'vendor' && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                      <input
                        type="text"
                        value={formData.vendor_name}
                        onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contracting Party Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.contracting_party_name}
                      onChange={(e) => setFormData({ ...formData, contracting_party_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.contracting_party_email}
                      onChange={(e) => setFormData({ ...formData, contracting_party_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.contracting_party_phone}
                      onChange={(e) => setFormData({ ...formData, contracting_party_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ContractStatus })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending_signature">Pending Signature</option>
                      <option value="signed">Signed</option>
                      <option value="countersigned">Countersigned</option>
                      <option value="executed">Executed</option>
                      <option value="expired">Expired</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.contract_amount}
                      onChange={(e) => setFormData({ ...formData, contract_amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Schedule</label>
                    <textarea
                      value={formData.payment_schedule}
                      onChange={(e) => setFormData({ ...formData, payment_schedule: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                    <textarea
                      value={formData.terms_and_conditions}
                      onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedContract(null)
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
                    {updating ? 'Updating...' : 'Update Contract'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Contract Modal */}
        {showViewModal && selectedContract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedContract.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Contract #{selectedContract.contract_number}</p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedContract(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Type</h5>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[selectedContract.contract_type]}`}>
                      {selectedContract.contract_type.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Status</h5>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[selectedContract.status]}`}>
                      {selectedContract.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Contracting Party</h5>
                    <p className="text-gray-900">{selectedContract.contracting_party_name}</p>
                    {selectedContract.contracting_party_email && (
                      <p className="text-sm text-gray-600">{selectedContract.contracting_party_email}</p>
                    )}
                    {selectedContract.contracting_party_phone && (
                      <p className="text-sm text-gray-600">{selectedContract.contracting_party_phone}</p>
                    )}
                  </div>
                  {selectedContract.contract_amount && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Amount</h5>
                      <p className="text-gray-900">${selectedContract.contract_amount.toLocaleString()} {selectedContract.currency}</p>
                    </div>
                  )}
                  {selectedContract.start_date && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Start Date</h5>
                      <p className="text-gray-900">{new Date(selectedContract.start_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedContract.end_date && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">End Date</h5>
                      <p className="text-gray-900">{new Date(selectedContract.end_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {selectedContract.description && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                    <p className="text-gray-900">{selectedContract.description}</p>
                  </div>
                )}

                {selectedContract.payment_schedule && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Payment Schedule</h5>
                    <p className="text-gray-900">{selectedContract.payment_schedule}</p>
                  </div>
                )}

                {selectedContract.terms_and_conditions && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions</h5>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedContract.terms_and_conditions}</p>
                  </div>
                )}

                {selectedContract.notes && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Internal Notes</h5>
                    <p className="text-gray-900">{selectedContract.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEditClick(selectedContract)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Contract
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedContract(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
