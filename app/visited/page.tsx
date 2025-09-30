'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

type Visit = {
  id: string
  visitorName: string
  visitDate: string
  vibeRating: number
  foodRating: number
  coffeeRating: number
  priceRating: number
  itemsBought: string | null
  recommendations: string | null
  notes: string | null
}

type Cafe = {
  id: string
  name: string
  area: string | null
  postcode: string | null
  avgRating: number
  avgVibe: number
  avgFood: number
  avgCoffee: number
  avgPrice: number
  totalVisits: number
  visitorCounts: Record<string, number>
  lastVisit: string | null
  visits: Visit[]
}

export default function VisitedPage() {
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'visits' | 'date'>('rating')
  const [filterArea, setFilterArea] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)

  useEffect(() => {
    fetchCafes()
  }, [])

  const fetchCafes = async () => {
    try {
      const response = await fetch('/api/cafes')
      const data = await response.json()
      // Fetch full visit details for each cafe
      const cafesWithVisits = await Promise.all(
        data
          .filter((c: Cafe) => c.totalVisits > 0)
          .map(async (cafe: Cafe) => {
            const cafeResponse = await fetch(`/api/cafes/${cafe.id}`)
            const fullCafe = await cafeResponse.json()
            return fullCafe
          })
      )
      setCafes(cafesWithVisits)
      setFilteredCafes(cafesWithVisits)
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
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">☕</div>
          <div className="text-xl text-gray-600">Loading your café adventures...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-black">✅ Visited Cafés</h1>
        <div className="text-lg font-semibold text-gray-600">
          {filteredCafes.length} {filteredCafes.length === 1 ? 'café' : 'cafés'}
        </div>
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
              ⚡ Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'rating' | 'visits' | 'date')
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="rating">⭐ Highest rated</option>
              <option value="visits">🔥 Most visited</option>
              <option value="date">📅 Latest visit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cafés Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCafes.map((cafe) => (
          <div
            key={cafe.id}
            onClick={() => setSelectedCafe(cafe)}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer border-2 border-gray-200 hover:border-black p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-black flex-1">
                {cafe.name}
              </h3>
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-lg">⭐</span>
                <span className="font-bold text-black">
                  {cafe.avgRating.toFixed(1)}
                </span>
              </div>
            </div>

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
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <RatingBadge label="Vibe" rating={cafe.avgVibe} />
              <RatingBadge label="Food" rating={cafe.avgFood} />
              <RatingBadge label="Coffee" rating={cafe.avgCoffee} />
              <RatingBadge label="Value" rating={cafe.avgPrice} />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm">
                <span className="font-semibold text-gray-900">{cafe.totalVisits}</span>
                <span className="text-gray-600"> visits</span>
              </div>
              <div className="flex gap-1">
                {Object.entries(cafe.visitorCounts).map(([name, count]) => (
                  <div
                    key={name}
                    className="bg-gray-200 text-black px-2 py-1 rounded-full text-xs font-semibold"
                    title={`${name}: ${count} visits`}
                  >
                    {name[0]} {count}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCafes.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">😔</div>
          <div className="text-xl text-gray-600">No cafés found matching your filters</div>
        </div>
      )}

      {/* Café Detail Modal */}
      {selectedCafe && (
        <CafeDetailModal cafe={selectedCafe} onClose={() => setSelectedCafe(null)} />
      )}
    </div>
  )
}

function RatingBadge({ label, rating }: { label: string; rating: number }) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="font-bold text-black">{rating.toFixed(1)}</div>
    </div>
  )
}

function CafeDetailModal({ cafe, onClose }: { cafe: Cafe; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black p-8 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{cafe.name}</h2>
              {cafe.area && (
                <p className="text-gray-300 flex items-center gap-2">
                  <span>📍</span>
                  <span>{cafe.area}</span>
                  {cafe.postcode && <span className="font-mono">• {cafe.postcode}</span>}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-3xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Overall Rating */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
            <div className="text-6xl font-bold text-black mb-2">
              {cafe.avgRating.toFixed(1)}
            </div>
            <div className="text-gray-600 mb-4">Overall Rating</div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-black">{cafe.avgVibe.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Vibe</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{cafe.avgFood.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Food</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{cafe.avgCoffee.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Coffee</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{cafe.avgPrice.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Value</div>
              </div>
            </div>
          </div>

          {/* Visitors */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">👥 Visitors</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(cafe.visitorCounts).map(([name, count]) => (
                <div key={name} className="bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="font-semibold text-black">{name}</span>
                  <span className="text-gray-700"> visited {count}×</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visit History */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              📅 Visit History ({cafe.visits.length})
            </h3>
            <div className="space-y-4">
              {cafe.visits.map((visit) => (
                <div key={visit.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-black">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 text-black px-3 py-1 rounded-full font-semibold">
                        {visit.visitorName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(visit.visitDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span className="font-bold">
                        {((visit.vibeRating + visit.foodRating + visit.coffeeRating + visit.priceRating) / 4).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                    <div>
                      <span className="text-gray-600">Vibe: </span>
                      <span className="font-semibold">{visit.vibeRating}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Food: </span>
                      <span className="font-semibold">{visit.foodRating}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Coffee: </span>
                      <span className="font-semibold">{visit.coffeeRating}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Value: </span>
                      <span className="font-semibold">{visit.priceRating}</span>
                    </div>
                  </div>

                  {visit.itemsBought && (
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">🍰 Ordered: </span>
                      <span className="text-gray-600">{visit.itemsBought}</span>
                    </div>
                  )}

                  {visit.recommendations && (
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">💡 Recommends: </span>
                      <span className="text-gray-600">{visit.recommendations}</span>
                    </div>
                  )}

                  {visit.notes && (
                    <div>
                      <span className="font-semibold text-gray-700">📝 Notes: </span>
                      <span className="text-gray-600">{visit.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}