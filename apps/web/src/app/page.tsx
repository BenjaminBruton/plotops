'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Header */}
      <header className="relative z-10">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
          <div className="flex w-full items-center justify-between border-b border-border py-6 lg:border-none">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v8a1 1 0 01-1 1M7 4H6a1 1 0 00-1 1v8a1 1 0 001 1h1m0-10h10M7 4v10m10-10v10" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-foreground">PlotOps</span>
              </div>
            </div>
            <div className="ml-10 space-x-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visual:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-10 px-4 py-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <div className="relative px-6 lg:px-8">
          <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
            <div>
              <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative rounded-full py-1 px-3 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-ring/20 transition-colors">
                  Cradle-to-Grave Film Production ERP System{' '}
                  <a href="#signup" className="font-semibold text-primary hover:text-primary/80">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Join Now <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                  Film Production
                  <span className="text-primary"> Management</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  From script to screen - manage your entire film production workflow with AI-assisted 
                  breakdowns, real-time collaboration, and comprehensive project tracking.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a
                    href="#signup"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-11 px-8"
                  >
                    Choose Your Role
                  </a>
                  <a href="#features" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection / Signup Section */}
        <div id="signup" className="py-24 sm:py-32 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Get Started with PlotOps
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Choose your role to access the right tools for your work
              </p>
            </div>

            <div className="grid max-w-5xl mx-auto grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Production Team Card */}
              <div className="rounded-lg border-2 border-primary bg-card text-card-foreground shadow-soft hover:shadow-medium transition-all duration-200 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 flex items-center justify-center rounded-lg bg-primary/10">
                    <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Production Team</h3>
                    <p className="text-sm text-muted-foreground">For producers, directors, and crew</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">Manage complete film projects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">AI-powered script breakdown</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">Production scheduling & stripboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">Casting & crew management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">Budget tracking & reporting</span>
                  </li>
                </ul>

                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-11 px-8"
                >
                  Sign Up as Production Team
                </Link>
              </div>

              {/* Talent & Crew Card */}
              <div className="rounded-lg border-2 border-border bg-card text-card-foreground shadow-soft hover:shadow-medium transition-all duration-200 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 flex items-center justify-center rounded-lg bg-status-success/10">
                    <svg className="h-8 w-8 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Talent & Crew</h3>
                    <p className="text-sm text-muted-foreground">For actors and crew looking for work</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">Browse casting calls & auditions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">Apply to crew positions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">Upload your portfolio & demo reel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">Track your submissions & callbacks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">Get notifications for new opportunities</span>
                  </li>
                </ul>

                <Link
                  href="/jobs"
                  className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8"
                >
                  Sign Up for Job Board
                </Link>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{' '}
              <a href="#" className="font-semibold text-primary hover:text-primary/80">
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">Complete Production Suite</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need for film production
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                PlotOps provides role-based dashboards and AI-assisted workflows for every stage of film production.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {/* Script Breakdown */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10">
                      <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Script Breakdown & Analysis
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">
                      AI-powered script parsing extracts scenes, characters, locations, and assets. 
                      Automatically generates breakdown sheets with complexity ratings and budget estimates.
                    </p>
                  </dd>
                </div>

                {/* Casting Management */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-status-success/10">
                      <svg className="h-6 w-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    Casting & Talent Management
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">
                      Public casting board for submissions, internal Kanban-style casting management, 
                      and automated character-to-actor matching with availability tracking.
                    </p>
                  </dd>
                </div>

                {/* Production Scheduling */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-status-warning/10">
                      <svg className="h-6 w-6 text-status-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Interactive Stripboard
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">
                      Drag-and-drop production scheduling with intelligent scene clustering based on 
                      location and actor availability. Real-time collaboration for the entire crew.
                    </p>
                  </dd>
                </div>

                {/* Location Scouting */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-status-danger/10">
                      <svg className="h-6 w-6 text-status-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    Location Management
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">
                      Google Maps integration for location scouting with photo uploads, logistics notes, 
                      permit tracking, and automated call sheet generation with directions.
                    </p>
                  </dd>
                </div>

                {/* Real-time Production */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-status-info/10">
                      <svg className="h-6 w-6 text-status-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Live Production Tracking
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">
                      Mobile-responsive "wrap" tracker for script supervisors with real-time progress 
                      monitoring and automatic alerts when scenes fall behind schedule.
                    </p>
                  </dd>
                </div>

                {/* Post-Production */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-status-purple/10">
                      <svg className="h-6 w-6 text-status-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                    </div>
                    Digital Asset Management
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">
                      Collaborative tagging system for raw footage with VFX, ADR, and reshoot flags. 
                      Automated feedback loops between post-production and production teams.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24 sm:py-32 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to streamline your production?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Join the future of film production management with PlotOps' comprehensive ERP system.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="#signup"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-11 px-8"
                >
                  Get Started Today
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">PlotOps</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PlotOps. Cradle-to-Grave Film Production ERP.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
