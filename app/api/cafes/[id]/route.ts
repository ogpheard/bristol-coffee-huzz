import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id },
      include: {
        visits: {
          orderBy: {
            visitDate: 'desc',
          },
        },
      },
    })

    if (!cafe) {
      return NextResponse.json({ error: 'Cafe not found' }, { status: 404 })
    }

    // Calculate aggregates
    const visits = cafe.visits
    const totalVisits = visits.length

    let avgRating = 0
    let avgVibe = 0
    let avgFood = 0
    let avgCoffee = 0
    let avgPrice = 0
    let uniqueVisitors: string[] = []
    let visitorCounts: Record<string, number> = {}

    if (totalVisits > 0) {
      avgVibe = visits.reduce((sum, v) => sum + v.vibeRating, 0) / totalVisits
      avgFood = visits.reduce((sum, v) => sum + v.foodRating, 0) / totalVisits
      avgCoffee =
        visits.reduce((sum, v) => sum + v.coffeeRating, 0) / totalVisits
      avgPrice = visits.reduce((sum, v) => sum + v.priceRating, 0) / totalVisits

      avgRating = (avgVibe + avgFood + avgCoffee + avgPrice) / 4

      uniqueVisitors = [...new Set(visits.map((v) => v.visitorName))]

      visitorCounts = visits.reduce(
        (acc, visit) => {
          acc[visit.visitorName] = (acc[visit.visitorName] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )
    }

    // Get all recommendations
    const allRecommendations = visits
      .filter((v) => v.recommendations)
      .map((v) => ({
        visitor: v.visitorName,
        text: v.recommendations,
      }))

    return NextResponse.json({
      ...cafe,
      avgRating: Number(avgRating.toFixed(1)),
      avgVibe: Number(avgVibe.toFixed(1)),
      avgFood: Number(avgFood.toFixed(1)),
      avgCoffee: Number(avgCoffee.toFixed(1)),
      avgPrice: Number(avgPrice.toFixed(1)),
      totalVisits,
      uniqueVisitors,
      visitorCounts,
      allRecommendations,
    })
  } catch (error) {
    console.error('Error fetching cafe:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cafe' },
      { status: 500 }
    )
  }
}