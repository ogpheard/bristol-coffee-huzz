'use client'

import { useEffect, useState } from 'react'

type Stats = {
  overview: {
    totalCafes: number
    totalVisited: number
    totalRemaining: number
    percentComplete: string
  }
  leaderboard: Array<{
    name: string
    totalVisits: number
    uniqueCafes: number
  }>
  topCafes: Array<{
    id: string
    name: string
    area: string | null
    avgRating: number
    totalVisits: number
  }>
  areaStats: Array<{
    area: string
    total: number
    visited: number
    remaining: number
    percentComplete: number
  }>
}

export default function ScoreboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!stats) {
    return <div className="text-center py-8">No data available</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Scoreboard</h1>

      {/* Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-amber-900 mb-2">
            {stats.overview.totalCafes}
          </div>
          <div className="text-gray-600">Total Cafés</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.overview.totalVisited}
          </div>
          <div className="text-gray-600">Visited</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {stats.overview.totalRemaining}
          </div>
          <div className="text-gray-600">Remaining</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-amber-600 mb-2">
            {stats.overview.percentComplete}%
          </div>
          <div className="text-gray-600">Complete</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-amber-900 mb-4">
          Overall Progress
        </h2>
        <div className="w-full bg-gray-200 rounded-full h-8">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-8 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ width: `${stats.overview.percentComplete}%` }}
          >
            {parseFloat(stats.overview.percentComplete) > 5 &&
              `${stats.overview.percentComplete}%`}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-amber-900 mb-4">
          Leaderboard
        </h2>
        <div className="space-y-4">
          {stats.leaderboard.map((person, index) => (
            <div
              key={person.name}
              className="flex items-center justify-between p-4 bg-amber-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-amber-900 w-8">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div>
                  <div className="font-semibold text-lg">{person.name}</div>
                  <div className="text-sm text-gray-600">
                    {person.uniqueCafes} unique cafés • {person.totalVisits}{' '}
                    total visits
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-600">
                  {person.uniqueCafes}
                </div>
                <div className="text-xs text-gray-600">cafés</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Cafes */}
      {stats.topCafes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">
            Top Rated Cafés
          </h2>
          <div className="text-sm text-gray-600 mb-4">
            (Minimum 2 visits to qualify)
          </div>
          <div className="space-y-3">
            {stats.topCafes.map((cafe, index) => (
              <div
                key={cafe.id}
                className="flex items-center justify-between p-3 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold text-gray-400 w-6">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{cafe.name}</div>
                    <div className="text-sm text-gray-600">
                      {cafe.area} • {cafe.totalVisits} visits
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-amber-600">
                    {cafe.avgRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">/ 5</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Area Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-amber-900 mb-4">
          Progress by Area
        </h2>
        <div className="space-y-4">
          {stats.areaStats.map((area) => (
            <div key={area.area}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">{area.area}</div>
                  <div className="text-sm text-gray-600">
                    {area.visited} of {area.total} visited • {area.remaining}{' '}
                    remaining
                  </div>
                </div>
                <div className="text-lg font-semibold text-amber-600">
                  {area.percentComplete}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-amber-600 h-3 rounded-full"
                  style={{ width: `${area.percentComplete}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}