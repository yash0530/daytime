# Daytime Architecture Overview

A comprehensive guide to the Daytime time tracking application.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Data Flow](#data-flow)
5. [Component Guides](#component-guides)

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend (React + Vite)"]
        UI[UI Components]
        Hooks[Custom Hooks]
        Context[Auth Context]
        LS[(localStorage)]
    end

    subgraph Server["Backend (Bun + Hono)"]
        Routes[API Routes]
        MW[Auth Middleware]
        Models[Mongoose Models]
    end

    subgraph DB["Database"]
        MongoDB[(MongoDB)]
    end

    UI --> Hooks
    Hooks --> Context
    Hooks --> LS
    UI --> Routes
    Routes --> MW
    MW --> Models
    Models --> MongoDB
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Bun.js | High-performance JavaScript runtime |
| **Backend** | Hono.js | Lightweight, fast web framework |
| **Frontend** | React 19 | Component-based UI library |
| **Build** | Vite | Fast dev server and bundler |
| **Database** | MongoDB | NoSQL document database |
| **ODM** | Mongoose | MongoDB object modeling |
| **Charts** | Recharts | React charting library |
| **Styling** | CSS Variables | Custom design system |

---

## Project Structure

```
daytime/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ActivityList.jsx
│   │   │   ├── ActivityLogger.jsx
│   │   │   ├── CalendarView.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── CreateTemplateModal.jsx
│   │   │   ├── SaveTemplateModal.jsx
│   │   │   ├── StatsView.jsx
│   │   │   ├── TemplateList.jsx
│   │   │   └── Timer.jsx
│   │   ├── context/           # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useTimer.js
│   │   ├── pages/             # Route-level components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Visualization.jsx
│   │   ├── App.jsx            # Root component & routing
│   │   ├── config.js          # API URL configuration
│   │   ├── index.css          # Global styles
│   │   └── main.jsx           # Entry point
│   └── index.html
├── server/                    # Backend application
│   ├── models/                # Mongoose schemas
│   │   ├── Activity.ts
│   │   ├── Tag.ts
│   │   ├── Template.ts
│   │   ├── Timer.ts
│   │   └── User.ts
│   ├── routes/                # API route handlers
│   │   ├── activities.ts
│   │   ├── auth.ts
│   │   ├── tags.ts
│   │   ├── templates.ts
│   │   └── timer.ts
│   ├── middleware/            # Express-style middleware
│   │   └── auth.ts
│   └── index.ts               # Server entry point
├── docs/                      # Documentation
└── README.md
```


---

## Data Flow

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as MongoDB

    U->>C: Enter credentials
    C->>S: POST /api/auth/login
    S->>DB: Verify user
    DB-->>S: User data
    S-->>C: JWT token
    C->>C: Store in localStorage
    C->>C: Update AuthContext
    C-->>U: Redirect to dashboard
```

### Activity Logging Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as MongoDB

    U->>C: Log activity (manual or timer)
    C->>S: POST /api/activities
    S->>DB: Create/find tags
    S->>DB: Save activity
    DB-->>S: Activity doc
    S-->>C: Activity response
    C->>C: Update state
    C-->>U: Show in activity list
```

### Timer Persistence Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant LS as localStorage
    participant S as Server
    participant DB as MongoDB

    U->>C: Start timer
    C->>S: POST /api/timer/start
    S->>DB: Save timer state
    C->>LS: Cache timer state
    
    Note over C: Page refresh
    
    C->>LS: Check cached state
    C->>S: GET /api/timer
    S->>DB: Fetch timer
    C->>C: Restore timer
```

---

## Component Guides

| Document | Description |
|----------|-------------|
| [Backend Architecture](./backend-architecture.md) | Server, routes, models, middleware |
| [Frontend Architecture](./frontend-architecture.md) | Components, hooks, state management |
| [API Reference](./api-reference.md) | All endpoints with request/response |
| [Data Models](./data-models.md) | Database schemas and relationships |
| [Design System](./design-system.md) | CSS variables, components, patterns |

---

## Key Design Decisions

### 1. Stateless JWT Authentication
- Tokens stored in localStorage for persistence
- Each request includes `Authorization: Bearer <token>` header
- Server validates JWT on every protected route

### 2. Timer Dual Persistence
- **localStorage**: Immediate persistence for page refresh survival
- **Server DB**: Long-term persistence and cross-device sync
- Hook reconciles both sources on page load

### 3. Tag Auto-Creation
- Categories are created on first use rather than pre-defined
- Random colors assigned automatically
- Enables frictionless activity logging

### 4. Component Composition
- Small, focused components (Timer, ActivityList, etc.)
- Shared state managed via props and context
- Custom hooks encapsulate complex logic (useTimer)
