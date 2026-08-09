'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import TalentLayout from '../../components/layout/talent-layout'
import { getPublicCastingCalls } from '../../lib/api/public-casting'

type JobType = 'all' | 'actor' | 'voiceover' | 'crew' | 'modeling'

export default function JobBoard() {
  const [jobType, setJobType] = useState<JobType>('all')
  const [castingCalls, setCastingCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [location, setLocation] = useState('')
  const [radius, setRadius] = useState('25')
  const [distanceUnit, setDistanceUnit] = useState('miles')
  const [showRemote, setShowRemote] = useState(false)
  const [gender, setGender] = useState('any')
  const [age, setAge] = useState('any')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const jobCategories = [
    'Post-Production (Video & Animation)',
    'Copy & Design',
    'Writing',
    'Directing',
    'Producing / Production Management',
    'Camera, Photography, Videography',
    'Hair & Makeup',
    'Wardrobe / Costume',
    'Audio (Sound & Music)',
    'Art & Props',
    'Lighting & Electrical',
    'Grips',
    'Locations & Unit',
    'Distribution / Multimedia Content Production',
    'Casting & Talent',
    'Other specializations'
  ]

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Load casting calls on mount
  useEffect(() => {
    loadCastingCalls()
  }, [])

  async function loadCastingCalls() {
    try {
      setLoading(true)
      const data = await getPublicCastingCalls()
      console.log('Loaded public casting calls:', data)
      setCastingCalls(data || [])
    } catch (error) {
      console.error('Failed to load casting calls:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock crew data (will be replaced with real data later)
  const crewPositions = [
    {
      id: '1',
      project: 'The Heist',
      position: '1st Assistant Director',
      department: 'Producing / Production Management',
      type: 'crew',
      description: 'Experienced 1st AD needed for 30-day shoot.',
      requirements: '5+ years experience, DGA preferred',
      compensation: '$3,500/week',
      location: 'Los Angeles, CA',
      startDate: '2024-03-15',
      duration: '6 weeks',
      status: 'Open'
    },
    {
      id: '2',
      project: 'The Heist',
      position: 'Director of Photography',
      department: 'Camera, Photography, Videography',
      type: 'crew',
      description: 'Seeking DP for stylish heist thriller.',
      requirements: 'Feature film experience, RED camera expertise',
      compensation: '$5,000/week + kit rental',
      location: 'Los Angeles, CA',
      startDate: '2024-03-10',
      duration: '8 weeks',
      status: 'Interviewing'
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      Open: 'bg-status-success/10 text-status-success border-status-success/20',
      Callback: 'bg-status-warning/10 text-status-warning border-status-warning/20',
      Interviewing: 'bg-status-info/10 text-status-info border-status-info/20',
      Closed: 'bg-muted text-muted-foreground border-muted'
    }
    return colors[status as keyof typeof colors] || colors.Open
  }

  return (
    <TalentLayout>
      <div className="p-6">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Next Opportunity</h1>
          <p className="text-lg text-muted-foreground">Browse casting calls and crew positions</p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Top Filter Row */}
          <div className="flex flex-wrap gap-4">
            {/* Location Filter */}
            <div className="flex-1 min-w-[200px]">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between h-10 px-4 rounded-md border border-input bg-background hover:bg-accent text-left"
              >
                <span className="text-sm font-medium">Job location</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="text-sm text-muted-foreground mt-1">{location || 'Any Location'}</div>
            </div>

            {/* Job Type Filter */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as JobType)}
                  className="w-full h-10 px-4 rounded-md border border-input bg-background text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="all">All Jobs</option>
                  <option value="actor">Actor & Performer</option>
                  <option value="voiceover">Voiceover</option>
                  <option value="crew">Crew</option>
                  <option value="modeling">Modeling</option>
                </select>
                <svg className="absolute right-3 top-3 h-4 w-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{jobType === 'all' ? 'All Jobs' : jobType.charAt(0).toUpperCase() + jobType.slice(1)}</div>
            </div>

            {/* Gender Filter (for non-crew) */}
            {jobType !== 'crew' && (
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-10 px-4 rounded-md border border-input bg-background text-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="any">Any Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="nonbinary">Non-binary</option>
                  </select>
                  <svg className="absolute right-3 top-3 h-4 w-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{gender === 'any' ? 'Any Gender' : gender.charAt(0).toUpperCase() + gender.slice(1)}</div>
              </div>
            )}

            {/* Age Filter (for non-crew) OR Job Categories (for crew) */}
            {jobType !== 'crew' ? (
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <select
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full h-10 px-4 rounded-md border border-input bg-background text-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="any">Any Age</option>
                    <option value="child">Child (0-12)</option>
                    <option value="teen">Teen (13-17)</option>
                    <option value="young-adult">Young Adult (18-29)</option>
                    <option value="adult">Adult (30-54)</option>
                    <option value="senior">Senior (55+)</option>
                  </select>
                  <svg className="absolute right-3 top-3 h-4 w-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{age === 'any' ? 'Any Age' : age.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
              </div>
            ) : (
              <div className="flex-1 min-w-[200px]">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between h-10 px-4 rounded-md border border-input bg-background hover:bg-accent text-left"
                >
                  <span className="text-sm font-medium">Job Categories</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="text-sm text-muted-foreground mt-1">{selectedCategories.length > 0 ? `${selectedCategories.length} selected` : 'All Categories'}</div>
              </div>
            )}

            {/* Search Button */}
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>

            {/* Filter Toggle */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>

            {/* Save Search */}
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-status-success text-white hover:bg-status-success/90 h-10 px-4">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Save Search
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="rounded-lg border bg-card p-6 space-y-6">
              {/* Location Search */}
              <div>
                <h3 className="font-semibold mb-3">Select or type to search locations</h3>
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 px-4 rounded-md border border-input bg-background"
                />
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm font-medium">Distance:</span>
                  <button
                    onClick={() => setDistanceUnit('miles')}
                    className={`text-sm ${distanceUnit === 'miles' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Miles
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={() => setDistanceUnit('kilometers')}
                    className={`text-sm ${distanceUnit === 'kilometers' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Kilometers
                  </button>
                </div>
                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="mt-3 w-full h-10 px-4 rounded-md border border-input bg-background"
                >
                  <option value="10">Within 10 {distanceUnit}</option>
                  <option value="25">Within 25 {distanceUnit}</option>
                  <option value="50">Within 50 {distanceUnit}</option>
                  <option value="100">Within 100 {distanceUnit}</option>
                  <option value="any">Any distance</option>
                </select>
                <label className="mt-3 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRemote}
                    onChange={(e) => setShowRemote(e.target.checked)}
                    className="w-4 h-4 rounded border-input"
                  />
                  <span className="text-sm">Show remote jobs only</span>
                </label>
              </div>

              {/* Job Categories (only for crew) */}
              {jobType === 'crew' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Job categories</h3>
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      Clear All
                    </button>
                  </div>
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === jobCategories.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...jobCategories])
                        } else {
                          setSelectedCategories([])
                        }
                      }}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="font-medium">Select All</span>
                  </label>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {jobCategories.map((category) => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-4 h-4 rounded border-input"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={() => {
                    setLocation('')
                    setRadius('25')
                    setGender('any')
                    setAge('any')
                    setSelectedCategories([])
                    setShowRemote(false)
                  }}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
                >
                  Update
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results - Project Cards */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading casting calls...</p>
          </div>
        ) : castingCalls.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No casting calls available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {castingCalls.map((castingCall) => {
              const rolesCount = castingCall.characters?.length || 0
              const crewCount = castingCall.crew_positions?.length || 0
              
              return (
                <div
                  key={castingCall.id}
                  className="rounded-lg border bg-card shadow-soft hover:shadow-medium transition-all p-6"
                >
                  {/* Project Title */}
                  <h3 className="text-xl font-bold mb-2">
                    {castingCall.is_anonymous ? 'Film Production Casting Call' : castingCall.title}
                  </h3>
                  
                  {/* Logline */}
                  {castingCall.logline && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{castingCall.logline}</p>
                  )}
                  
                  {/* Description */}
                  {castingCall.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{castingCall.description}</p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 py-3 border-y">
                    {rolesCount > 0 && (
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm font-medium">{rolesCount} {rolesCount === 1 ? 'Role' : 'Roles'}</span>
                      </div>
                    )}
                    {crewCount > 0 && (
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">{crewCount} Crew {crewCount === 1 ? 'Position' : 'Positions'}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Shooting Dates */}
                  {(castingCall.shooting_start_date || castingCall.shooting_end_date) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {castingCall.shooting_start_date && new Date(castingCall.shooting_start_date).toLocaleDateString()}
                        {castingCall.shooting_end_date && ` - ${new Date(castingCall.shooting_end_date).toLocaleDateString()}`}
                      </span>
                    </div>
                  )}
                  
                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => setExpandedCard(expandedCard === castingCall.id ? null : castingCall.id)}
                    className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 mt-4"
                  >
                    {expandedCard === castingCall.id ? 'Hide' : 'View'} Available Roles & Positions
                    <svg className={`ml-2 h-4 w-4 transition-transform ${expandedCard === castingCall.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Content */}
                  {expandedCard === castingCall.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Character Roles */}
                      {castingCall.characters && castingCall.characters.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">🎭 Character Roles ({castingCall.characters.length})</h4>
                          <div className="space-y-3">
                            {castingCall.characters.map((character: any) => (
                              <div key={character.id} className="rounded-lg border bg-muted/30 p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-semibold">{character.name}</h5>
                                  {character.character_type && (
                                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                                      {character.character_type}
                                    </span>
                                  )}
                                </div>
                                {character.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{character.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  {character.age_range && <span>Age: {character.age_range}</span>}
                                  {character.gender && <span>• Gender: {character.gender}</span>}
                                  {character.ethnicity && <span>• Ethnicity: {character.ethnicity}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Crew Positions */}
                      {castingCall.crew_positions && castingCall.crew_positions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">🎬 Crew Positions ({castingCall.crew_positions.length})</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {castingCall.crew_positions.map((position: any, index: number) => (
                              <div key={index} className="rounded border bg-muted/20 p-2 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{position.role}</span>
                                  <span className="text-xs text-muted-foreground">×{position.count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact Information */}
                      <div className="pt-3 border-t">
                        <h4 className="font-semibold mb-3 text-center">📧 Contact Information</h4>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                          {castingCall.contact_name && (
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-sm font-medium">{castingCall.contact_name}</span>
                            </div>
                          )}
                          {castingCall.contact_email && (
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <a href={`mailto:${castingCall.contact_email}`} className="text-sm text-primary hover:underline">
                                {castingCall.contact_email}
                              </a>
                            </div>
                          )}
                          {castingCall.contact_phone && (
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <a href={`tel:${castingCall.contact_phone}`} className="text-sm text-primary hover:underline">
                                {castingCall.contact_phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* OLD Mock Data Display - REMOVED */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" style={{display: 'none'}}>
          {/* Casting Calls */}
          {(jobType === 'all' || jobType === 'actor') && [].map((call: any) => (
            <div key={call.id} className="rounded-lg border bg-card shadow-soft hover:shadow-medium transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{call.role}</h3>
                  <p className="text-sm text-muted-foreground">{call.project}</p>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(call.status)}`}>
                  {call.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-muted-foreground">{call.ageRange}, {call.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-muted-foreground">{call.location}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{call.description}</p>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Compensation:</span>
                  <span className="font-medium">{call.compensation}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="font-medium">{call.deadline}</span>
                </div>
              </div>

              <button className="w-full mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">
                Apply Now
              </button>
            </div>
          ))}

          {/* Crew Positions */}
          {(jobType === 'all' || jobType === 'crew') && crewPositions.map((position) => (
            <div key={position.id} className="rounded-lg border bg-card shadow-soft hover:shadow-medium transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{position.position}</h3>
                  <p className="text-sm text-muted-foreground">{position.project} • {position.department}</p>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(position.status)}`}>
                  {position.status}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{position.description}</p>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Requirements</p>
                  <p className="text-sm">{position.requirements}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Start Date</p>
                    <p className="text-sm font-medium">{position.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Duration</p>
                    <p className="text-sm font-medium">{position.duration}</p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Compensation</p>
                  <p className="text-lg font-bold text-primary">{position.compensation}</p>
                </div>
              </div>

              <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">
                Apply for Position
              </button>
            </div>
          ))}
        </div>
      </div>
    </TalentLayout>
  )
}
