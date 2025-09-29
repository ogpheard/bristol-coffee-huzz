import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [allCafes, visits] = await Promise.all([
      prisma.cafe.findMany({
        include: {
          visits: true,
        },
      }),
      prisma.visit.findMany({
        include: {
          cafe: true,
        },
      }),
    ])

    const totalCafes = allCafes.length
    const visitedCafes = allCafes.filter((cafe) => cafe.visits.length > 0)
    const totalVisited = visitedCafes.length
    const totalRemaining = totalCafes - totalVisited
    const percentComplete =
      totalCafes > 0 ? ((totalVisited / totalCafes) * 100).toFixed(1) : '0'

    // Visitor stats
    const visitorStats = visits.reduce(
      (acc, visit) => {
        if (!acc[visit.visitorName]) {
          acc[visit.visitorName] = {
            totalVisits: 0,
            uniqueCafes: new Set<string>(),
          }
        }
        acc[visit.visitorName].totalVisits++
        acc[visit.visitorName].uniqueCafes.add(visit.cafeId)
        return acc
      },
      {} as Record<string, { totalVisits: number; uniqueCafes: Set<string> }>
    )

    const leaderboard = Object.entries(visitorStats)
      .map(([name, stats]) => ({
        name,
        totalVisits: stats.totalVisits,
        uniqueCafes: stats.uniqueCafes.size,
      }))
      .sort((a, b) => b.uniqueCafes - a.uniqueCafes)

    // Top cafes (min 2 visits)
    const topCafes = visitedCafes
      .filter((cafe) => cafe.visits.length >= 2)
      .map((cafe) => {
        const totalVisits = cafe.visits.length
        const avgVibe =
          cafe.visits.reduce((sum, v) => sum + v.vibeRating, 0) / totalVisits
        const avgFood =
          cafe.visits.reduce((sum, v) => sum + v.foodRating, 0) / totalVisits
        const avgCoffee =
          cafe.visits.reduce((sum, v) => sum + v.coffeeRating, 0) / totalVisits
        const avgPrice =
          cafe.visits.reduce((sum, v) => sum + v.priceRating, 0) / totalVisits
        const avgRating = (avgVibe + avgFood + avgCoffee + avgPrice) / 4

        return {
          id: cafe.id,
          name: cafe.name,
          area: cafe.area,
          avgRating: Number(avgRating.toFixed(1)),
          totalVisits,
        }
      })
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10)

    // Area breakdown
    const areaBreakdown = allCafes.reduce(
      (acc, cafe) => {
        const area = cafe.area || 'Unknown'
        if (!acc[area]) {
          acc[area] = { total: 0, visited: 0 }
        }
        acc[area].total++
        if (cafe.visits.length > 0) {
          acc[area].visited++
        }
        return acc
      },
      {} as Record<string, { total: number; visited: number }>
    )

    const areaStats = Object.entries(areaBreakdown)
      .map(([area, stats]) => ({
        area,
        total: stats.total,
        visited: stats.visited,
        remaining: stats.total - stats.visited,
        percentComplete:
          stats.total > 0
            ? Number(((stats.visited / stats.total) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.percentComplete - a.percentComplete)

    return NextResponse.json({
      overview: {
        totalCafes,
        totalVisited,
        totalRemaining,
        percentComplete,
      },
      leaderboard,
      topCafes,
      areaStats,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}