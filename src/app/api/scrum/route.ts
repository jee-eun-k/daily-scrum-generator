import { NextRequest, NextResponse } from 'next/server'
import { prisma, ScrumDataInput } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const scrumData = await prisma.scrumData.findUnique({
      where: { userId },
      include: { user: true }
    })

    if (!scrumData) {
      return NextResponse.json({ 
        yesterday: [], 
        today: [], 
        impediments: [] 
      })
    }

    return NextResponse.json({
      yesterday: scrumData.yesterday,
      today: scrumData.today,
      impediments: scrumData.impediments
    })
  } catch (error) {
    console.error('Error fetching scrum data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ScrumDataInput = await request.json()
    const { userId, yesterday, today, impediments } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId }
    })

    // Upsert scrum data
    const scrumData = await prisma.scrumData.upsert({
      where: { userId },
      update: {
        yesterday,
        today,
        impediments
      },
      create: {
        userId,
        yesterday,
        today,
        impediments
      }
    })

    return NextResponse.json(scrumData)
  } catch (error) {
    console.error('Error saving scrum data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}