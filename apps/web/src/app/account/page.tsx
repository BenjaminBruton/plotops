'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [organization, setOrganization] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('crew')
  const [invitations, setInvitations] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  useEffect(() => {
    getProfile()
    loadTeamData()
  }, [])

  async function getProfile() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        
        // Fetch user profile from database
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, organization_id, organizations(name)')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setFirstName(profile.first_name || '')
          setLastName(profile.last_name || '')
          setOrganizationId(profile.organization_id || '')
          if (profile.organizations) {
            setOrganization((profile.organizations as any).name || '')
          }
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadTeamData() {
    if (!user?.id) return
    
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) return

      // Load team members
      const { data: members } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, role, created_at')
        .eq('organization_id', profile.organization_id)
        .order('created_at')

      setTeamMembers(members || [])

      // Load invitations
      const { data: invites } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      setInvitations(invites || [])
    } catch (error) {
      console.error('Error loading team data:', error)
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}!` })
      setInviteEmail('')
      loadTeamData()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  async function cancelInvite(inviteId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch(`/api/invitations?id=${inviteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) throw new Error('Failed to cancel invitation')

      setMessage({ type: 'success', text: 'Invitation cancelled' })
      loadTeamData()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      setMessage(null)

      if (!user?.id) return

      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: firstName,
          last_name: lastName
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update organization name in organizations table
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profile?.organization_id) {
        const { error: orgError } = await supabase
          .from('organizations')
          .update({ name: organization })
          .eq('id', profile.organization_id)

        if (orgError) throw orgError
      }

      // Also update auth metadata for consistency
      await supabase.auth.updateUser({
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          organization: organization,
        }
      })

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

            {message && (
              <div className={`mb-4 p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={updateProfile} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm px-3 py-2 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                  Organization
                </label>
                <input
                  id="organization"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  placeholder="Production Company"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Team Management Section */}
        <div className="bg-white shadow rounded-lg mt-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Team Management</h2>

            {/* Invite New Member */}
            <form onSubmit={sendInvite} className="mb-8 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Invite Team Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="producer">Producer</option>
                    <option value="director">Director</option>
                    <option value="crew">Crew</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                  >
                    Send Invite
                  </button>
                </div>
              </div>
            </form>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Pending Invitations ({invitations.length})</h3>
                <div className="space-y-2">
                  {invitations.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{invite.email}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {invite.role} • Invited {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => cancelInvite(invite.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Members */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Team Members ({teamMembers.length})</h3>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 border rounded-md">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                        {member.id === user?.id && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Share the invitation link with your team members or they will receive an email (if configured).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
