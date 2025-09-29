'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Cafe = {
  id: string
  name: string
  area: string | null
  postcode: string | null
  latitude: number | null
  longitude: number | null
  avgRating: number
  avgVibe: number
  avgFood: number
  avgCoffee: number
  avgPrice: number
  totalVisits: number
  uniqueVisitors: string[]
  visitorCounts: Record<string, number>
}

// You'll need to add your Mapbox token to .env.local
// NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([])
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVisited, setFilterVisited] = useState<'all' | 'visited' | 'unvisited'>('all')

  useEffect(() => {
    fetchCafes()
  }, [])

  const fetchCafes = async () => {
    try {
      const response = await fetch('/api/cafes')
      const data = await response.json()
      const validCafes = data.filter((c: Cafe) => c.latitude && c.longitude)
      setCafes(validCafes)
      setFilteredCafes(validCafes)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching cafes:', error)
      setLoading(false)
    }
  }

  // Filter cafes based on search and visited status
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

    if (filterVisited === 'visited') {
      filtered = filtered.filter((cafe) => cafe.totalVisits > 0)
    } else if (filterVisited === 'unvisited') {
      filtered = filtered.filter((cafe) => cafe.totalVisits === 0)
    }

    setFilteredCafes(filtered)
  }, [searchTerm, filterVisited, cafes])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || loading) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    // Initialize map centered on Bristol
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-2.5879, 51.4545], // Bristol coordinates
      zoom: 12,
    })

    return () => {
      map.current?.remove()
    }
  }, [loading])

  // Update markers when filtered cafes change
  useEffect(() => {
    if (!map.current) return

    // Remove existing markers
    markers.current.forEach((marker) => marker.remove())
    markers.current = []

    // Add markers for filtered cafes
    filteredCafes.forEach((cafe) => {
      if (!cafe.latitude || !cafe.longitude) return

      const el = document.createElement('div')
      el.className = 'cafe-marker'
      el.style.width = '36px'
      el.style.height = '36px'
      el.style.borderRadius = '50%'
      el.style.cursor = 'pointer'
      el.style.border = '3px solid white'
      el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
      el.style.transition = 'transform 0.2s, box-shadow 0.2s'

      // Color based on rating
      const color = getColorForRating(cafe.avgRating)
      el.style.backgroundColor = color

      // Add visitor badges
      if (cafe.uniqueVisitors.length > 0) {
        el.style.position = 'relative'
        const badge = document.createElement('div')
        badge.className = 'visitor-badge'
        badge.textContent = cafe.uniqueVisitors
          .map((v) => v[0])
          .join('')
        badge.style.position = 'absolute'
        badge.style.top = '-10px'
        badge.style.right = '-10px'
        badge.style.backgroundColor = '#f59e0b'
        badge.style.color = 'white'
        badge.style.fontSize = '11px'
        badge.style.padding = '3px 6px'
        badge.style.borderRadius = '6px'
        badge.style.fontWeight = 'bold'
        badge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
        el.appendChild(badge)
      }

      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)'
        el.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)'
        el.style.zIndex = '1000'
      })

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
        el.style.zIndex = 'auto'
      })

      el.addEventListener('click', () => {
        setSelectedCafe(cafe)
        map.current?.flyTo({
          center: [cafe.longitude!, cafe.latitude!],
          zoom: 15,
          duration: 1000,
        })
      })

      const marker = new mapboxgl.Marker(el)
        .setLngLat([cafe.longitude, cafe.latitude])
        .addTo(map.current!)

      markers.current.push(marker)
    })
  }, [filteredCafes])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
        <h2 className="font-semibold mb-2">Mapbox Token Required</h2>
        <p>
          To use the map feature, you need to add a Mapbox token to your .env.local file:
        </p>
        <code className="block bg-yellow-200 p-2 mt-2 rounded">
          NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
        </code>
        <p className="mt-2 text-sm">
          Get a free token at{' '}
          <a
            href="https://www.mapbox.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            mapbox.com
          </a>
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <div className="text-xl text-gray-600">Loading map...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">🗺️ Map</h1>
        <p className="text-gray-600">Explore all {cafes.length} Bristol cafés</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
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
              📊 Filter
            </label>
            <select
              value={filterVisited}
              onChange={(e) => setFilterVisited(e.target.value as 'all' | 'visited' | 'unvisited')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="all">All cafés ({cafes.length})</option>
              <option value="visited">Visited ({cafes.filter(c => c.totalVisits > 0).length})</option>
              <option value="unvisited">Unvisited ({cafes.filter(c => c.totalVisits === 0).length})</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white"></div>
                <span className="text-gray-600">Unvisited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                <span className="text-gray-600">&lt;2.5</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
                <span className="text-gray-600">2.5-3.5</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white"></div>
                <span className="text-gray-600">3.5-4.5</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                <span className="text-gray-600">4.5+</span>
              </div>
            </div>
            <div className="text-gray-600 font-semibold">
              Showing {filteredCafes.length} of {cafes.length} cafés
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full rounded-xl shadow-2xl" />
        </div>

        {/* Sidebar */}
        {selectedCafe && (
          <div className="w-96 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedCafe.name}
                  </h2>
                  {selectedCafe.area && (
                    <p className="text-amber-100 flex items-center gap-2">
                      <span>📍</span>
                      <span>{selectedCafe.area}</span>
                      {selectedCafe.postcode && <span className="font-mono">• {selectedCafe.postcode}</span>}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedCafe(null)}
                  className="text-white hover:text-amber-200 text-3xl font-bold transition-colors ml-2"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedCafe.totalVisits > 0 ? (
                <>
                  {/* Overall Rating */}
                  <div className="bg-amber-50 rounded-xl p-6 mb-6 text-center">
                    <div className="text-5xl font-bold text-amber-900 mb-2">
                      {selectedCafe.avgRating.toFixed(1)}
                    </div>
                    <div className="text-gray-600 mb-4 flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-2xl">
                          {i < Math.round(selectedCafe.avgRating) ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">Overall Rating</div>
                  </div>

                  {/* Category Ratings */}
                  <div className="space-y-4 mb-6">
                    <RatingBar label="🎨 Vibe" rating={selectedCafe.avgVibe} />
                    <RatingBar label="🍰 Food" rating={selectedCafe.avgFood} />
                    <RatingBar label="☕ Coffee" rating={selectedCafe.avgCoffee} />
                    <RatingBar label="💰 Value" rating={selectedCafe.avgPrice} />
                  </div>

                  {/* Visitors */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span>👥</span>
                      <span>Visitors</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedCafe.visitorCounts).map(([name, count]) => (
                        <div key={name} className="bg-amber-100 px-3 py-2 rounded-lg">
                          <span className="font-semibold text-amber-900">{name}</span>
                          <span className="text-amber-700"> × {count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{selectedCafe.totalVisits}</div>
                      <div className="text-sm text-gray-600">Total Visits</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/add-visit?cafe=${encodeURIComponent(selectedCafe.name)}`}
                    className="block w-full text-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 mt-6"
                  >
                    ➕ Add Visit
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📍</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Not visited yet</h3>
                    <p className="text-gray-600 mb-6">Be the first to visit this café!</p>
                  </div>

                  <Link
                    href={`/add-visit?cafe=${encodeURIComponent(selectedCafe.name)}`}
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105"
                  >
                    ➕ Mark as Visited
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getColorForRating(rating: number): string {
  if (rating === 0) return '#9ca3af' // Gray for unvisited
  if (rating < 2.5) return '#ef4444' // Red
  if (rating < 3.5) return '#f59e0b' // Orange
  if (rating < 4.5) return '#eab308' // Yellow
  return '#22c55e' // Green
}

function RatingBar({ label, rating }: { label: string; rating: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="font-bold text-amber-900">{rating.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(rating / 5) * 100}%` }}
        />
      </div>
    </div>
  )
}