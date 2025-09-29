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
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <div className="text-xl text-gray-600">Loading stats...</div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-8">No data available</div>
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">🏆 Scoreboard</h1>
        <p className="text-gray-600">Track your café conquest progress</p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-5xl font-bold mb-2">{stats.overview.totalCafes}</div>
          <div className="text-amber-100 font-semibold">Total Cafés</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-5xl font-bold mb-2">{stats.overview.totalVisited}</div>
          <div className="text-green-100 font-semibold">Visited ✅</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-5xl font-bold mb-2">{stats.overview.totalRemaining}</div>
          <div className="text-blue-100 font-semibold">Remaining 📍</div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-5xl font-bold mb-2">{stats.overview.percentComplete}%</div>
          <div className="text-pink-100 font-semibold">Complete 🎉</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
          <span>📊</span>
          <span>Overall Progress</span>
        </h2>
        <div className="relative w-full bg-gray-200 rounded-full h-12 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 flex items-center justify-center font-bold text-white text-lg transition-all duration-1000 ease-out"
            style={{ width: `${stats.overview.percentComplete}%` }}
          >
            {parseFloat(stats.overview.percentComplete) > 10 && (
              <span className="drop-shadow-lg">{stats.overview.percentComplete}% Complete</span>
            )}
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-3">
          <span>0 cafés</span>
          <span>{stats.overview.totalCafes} cafés</span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
          <span>👑</span>
          <span>Brew Baddie Leaderboard</span>
        </h2>
        <div className="space-y-4">
          {stats.leaderboard.map((person, index) => {
            const medals = ['🥇', '🥈', '🥉']
            const colors = ['from-yellow-400 to-yellow-600', 'from-gray-300 to-gray-500', 'from-orange-400 to-orange-600']
            const bgColors = ['bg-yellow-50', 'bg-gray-50', 'bg-orange-50']

            return (
              <div
                key={person.name}
                className={`${bgColors[index] || 'bg-white'} border-2 ${index < 3 ? 'border-amber-300' : 'border-gray-200'} rounded-xl p-6 transform hover:scale-[1.02] transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-5xl">
                      {index < 3 ? medals[index] : `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-gray-900">{person.name}</div>
                      <div className="text-gray-600 mt-1">
                        <span className="font-semibold">{person.uniqueCafes}</span> unique cafés •
                        <span className="font-semibold"> {person.totalVisits}</span> total visits
                      </div>
                    </div>
                  </div>
                  <div className={`bg-gradient-to-r ${colors[index] || 'from-amber-400 to-amber-600'} text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg`}>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{person.uniqueCafes}</div>
                      <div className="text-xs">cafés</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Cafes */}
      {stats.topCafes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>Top Rated Cafés</span>
          </h2>
          <div className="text-sm text-gray-600 mb-6">Minimum 2 visits to qualify</div>
          <div className="grid md:grid-cols-2 gap-4">
            {stats.topCafes.map((cafe, index) => (
              <div
                key={cafe.id}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-amber-600">#{index + 1}</div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">{cafe.name}</div>
                      {cafe.area && <div className="text-sm text-gray-600">📍 {cafe.area}</div>}
                    </div>
                  </div>
                  <div className="bg-amber-500 text-white px-4 py-2 rounded-full font-bold text-xl shadow-md">
                    {cafe.avgRating.toFixed(1)}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {cafe.totalVisits} {cafe.totalVisits === 1 ? 'visit' : 'visits'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Area Breakdown */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
          <span>🗺️</span>
          <span>Progress by Area</span>
        </h2>
        <div className="space-y-6">
          {stats.areaStats.map((area) => (
            <div key={area.area} className="group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="font-bold text-lg text-gray-900">{area.area}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold text-green-600">{area.visited}</span> visited •
                    <span className="font-semibold text-blue-600"> {area.remaining}</span> remaining •
                    <span className="text-gray-500"> {area.total} total</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-600 min-w-[80px] text-right">
                  {area.percentComplete}%
                </div>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out group-hover:from-amber-600 group-hover:to-orange-600"
                  style={{ width: `${area.percentComplete}%` }}
                />
                {area.percentComplete > 15 && (
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-white font-semibold text-sm drop-shadow">
                      {area.visited} / {area.total}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-center text-white">
        <div className="text-4xl mb-3">💪</div>
        <div className="text-2xl font-bold mb-2">Keep Going, Brew Baddies!</div>
        <div className="text-lg text-purple-100">
          {stats.overview.totalRemaining} more cafés to conquer!
        </div>
      </div>
    </div>
  )
}