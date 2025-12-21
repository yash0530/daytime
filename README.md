# Daytime - Time Tracking Application

## Overview
Daytime is a premium, mobile-friendly time tracking application with a modern dark-mode interface. Track activities, visualize productivity trends, and manage your time with an elegant, glassmorphism-inspired design.

## Core Features

### 1. Authentication
- **Modern Auth Pages**: Centered card design with gradient accents
- **JWT-based Security**: Token-based authentication
- **User Isolation**: Private data per user

### 2. Activity Logging
- **Activity Input**: Description, duration (minutes), category, and **date**
- **Date Picker**: Select any date for activity logging (defaults to today)
- **Smart Categories**: Auto-created on first use with autocomplete suggestions
- **Activity Management**: 
  - Sleek activity cards with hover effects
  - **Delete Confirmation**: Animated modal with keyboard support

### 3. Timer / Stopwatch Mode
- **Real-time Tracking**: Start/stop timer instead of manual duration entry
- **Date Selection**: Choose date for timer activity (uses selected date when stopped)
- **Pause/Resume**: Full timer control with state persistence
- **Background Persistence**: Timer survives page refreshes via localStorage + server sync
- **Pomodoro Mode**: Optional 25min work / 5min break cycles with session tracking
- **Auto Activity Creation**: Stopped timers automatically create activity logs

### 4. Templates & Quick Actions
- **Save as Template**: Save any activity as a reusable template for quick re-logging
- **Create Custom Templates**: Build templates from scratch with custom name, description, duration, and categories
- **Template Library**: View, use, and manage saved templates in Quick Actions section
- **One-Click Logging**: Use templates to instantly create activities

### 5. Journal / Note-Taking
- **Journal Tab**: Third tab in Activity Logger for quick note-taking
- **Date Selection**: Choose date for journal entries (defaults to today)
- **Journal Entries**: Write thoughts, ideas, or notes with optional category
- **Category Autocomplete**: Reuse existing categories for organization
- **Journal View**: Dedicated page (`/journals`) with **date range filtering**
- **Time Range Selection**: Last 3/7/30 days or custom date range for journal view
- **Delete Support**: Remove journal entries with confirmation

### 6. Dashboard (`/`)
- **Date Range Filter**: Filter all dashboard data by start/end date
- **Time Range Presets**: Last 3/7/30 days buttons for quick filtering
- **Calendar View**: Monthly grid with activity indicators and color dots
  - Click any date to filter charts to that day
- **Analytics Charts**:
  - **Time by Category**: Donut chart showing time distribution with percentages
  - **Activity by Day**: Stacked bar chart with per-category breakdown
  - **Category Breakdown**: Radial bar chart with top categories + summary stats
  - **Productivity Trends**: Area chart showing activity patterns over time
- **Recent Activities**: Scrollable list filtered by date range
- **Quick Actions**: Templates section for fast activity logging

### 7. Goals & Targets
- **Category Goals**: Set daily/weekly time targets per category (e.g., "8 hours work", "1 hour exercise")
- **Visual Progress**: Progress bars showing current vs target time with percentages
- **Streak Tracking**: Track consecutive days/weeks of meeting goals with 🔥 badges
- **Goal Management**: Create, edit, and delete goals via modal interface
- **Auto-Refresh**: Progress updates automatically when activities are logged


## Design System

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0f0f1a` | Page background |
| `--bg-card` | `rgba(255,255,255,0.05)` | Card backgrounds |
| `--accent-purple` | `#667eea` | Primary accent |
| `--accent-pink` | `#f093fb` | Secondary accent |
| `--accent-cyan` | `#00d4ff` | Highlights |
| `--accent-green` | `#38ef7d` | Success states |

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold)

### Design Elements
- **Glassmorphism**: Blur effects with translucent backgrounds
- **Gradients**: Purple-to-pink primary gradient
- **Animations**: Smooth transitions (0.15s-0.5s) and hover effects
- **Cards**: Rounded corners (16-20px) with subtle borders
- **Dark Theme Tooltips**: Consistent dark styling for chart tooltips

## Technical Architecture

### Stack
| Layer | Technology |
|-------|------------|
| Runtime | Bun.js |
| Backend | Hono.js |
| Frontend | React 19 + Vite |
| Database | MongoDB + Mongoose |
| Charts | Recharts |
| Styling | CSS Variables + Glassmorphism |

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/activities` | Get user activities |
| POST | `/api/activities` | Create activity |
| DELETE | `/api/activities/:id` | Delete activity |
| GET | `/api/tags` | Get user categories |
| DELETE | `/api/tags/:id` | Delete category |
| GET | `/api/timer` | Get active timer state |
| POST | `/api/timer/start` | Start new timer |
| POST | `/api/timer/pause` | Pause active timer |
| POST | `/api/timer/resume` | Resume paused timer |
| POST | `/api/timer/stop` | Stop timer & create activity |
| PATCH | `/api/timer` | Update timer details |
| POST | `/api/timer/pomodoro/toggle` | Toggle Pomodoro work/break |
| GET | `/api/templates` | Get user templates |
| POST | `/api/templates` | Create new template |
| DELETE | `/api/templates/:id` | Delete template |
| POST | `/api/templates/:id/use` | Create activity from template |
| GET | `/api/journals` | Get user journals (desc sorted) |
| POST | `/api/journals` | Create journal entry |
| DELETE | `/api/journals/:id` | Delete journal entry |
| GET | `/api/goals` | Get all goals with progress |
| POST | `/api/goals` | Create a new goal |
| PATCH | `/api/goals/:id` | Update goal target |
| DELETE | `/api/goals/:id` | Delete a goal |
| GET | `/api/goals/streaks` | Get streak data for active goals |

### Data Model
- **User**: `_id`, `username`, `password` (bcrypt hashed)
- **Tag** (Category): `_id`, `user`, `name`, `color`
- **Activity**: `_id`, `user`, `description`, `durationMinutes`, `date`, `tags[]`
- **Timer**: `_id`, `user`, `description`, `tagNames[]`, `startTime`, `pausedDuration`, `isPaused`, `pausedAt`, `mode`, `pomodoroState`
- **Template**: `_id`, `user`, `name`, `description`, `durationMinutes`, `tagNames[]`
- **Journal**: `_id`, `user`, `content`, `category`, `createdAt`, `updatedAt`
- **Goal**: `_id`, `user`, `categoryName`, `targetMinutes`, `period` (daily/weekly), `isActive`

## Running Locally

```bash
# Start MongoDB
mongod

# Start Server
cd server && bun run index.ts

# Start Client  
cd client && npm run dev
```

Open http://localhost:5173