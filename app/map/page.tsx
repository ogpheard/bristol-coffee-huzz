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
  const userLocationMarker = useRef<mapboxgl.Marker | null>(null)
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([])
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVisited, setFilterVisited] = useState<'all' | 'visited' | 'unvisited'>('all')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyCafes, setNearbyCafes] = useState<(Cafe & { distance: number })[]>([])
  const [nearbyFilter, setNearbyFilter] = useState<'all' | 'visited' | 'unvisited'>('all')

  useEffect(() => {
    fetchCafes()
    getUserLocation()
  }, [])

  const getUserLocation = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(location)
      },
      (error) => {
        console.error('Error getting location:', error)
      }
    )
  }

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

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

  // Calculate nearby cafes when user location or cafes change
  useEffect(() => {
    if (!userLocation) return

    const cafesWithDistance = cafes
      .filter((cafe) => cafe.latitude && cafe.longitude)
      .map((cafe) => ({
        ...cafe,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          cafe.latitude!,
          cafe.longitude!
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10) // Top 10 nearest cafes

    setNearbyCafes(cafesWithDistance)
  }, [userLocation, cafes])

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

      // Create main marker element
      const el = document.createElement('div')
      el.className = 'cafe-marker'
      el.style.width = '36px'
      el.style.height = '36px'
      el.style.borderRadius = '50%'
      el.style.cursor = 'pointer'
      el.style.border = '3px solid white'
      el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
      el.style.transition = 'transform 0.2s, box-shadow 0.2s'
      el.style.position = 'relative'

      // Color based on rating
      const color = getColorForRating(cafe.avgRating)
      el.style.backgroundColor = color

      // Add visitor badges directly to marker element
      if (cafe.uniqueVisitors.length > 0) {
        const badge = document.createElement('div')
        badge.className = 'visitor-badge'
        badge.textContent = cafe.uniqueVisitors
          .map((v) => v[0])
          .join('')
        badge.style.position = 'absolute'
        badge.style.top = '-10px'
        badge.style.right = '-10px'
        badge.style.backgroundColor = '#000000'
        badge.style.color = 'white'
        badge.style.fontSize = '11px'
        badge.style.padding = '3px 6px'
        badge.style.borderRadius = '6px'
        badge.style.fontWeight = 'bold'
        badge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
        badge.style.fontFamily = 'var(--font-fredoka)'
        badge.style.pointerEvents = 'none'
        badge.style.zIndex = '10'
        el.appendChild(badge)
      }

      // Create popup with café name and rating
      const popupContent = `
        <div style="padding: 8px; min-width: 150px; font-family: var(--font-fredoka);">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #1f2937;">
            ${cafe.name}
          </div>
          ${cafe.totalVisits > 0 ? `
            <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280;">
              <span>⭐</span>
              <span style="font-weight: 600;">${cafe.avgRating.toFixed(1)}</span>
              <span>•</span>
              <span>${cafe.totalVisits} ${cafe.totalVisits === 1 ? 'visit' : 'visits'}</span>
            </div>
          ` : `
            <div style="font-size: 12px; color: #9ca3af;">Not visited yet</div>
          `}
          ${cafe.area ? `
            <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
              📍 ${cafe.area}
            </div>
          ` : ''}
        </div>
      `

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
        maxWidth: '300px'
      }).setHTML(popupContent)

      // Create marker with proper anchor to prevent positioning issues
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([cafe.longitude, cafe.latitude])
        .setPopup(popup)
        .addTo(map.current!)

      // Hover effect and popup toggle
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)'
        el.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)'
        el.style.zIndex = '1000'
        marker.togglePopup()
      })

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
        el.style.zIndex = 'auto'
        marker.togglePopup()
      })

      // Click to select cafe and fly to location
      el.addEventListener('click', () => {
        setSelectedCafe(cafe)
        map.current?.flyTo({
          center: [cafe.longitude!, cafe.latitude!],
          zoom: 15,
          duration: 1000,
        })
      })

      markers.current.push(marker)
    })
  }, [filteredCafes])

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return

    // Remove existing user location marker
    if (userLocationMarker.current) {
      userLocationMarker.current.remove()
    }

    // Create user location marker
    const el = document.createElement('div')
    el.style.width = '24px'
    el.style.height = '24px'
    el.style.borderRadius = '50%'
    el.style.backgroundColor = '#3b82f6'
    el.style.border = '4px solid white'
    el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3), 0 0 0 8px rgba(59, 130, 246, 0.2)'
    el.style.cursor = 'pointer'

    const popup = new mapboxgl.Popup({
      offset: 15,
      closeButton: false,
    }).setHTML(`
      <div style="padding: 6px; font-family: var(--font-fredoka); font-weight: 600;">
        📍 Your Location
      </div>
    `)

    userLocationMarker.current = new mapboxgl.Marker(el)
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(popup)
      .addTo(map.current)

    el.addEventListener('mouseenter', () => {
      popup.addTo(map.current!)
    })

    el.addEventListener('mouseleave', () => {
      popup.remove()
    })
  }, [userLocation])

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
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">🗺️ Map</h1>
        <p className="text-gray-600">Explore all {cafes.length} Bristol cafés</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔍 Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cafés, areas, postcodes..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📊 Filter
            </label>
            <select
              value={filterVisited}
              onChange={(e) => setFilterVisited(e.target.value as 'all' | 'visited' | 'unvisited')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all font-semibold"
            >
              <option value="all">All cafés ({cafes.length})</option>
              <option value="visited">Visited ({cafes.filter(c => c.totalVisits > 0).length})</option>
              <option value="unvisited">Unvisited ({cafes.filter(c => c.totalVisits === 0).length})</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-400 border-2 border-white shadow-sm"></div>
                <span className="text-gray-700 font-semibold">Unvisited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                <span className="text-gray-700 font-semibold">1★</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
                <span className="text-gray-700 font-semibold">2★</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-yellow-500 border-2 border-white shadow-sm"></div>
                <span className="text-gray-700 font-semibold">3★</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-lime-500 border-2 border-white shadow-sm"></div>
                <span className="text-gray-700 font-semibold">4★</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-600 border-2 border-white shadow-sm"></div>
                <span className="text-gray-700 font-semibold">5★</span>
              </div>
            </div>
            <div className="text-gray-600 font-semibold">
              Showing {filteredCafes.length} of {cafes.length} cafés
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
        <div ref={mapContainer} className="w-full h-[60vh] sm:h-[70vh]" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Nearby Cafes - Below map on mobile, sidebar on desktop */}
        {userLocation && !selectedCafe && nearbyCafes.length > 0 && (
          <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
            <div className="bg-black p-6">
              <h2 className="text-2xl font-bold text-white mb-2">📍 Nearby Cafés</h2>
              <p className="text-gray-300 text-sm">Closest cafés to your location</p>
            </div>

            <div className="p-4 border-b border-gray-200">
              <select
                value={nearbyFilter}
                onChange={(e) => setNearbyFilter(e.target.value as 'all' | 'visited' | 'unvisited')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all font-semibold"
              >
                <option value="all">All Nearby</option>
                <option value="visited">Visited Only</option>
                <option value="unvisited">Unvisited Only</option>
              </select>
            </div>

            <div className="overflow-y-auto max-h-96 lg:max-h-[500px]">
              {nearbyCafes
                .filter((cafe) => {
                  if (nearbyFilter === 'visited') return cafe.totalVisits > 0
                  if (nearbyFilter === 'unvisited') return cafe.totalVisits === 0
                  return true
                })
                .map((cafe) => (
                  <button
                    key={cafe.id}
                    onClick={() => {
                      setSelectedCafe(cafe)
                      map.current?.flyTo({
                        center: [cafe.longitude!, cafe.latitude!],
                        zoom: 15,
                        duration: 1000,
                      })
                    }}
                    className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-black mb-1">{cafe.name}</h3>
                        {cafe.area && (
                          <p className="text-sm text-gray-600 mb-2">📍 {cafe.area}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-600 font-semibold">
                            🚶 {cafe.distance < 1
                              ? `${Math.round(cafe.distance * 1000)}m`
                              : `${cafe.distance.toFixed(1)}km`}
                          </span>
                          {cafe.totalVisits > 0 ? (
                            <span className="bg-black text-white px-2 py-1 rounded font-bold">
                              ⭐ {cafe.avgRating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold">
                              Not visited
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl">
                        {cafe.totalVisits > 0 ? '✅' : '📍'}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Selected Cafe - Below map on mobile, sidebar on desktop */}
        {selectedCafe && (
          <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-black p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedCafe.name}
                  </h2>
                  {selectedCafe.area && (
                    <p className="text-gray-300 flex items-center gap-2">
                      <span>📍</span>
                      <span>{selectedCafe.area}</span>
                      {selectedCafe.postcode && <span className="font-mono">• {selectedCafe.postcode}</span>}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedCafe(null)}
                  className="text-white hover:text-gray-300 text-3xl font-bold transition-colors ml-2"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 max-h-96 lg:max-h-[500px]">
              {selectedCafe.totalVisits > 0 ? (
                <>
                  {/* Overall Rating */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
                    <div className="text-5xl font-bold text-black mb-2">
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
                        <div key={name} className="bg-gray-100 px-3 py-2 rounded-lg">
                          <span className="font-semibold text-black">{name}</span>
                          <span className="text-gray-700"> × {count}</span>
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
                    className="block w-full text-center bg-black hover:bg-gray-900 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 mt-6"
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
                    className="block w-full text-center bg-black hover:bg-gray-900 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105"
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
  if (rating < 1.5) return '#ef4444' // Red - 1 star
  if (rating < 2.5) return '#f59e0b' // Orange - 2 stars
  if (rating < 3.5) return '#eab308' // Yellow - 3 stars
  if (rating < 4.5) return '#84cc16' // Lime - 4 stars
  return '#16a34a' // Green - 5 stars
}

function RatingBar({ label, rating }: { label: string; rating: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="font-bold text-black">{rating.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-black h-3 rounded-full transition-all duration-500"
          style={{ width: `${(rating / 5) * 100}%` }}
        />
      </div>
    </div>
  )
}