# Daily Scrum Generator PRD (Product Requirements Document)

## 1. Overview

### 1.1 Product Name
Daily Scrum Generator

### 1.2 Product Purpose
A form-based generator that streamlines daily scrum writing by enabling task reuse from previous scrums, providing automatic date insertion, and generating formatted text for team chat integration.

### 1.3 Current Implementation Status
**Phase**: MVP Development (Partially Complete)

**✅ Implemented Features:**
- Core task management system with drag-and-drop functionality
- Three scrum categories (Yesterday, Today, Impediments) with Korean UI
- Database persistence and auto-save
- Scrum text generation with clipboard copy
- Comprehensive backend API system (Prisma + Supabase)
- shadcn/ui components with professional styling

**❌ Missing Features:**
- User identification system and "Load Previous Data" functionality
- Integration between frontend UI and backend API
- Fourth category "Later" as specified in PRD
- Weekly recurring task auto-insertion (Wednesday/Thursday)
- Enhanced output format with emojis and user ID
- User-specific data storage via database

### 1.4 Problem Statement
- Repetitive daily scrum writing process
- Manual effort required to move todo items from previous scrums to done items
- Difficulty maintaining consistent scrum formatting
- Inconvenience of generating properly formatted text for group chat integration

## 2. Target Users

### 2.1 Primary Target
- Developers (5-person team, partial adoption expected)
- Team members who write daily scrums

### 2.2 Usage Environment
- Desktop browsers (mobile environment not considered)
- Group chat integration (copy-paste text format)

## 3. Core Features

### 3.1 User Identification System ❌ **NOT IMPLEMENTED**
- **Simple ID Input**: Data differentiation based on user-entered ID without login
- **Previous Data Loading**: Retrieve latest scrum data based on user ID
- **New User Support**: Start fresh when no existing data is found
- **Current Status**: Database-based data persistence ready, no user identification UI

### 3.2 Scrum Template Structure ⚠️ **PARTIALLY IMPLEMENTED**
Four categories specified:
1. **Yesterday** (What I did yesterday) ✅ **IMPLEMENTED** as "어제 한 일"
2. **Today** (What I will do today) ✅ **IMPLEMENTED** as "오늘 할 일"
3. **Blockers** (Impediments/obstacles) ✅ **IMPLEMENTED** as "방해 요소"
4. **Later** (Tasks for later/reminders) ❌ **MISSING** - Not implemented in current UI

### 3.3 Task Management Features ✅ **FULLY IMPLEMENTED**
- **Drag & Drop**: Free task movement between all categories ✅ **WORKING**
- **Add/Remove**: Task addition and deletion for each category ✅ **WORKING**
- **Auto-initialization**: One empty task automatically created for each category on page load ✅ **WORKING**
- **Current Implementation**: Full drag-and-drop with React DnD, proper state management, visual feedback

### 3.4 Smart Task Auto-insertion ❌ **NOT IMPLEMENTED**
- **Weekly Recurring Tasks**: 
  - Every Wednesday: Automatically add "Write weekly report" to Today section
  - Every Thursday: Automatically add "Weekly report meeting" to Today section
- **User Control**: Users can remove auto-inserted tasks if not needed
- **Current Status**: No automatic task insertion logic implemented

### 3.5 Data Storage and Management ⚠️ **BACKEND READY, FRONTEND NOT CONNECTED**
- **Storage**: Supabase PostgreSQL ✅ **CONFIGURED**
- **Storage Policy**: One scrum per day per user ID (overwrite approach) ✅ **API READY**
- **Data Retention**: Unlimited storage ✅ **IMPLEMENTED**
- **Current Status**: 
  - ✅ Full Prisma schema with User, DailyLog, LogEntry models
  - ✅ Complete CRUD API routes (/api/logs)
  - ❌ Frontend UI not connected to backend

### 3.6 Scrum Generation and Output ⚠️ **PARTIALLY IMPLEMENTED**
- **Text Format Generation**: Structured text format scrum output ✅ **WORKING** (Korean format)
- **Auto Clipboard Copy**: Automatic copying when clicking generated scrum ✅ **WORKING** with fallback
- **Auto Date Insertion**: Current date automatically included ✅ **WORKING** (Korean locale)
- **Missing**: Enhanced emoji format, user ID in output as specified in PRD

## 4. Technical Specifications

### 4.1 Technology Stack ✅ **FULLY IMPLEMENTED**
- **Frontend**: Next.js 15 with App Router + React 19 + TypeScript
- **Package Manager**: Bun (note: bun.lock file)
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Database**: Supabase PostgreSQL + Prisma ORM
- **Authentication**: Supabase Auth (configured for anonymous sign-in)
- **State Management**: React hooks with drag-and-drop (React DnD)
- **Environment Variables**: 
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - DATABASE_URL

### 4.2 Database Schema ✅ **IMPLEMENTED (Prisma + Supabase)**

**Current Prisma Schema (More Advanced than Original Spec):**

```prisma
model User {
  id        String   @id @default(uuid()) @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  dailyLogs DailyLog[]
  
  @@map("users")
}

model DailyLog {
  id     String   @id @default(uuid()) @db.Uuid
  userId String   @map("user_id") @db.Uuid
  date   DateTime @db.Date
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  user    User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  entries LogEntry[]
  
  @@unique([userId, date])
  @@map("daily_logs")
}

enum LogCategory {
  DONE      // Maps to "Yesterday"
  TODO      // Maps to "Today" 
  BLOCKER   // Maps to "Blockers"
  UPCOMING  // Maps to "Later"
}

model LogEntry {
  id          String      @id @default(uuid()) @db.Uuid
  dailyLogId  String      @map("daily_log_id") @db.Uuid
  workItemId  String?     @map("work_item_id")
  description String
  category    LogCategory
  order       Int         @default(0)
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  dailyLog DailyLog @relation(fields: [dailyLogId], references: [id], onDelete: Cascade)
  
  @@map("log_entries")
}
```

**Key Improvements Over Original:**
- ✅ Normalized structure (separate entries table)
- ✅ UUID primary keys for better scalability
- ✅ Proper foreign key relationships
- ✅ Four categories: DONE, TODO, BLOCKER, UPCOMING
- ✅ Order field for task sequencing
- ✅ Optional work item ID for future integrations
- ✅ Cascade delete for data integrity

## 5. User Flow

### 5.1 New User Flow
1. Enter user ID
2. Click "Load Previous Data" → Confirm no existing data
3. Write tasks for each category in empty form
4. System auto-inserts weekly recurring tasks if applicable (Wednesday/Thursday)
5. Click "Generate Scrum"
6. Click generated text to copy to clipboard
7. Paste into group chat

### 5.2 Existing User Flow
1. Enter user ID
2. Click "Load Previous Data" → Load latest data
3. Rearrange tasks using drag & drop
4. System auto-inserts weekly recurring tasks if applicable (Wednesday/Thursday)
5. Add/delete/modify tasks as needed
6. Click "Generate Scrum"
7. Click generated text to copy to clipboard
8. Paste into group chat

## 6. UI/UX Requirements

### 6.1 Layout
- Four clearly distinguished category areas
- Task list display for each category
- User ID input field and "Load Previous Data" button at top
- "Generate Scrum" button at bottom

### 6.2 Interactions
- Visual feedback during drag & drop operations
- Intuitive placement of task add/delete buttons
- Notification display when clipboard copy is completed
- Visual indicator for auto-inserted weekly tasks

### 6.3 Output Format
```
📅 YYYY-MM-DD Daily Scrum - [User ID]

✅ Yesterday:
- Task1
- Task2

📋 Today:
- Task3
- Task4
- Write weekly report (auto-inserted on Wednesdays)
- Weekly report meeting (auto-inserted on Thursdays)

🚫 Blockers:
- Issue1

📝 Later:
- Task5
```

## 7. Success Metrics

### 7.1 Usability Metrics
- Scrum writing time reduction (50%+ compared to manual process)
- User retention rate (3+ uses per week)
- Minimal error occurrence rate

### 7.2 Functional Metrics
- Data load success rate 99%+
- Clipboard copy success rate 99%+
- Drag & drop accuracy 100%
- Weekly task auto-insertion accuracy 100%

## 8. Current Implementation Progress

### 8.1 Implementation Matrix

| Feature | Status | Frontend | Backend | Priority |
|---------|--------|----------|---------|----------|
| Task Management (Drag & Drop) | ✅ Complete | ✅ Working | ❌ Not Connected | High |
| Three Categories (Yesterday/Today/Blockers) | ✅ Complete | ✅ Working | ✅ API Ready | High |
| Fourth Category "Later" | ❌ Missing | ❌ Not Implemented | ✅ UPCOMING in DB | High |
| User Identification | ❌ Missing | ❌ No UI | ✅ User model ready | Critical |
| Data Persistence | ❌ Missing | ❌ No UI connection | ✅ Full CRUD API | Critical |
| Scrum Generation | ⚠️ Partial | ✅ Korean format | ❌ Not connected | Medium |
| Weekly Auto-insertion | ❌ Missing | ❌ No logic | ❌ Not implemented | Medium |
| Enhanced Output Format | ❌ Missing | ❌ Plain text only | ❌ No emoji format | Low |

### 8.2 Architecture Status
- **✅ Backend Infrastructure**: Complete Prisma + Supabase setup
- **✅ UI Components**: Professional shadcn/ui implementation  
- **❌ Integration Gap**: Frontend and backend not connected
- **❌ User System**: No user identification in current UI

## 9. Development Priority

### Phase 1 (MVP) - ⚠️ **PARTIALLY COMPLETE**
- ✅ Basic form structure implementation
- ❌ User ID-based data storage/retrieval 
- ✅ Task add/delete functionality
- ✅ Basic text generation and clipboard copy
- ❌ Weekly recurring task auto-insertion logic

### Phase 2 - ⚠️ **PARTIALLY COMPLETE** 
- ✅ Drag & drop functionality implementation
- ✅ UI/UX improvements (shadcn/ui)
- ⚠️ Enhanced error handling (partial)

### Phase 3 - ❌ **NOT STARTED**
- ❌ Performance optimization
- ❌ Additional feature review and implementation

### **IMMEDIATE NEXT STEPS (Critical Gap Resolution):**
1. **🔴 Connect Frontend to Backend** - Integrate frontend UI with Prisma API
2. **🔴 Add User Identification** - Implement user ID input and "Load Previous Data"
3. **🔴 Add Fourth Category** - Implement "Later" category in UI
4. **🟪 Implement Weekly Auto-insertion** - Add Wednesday/Thursday recurring tasks
5. **🟪 Enhance Output Format** - Add emojis and user ID to generated text

## 10. Constraints and Considerations

### 10.1 Constraints
- No mobile environment support
- No team collaboration features (individual use focused)
- No login/authentication system

### 10.2 Security Considerations
- User ID-based data access (anyone can potentially access other users' data)
- Recommend avoiding storage of sensitive information

### 10.3 Scalability Considerations
- Future possibility of team features
- Template customization feature expansion potential
- Support for various output formats

## 11. Feature Details

### 11.1 Weekly Recurring Tasks Logic
- **Day Detection**: System automatically detects current day of the week
- **Auto-insertion Rules**:
  - Wednesday (day 3): Add "Write weekly report" to Today section
  - Thursday (day 4): Add "Weekly report meeting" to Today section
- **User Override**: Auto-inserted tasks can be removed by users
- **Visual Distinction**: Auto-inserted tasks should be visually distinguishable (e.g., different styling, icon, or label)
- **Data Persistence**: Auto-inserted tasks are treated the same as user-entered tasks once the scrum is saved

### 11.2 Date and Time Handling
- Use local timezone for day-of-week detection
- Consider edge cases around midnight transitions
- Consistent date formatting across all features