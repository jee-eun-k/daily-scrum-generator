import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Update a specific log entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { workItemId, description, category, order } = body

    const updatedEntry = await prisma.logEntry.update({
      where: { id },
      data: {
        ...(workItemId !== undefined && { workItemId }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order })
      }
    })

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Error updating log entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete a specific log entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.logEntry.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting log entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}