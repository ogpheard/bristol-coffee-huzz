'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Fuse from 'fuse.js'

type Cafe = {
  id: string
  name: string
  area: string | null
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
    // Pre-fill cafe from URL param
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
      keys: ['name', 'area'],
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

        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error creating visit:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Add Visit</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Visit logged successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Cafe Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Café *
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setShowSuggestions(true)}
            placeholder="Search for a café..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />

          {showSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCafes.length > 0 ? (
                filteredCafes.map((cafe) => (
                  <button
                    key={cafe.id}
                    type="button"
                    onClick={() => handleSelectCafe(cafe)}
                    className="w-full px-4 py-2 text-left hover:bg-amber-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{cafe.name}</div>
                    <div className="text-sm text-gray-600">
                      {cafe.area && `${cafe.area} • `}
                      {cafe.visitorCounts &&
                        Object.keys(cafe.visitorCounts).length > 0 && (
                          <span>
                            Visited by:{' '}
                            {Object.entries(cafe.visitorCounts)
                              .map(([name, count]) => `${name} (${count})`)
                              .join(', ')}
                          </span>
                        )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2">
                  <div className="text-gray-600 mb-2">No cafés found</div>
                  <button
                    type="button"
                    onClick={handleShowNewCafeForm}
                    className="text-amber-600 hover:text-amber-700 font-medium"
                  >
                    + Add new café (no map pin yet)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* New Cafe Form */}
        {showNewCafeForm && (
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Add New Café</h3>
            <input
              type="text"
              value={newCafeName}
              onChange={(e) => setNewCafeName(e.target.value)}
              placeholder="Café name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateNewCafe}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewCafeForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Selected Cafe Info */}
        {selectedCafe && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="font-semibold">Selected: {selectedCafe.name}</div>
            {selectedCafe.area && (
              <div className="text-sm text-gray-600">{selectedCafe.area}</div>
            )}
          </div>
        )}

        {/* Visitor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who visited? *
          </label>
          <select
            value={visitor}
            onChange={(e) => setVisitor(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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

        {/* Visit Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visit Date
          </label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Ratings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Ratings (1-5)</h3>

          <RatingInput
            label="Vibe"
            value={vibeRating}
            onChange={setVibeRating}
          />
          <RatingInput
            label="Food"
            value={foodRating}
            onChange={setFoodRating}
          />
          <RatingInput
            label="Coffee"
            value={coffeeRating}
            onChange={setCoffeeRating}
          />
          <RatingInput
            label="Price (value for money)"
            value={priceRating}
            onChange={setPriceRating}
          />
        </div>

        {/* Optional fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items Bought
          </label>
          <textarea
            value={itemsBought}
            onChange={(e) => setItemsBought(e.target.value)}
            placeholder="e.g., Flat white, croissant"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recommendations
          </label>
          <textarea
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            placeholder="e.g., Try the blueberry muffin!"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any other thoughts?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedCafe || !visitor}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Save Visit'}
        </button>
      </form>
    </div>
  )
}

function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-amber-600 font-semibold">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
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