import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our application
export interface Task {
  id: string
  text: string
}

export interface ScrumData {
  yesterday: Task[]
  today: Task[]
  impediments: Task[]
}

// API client for scrum data operations (using Prisma backend)
export const scrumApi = {
  async loadData(userId: string): Promise<ScrumData> {
    const response = await fetch(`/api/scrum?userId=${userId}`)
    if (!response.ok) {
      throw new Error('Failed to load scrum data')
    }
    return response.json()
  },

  async saveData(userId: string, data: ScrumData): Promise<void> {
    const response = await fetch('/api/scrum', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...data
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to save scrum data')
    }
  }
}