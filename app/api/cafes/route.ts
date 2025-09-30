import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const unvisited = searchParams.get('unvisited') === 'true'

  try {
    const cafes = await prisma.cafe.findMany({
      include: {
        visits: {
          include: {
            cafe: false,
          },
        },
      },
    })

    // Filter based on query params
    let filtered = cafes

    if (unvisited) {
      filtered = filtered.filter((cafe) => cafe.visits.length === 0)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((cafe) =>
        cafe.name.toLowerCase().includes(searchLower)
      )
    }

    // Calculate aggregates for each cafe
    const cafesWithAggregates = filtered.map((cafe) => {
      const visits = cafe.visits
      const totalVisits = visits.length

      if (totalVisits === 0) {
        return {
          ...cafe,
          avgRating: 0,
          avgVibe: 0,
          avgFood: 0,
          avgCoffee: 0,
          avgPrice: 0,
          totalVisits: 0,
          uniqueVisitors: [],
          visitorCounts: {},
          lastVisit: null,
        }
      }

      const avgVibe =
        visits.reduce((sum, v) => sum + v.vibeRating, 0) / totalVisits
      const avgFood =
        visits.reduce((sum, v) => sum + v.foodRating, 0) / totalVisits
      const avgCoffee =
        visits.reduce((sum, v) => sum + v.coffeeRating, 0) / totalVisits
      const avgPrice =
        visits.reduce((sum, v) => sum + v.priceRating, 0) / totalVisits

      const avgRating = (avgVibe + avgFood + avgCoffee + avgPrice) / 4

      const uniqueVisitors = [...new Set(visits.map((v) => v.visitorName))]

      const visitorCounts = visits.reduce(
        (acc, visit) => {
          acc[visit.visitorName] = (acc[visit.visitorName] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      const lastVisit = visits.reduce((latest, visit) => {
        return !latest || new Date(visit.visitDate) > new Date(latest)
          ? visit.visitDate
          : latest
      }, null as Date | null)

      return {
        ...cafe,
        avgRating: Number(avgRating.toFixed(1)),
        avgVibe: Number(avgVibe.toFixed(1)),
        avgFood: Number(avgFood.toFixed(1)),
        avgCoffee: Number(avgCoffee.toFixed(1)),
        avgPrice: Number(avgPrice.toFixed(1)),
        totalVisits,
        uniqueVisitors,
        visitorCounts,
        lastVisit,
      }
    })

    return NextResponse.json(cafesWithAggregates)
  } catch (error) {
    console.error('Error fetching cafes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cafes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, area, postcode, latitude, longitude, source } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Café name is required' },
        { status: 400 }
      )
    }

    const cafe = await prisma.cafe.create({
      data: {
        name,
        area: area || null,
        postcode: postcode || null,
        latitude: latitude || null,
        longitude: longitude || null,
        website: null,
        neighbourhood: null,
        source: source || 'user_added',
      },
    })

    return NextResponse.json(cafe, { status: 201 })
  } catch (error) {
    console.error('Error creating cafe:', error)
    return NextResponse.json(
      { error: 'Failed to create cafe' },
      { status: 500 }
    )
  }
}