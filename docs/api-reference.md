# API Reference

Complete API documentation for Daytime endpoints.

---

## Base URL

```
http://localhost:3000/api
```

---

## Authentication

Protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "secure123"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 400 | `{ "error": "Username already exists" }` |

---

### POST `/auth/login`

Authenticate user.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "secure123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 401 | `{ "error": "Invalid credentials" }` |

---

## Activities Endpoints

### GET `/activities`

Get all activities for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "description": "Morning workout",
    "durationMinutes": 45,
    "date": "2024-01-15T08:00:00.000Z",
    "tags": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Exercise",
        "color": "#38ef7d"
      }
    ],
    "user": "507f1f77bcf86cd799439010",
    "createdAt": "2024-01-15T08:45:00.000Z",
    "updatedAt": "2024-01-15T08:45:00.000Z"
  }
]
```

---

### POST `/activities`

Create a new activity.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "description": "Morning workout",
  "durationMinutes": 45,
  "tagNames": ["Exercise", "Health"],
  "date": "2024-01-15T08:00:00.000Z"  // optional, defaults to now
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "description": "Morning workout",
  "durationMinutes": 45,
  "date": "2024-01-15T08:00:00.000Z",
  "tags": [
    { "_id": "...", "name": "Exercise", "color": "#38ef7d" },
    { "_id": "...", "name": "Health", "color": "#667eea" }
  ],
  "user": "507f1f77bcf86cd799439010"
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 400 | `{ "error": "Description and duration required" }` |

---

### DELETE `/activities/:id`

Delete an activity.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Activity ObjectId |

**Success Response (200):**
```json
{
  "message": "Activity deleted"
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 404 | `{ "error": "Activity not found" }` |

---

## Tags Endpoints

### GET `/tags`

Get all tags for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Exercise",
    "color": "#38ef7d",
    "user": "507f1f77bcf86cd799439010",
    "createdAt": "2024-01-10T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Work",
    "color": "#667eea",
    "user": "507f1f77bcf86cd799439010",
    "createdAt": "2024-01-10T10:05:00.000Z"
  }
]
```

---

## Timer Endpoints

### GET `/timer`

Get active timer state.

**Headers:** `Authorization: Bearer <token>`

**Success Response - No Active Timer (200):**
```json
{
  "active": false
}
```

**Success Response - Active Timer (200):**
```json
{
  "active": true,
  "description": "Working on project",
  "tagNames": ["Work", "Development"],
  "startTime": "2024-01-15T09:00:00.000Z",
  "pausedDuration": 0,
  "isPaused": false,
  "pausedAt": null,
  "mode": "timer",
  "pomodoroState": null,
  "elapsedMs": 1800000
}
```

---

### POST `/timer/start`

Start a new timer.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "description": "Working on project",
  "tagNames": ["Work", "Development"],
  "mode": "timer",                      // or "pomodoro"
  "pomodoroSettings": {                 // optional, only for pomodoro mode
    "workDuration": 1500000,            // 25 min in ms
    "breakDuration": 300000             // 5 min in ms
  }
}
```

**Success Response (201):**
```json
{
  "active": true,
  "startTime": "2024-01-15T09:00:00.000Z",
  "mode": "timer",
  "pomodoroState": null
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 400 | `{ "error": "Timer already running. Stop it before starting a new one." }` |

---

### POST `/timer/pause`

Pause the active timer.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** None

**Success Response (200):**
```json
{
  "active": true,
  "isPaused": true,
  "pausedAt": "2024-01-15T09:30:00.000Z"
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 404 | `{ "error": "No active timer to pause" }` |
| 400 | `{ "error": "Timer is already paused" }` |

---

### POST `/timer/resume`

Resume a paused timer.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** None

**Success Response (200):**
```json
{
  "active": true,
  "isPaused": false,
  "pausedDuration": 300000
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 404 | `{ "error": "No active timer to resume" }` |
| 400 | `{ "error": "Timer is not paused" }` |

---

### POST `/timer/stop`

Stop timer and optionally create activity.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "createActivity": true  // optional, defaults to true
}
```

**Success Response (200):**
```json
{
  "stopped": true,
  "durationMinutes": 30,
  "activity": {
    "_id": "507f1f77bcf86cd799439011",
    "description": "Working on project",
    "durationMinutes": 30,
    "date": "2024-01-15T09:00:00.000Z",
    "tags": [...]
  }
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 404 | `{ "error": "No active timer to stop" }` |

---

### PATCH `/timer`

Update timer description/tags while running.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "description": "Updated description",
  "tagNames": ["Work", "Priority"]
}
```

**Success Response (200):**
```json
{
  "active": true,
  "description": "Updated description",
  "tagNames": ["Work", "Priority"]
}
```

---

### POST `/timer/pomodoro/toggle`

Toggle between work and break in Pomodoro mode.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** None

**Success Response (200):**
```json
{
  "active": true,
  "pomodoroState": {
    "workDuration": 1500000,
    "breakDuration": 300000,
    "isBreak": true,
    "completedSessions": 1
  },
  "startTime": "2024-01-15T09:25:00.000Z"
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 400 | `{ "error": "Timer is not in Pomodoro mode" }` |

---

## Templates Endpoints

### GET `/templates`

Get all templates for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Morning Workout",
    "description": "30 min cardio + stretching",
    "durationMinutes": 30,
    "tagNames": ["Exercise", "Health"],
    "user": "507f1f77bcf86cd799439010",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

---

### POST `/templates`

Create a new template.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Morning Workout",
  "description": "30 min cardio + stretching",
  "durationMinutes": 30,
  "tagNames": ["Exercise", "Health"]
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "Morning Workout",
  "description": "30 min cardio + stretching",
  "durationMinutes": 30,
  "tagNames": ["Exercise", "Health"],
  "user": "507f1f77bcf86cd799439010"
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 400 | `{ "error": "Name and description are required" }` |

---

### DELETE `/templates/:id`

Delete a template.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Template ObjectId |

**Success Response (200):**
```json
{
  "message": "Template deleted"
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 404 | `{ "error": "Template not found" }` |

---

### POST `/templates/:id/use`

Create an activity from a template.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Template ObjectId |

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "description": "30 min cardio + stretching",
  "durationMinutes": 30,
  "date": "2024-01-15T09:00:00.000Z",
  "tags": [
    { "_id": "...", "name": "Exercise", "color": "#38ef7d" },
    { "_id": "...", "name": "Health", "color": "#667eea" }
  ],
  "user": "507f1f77bcf86cd799439010"
}
```

**Error Responses:**
| Code | Body |
|------|------|
| 404 | `{ "error": "Template not found" }` |

---

## Error Response Format

All error responses follow this format:
```json
{
  "error": "Human-readable error message"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |
