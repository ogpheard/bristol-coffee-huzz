import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const visits = await prisma.visit.findMany({
      include: {
        cafe: true,
      },
      orderBy: {
        visitDate: 'desc',
      },
    })

    return NextResponse.json(visits)
  } catch (error) {
    console.error('Error fetching visits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visits' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      cafeId,
      visitorName,
      visitDate,
      vibeRating,
      foodRating,
      coffeeRating,
      priceRating,
      itemsBought,
      recommendations,
      notes,
    } = body

    // Validate ratings
    if (
      [vibeRating, foodRating, coffeeRating, priceRating].some(
        (rating) => rating < 1 || rating > 5
      )
    ) {
      return NextResponse.json(
        { error: 'Ratings must be between 1 and 5' },
        { status: 400 }
      )
    }

    const visit = await prisma.visit.create({
      data: {
        cafeId,
        visitorName,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        vibeRating,
        foodRating,
        coffeeRating,
        priceRating,
        itemsBought,
        recommendations,
        notes,
      },
      include: {
        cafe: true,
      },
    })

    return NextResponse.json(visit, { status: 201 })
  } catch (error) {
    console.error('Error creating visit:', error)
    return NextResponse.json(
      { error: 'Failed to create visit' },
      { status: 500 }
    )
  }
}