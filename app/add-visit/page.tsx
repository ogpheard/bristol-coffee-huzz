'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Fuse from 'fuse.js'

type Cafe = {
  id: string
  name: string
  area: string | null
  postcode: string | null
  visitorCounts?: Record<string, number>
  lastVisit?: string | null
}

const VISITORS = ['Eleanor', 'Hannah', 'Anna']

function AddVisitForm() {
  const searchParams = useSearchParams()
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([])
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showNewCafeForm, setShowNewCafeForm] = useState(false)

  // Form state
  const [visitor, setVisitor] = useState('')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [vibeRating, setVibeRating] = useState(3)
  const [foodRating, setFoodRating] = useState(3)
  const [coffeeRating, setCoffeeRating] = useState(3)
  const [priceRating, setPriceRating] = useState(3)
  const [itemsBought, setItemsBought] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // New cafe form
  const [newCafeName, setNewCafeName] = useState('')

  useEffect(() => {
    fetchCafes()
  }, [])

  useEffect(() => {
    const cafeName = searchParams.get('cafe')
    if (cafeName && cafes.length > 0) {
      const cafe = cafes.find((c) => c.name === cafeName)
      if (cafe) {
        setSelectedCafe(cafe)
        setSearchTerm(cafe.name)
      } else {
        setSearchTerm(cafeName)
      }
    }
  }, [searchParams, cafes])

  const fetchCafes = async () => {
    const response = await fetch('/api/cafes')
    const data = await response.json()
    setCafes(data)
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCafes([])
      setShowSuggestions(false)
      return
    }

    const fuse = new Fuse(cafes, {
      keys: ['name', 'area', 'postcode'],
      threshold: 0.3,
    })

    const results = fuse.search(searchTerm)
    setFilteredCafes(results.map((r) => r.item).slice(0, 10))
    setShowSuggestions(true)
  }, [searchTerm, cafes])

  const handleSelectCafe = (cafe: Cafe) => {
    setSelectedCafe(cafe)
    setSearchTerm(cafe.name)
    setShowSuggestions(false)
  }

  const handleShowNewCafeForm = () => {
    setNewCafeName(searchTerm)
    setShowNewCafeForm(true)
    setShowSuggestions(false)
  }

  const handleCreateNewCafe = async () => {
    if (!newCafeName.trim()) return

    const response = await fetch('/api/cafes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCafeName }),
    })

    const newCafe = await response.json()
    setSelectedCafe(newCafe)
    setSearchTerm(newCafe.name)
    setShowNewCafeForm(false)
    setCafes([...cafes, newCafe])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCafe || !visitor) return

    setLoading(true)

    try {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeId: selectedCafe.id,
          visitorName: visitor,
          visitDate,
          vibeRating,
          foodRating,
          coffeeRating,
          priceRating,
          itemsBought: itemsBought || null,
          recommendations: recommendations || null,
          notes: notes || null,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        // Reset form
        setSearchTerm('')
        setSelectedCafe(null)
        setVisitor('')
        setVibeRating(3)
        setFoodRating(3)
        setCoffeeRating(3)
        setPriceRating(3)
        setItemsBought('')
        setRecommendations('')
        setNotes('')
        fetchCafes()

        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (error) {
      console.error('Error creating visit:', error)
    } finally {
      setLoading(false)
    }
  }

  const avgRating = ((vibeRating + foodRating + coffeeRating + priceRating) / 4).toFixed(1)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">➕ Add Visit</h1>
        <p className="text-gray-600">Log your latest café adventure</p>
      </div>

      {success && (
        <div className="bg-green-50 border-2 border-green-400 text-green-800 px-6 py-4 rounded-xl mb-6 flex items-center gap-3 animate-bounce">
          <span className="text-3xl">✅</span>
          <div>
            <div className="font-bold text-lg">Visit logged successfully!</div>
            <div className="text-sm">Your café conquest continues...</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Café Search Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span>☕</span>
            <span>Select Café</span>
          </h2>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm && setShowSuggestions(true)}
              placeholder="Search for a café..."
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              required
            />

            {showSuggestions && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-amber-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                {filteredCafes.length > 0 ? (
                  filteredCafes.map((cafe) => (
                    <button
                      key={cafe.id}
                      type="button"
                      onClick={() => handleSelectCafe(cafe)}
                      className="w-full px-5 py-4 text-left hover:bg-amber-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-semibold text-amber-900">{cafe.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        {cafe.area && <span>📍 {cafe.area}</span>}
                        {cafe.postcode && <span className="font-mono">• {cafe.postcode}</span>}
                      </div>
                      {cafe.visitorCounts &&
                        Object.keys(cafe.visitorCounts).length > 0 && (
                          <div className="text-sm text-amber-600 mt-1">
                            Visited by:{' '}
                            {Object.entries(cafe.visitorCounts)
                              .map(([name, count]) => `${name} (${count}×)`)
                              .join(', ')}
                          </div>
                        )}
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-4">
                    <div className="text-gray-600 mb-3">No cafés found</div>
                    <button
                      type="button"
                      onClick={handleShowNewCafeForm}
                      className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-2"
                    >
                      <span className="text-xl">➕</span>
                      <span>Add new café (no map pin yet)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {showNewCafeForm && (
            <div className="mt-4 bg-amber-50 p-5 rounded-xl border-2 border-amber-300">
              <h3 className="font-bold text-amber-900 mb-3">Add New Café</h3>
              <input
                type="text"
                value={newCafeName}
                onChange={(e) => setNewCafeName(e.target.value)}
                placeholder="Café name"
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg mb-3"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCreateNewCafe}
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCafeForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {selectedCafe && (
            <div className="mt-4 bg-green-50 p-5 rounded-xl border-2 border-green-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <span className="font-bold text-green-900 text-lg">Selected:</span>
              </div>
              <div className="font-semibold text-green-900 text-xl">{selectedCafe.name}</div>
              {selectedCafe.area && (
                <div className="text-green-700 flex items-center gap-2 mt-1">
                  <span>📍</span>
                  <span>{selectedCafe.area}</span>
                  {selectedCafe.postcode && <span className="font-mono">• {selectedCafe.postcode}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visitor & Date Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span>👤</span>
            <span>Visit Details</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Who visited? *
              </label>
              <select
                value={visitor}
                onChange={(e) => setVisitor(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-lg"
                required
              >
                <option value="">Select visitor</option>
                {VISITORS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Visit Date
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Ratings Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span>⭐</span>
              <span>Rate Your Experience</span>
            </h2>
            <div className="bg-amber-100 px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-amber-700">Overall: </span>
              <span className="text-2xl font-bold text-amber-900">{avgRating}</span>
            </div>
          </div>

          <div className="space-y-6">
            <RatingInput
              label="✨ Vibe"
              description="Atmosphere, ambiance, and overall feel"
              value={vibeRating}
              onChange={setVibeRating}
            />
            <RatingInput
              label="🍰 Food"
              description="Quality and variety of food"
              value={foodRating}
              onChange={setFoodRating}
            />
            <RatingInput
              label="☕ Coffee"
              description="Coffee quality and preparation"
              value={coffeeRating}
              onChange={setCoffeeRating}
            />
            <RatingInput
              label="💰 Value"
              description="Price vs quality ratio"
              value={priceRating}
              onChange={setPriceRating}
            />
          </div>
        </div>

        {/* Additional Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span>📝</span>
            <span>Additional Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🍰 Items Bought
              </label>
              <textarea
                value={itemsBought}
                onChange={(e) => setItemsBought(e.target.value)}
                placeholder="e.g., Flat white, almond croissant, avocado toast"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💡 Recommendations
              </label>
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="What should others try? e.g., Try the blueberry muffin!"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📋 Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any other thoughts or observations?"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedCafe || !visitor}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-xl px-8 py-5 rounded-xl transition-all transform hover:scale-[1.02] disabled:transform-none shadow-lg disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="animate-spin text-2xl">⏳</span>
              <span>Saving...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <span className="text-2xl">🎉</span>
              <span>Save Visit</span>
            </span>
          )}
        </button>
      </form>
    </div>
  )
}

function RatingInput({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: number
  onChange: (value: number) => void
}) {
  const emojis = ['😢', '😕', '😐', '😊', '🤩']

  return (
    <div className="bg-amber-50 p-5 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-base font-bold text-amber-900">{label}</label>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl">{emojis[value - 1]}</span>
          <span className="text-3xl font-bold text-amber-600">{value}</span>
        </div>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  )
}

export default function AddVisitPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 mb-6">Add Visit</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-8 text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <AddVisitForm />
    </Suspense>
  )
}