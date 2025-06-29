import { PrismaClient, LogCategory } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Export types from Prisma
export { LogCategory }

// Additional types for our application
export interface LogEntryInput {
  workItemId?: string
  description: string
  category: LogCategory
  order?: number
}

export interface DailyLogInput {
  date: string // YYYY-MM-DD format
  entries: LogEntryInput[]
}