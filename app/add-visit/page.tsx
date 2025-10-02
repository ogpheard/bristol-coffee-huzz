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
  const [coffeeTasteRating, setCoffeeTasteRating] = useState(3)
  const [coffeePresentationRating, setCoffeePresentationRating] = useState(3)
  const [coffeeTextureRating, setCoffeeTextureRating] = useState(3)
  const [coffeeMugRating, setCoffeeMugRating] = useState(3)
  const [priceRating, setPriceRating] = useState(3)
  const [itemsTags, setItemsTags] = useState<string[]>([])
  const [itemsInput, setItemsInput] = useState('')
  const [recommendationsTags, setRecommendationsTags] = useState<string[]>([])
  const [recommendationsInput, setRecommendationsInput] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // New cafe form
  const [newCafeName, setNewCafeName] = useState('')
  const [newCafeArea, setNewCafeArea] = useState('')
  const [newCafePostcode, setNewCafePostcode] = useState('')
  const [newCafeLocationLat, setNewCafeLocationLat] = useState<number | null>(null)
  const [newCafeLocationLng, setNewCafeLocationLng] = useState<number | null>(null)
  const [newCafeLocationLoading, setNewCafeLocationLoading] = useState(false)
  const [newCafeLocationError, setNewCafeLocationError] = useState('')

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
    setShowSuggestions(false)
  }

  const handleGetNewCafeLocation = () => {
    if (!navigator.geolocation) {
      setNewCafeLocationError('Geolocation is not supported by your browser')
      return
    }

    setNewCafeLocationLoading(true)
    setNewCafeLocationError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewCafeLocationLat(position.coords.latitude)
        setNewCafeLocationLng(position.coords.longitude)
        setNewCafeLocationLoading(false)
      },
      () => {
        setNewCafeLocationError('Unable to retrieve your location')
        setNewCafeLocationLoading(false)
      }
    )
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
        latitude: newCafeLocationLat || undefined,
        longitude: newCafeLocationLng || undefined,
        source: 'user_added',
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
    setNewCafeLocationLat(null)
    setNewCafeLocationLng(null)
    setNewCafeLocationError('')
  }

  const handleItemsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && itemsInput.trim()) {
      e.preventDefault()
      setItemsTags([...itemsTags, itemsInput.trim()])
      setItemsInput('')
    }
  }

  const handleAddItem = () => {
    if (itemsInput.trim()) {
      setItemsTags([...itemsTags, itemsInput.trim()])
      setItemsInput('')
    }
  }

  const removeItemsTag = (index: number) => {
    setItemsTags(itemsTags.filter((_, i) => i !== index))
  }

  const handleRecommendationsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && recommendationsInput.trim()) {
      e.preventDefault()
      setRecommendationsTags([...recommendationsTags, recommendationsInput.trim()])
      setRecommendationsInput('')
    }
  }

  const handleAddRecommendation = () => {
    if (recommendationsInput.trim()) {
      setRecommendationsTags([...recommendationsTags, recommendationsInput.trim()])
      setRecommendationsInput('')
    }
  }

  const removeRecommendationsTag = (index: number) => {
    setRecommendationsTags(recommendationsTags.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCafe || !visitor) return

    setLoading(true)

    try {
      // Combine tags into comma-separated strings
      const itemsBoughtStr = itemsTags.length > 0 ? itemsTags.join(', ') : null
      const recommendationsStr = recommendationsTags.length > 0 ? recommendationsTags.join(', ') : null

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
          itemsBought: itemsBoughtStr,
          recommendations: recommendationsStr,
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
        setCoffeeTasteRating(3)
        setCoffeePresentationRating(3)
        setCoffeeTextureRating(3)
        setCoffeeMugRating(3)
        setPriceRating(3)
        setItemsTags([])
        setItemsInput('')
        setRecommendationsTags([])
        setRecommendationsInput('')
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

  // Calculate average coffee rating from the 4 components
  const coffeeRating = ((coffeeTasteRating + coffeePresentationRating + coffeeTextureRating + coffeeMugRating) / 4)

  const avgRating = ((vibeRating + foodRating + coffeeRating + priceRating) / 4).toFixed(1)

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">Add Visit</h1>
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

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Café Search Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-gray-200">
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

            {showSuggestions && searchTerm.trim() && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                {filteredCafes.length > 0 ? (
                  <>
                    {filteredCafes.map((cafe) => (
                      <button
                        key={cafe.id}
                        type="button"
                        onClick={() => handleSelectCafe(cafe)}
                        className="w-full px-5 py-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors"
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
                    {/* Add café button at bottom of results */}
                    <button
                      type="button"
                      onClick={handleShowNewCafeForm}
                      className="w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 font-bold text-black"
                    >
                      <span className="text-xl">➕</span>
                      <span>Can&apos;t find your café? Add it here</span>
                    </button>
                  </>
                ) : (
                  // Show only the add café button when no results
                  <button
                    type="button"
                    onClick={handleShowNewCafeForm}
                    className="w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 font-bold text-black"
                  >
                    <span className="text-xl">➕</span>
                    <span>Can&apos;t find your café? Add it here</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* New Café Form - expands inline */}
          {showNewCafeForm && (
            <div className="mt-4 bg-gray-50 p-6 rounded-xl border-2 border-gray-300 space-y-4">
              <h3 className="font-bold text-black text-lg">Add New Café</h3>
              <p className="text-sm text-gray-600 font-semibold">
                Add a new café to the list. If you&apos;re at the café, you can pin its location on the map!
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

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  📍 Pin Location (Optional)
                </label>
                <p className="text-xs text-gray-600 font-semibold mb-3">
                  If you&apos;re at the café right now, pin it on the map
                </p>

                {!newCafeLocationLat && !newCafeLocationLng ? (
                  <button
                    type="button"
                    onClick={handleGetNewCafeLocation}
                    disabled={newCafeLocationLoading}
                    className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 font-bold transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {newCafeLocationLoading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Getting location...</span>
                      </>
                    ) : (
                      <>
                        <span>📍</span>
                        <span>Use My Current Location</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-green-900 mb-1">Location saved!</div>
                        <div className="text-sm text-green-700 font-mono">
                          Lat: {newCafeLocationLat?.toFixed(6)}, Lng: {newCafeLocationLng?.toFixed(6)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewCafeLocationLat(null)
                          setNewCafeLocationLng(null)
                        }}
                        className="text-green-900 hover:text-green-700 font-bold text-2xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {newCafeLocationError && (
                  <div className="mt-2 text-sm text-red-600 font-semibold">
                    {newCafeLocationError}
                  </div>
                )}
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
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <span>👤</span>
            <span>Visit Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-3">
                Who visited? *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {VISITORS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisitor(v)}
                    className={`py-4 px-6 rounded-lg border-2 transition-all font-bold text-lg text-center flex items-center justify-center ${
                      visitor === v
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-200 hover:border-black'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Visit Date
              </label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="col-span-3 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ratings Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-black flex items-center gap-2 mb-6">
            <span>⭐</span>
            <span>Rate Your Experience</span>
          </h2>

          <div className="space-y-6">
            {/* Coffee Section - First */}
            <div className="space-y-4 bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-black">☕ Coffee Rating</h3>
              </div>

              {/* Taste */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">👅 Taste</label>
                <p className="text-xs text-gray-600 font-semibold">Flavor profile and richness</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setCoffeeTasteRating(rating)}
                      className={`py-3 px-2 rounded-lg border-2 transition-all font-bold ${
                        coffeeTasteRating === rating
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-200 hover:border-black'
                      }`}
                    >
                      <div className="text-xl font-bold">{rating}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Presentation */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">🎨 Presentation</label>
                <p className="text-xs text-gray-600 font-semibold">Latte art and visual appeal</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setCoffeePresentationRating(rating)}
                      className={`py-3 px-2 rounded-lg border-2 transition-all font-bold ${
                        coffeePresentationRating === rating
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-200 hover:border-black'
                      }`}
                    >
                      <div className="text-xl font-bold">{rating}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Texture */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">🥛 Texture</label>
                <p className="text-xs text-gray-600 font-semibold">Smoothness and consistency</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setCoffeeTextureRating(rating)}
                      className={`py-3 px-2 rounded-lg border-2 transition-all font-bold ${
                        coffeeTextureRating === rating
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-200 hover:border-black'
                      }`}
                    >
                      <div className="text-xl font-bold">{rating}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mug */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">☕ Mug</label>
                <p className="text-xs text-gray-600 font-semibold">Quality and design of the mug</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setCoffeeMugRating(rating)}
                      className={`py-3 px-2 rounded-lg border-2 transition-all font-bold ${
                        coffeeMugRating === rating
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-200 hover:border-black'
                      }`}
                    >
                      <div className="text-xl font-bold">{rating}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Coffee Average */}
              <div className="bg-white border-2 border-amber-300 rounded-lg p-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Coffee Average:</span>
                  <span className="text-2xl font-bold text-black">{coffeeRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

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
                    <div className="text-2xl font-bold">{rating}</div>
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
                    <div className="text-2xl font-bold">{rating}</div>
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
                    <div className="text-2xl font-bold">{rating}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Overall Rating at Bottom */}
            <div className="bg-black text-white px-6 py-4 rounded-xl shadow-lg mt-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Overall Rating:</span>
                <span className="text-4xl font-bold">{avgRating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <span>📝</span>
            <span>Additional Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                🍰 Items Bought
              </label>
              <div className="space-y-2">
                {itemsTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {itemsTags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-black rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-2 hover:bg-gray-300 transition-colors"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeItemsTag(index)}
                          className="text-gray-600 hover:text-black font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={itemsInput}
                    onChange={(e) => setItemsInput(e.target.value)}
                    onKeyDown={handleItemsKeyDown}
                    placeholder="Type an item (e.g., Flat white)"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!itemsInput.trim()}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-bold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                💡 Recommendations
              </label>
              <div className="space-y-2">
                {recommendationsTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recommendationsTags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-black rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-2 hover:bg-gray-300 transition-colors"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeRecommendationsTag(index)}
                          className="text-gray-600 hover:text-black font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recommendationsInput}
                    onChange={(e) => setRecommendationsInput(e.target.value)}
                    onKeyDown={handleRecommendationsKeyDown}
                    placeholder="Type a recommendation (e.g., Blueberry muffin)"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddRecommendation}
                    disabled={!recommendationsInput.trim()}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-bold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    <span>Add</span>
                  </button>
                </div>
              </div>
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