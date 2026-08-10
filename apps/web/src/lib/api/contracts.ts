/**
 * Contracts API
 * Functions for managing contracts, payments, and documents
 */

import { supabase } from '../supabase'

export type ContractType = 'actor' | 'crew' | 'vendor' | 'location' | 'other'
export type ContractStatus = 'draft' | 'pending_signature' | 'signed' | 'countersigned' | 'executed' | 'expired' | 'terminated'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue'

export interface Contract {
  id: string
  project_id: string
  contract_number?: string
  contract_type: ContractType
  title: string
  description?: string
  
  // Parties
  actor_id?: string
  character_id?: string
  vendor_name?: string
  contracting_party_name: string
  contracting_party_email?: string
  contracting_party_phone?: string
  
  // Status
  status: ContractStatus
  
  // Dates
  start_date?: string
  end_date?: string
  signature_date?: string
  countersignature_date?: string
  
  // Financial
  contract_amount?: number
  currency?: string
  payment_schedule?: string
  payment_status?: PaymentStatus
  
  // Documents
  contract_pdf_url?: string
  signed_pdf_url?: string
  
  // E-Signature
  esignature_provider?: string
  esignature_envelope_id?: string
  esignature_status?: string
  esignature_sent_at?: string
  
  // Notes
  notes?: string
  terms_and_conditions?: string
  special_provisions?: string
  
  // Audit
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ContractPayment {
  id: string
  contract_id: string
  description: string
  amount: number
  due_date?: string
  paid_date?: string
  payment_method?: string
  reference_number?: string
  status: PaymentStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface ContractDocument {
  id: string
  contract_id: string
  title: string
  document_type?: string
  file_url: string
  file_name?: string
  file_size?: number
  mime_type?: string
  uploaded_by?: string
  uploaded_at: string
  notes?: string
}

// ============================================================================
// CONTRACTS
// ============================================================================

/**
 * Get all contracts for a project
 */
export async function getContracts(projectId: string): Promise<Contract[]> {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      actor:actors(id, first_name, last_name, stage_name),
      character:characters(id, name)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contracts:', error)
    throw error
  }

  return data || []
}

/**
 * Get a single contract by ID
 */
export async function getContract(contractId: string): Promise<Contract | null> {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      actor:actors(*),
      character:characters(*)
    `)
    .eq('id', contractId)
    .single()

  if (error) {
    console.error('Error fetching contract:', error)
    throw error
  }

  return data
}

/**
 * Create a new contract
 */
export async function createContract(contract: Partial<Contract>): Promise<Contract> {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('contracts')
    .insert({
      ...contract,
      created_by: user?.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating contract:', error)
    throw error
  }

  return data
}

/**
 * Update a contract
 */
export async function updateContract(contractId: string, updates: Partial<Contract>): Promise<Contract> {
  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', contractId)
    .select()
    .single()

  if (error) {
    console.error('Error updating contract:', error)
    throw error
  }

  return data
}

/**
 * Delete a contract
 */
export async function deleteContract(contractId: string): Promise<void> {
  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', contractId)

  if (error) {
    console.error('Error deleting contract:', error)
    throw error
  }
}

/**
 * Get contract statistics for a project
 */
export async function getContractStats(projectId: string) {
  const { data: contracts, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('project_id', projectId)

  if (error) {
    console.error('Error fetching contract stats:', error)
    throw error
  }

  const totalValue = contracts?.reduce((sum: number, c: any) => sum + (c.contract_amount || 0), 0) || 0
  const byStatus = {
    draft: contracts?.filter((c: any) => c.status === 'draft').length || 0,
    pending: contracts?.filter((c: any) => c.status === 'pending_signature').length || 0,
    signed: contracts?.filter((c: any) => c.status === 'signed').length || 0,
    executed: contracts?.filter((c: any) => c.status === 'executed').length || 0,
  }
  const byType = {
    actor: contracts?.filter((c: any) => c.contract_type === 'actor').length || 0,
    crew: contracts?.filter((c: any) => c.contract_type === 'crew').length || 0,
    vendor: contracts?.filter((c: any) => c.contract_type === 'vendor').length || 0,
    location: contracts?.filter((c: any) => c.contract_type === 'location').length || 0,
  }

  return {
    totalContracts: contracts?.length || 0,
    totalValue,
    byStatus,
    byType,
  }
}

// ============================================================================
// CONTRACT PAYMENTS
// ============================================================================

/**
 * Get all payments for a contract
 */
export async function getContractPayments(contractId: string): Promise<ContractPayment[]> {
  const { data, error } = await supabase
    .from('contract_payments')
    .select('*')
    .eq('contract_id', contractId)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching contract payments:', error)
    throw error
  }

  return data || []
}

/**
 * Create a new payment
 */
export async function createContractPayment(payment: Partial<ContractPayment>): Promise<ContractPayment> {
  const { data, error } = await supabase
    .from('contract_payments')
    .insert(payment)
    .select()
    .single()

  if (error) {
    console.error('Error creating payment:', error)
    throw error
  }

  return data
}

/**
 * Update a payment
 */
export async function updateContractPayment(paymentId: string, updates: Partial<ContractPayment>): Promise<ContractPayment> {
  const { data, error } = await supabase
    .from('contract_payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating payment:', error)
    throw error
  }

  return data
}

/**
 * Delete a payment
 */
export async function deleteContractPayment(paymentId: string): Promise<void> {
  const { error } = await supabase
    .from('contract_payments')
    .delete()
    .eq('id', paymentId)

  if (error) {
    console.error('Error deleting payment:', error)
    throw error
  }
}

// ============================================================================
// CONTRACT DOCUMENTS
// ============================================================================

/**
 * Get all documents for a contract
 */
export async function getContractDocuments(contractId: string): Promise<ContractDocument[]> {
  const { data, error } = await supabase
    .from('contract_documents')
    .select('*')
    .eq('contract_id', contractId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('Error fetching contract documents:', error)
    throw error
  }

  return data || []
}

/**
 * Create a new document record
 */
export async function createContractDocument(document: Partial<ContractDocument>): Promise<ContractDocument> {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('contract_documents')
    .insert({
      ...document,
      uploaded_by: user?.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating document:', error)
    throw error
  }

  return data
}

/**
 * Delete a document
 */
export async function deleteContractDocument(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('contract_documents')
    .delete()
    .eq('id', documentId)

  if (error) {
    console.error('Error deleting document:', error)
    throw error
  }
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadContractFile(file: File, contractId: string, type: 'contract' | 'signed' | 'document'): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${contractId}/${type}-${Date.now()}.${fileExt}`
  const filePath = `contracts/${fileName}`

  const { data, error } = await supabase.storage
    .from('contracts')
    .upload(filePath, file)

  if (error) {
    console.error('Error uploading file:', error)
    throw error
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('contracts')
    .getPublicUrl(filePath)

  return publicUrl
}
