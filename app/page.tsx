import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="bg-black rounded-2xl shadow-2xl p-12 text-center mb-8">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-5xl font-bold text-white mb-4">
          Bristol Brew Baddies
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          The ultimate café conquest! Track every visit, rate every brew, and compete with your crew across Bristol&apos;s finest coffee spots.
        </p>
        <Link
          href="/add-visit"
          className="inline-block bg-white text-black font-semibold px-10 py-4 rounded-lg hover:bg-gray-100 transition-all shadow-lg text-lg"
        >
          ➕ Log Your First Visit
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link href="/add-visit" className="group">
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all border border-gray-200 group-hover:border-black">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-black mb-3">Log Visits</h3>
            <p className="text-gray-600">
              Quick and intuitive visit logging with ratings for vibe, food, coffee, and value
            </p>
          </div>
        </Link>

        <Link href="/map" className="group">
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all border border-gray-200 group-hover:border-black">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-black mb-3">Explore Map</h3>
            <p className="text-gray-600">
              See all 513 Bristol cafés on an interactive map with color-coded ratings and visitor badges
            </p>
          </div>
        </Link>

        <Link href="/scoreboard" className="group">
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all border border-gray-200 group-hover:border-black">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-black mb-3">Leaderboards</h3>
            <p className="text-gray-600">
              Compare stats, track progress, and see who&apos;s the ultimate Bristol brew baddie!
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/visited" className="bg-white border border-gray-200 rounded-xl p-6 hover:border-black hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="text-4xl">✅</div>
            <div>
              <h3 className="text-xl font-bold text-black">Visited Cafés</h3>
              <p className="text-gray-600">Browse your conquered coffee spots</p>
            </div>
          </div>
        </Link>

        <Link href="/to-visit" className="bg-white border border-gray-200 rounded-xl p-6 hover:border-black hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📍</div>
            <div>
              <h3 className="text-xl font-bold text-black">To Visit</h3>
              <p className="text-gray-600">Discover cafés waiting to be explored</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
