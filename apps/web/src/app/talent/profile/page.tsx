'use client'

import TalentLayout from '../../../components/layout/talent-layout'
import { useState } from 'react'

export default function TalentProfile() {
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'experience'>('basic')

  return (
    <TalentLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your professional profile and media</p>
        </div>

        {/* Profile Completion */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Profile Completion</h3>
              <p className="text-sm text-muted-foreground">Complete your profile to increase visibility</p>
            </div>
            <span className="text-2xl font-bold text-primary">75%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'media'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Media & Portfolio
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'experience'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Experience & Credits
            </button>
          </div>
        </div>

        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
              <div className="flex items-start gap-6">
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
                  JD
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3">Upload a professional headshot. Max size: 5MB</p>
                  <div className="flex gap-3">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">
                      Upload Photo
                    </button>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">First Name</label>
                  <input type="text" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="John" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Last Name</label>
                  <input type="text" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <input type="email" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <input type="tel" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <input type="text" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="Los Angeles, CA" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Union Status</label>
                  <select className="w-full h-10 px-4 rounded-md border border-input bg-background">
                    <option>SAG-AFTRA</option>
                    <option>Non-Union</option>
                    <option>SAG-AFTRA Eligible</option>
                    <option>IATSE</option>
                    <option>DGA</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Physical Characteristics */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Physical Characteristics</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Age Range</label>
                  <select className="w-full h-10 px-4 rounded-md border border-input bg-background">
                    <option>18-25</option>
                    <option>26-35</option>
                    <option>36-45</option>
                    <option>46-55</option>
                    <option>56+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Gender</label>
                  <select className="w-full h-10 px-4 rounded-md border border-input bg-background">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-binary</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Ethnicity</label>
                  <input type="text" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="e.g., Asian, Caucasian" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Height</label>
                  <input type="text" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="5'10&quot;" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hair Color</label>
                  <input type="text" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="Brown" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Eye Color</label>
                  <input type="text" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="Blue" />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Professional Bio</h3>
              <textarea
                className="w-full min-h-32 px-4 py-3 rounded-md border border-input bg-background"
                placeholder="Write a brief professional bio..."
              ></textarea>
              <p className="text-sm text-muted-foreground mt-2">500 characters recommended</p>
            </div>

            <div className="flex justify-end gap-3">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4">
                Cancel
              </button>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Media & Portfolio Tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Resume Upload */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Resume</h3>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium mb-2">Upload your resume</p>
                <p className="text-xs text-muted-foreground mb-4">PDF, DOC, DOCX up to 10MB</p>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">
                  Choose File
                </button>
              </div>
            </div>

            {/* Headshots */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Headshots</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload up to 8 professional headshots</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[3/4] border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo Reels */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Demo Reels & Audition Tapes</h3>
              <p className="text-sm text-muted-foreground mb-4">Add links to your demo reels (YouTube, Vimeo, etc.)</p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="url"
                    className="flex-1 h-10 px-4 rounded-md border border-input bg-background"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">
                    Add
                  </button>
                </div>
                <div className="rounded-lg border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-24 bg-muted rounded"></div>
                    <div>
                      <p className="font-medium text-sm">Character Reel 2024</p>
                      <p className="text-xs text-muted-foreground">youtube.com/watch?v=...</p>
                    </div>
                  </div>
                  <button className="text-sm text-destructive hover:text-destructive/80">Remove</button>
                </div>
              </div>
            </div>

            {/* Portfolio Website */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Portfolio & Social Links</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Personal Website</label>
                  <input type="url" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="https://yourwebsite.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">IMDb</label>
                  <input type="url" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="https://imdb.com/name/..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Instagram</label>
                  <input type="text" className="w-full h-10 px-4 rounded-md border border-input bg-background" placeholder="@username" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4">
                Cancel
              </button>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Experience & Credits Tab */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            {/* Film/TV Credits */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Film & TV Credits</h3>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
                  Add Credit
                </button>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">Lead Role - Detective Martinez</h4>
                      <p className="text-sm text-muted-foreground">The Heist • Feature Film • 2023</p>
                      <p className="text-sm mt-2">Directed by Jane Smith • Warner Bros.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-sm text-primary hover:text-primary/80">Edit</button>
                      <button className="text-sm text-destructive hover:text-destructive/80">Delete</button>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">Supporting - Dr. Chen</h4>
                      <p className="text-sm text-muted-foreground">Medical Drama • TV Series • 2022</p>
                      <p className="text-sm mt-2">Seasons 1-3 • NBC</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-sm text-primary hover:text-primary/80">Edit</button>
                      <button className="text-sm text-destructive hover:text-destructive/80">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Theater Credits */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Theater Credits</h3>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
                  Add Credit
                </button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No theater credits added yet</p>
              </div>
            </div>

            {/* Training & Education */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Training & Education</h3>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
                  Add Training
                </button>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold">BFA in Acting</h4>
                  <p className="text-sm text-muted-foreground">Juilliard School • 2015-2019</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold">Method Acting Workshop</h4>
                  <p className="text-sm text-muted-foreground">Actors Studio • 2020</p>
                </div>
              </div>
            </div>

            {/* Special Skills */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Special Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Stage Combat', 'Horseback Riding', 'Spanish (Fluent)', 'Piano', 'Rock Climbing', 'Dance', 'Martial Arts'].map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                    {skill}
                    <button className="hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 h-10 px-4 rounded-md border border-input bg-background"
                  placeholder="Add a skill..."
                />
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4">
                Cancel
              </button>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </TalentLayout>
  )
}
