'use client'

import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/app-layout'
import { getProjects } from '../../lib/api/projects'
import { getProjectReport, type ProjectReportData } from '../../lib/api/reports'

export default function Reports() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [report, setReport] = useState<ProjectReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadReport()
    }
  }, [selectedProjectId])

  async function loadProjects() {
    try {
      setLoading(true)
      const data = await getProjects()
      setProjects(data || [])
      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadReport() {
    if (!selectedProjectId) return
    
    try {
      const data = await getProjectReport(selectedProjectId)
      setReport(data)
    } catch (error) {
      console.error('Failed to load report:', error)
    }
  }

  const StatCard = ({ title, value, subtitle, color = 'blue' }: { title: string, value: string | number, subtitle?: string, color?: string }) => (
    <div className="rounded-lg border bg-card p-6 shadow-soft">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <p className={`text-3xl font-bold text-${color}-600 mb-1`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  )

  const ProgressBar = ({ percentage, color = 'blue' }: { percentage: number, color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div 
        className={`h-full bg-${color}-600 transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <p>Loading reports...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Project Reports</h2>
            <p className="text-muted-foreground">Analytics and statistics for your film production</p>
          </div>
          
          {projects.length > 0 && (
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {!report ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No report data available</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cast & Crew Section */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Cast & Crew</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  title="Total Cast"
                  value={report.total_cast}
                  subtitle={`${report.cast_signed_contracts} with signed contracts`}
                  color="purple"
                />
                <StatCard 
                  title="Cast Contracts"
                  value={`${report.cast_signed_contracts}/${report.total_cast}`}
                  subtitle={report.total_cast > 0 ? `${Math.round((report.cast_signed_contracts / report.total_cast) * 100)}% signed` : 'N/A'}
                  color="green"
                />
                <StatCard 
                  title="Total Crew"
                  value={report.total_crew}
                  subtitle={`${report.crew_confirmed} confirmed`}
                  color="blue"
                />
                <StatCard 
                  title="Crew Status"
                  value={`${report.crew_confirmed}/${report.total_crew}`}
                  subtitle={`${report.crew_pending} pending`}
                  color="orange"
                />
              </div>
            </div>

            {/* Production Progress */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Production Progress</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Scene Completion</h4>
                    <span className="text-2xl font-bold text-green-600">{report.scene_completion_percentage}%</span>
                  </div>
                  <ProgressBar percentage={report.scene_completion_percentage} color="green" />
                  <p className="text-sm text-muted-foreground mt-3">
                    {report.completed_scenes} of {report.total_scenes} scenes completed
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Locations Secured</h4>
                    <span className="text-2xl font-bold text-blue-600">
                      {report.total_locations > 0 ? Math.round((report.locations_confirmed / report.total_locations) * 100) : 0}%
                    </span>
                  </div>
                  <ProgressBar 
                    percentage={report.total_locations > 0 ? (report.locations_confirmed / report.total_locations) * 100 : 0} 
                    color="blue" 
                  />
                  <p className="text-sm text-muted-foreground mt-3">
                    {report.locations_confirmed} of {report.total_locations} locations confirmed
                  </p>
                </div>
              </div>
            </div>

            {/* Contracts Section */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Contracts</h3>
              <div className="grid gap-6 md:grid-cols-3">
                <StatCard 
                  title="Total Contracts"
                  value={report.total_contracts}
                  color="indigo"
                />
                <StatCard 
                  title="Contracts Sent"
                  value={report.contracts_sent}
                  subtitle={`${report.total_contracts - report.contracts_sent} pending`}
                  color="yellow"
                />
                <StatCard 
                  title="Contracts Signed"
                  value={report.contracts_signed}
                  subtitle={report.contracts_sent > 0 ? `${Math.round((report.contracts_signed / report.contracts_sent) * 100)}% signed` : 'N/A'}
                  color="green"
                />
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Detailed Breakdown</h3>
              <div className="rounded-lg border bg-card shadow-soft overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Category</th>
                      <th className="text-right p-4 font-semibold">Total</th>
                      <th className="text-right p-4 font-semibold">Completed/Confirmed</th>
                      <th className="text-right p-4 font-semibold">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-4">Scenes</td>
                      <td className="p-4 text-right">{report.total_scenes}</td>
                      <td className="p-4 text-right">{report.completed_scenes}</td>
                      <td className="p-4 text-right font-semibold text-green-600">{report.scene_completion_percentage}%</td>
                    </tr>
                    <tr>
                      <td className="p-4">Cast Members</td>
                      <td className="p-4 text-right">{report.total_cast}</td>
                      <td className="p-4 text-right">{report.cast_signed_contracts}</td>
                      <td className="p-4 text-right font-semibold text-purple-600">
                        {report.total_cast > 0 ? Math.round((report.cast_signed_contracts / report.total_cast) * 100) : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Crew Members</td>
                      <td className="p-4 text-right">{report.total_crew}</td>
                      <td className="p-4 text-right">{report.crew_confirmed}</td>
                      <td className="p-4 text-right font-semibold text-blue-600">
                        {report.total_crew > 0 ? Math.round((report.crew_confirmed / report.total_crew) * 100) : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Locations</td>
                      <td className="p-4 text-right">{report.total_locations}</td>
                      <td className="p-4 text-right">{report.locations_confirmed}</td>
                      <td className="p-4 text-right font-semibold text-indigo-600">
                        {report.total_locations > 0 ? Math.round((report.locations_confirmed / report.total_locations) * 100) : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Contracts</td>
                      <td className="p-4 text-right">{report.total_contracts}</td>
                      <td className="p-4 text-right">{report.contracts_signed}</td>
                      <td className="p-4 text-right font-semibold text-green-600">
                        {report.total_contracts > 0 ? Math.round((report.contracts_signed / report.total_contracts) * 100) : 0}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
