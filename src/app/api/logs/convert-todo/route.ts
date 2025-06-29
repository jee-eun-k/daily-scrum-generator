import { NextRequest, NextResponse } from 'next/server'
import { prisma, LogCategory } from '@/lib/prisma'

// Convert TODO items to DONE
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entryIds } = body as { entryIds: string[] }

    if (!entryIds || !Array.isArray(entryIds)) {
      return NextResponse.json({ error: 'Entry IDs array is required' }, { status: 400 })
    }

    // Update multiple entries from TODO to DONE
    const updatedEntries = await prisma.logEntry.updateMany({
      where: {
        id: { in: entryIds },
        category: LogCategory.TODO
      },
      data: {
        category: LogCategory.DONE
      }
    })

    return NextResponse.json({ 
      message: `${updatedEntries.count} entries converted from TODO to DONE`,
      updatedCount: updatedEntries.count
    })
  } catch (error) {
    console.error('Error converting TODO to DONE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}