'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [invitation, setInvitation] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadInvitation()
  }, [params.token])

  async function loadInvitation() {
    try {
      setLoading(true)
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Load invitation details
      const { data: invite, error: inviteError } = await supabase
        .from('organization_invitations')
        .select('*, organizations(name)')
        .eq('token', params.token)
        .eq('status', 'pending')
        .single()

      if (inviteError || !invite) {
        setError('Invitation not found or expired')
        return
      }

      // Check if expired
      if (new Date(invite.expires_at) < new Date()) {
        setError('This invitation has expired')
        return
      }

      setInvitation(invite)
      setOrganization(invite.organizations)
    } catch (err: any) {
      setError(err.message || 'Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  async function acceptInvite() {
    if (!user) {
      // Redirect to signup with token
      router.push(`/signup?invite=${params.token}`)
      return
    }

    try {
      setAccepting(true)
      setError(null)

      // Update user profile with new organization
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          organization_id: invitation.organization_id,
          role: invitation.role
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Mark invitation as accepted
      await supabase
        .from('organization_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading invitation...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-lg p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-2xl font-bold mb-2">You've Been Invited!</h1>
          <p className="text-muted-foreground">
            Join <strong>{organization?.name}</strong> on PlotOps
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Role</div>
              <div className="font-medium capitalize">{invitation?.role}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Email</div>
              <div className="font-medium">{invitation?.email}</div>
            </div>
          </div>
        </div>

        {user ? (
          <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Logged in as <strong>{user.email}</strong>
            </p>
            <button
              onClick={acceptInvite}
              disabled={accepting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {accepting ? 'Accepting...' : 'Accept Invitation'}
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Sign in with a different account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground mb-4">
              Create an account or sign in to accept this invitation
            </p>
            <button
              onClick={() => router.push(`/signup?invite=${params.token}`)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-4 rounded-md transition-colors"
            >
              Create Account
            </button>
            <button
              onClick={() => router.push(`/login?invite=${params.token}`)}
              className="w-full border border-input hover:bg-accent hover:text-accent-foreground font-medium py-3 px-4 rounded-md transition-colors"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
