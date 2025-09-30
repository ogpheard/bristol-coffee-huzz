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

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((cafe) =>
        cafe.name.toLowerCase().includes(search) ||
        cafe.area?.toLowerCase().includes(search) ||
        cafe.postcode?.toLowerCase().includes(search)
      )
    }

    if (filterArea) {
      filtered = filtered.filter((cafe) => cafe.area === filterArea)
    }

    if (filterWebsite === 'with') {
      filtered = filtered.filter((cafe) => cafe.website)
    } else if (filterWebsite === 'without') {
      filtered = filtered.filter((cafe) => !cafe.website)
    }

    setFilteredCafes(filtered)
  }, [searchTerm, filterArea, filterWebsite, cafes])

  const areas = [...new Set(cafes.map((c) => c.area).filter(Boolean))] as string[]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">☕</div>
          <div className="text-xl text-gray-600">Loading cafés...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-black mb-2">📍 To Visit</h1>
        <p className="text-gray-600">Your next café adventures await!</p>
      </div>

      {/* Summary Card */}
      <div className="bg-black rounded-xl shadow-lg p-8 mb-6 text-white text-center">
        <div className="text-6xl font-bold mb-2">{cafes.length}</div>
        <div className="text-xl">cafés waiting to be conquered!</div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔍 Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cafés, areas, postcodes..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📍 Area
            </label>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🌐 Website
            </label>
            <select
              value={filterWebsite}
              onChange={(e) =>
                setFilterWebsite(e.target.value as 'all' | 'with' | 'without')
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="all">All</option>
              <option value="with">With website</option>
              <option value="without">Without website</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-gray-600 mb-4 font-semibold">
        Showing {filteredCafes.length} of {cafes.length} unvisited cafés
      </div>

      {/* Grid of cafes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCafes.map((cafe) => (
          <div
            key={cafe.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 p-6 border-2 border-gray-200 hover:border-black"
          >
            <h3 className="font-bold text-xl text-black mb-3">
              {cafe.name}
            </h3>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {cafe.area && (
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{cafe.area}</span>
                </div>
              )}
              {cafe.postcode && (
                <div className="flex items-center gap-2">
                  <span>🏠</span>
                  <span className="font-mono">{cafe.postcode}</span>
                </div>
              )}
              {cafe.website && (
                <div className="flex items-center gap-2">
                  <span>🌐</span>
                  <a
                    href={cafe.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit website
                  </a>
                </div>
              )}
            </div>

            <Link
              href={`/add-visit?cafe=${encodeURIComponent(cafe.name)}`}
              className="block w-full text-center bg-black hover:bg-gray-900 text-white font-semibold px-4 py-3 rounded-lg transition-all transform hover:scale-105"
            >
              ➕ Mark Visited
            </Link>
          </div>
        ))}
      </div>

      {filteredCafes.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-xl text-gray-600">
            {searchTerm || filterArea ?
              "No cafés found matching your filters" :
              "Congratulations! You've visited all cafés!"}
          </div>
        </div>
      )}
    </div>
  )
}