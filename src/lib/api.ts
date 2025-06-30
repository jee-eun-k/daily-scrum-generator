import { LogCategory } from '@prisma/client';

// Types for our frontend
export interface ScrumEntry {
  id: string;
  text: string;
  workItemId?: string;
  isAutoInserted?: boolean;
}

export interface ScrumData {
  yesterday: ScrumEntry[];
  today: ScrumEntry[];
  impediments: ScrumEntry[];
  later: ScrumEntry[];
}

// API service for Daily Scrum
export class DailyScrumApi {
  private static async makeRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Map frontend categories to backend LogCategory enum
  private static mapCategoryToLogCategory(category: string): LogCategory {
    switch (category) {
      case 'yesterday': return LogCategory.DONE;
      case 'today': return LogCategory.TODO;
      case 'impediments': return LogCategory.BLOCKER;
      case 'later': return LogCategory.UPCOMING;
      default: return LogCategory.TODO;
    }
  }

  // Map backend LogCategory to frontend category
  private static mapLogCategoryToCategory(logCategory: LogCategory): keyof ScrumData {
    switch (logCategory) {
      case LogCategory.DONE: return 'yesterday';
      case LogCategory.TODO: return 'today';
      case LogCategory.BLOCKER: return 'impediments';
      case LogCategory.UPCOMING: return 'later';
      default: return 'today';
    }
  }

  // Load user's latest scrum data
  static async loadUserData(userId: string): Promise<ScrumData> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
      const data = await this.makeRequest(`/api/logs?userId=${encodeURIComponent(userId)}&date=${today}`);
      
      // Initialize empty scrum data
      const scrumData: ScrumData = {
        yesterday: [],
        today: [],
        impediments: [],
        later: []
      };

      // Convert API entries to frontend format
      if (data.entries) {
        data.entries.forEach((entry: { id: string; description: string; workItemId: string | null; category: LogCategory }) => {
          const category = this.mapLogCategoryToCategory(entry.category);
          scrumData[category].push({
            id: entry.id,
            text: entry.description,
            workItemId: entry.workItemId || undefined,
            isAutoInserted: false // API doesn't track this, could be enhanced
          });
        });
      }

      return scrumData;
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Return empty data on error
      return {
        yesterday: [],
        today: [],
        impediments: [],
        later: []
      };
    }
  }

  // Save user's scrum data
  static async saveUserData(userId: string, scrumData: ScrumData): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Convert frontend data to API format
    const entries: Array<{
      workItemId?: string;
      description: string;
      category: LogCategory;
      order: number;
    }> = [];
    let order = 0;

    // Add all entries from each category
    Object.entries(scrumData).forEach(([category, tasks]) => {
      tasks.forEach((task: ScrumEntry) => {
        if (task.text.trim()) { // Only save non-empty tasks
          entries.push({
            workItemId: task.workItemId?.trim() || undefined,
            description: task.text.trim(),
            category: this.mapCategoryToLogCategory(category),
            order: order++
          });
        }
      });
    });

    const payload = {
      userId,
      date: today,
      entries
    };

    await this.makeRequest('/api/logs', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Get previous day's data for "Load Previous Data" functionality
  static async loadPreviousData(userId: string): Promise<ScrumData> {
    try {
      // Get recent logs and find the most recent one
      const data = await this.makeRequest(`/api/logs?userId=${encodeURIComponent(userId)}`);
      
      if (data.logs && data.logs.length > 0) {
        const mostRecentLog = data.logs[0]; // Already sorted by date desc
        
        // Initialize empty scrum data
        const scrumData: ScrumData = {
          yesterday: [],
          today: [],
          impediments: [],
          later: []
        };

        // Convert the most recent log entries
        if (mostRecentLog.entries) {
          mostRecentLog.entries.forEach((entry: { description: string; workItemId: string | null; category: LogCategory }) => {
            const category = this.mapLogCategoryToCategory(entry.category);
            scrumData[category].push({
              id: crypto.randomUUID(), // Generate new ID for frontend
              text: entry.description,
              workItemId: entry.workItemId || undefined,
              isAutoInserted: false
            });
          });
        }

        return scrumData;
      }

      // No previous data found
      return {
        yesterday: [],
        today: [],
        impediments: [],
        later: []
      };
    } catch (error) {
      console.error('Failed to load previous data:', error);
      throw error;
    }
  }
}