'use client'

import { useEffect, useState, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Cafe = {
  id: string
  name: string
  area: string | null
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
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCafes()
  }, [])

  const fetchCafes = async () => {
    try {
      const response = await fetch('/api/cafes')
      const data = await response.json()
      setCafes(data.filter((c: Cafe) => c.latitude && c.longitude))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching cafes:', error)
      setLoading(false)
    }
  }

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

    // Add markers for cafes
    cafes.forEach((cafe) => {
      if (!cafe.latitude || !cafe.longitude) return

      const el = document.createElement('div')
      el.className = 'cafe-marker'
      el.style.width = '30px'
      el.style.height = '30px'
      el.style.borderRadius = '50%'
      el.style.cursor = 'pointer'
      el.style.border = '2px solid white'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

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
        badge.style.top = '-8px'
        badge.style.right = '-8px'
        badge.style.backgroundColor = '#f59e0b'
        badge.style.color = 'white'
        badge.style.fontSize = '10px'
        badge.style.padding = '2px 4px'
        badge.style.borderRadius = '4px'
        badge.style.fontWeight = 'bold'
        el.appendChild(badge)
      }

      el.addEventListener('click', () => {
        setSelectedCafe(cafe)
      })

      new mapboxgl.Marker(el)
        .setLngLat([cafe.longitude, cafe.latitude])
        .addTo(map.current!)
    })

    return () => {
      map.current?.remove()
    }
  }, [cafes, loading])

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

  return (
    <div className="h-[calc(100vh-200px)]">
      <h1 className="text-3xl font-bold text-amber-900 mb-4">Map</h1>

      <div className="flex gap-4 h-full">
        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
        </div>

        {/* Sidebar */}
        {selectedCafe && (
          <div className="w-96 bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
            <button
              onClick={() => setSelectedCafe(null)}
              className="text-gray-500 hover:text-gray-700 float-right"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-amber-900 mb-2">
              {selectedCafe.name}
            </h2>

            {selectedCafe.area && (
              <p className="text-gray-600 mb-4">{selectedCafe.area}</p>
            )}

            {/* Overall Rating */}
            <div className="bg-amber-50 p-4 rounded-lg mb-4">
              <div className="text-3xl font-bold text-amber-900">
                {selectedCafe.avgRating > 0
                  ? selectedCafe.avgRating.toFixed(1)
                  : 'Not rated'}
              </div>
              <div className="text-sm text-gray-600">Overall Rating</div>
            </div>

            {/* Category Ratings */}
            {selectedCafe.totalVisits > 0 && (
              <div className="space-y-2 mb-4">
                <RatingBar label="Vibe" rating={selectedCafe.avgVibe} />
                <RatingBar label="Food" rating={selectedCafe.avgFood} />
                <RatingBar label="Coffee" rating={selectedCafe.avgCoffee} />
                <RatingBar label="Price" rating={selectedCafe.avgPrice} />
              </div>
            )}

            {/* Visitors */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Visitors</h3>
              <div className="text-sm text-gray-600">
                {Object.entries(selectedCafe.visitorCounts).map(
                  ([name, count]) => (
                    <div key={name}>
                      {name} visited {count}×
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Visit Count */}
            <div className="text-sm text-gray-600">
              Total visits: {selectedCafe.totalVisits}
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
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-semibold">{rating.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-amber-600 h-2 rounded-full"
          style={{ width: `${(rating / 5) * 100}%` }}
        />
      </div>
    </div>
  )
}