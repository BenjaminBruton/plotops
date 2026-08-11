'use client'

import AppLayout from '../../components/layout/app-layout'
import Link from 'next/link'

export default function MarketingPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Website & Marketing</h2>
          <p className="text-muted-foreground">
            Build your promotional website and access marketing resources to promote your film project
          </p>
        </div>

        {/* Promotional Website Section */}
        <div className="rounded-lg border bg-card shadow-soft p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Promotional Website Template
          </h3>
          <p className="text-muted-foreground mb-6">
            Create a stunning website for your film project with our open-source template. Showcase your trailer, cast, crew, and behind-the-scenes content.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border bg-background p-4">
              <h4 className="font-semibold mb-2">Features Include:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hero section with trailer embed
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cast & crew profiles
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Photo gallery
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Press kit downloads
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Contact form
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mobile responsive
                </li>
              </ul>
            </div>

            <div className="rounded-lg border bg-background p-4">
              <h4 className="font-semibold mb-2">Quick Start:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Clone the template repository</li>
                <li>Customize with your project details</li>
                <li>Add your images and trailer</li>
                <li>Deploy to Netlify/Vercel (free)</li>
                <li>Connect your custom domain</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-4">
            <a
              href="https://github.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Get Template (Coming Soon)
            </a>
            <a
              href="https://www.ghostnotesshortfilm.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Example Site
            </a>
          </div>
        </div>

        {/* Marketing Resources */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-lg border bg-card shadow-soft p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Marketing Tips
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium">Build a Social Media Presence</h4>
                  <p className="text-sm text-muted-foreground">Create accounts on Instagram, Twitter, TikTok, and Facebook. Post behind-the-scenes content regularly.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium">Email List Building</h4>
                  <p className="text-sm text-muted-foreground">Collect emails from interested viewers. Use Mailchimp (free tier) for newsletters.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium">Film Festival Strategy</h4>
                  <p className="text-sm text-muted-foreground">Research festivals that match your genre. Start with submission-friendly festivals.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium">Press Kit Essentials</h4>
                  <p className="text-sm text-muted-foreground">High-res stills, synopsis, director statement, cast bios, production notes.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card shadow-soft p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Free Marketing Tools
            </h3>
            <div className="space-y-3">
              <a href="https://canva.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                <div>
                  <h4 className="font-medium">Canva</h4>
                  <p className="text-sm text-muted-foreground">Design posters, social media graphics</p>
                </div>
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <a href="https://buffer.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                <div>
                  <h4 className="font-medium">Buffer</h4>
                  <p className="text-sm text-muted-foreground">Schedule social media posts</p>
                </div>
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <a href="https://mailchimp.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                <div>
                  <h4 className="font-medium">Mailchimp</h4>
                  <p className="text-sm text-muted-foreground">Email marketing (free for 500 contacts)</p>
                </div>
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <a href="https://hootsuite.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                <div>
                  <h4 className="font-medium">Hootsuite</h4>
                  <p className="text-sm text-muted-foreground">Social media management</p>
                </div>
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Grants & Funding Resources */}
        <div className="rounded-lg border bg-card shadow-soft p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Film Grants & Funding Opportunities
          </h3>
          <p className="text-muted-foreground mb-6">
            Explore funding opportunities to help finance your film project.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <a href="https://www.neh.gov/grants" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg border hover:bg-accent transition-colors">
              <h4 className="font-semibold mb-2">NEH Grants</h4>
              <p className="text-sm text-muted-foreground mb-3">National Endowment for the Humanities - Documentary grants</p>
              <span className="text-xs text-primary">Learn More →</span>
            </a>

            <a href="https://www.arts.gov" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg border hover:bg-accent transition-colors">
              <h4 className="font-semibold mb-2">NEA Grants</h4>
              <p className="text-sm text-muted-foreground mb-3">National Endowment for the Arts - Media arts funding</p>
              <span className="text-xs text-primary">Learn More →</span>
            </a>

            <a href="https://www.sundance.org/programs/documentary-fund" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg border hover:bg-accent transition-colors">
              <h4 className="font-semibold mb-2">Sundance Institute</h4>
              <p className="text-sm text-muted-foreground mb-3">Documentary Fund and creative support</p>
              <span className="text-xs text-primary">Learn More →</span>
            </a>

            <a href="https://tribecafilm.com/filmmakers" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg border hover:bg-accent transition-colors">
              <h4 className="font-semibold mb-2">Tribeca Film Institute</h4>
              <p className="text-sm text-muted-foreground mb-3">Funding and resources for filmmakers</p>
              <span className="text-xs text-primary">Learn More →</span>
            </a>

            <a href="https://www.itvs.org/funding" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg border hover:bg-accent transition-colors">
              <h4 className="font-semibold mb-2">ITVS</h4>
              <p className="text-sm text-muted-foreground mb-3">Independent Television Service - Public media funding</p>
              <span className="text-xs text-primary">Learn More →</span>
            </a>

            <a href="https://filmindependent.org" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg border hover:bg-accent transition-colors">
              <h4 className="font-semibold mb-2">Film Independent</h4>
              <p className="text-sm text-muted-foreground mb-3">Grants, labs, and fiscal sponsorship</p>
              <span className="text-xs text-primary">Learn More →</span>
            </a>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Pro Tip:</strong> Consider fiscal sponsorship through organizations like Film Independent or IFP to make your project eligible for grants that require 501(c)(3) status.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
