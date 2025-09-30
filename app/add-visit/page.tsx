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
const RATING_EMOJIS = ['😢', '😕', '😐', '😊', '🤩']

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
  const [newCafeArea, setNewCafeArea] = useState('')
  const [newCafePostcode, setNewCafePostcode] = useState('')

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
    setShowNewCafeForm(false)
  }

  const handleShowNewCafeForm = () => {
    setNewCafeName(searchTerm)
    setShowNewCafeForm(true)
  }

  const handleCreateNewCafe = async () => {
    if (!newCafeName.trim()) return

    const response = await fetch('/api/cafes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCafeName,
        area: newCafeArea || undefined,
        postcode: newCafePostcode || undefined,
        source: 'user',
      }),
    })

    const newCafe = await response.json()
    setSelectedCafe(newCafe)
    setSearchTerm(newCafe.name)
    setShowNewCafeForm(false)
    setShowSuggestions(false)
    setCafes([...cafes, newCafe])

    // Reset new cafe form
    setNewCafeName('')
    setNewCafeArea('')
    setNewCafePostcode('')
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Add Visit</h1>
        <p className="text-gray-600 font-semibold">Log your latest café adventure</p>
      </div>

      {success && (
        <div className="bg-green-50 border-2 border-green-400 text-green-800 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <div className="font-bold text-xl">Visit logged successfully!</div>
            <div className="text-sm font-semibold">Keep exploring Bristol&apos;s café scene!</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Café Search Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
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
              className="w-full px-5 py-4 text-lg font-semibold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              required
            />

            {showSuggestions && filteredCafes.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                {filteredCafes.map((cafe) => (
                  <button
                    key={cafe.id}
                    type="button"
                    onClick={() => handleSelectCafe(cafe)}
                    className="w-full px-5 py-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-bold text-black">{cafe.name}</div>
                    <div className="text-sm text-gray-600 font-semibold flex items-center gap-2 mt-1">
                      {cafe.area && <span>📍 {cafe.area}</span>}
                      {cafe.postcode && <span className="font-mono">• {cafe.postcode}</span>}
                    </div>
                    {cafe.visitorCounts &&
                      Object.keys(cafe.visitorCounts).length > 0 && (
                        <div className="text-sm text-gray-600 font-semibold mt-1">
                          Visited by:{' '}
                          {Object.entries(cafe.visitorCounts)
                            .map(([name, count]) => `${name} (${count}×)`)
                            .join(', ')}
                        </div>
                      )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Can't find café button - shows when there are search results OR no results */}
          {searchTerm.trim() && !selectedCafe && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleShowNewCafeForm}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-lg transition-all border-2 border-gray-300 hover:border-black flex items-center justify-center gap-2"
              >
                <span className="text-xl">➕</span>
                <span>Can&apos;t find your café? Add it here</span>
              </button>
            </div>
          )}

          {/* New Café Form - expands inline */}
          {showNewCafeForm && (
            <div className="mt-4 bg-gray-50 p-6 rounded-xl border-2 border-gray-300 space-y-4">
              <h3 className="font-bold text-black text-lg">Add New Café</h3>
              <p className="text-sm text-gray-600 font-semibold">
                This café will be added without a map pin (you can add location details later)
              </p>

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Café Name *
                </label>
                <input
                  type="text"
                  value={newCafeName}
                  onChange={(e) => setNewCafeName(e.target.value)}
                  placeholder="e.g., The Bristol Coffee House"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Area (optional)
                </label>
                <input
                  type="text"
                  value={newCafeArea}
                  onChange={(e) => setNewCafeArea(e.target.value)}
                  placeholder="e.g., Clifton, Stokes Croft"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Postcode (optional)
                </label>
                <input
                  type="text"
                  value={newCafePostcode}
                  onChange={(e) => setNewCafePostcode(e.target.value)}
                  placeholder="e.g., BS8 1AB"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCreateNewCafe}
                  disabled={!newCafeName.trim()}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 font-bold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Create Café
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCafeForm(false)}
                  className="flex-1 px-6 py-3 bg-white text-black border-2 border-gray-300 rounded-lg hover:border-black font-bold transition-colors"
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
              <div className="font-bold text-green-900 text-xl">{selectedCafe.name}</div>
              {selectedCafe.area && (
                <div className="text-green-700 font-semibold flex items-center gap-2 mt-1">
                  <span>📍</span>
                  <span>{selectedCafe.area}</span>
                  {selectedCafe.postcode && <span className="font-mono">• {selectedCafe.postcode}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visitor & Date Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <span>👤</span>
            <span>Visit Details</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Who visited? *
              </label>
              <select
                value={visitor}
                onChange={(e) => setVisitor(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-lg font-semibold"
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
              <label className="block text-sm font-bold text-black mb-2">
                Visit Date
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Ratings Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <span>⭐</span>
              <span>Rate Your Experience</span>
            </h2>
            <div className="bg-black text-white px-6 py-3 rounded-xl shadow-lg">
              <span className="text-sm font-bold">Overall: </span>
              <span className="text-3xl font-bold">{avgRating}</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Vibe Rating */}
            <div className="space-y-2">
              <label className="text-base font-bold text-black">✨ Vibe</label>
              <p className="text-xs text-gray-600 font-semibold">Atmosphere, ambiance, and overall feel</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setVibeRating(rating)}
                    className={`py-4 px-3 rounded-lg border-2 transition-all font-bold min-h-[56px] ${
                      vibeRating === rating
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-200 hover:border-black'
                    }`}
                  >
                    <div className="text-2xl mb-1">{RATING_EMOJIS[rating - 1]}</div>
                    <div>{rating}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Food Rating */}
            <div className="space-y-2">
              <label className="text-base font-bold text-black">🍰 Food</label>
              <p className="text-xs text-gray-600 font-semibold">Quality and variety of food</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFoodRating(rating)}
                    className={`py-4 px-3 rounded-lg border-2 transition-all font-bold min-h-[56px] ${
                      foodRating === rating
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-200 hover:border-black'
                    }`}
                  >
                    <div className="text-2xl mb-1">{RATING_EMOJIS[rating - 1]}</div>
                    <div>{rating}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Coffee Rating */}
            <div className="space-y-2">
              <label className="text-base font-bold text-black">☕ Coffee</label>
              <p className="text-xs text-gray-600 font-semibold">Coffee quality and preparation</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setCoffeeRating(rating)}
                    className={`py-4 px-3 rounded-lg border-2 transition-all font-bold min-h-[56px] ${
                      coffeeRating === rating
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-200 hover:border-black'
                    }`}
                  >
                    <div className="text-2xl mb-1">{RATING_EMOJIS[rating - 1]}</div>
                    <div>{rating}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Rating */}
            <div className="space-y-2">
              <label className="text-base font-bold text-black">💰 Value</label>
              <p className="text-xs text-gray-600 font-semibold">Price vs quality ratio</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setPriceRating(rating)}
                    className={`py-4 px-3 rounded-lg border-2 transition-all font-bold min-h-[56px] ${
                      priceRating === rating
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-200 hover:border-black'
                    }`}
                  >
                    <div className="text-2xl mb-1">{RATING_EMOJIS[rating - 1]}</div>
                    <div>{rating}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <span>📝</span>
            <span>Additional Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                🍰 Items Bought
              </label>
              <textarea
                value={itemsBought}
                onChange={(e) => setItemsBought(e.target.value)}
                placeholder="e.g., Flat white, almond croissant, avocado toast"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all font-semibold"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                💡 Recommendations
              </label>
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="What should others try? e.g., Try the blueberry muffin!"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all font-semibold"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                📋 Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any other thoughts or observations?"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all font-semibold"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedCafe || !visitor}
          className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white font-bold text-xl px-8 py-5 rounded-xl transition-all transform hover:scale-[1.02] disabled:transform-none shadow-lg disabled:shadow-none"
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

export default function AddVisitPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-6">Add Visit</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-8 text-gray-600 font-semibold">Loading...</div>
        </div>
      </div>
    }>
      <AddVisitForm />
    </Suspense>
  )
}