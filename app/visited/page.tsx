'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

type Cafe = {
  id: string
  name: string
  area: string | null
  avgRating: number
  avgVibe: number
  avgFood: number
  avgCoffee: number
  avgPrice: number
  totalVisits: number
  visitorCounts: Record<string, number>
  lastVisit: string | null
}

export default function VisitedPage() {
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'visits' | 'date'>('rating')
  const [filterArea, setFilterArea] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCafes()
  }, [])

  const fetchCafes = async () => {
    try {
      const response = await fetch('/api/cafes')
      const data = await response.json()
      const visitedCafes = data.filter((c: Cafe) => c.totalVisits > 0)
      setCafes(visitedCafes)
      setFilteredCafes(visitedCafes)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching cafes:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = cafes

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((cafe) =>
        cafe.name.toLowerCase().includes(search)
      )
    }

    // Area filter
    if (filterArea) {
      filtered = filtered.filter((cafe) => cafe.area === filterArea)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'rating') {
        return b.avgRating - a.avgRating
      } else if (sortBy === 'visits') {
        return b.totalVisits - a.totalVisits
      } else if (sortBy === 'date') {
        if (!a.lastVisit) return 1
        if (!b.lastVisit) return -1
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
      }
      return 0
    })

    setFilteredCafes(filtered)
  }, [searchTerm, sortBy, filterArea, cafes])

  const areas = [...new Set(cafes.map((c) => c.area).filter(Boolean))] as string[]

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Visited Cafés</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cafés..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area
            </label>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All areas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'rating' | 'visits' | 'date')
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="rating">Highest rated</option>
              <option value="visits">Most visited</option>
              <option value="date">Latest visit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-gray-600 mb-4">
        Showing {filteredCafes.length} of {cafes.length} visited cafés
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Café
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Vibe
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Food
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Coffee
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Visitors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Last Visit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCafes.map((cafe) => (
                <tr key={cafe.id} className="hover:bg-amber-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{cafe.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {cafe.area || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                      {cafe.avgRating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {cafe.avgVibe.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {cafe.avgFood.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {cafe.avgCoffee.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {cafe.avgPrice.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {cafe.totalVisits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {Object.entries(cafe.visitorCounts)
                      .map(([name, count]) => `${name} (${count})`)
                      .join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {cafe.lastVisit
                      ? format(new Date(cafe.lastVisit), 'MMM d, yyyy')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCafes.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No cafés found matching your filters.
        </div>
      )}
    </div>
  )
}