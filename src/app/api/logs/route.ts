import { NextRequest, NextResponse } from 'next/server'
import { prisma, DailyLogInput } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const date = searchParams.get('date') // YYYY-MM-DD format

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId }
    })

    if (date) {
      // Get specific date's logs
      const dailyLog = await prisma.dailyLog.findUnique({
        where: { 
          userId_date: { 
            userId, 
            date: new Date(date) 
          } 
        },
        include: {
          entries: {
            orderBy: [
              { category: 'asc' },
              { order: 'asc' },
              { createdAt: 'asc' }
            ]
          }
        }
      })

      return NextResponse.json({
        date,
        entries: dailyLog?.entries || []
      })
    } else {
      // Get recent logs (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const recentLogs = await prisma.dailyLog.findMany({
        where: {
          userId,
          date: {
            gte: sevenDaysAgo
          }
        },
        include: {
          entries: {
            orderBy: [
              { category: 'asc' },
              { order: 'asc' },
              { createdAt: 'asc' }
            ]
          }
        },
        orderBy: { date: 'desc' }
      })

      return NextResponse.json({ logs: recentLogs })
    }
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: { userId: string } & DailyLogInput = await request.json()
    const { userId, date, entries } = body

    if (!userId || !date) {
      return NextResponse.json({ error: 'User ID and date are required' }, { status: 400 })
    }

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId }
    })

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing daily log and entries for this date
      await tx.dailyLog.deleteMany({
        where: { userId, date: new Date(date) }
      })

      // Create new daily log with entries
      const dailyLog = await tx.dailyLog.create({
        data: {
          userId,
          date: new Date(date),
          entries: {
            create: entries.map((entry, index) => ({
              workItemId: entry.workItemId,
              description: entry.description,
              category: entry.category,
              order: entry.order ?? index
            }))
          }
        },
        include: {
          entries: {
            orderBy: [
              { category: 'asc' },
              { order: 'asc' },
              { createdAt: 'asc' }
            ]
          }
        }
      })

      return dailyLog
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}