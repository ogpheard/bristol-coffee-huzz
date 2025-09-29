'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Cafe = {
  id: string
  name: string
  area: string | null
  postcode: string | null
  website: string | null
  totalVisits: number
}

export default function ToVisitPage() {
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterArea, setFilterArea] = useState('')
  const [filterWebsite, setFilterWebsite] = useState<'all' | 'with' | 'without'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCafes()
  }, [])

  const fetchCafes = async () => {
    try {
      const response = await fetch('/api/cafes?unvisited=true')
      const data = await response.json()
      setCafes(data)
      setFilteredCafes(data)
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

    // Website filter
    if (filterWebsite === 'with') {
      filtered = filtered.filter((cafe) => cafe.website)
    } else if (filterWebsite === 'without') {
      filtered = filtered.filter((cafe) => !cafe.website)
    }

    setFilteredCafes(filtered)
  }, [searchTerm, filterArea, filterWebsite, cafes])

  const areas = [...new Set(cafes.map((c) => c.area).filter(Boolean))] as string[]

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-900 mb-6">To Visit</h1>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-3xl font-bold text-amber-900 mb-2">
          {cafes.length}
        </div>
        <div className="text-gray-600">
          cafés waiting to be explored!
        </div>
      </div>

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
              Website
            </label>
            <select
              value={filterWebsite}
              onChange={(e) =>
                setFilterWebsite(e.target.value as 'all' | 'with' | 'without')
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="with">With website</option>
              <option value="without">Without website</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-gray-600 mb-4">
        Showing {filteredCafes.length} of {cafes.length} unvisited cafés
      </div>

      {/* Grid of cafes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCafes.map((cafe) => (
          <div
            key={cafe.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4"
          >
            <h3 className="font-semibold text-lg text-amber-900 mb-2">
              {cafe.name}
            </h3>

            <div className="text-sm text-gray-600 mb-3 space-y-1">
              {cafe.area && (
                <div>
                  <span className="font-medium">Area:</span> {cafe.area}
                </div>
              )}
              {cafe.postcode && (
                <div>
                  <span className="font-medium">Postcode:</span> {cafe.postcode}
                </div>
              )}
              {cafe.website && (
                <div>
                  <a
                    href={cafe.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700 underline"
                  >
                    Visit website
                  </a>
                </div>
              )}
            </div>

            <Link
              href={`/add-visit?cafe=${encodeURIComponent(cafe.name)}`}
              className="inline-block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Mark Visited
            </Link>
          </div>
        ))}
      </div>

      {filteredCafes.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No cafés found matching your filters.
        </div>
      )}
    </div>
  )
}