import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl shadow-2xl p-12 text-center mb-8 transform hover:scale-[1.02] transition-transform">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-5xl font-bold text-white mb-4">
          Bristol Brew Baddies
        </h1>
        <p className="text-xl text-amber-50 mb-8 max-w-2xl mx-auto">
          The ultimate café conquest! Track every visit, rate every brew, and compete with your crew across Bristol's finest coffee spots.
        </p>
        <Link
          href="/add-visit"
          className="inline-block bg-white text-amber-600 font-bold px-10 py-4 rounded-full hover:bg-amber-50 transition-all transform hover:scale-105 shadow-lg text-lg"
        >
          ➕ Log Your First Visit
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link href="/add-visit" className="group">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent group-hover:border-amber-400">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">📝</div>
            <h3 className="text-2xl font-bold text-amber-900 mb-3">Log Visits</h3>
            <p className="text-gray-600">
              Quick and intuitive visit logging with ratings for vibe, food, coffee, and value
            </p>
          </div>
        </Link>

        <Link href="/map" className="group">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent group-hover:border-orange-400">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🗺️</div>
            <h3 className="text-2xl font-bold text-orange-900 mb-3">Explore Map</h3>
            <p className="text-gray-600">
              See all 513 Bristol cafés on an interactive map with color-coded ratings and visitor badges
            </p>
          </div>
        </Link>

        <Link href="/scoreboard" className="group">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent group-hover:border-yellow-400">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🏆</div>
            <h3 className="text-2xl font-bold text-yellow-900 mb-3">Leaderboards</h3>
            <p className="text-gray-600">
              Compare stats, track progress, and see who's the ultimate Bristol brew baddie!
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/visited" className="bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:bg-green-100 transition-all transform hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="text-4xl">✅</div>
            <div>
              <h3 className="text-xl font-bold text-green-900">Visited Cafés</h3>
              <p className="text-green-700">Browse your conquered coffee spots</p>
            </div>
          </div>
        </Link>

        <Link href="/to-visit" className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:bg-blue-100 transition-all transform hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📍</div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">To Visit</h3>
              <p className="text-blue-700">Discover cafés waiting to be explored</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
