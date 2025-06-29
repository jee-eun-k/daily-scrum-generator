# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application bootstrapped with `create-next-app` using the App Router architecture. The project uses TypeScript, Tailwind CSS v4, and Bun as the package manager.

## Development Commands

- **Start development server**: `bun dev` (or `npm run dev`)
- **Build for production**: `bun run build`
- **Start production server**: `bun start`
- **Lint code**: `bun run lint`

## Architecture

- **Framework**: Next.js 15 with App Router
- **Package Manager**: Bun (note `bun.lock` file)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono from next/font/google
- **TypeScript**: Strict mode enabled with path aliases (`@/*` → `./src/*`)

## Key File Structure

- `src/app/` - App Router pages and layouts
- `src/app/layout.tsx` - Root layout with font configuration
- `src/app/page.tsx` - Home page component
- `public/` - Static assets (SVG icons)

## Development Notes

- Uses App Router (not Pages Router)
- TypeScript configuration includes strict mode and Next.js plugin
- ESLint extends `next/core-web-vitals` and `next/typescript`
- Path alias `@/*` maps to `src/*` for cleaner imports
- Default port is 3000 for development server
- **Database**: Prisma ORM with Supabase PostgreSQL
- **Authentication**: Supabase Auth (anonymous sign-in)
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Icons**: Lucide React for iconography
- For complicated tasks, consider discussing the approach with Gemini for additional insights

## Setup Instructions

### 1. Supabase Project Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > Database to get your database connection string

### 2. Environment Configuration
1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase project URL and anon key
3. Add your Supabase PostgreSQL connection string to `DATABASE_URL`

### 3. Database Setup
1. Generate Prisma client: `bunx prisma generate`
2. Push schema to Supabase: `bunx prisma db push`
3. (Optional) View database: `bunx prisma studio`

## Prisma + Supabase Commands

- **Generate client**: `bunx prisma generate`
- **Push schema to Supabase**: `bunx prisma db push`
- **Pull schema from Supabase**: `bunx prisma db pull`
- **Reset database**: `bunx prisma migrate reset`
- **Open Prisma Studio**: `bunx prisma studio`

## Architecture

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Authentication**: Supabase Auth (anonymous users)
- **Database**: Supabase PostgreSQL + Prisma ORM
- **UI**: shadcn/ui + Tailwind CSS v4
- **Data Flow**: Supabase Auth → Next.js API Routes → Prisma → Supabase DB

## API Routes

- `GET /api/scrum?userId={id}` - Load user's scrum data
- `POST /api/scrum` - Save user's scrum data