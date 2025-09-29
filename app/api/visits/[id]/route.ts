import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const body = await request.json()
    const {
      vibeRating,
      foodRating,
      coffeeRating,
      priceRating,
      itemsBought,
      recommendations,
      notes,
    } = body

    const visit = await prisma.visit.update({
      where: { id },
      data: {
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

    return NextResponse.json(visit)
  } catch (error) {
    console.error('Error updating visit:', error)
    return NextResponse.json(
      { error: 'Failed to update visit' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    await prisma.visit.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting visit:', error)
    return NextResponse.json(
      { error: 'Failed to delete visit' },
      { status: 500 }
    )
  }
}