# Daytime - Time Tracking Application

## Overview
Daytime is a premium, mobile-friendly time tracking application with a modern dark-mode interface. Track activities, visualize productivity trends, and manage your time with an elegant, glassmorphism-inspired design.

## Core Features

### 1. Authentication
- **Modern Auth Pages**: Centered card design with gradient accents
- **JWT-based Security**: Token-based authentication
- **User Isolation**: Private data per user

### 2. Activity Logging
- **Activity Input**: Description, duration (minutes), and category
- **Smart Categories**: Auto-created on first use with autocomplete suggestions
- **Activity Management**: 
  - Sleek activity cards with hover effects
  - **Delete Confirmation**: Animated modal with keyboard support

### 3. Dashboard (`/`)
- **Calendar View**: Monthly grid with activity indicators and color dots
- **Time by Category**: Bar chart showing minutes per category
- **Activity Over Time**: Line chart showing daily productivity trends
- **Recent Activities**: Scrollable list with edit/delete actions

### 4. Analytics Dashboard (`/visualize`)
- **Time Range Selector**: Last 3/7/30 days or custom date range
- **Activity by Day**: Stacked bar chart with category breakdown
- **Time by Category**: Donut chart showing time distribution
- **Productivity Trends**: Area chart showing activity patterns

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

### Data Model
- **User**: `_id`, `username`, `passwordHash`
- **Tag** (Category): `_id`, `userId`, `name`, `color`
- **Activity**: `_id`, `userId`, `description`, `durationMinutes`, `date`, `tags[]`

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