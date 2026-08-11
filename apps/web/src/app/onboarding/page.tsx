'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    organizationName: '',
    role: 'producer' as 'producer' | 'director' | 'crew'
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create organization
      const orgSlug = formData.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-org'

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name: formData.organizationName || `${formData.firstName}'s Production`,
          slug: orgSlug,
          description: 'Film production organization',
          owner_id: user.id
        }])
        .select()
        .single()

      if (orgError) throw orgError

      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          display_name: `${formData.firstName} ${formData.lastName}`,
          organization_id: org.id,
          role: formData.role
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Onboarding error:', error)
      alert(error.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to PlotOps! 🎬</h1>
          <p className="text-muted-foreground">
            Let's set up your production workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg border shadow-soft">
          {/* Personal Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                placeholder="Benjamin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                placeholder="Bruton"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="producer">Producer</option>
                <option value="director">Director</option>
                <option value="crew">Crew Member</option>
              </select>
            </div>
          </div>

          {/* Organization */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-lg font-semibold">Production Organization</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                placeholder="Acme Films (optional - we'll create a default)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to use "{formData.firstName}'s Production"
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Complete Setup →'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          You can invite team members later from Account Settings
        </p>
      </div>
    </div>
  )
}
