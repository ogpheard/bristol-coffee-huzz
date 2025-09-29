import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-amber-900 mb-4">
          Welcome to Bristol Café Quest!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Track your journey through every café in Bristol. Log visits, rate cafés, and compete with your flatmates to see who can visit the most!
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-amber-50 rounded-lg p-6">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold text-amber-900 mb-2">Log Visits</h3>
            <p className="text-sm text-gray-600">
              Quick and easy visit logging with ratings for vibe, food, coffee, and value
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-6">
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="font-semibold text-amber-900 mb-2">Explore the Map</h3>
            <p className="text-sm text-gray-600">
              See all Bristol cafés on an interactive map with ratings and visitor badges
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-semibold text-amber-900 mb-2">Track Progress</h3>
            <p className="text-sm text-gray-600">
              Compare stats, see leaderboards, and track your completion rate
            </p>
          </div>
        </div>

        <Link
          href="/add-visit"
          className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Log Your First Visit
        </Link>
      </div>
    </div>
  )
}
