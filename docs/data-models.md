# Data Models

MongoDB schemas used by the Daytime application.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ACTIVITY : creates
    USER ||--o{ TAG : owns
    USER ||--o| TIMER : has_active
    ACTIVITY }o--o{ TAG : categorized_by

    USER {
        ObjectId _id PK
        string username UK
        string passwordHash
        Date createdAt
        Date updatedAt
    }

    TAG {
        ObjectId _id PK
        ObjectId user FK
        string name
        string color
        Date createdAt
        Date updatedAt
    }

    ACTIVITY {
        ObjectId _id PK
        ObjectId user FK
        string description
        number durationMinutes
        Date date
        ObjectId[] tags FK
        Date createdAt
        Date updatedAt
    }

    TIMER {
        ObjectId _id PK
        ObjectId user FK_UK
        string description
        string[] tagNames
        Date startTime
        number pausedDuration
        boolean isPaused
        Date pausedAt
        string mode
        object pomodoroState
        Date createdAt
        Date updatedAt
    }
```

---

## User Model

**File**: `server/models/User.ts`

```typescript
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
}, { timestamps: true });
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `username` | String | Yes | Unique identifier |
| `passwordHash` | String | Yes | Bcrypt hash |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Indexes
- `username`: Unique index (enforced by schema)

### Security Notes
- Password hashed with bcrypt (10 rounds)
- Never store or return plain text passwords
- JWT contains only `id` and `username`

---

## Tag Model

**File**: `server/models/Tag.ts`

```typescript
const tagSchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | Yes | Category name |
| `color` | String | Yes | Hex color code |
| `user` | ObjectId | Yes | Owner reference |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Indexes
- Compound index on `(user, name)` recommended for lookups

### Color Generation
Tags auto-created with random colors:
```typescript
const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
```

---

## Activity Model

**File**: `server/models/Activity.ts`

```typescript
const activitySchema = new mongoose.Schema({
    description: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `description` | String | Yes | What was done |
| `durationMinutes` | Number | Yes | Time spent |
| `date` | Date | Yes | When activity occurred |
| `tags` | ObjectId[] | No | Category references |
| `user` | ObjectId | Yes | Owner reference |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Population
Activities returned with populated tags:
```typescript
const activities = await Activity.find({ user: userId })
    .populate('tags')
    .sort({ date: -1 });
```

### Indexes
- `user`: For filtering by owner
- `date`: For time-range queries
- Compound `(user, date)` for efficient dashboard queries

---

## Timer Model

**File**: `server/models/Timer.ts`

```typescript
const pomodoroStateSchema = new mongoose.Schema({
    workDuration: { type: Number, default: 25 * 60 * 1000 },
    breakDuration: { type: Number, default: 5 * 60 * 1000 },
    isBreak: { type: Boolean, default: false },
    completedSessions: { type: Number, default: 0 }
}, { _id: false });

const timerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    description: { type: String, default: '' },
    tagNames: [{ type: String }],
    startTime: { type: Date, required: true },
    pausedDuration: { type: Number, default: 0 },
    isPaused: { type: Boolean, default: false },
    pausedAt: { type: Date },
    mode: { type: String, enum: ['timer', 'pomodoro'], default: 'timer' },
    pomodoroState: { type: pomodoroStateSchema, default: () => ({}) }
}, { timestamps: true });
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `user` | ObjectId | Yes | Owner (unique - one timer per user) |
| `description` | String | No | What is being worked on |
| `tagNames` | String[] | No | Category names (not refs) |
| `startTime` | Date | Yes | When timer started |
| `pausedDuration` | Number | No | Total pause time in ms |
| `isPaused` | Boolean | No | Current pause state |
| `pausedAt` | Date | No | When paused (if paused) |
| `mode` | String | No | 'timer' or 'pomodoro' |
| `pomodoroState` | Object | No | Pomodoro-specific state |

### Pomodoro State Sub-document

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `workDuration` | Number | 1500000 | Work interval (25 min) |
| `breakDuration` | Number | 300000 | Break interval (5 min) |
| `isBreak` | Boolean | false | Currently on break? |
| `completedSessions` | Number | 0 | Completed work sessions |

### Key Constraint
`user` field has `unique: true` - only ONE active timer per user.

### Elapsed Time Calculation
```typescript
let elapsed = timer.pausedDuration;
if (!timer.isPaused) {
    elapsed += Date.now() - timer.startTime.getTime();
} else if (timer.pausedAt) {
    elapsed += timer.pausedAt.getTime() - timer.startTime.getTime();
}
```

---

## Query Patterns

### Get User Activities for Date Range
```typescript
const activities = await Activity.find({
    user: userId,
    date: {
        $gte: startDate,
        $lte: endDate
    }
}).populate('tags').sort({ date: -1 });
```

### Aggregate Time by Category
```typescript
const stats = await Activity.aggregate([
    { $match: { user: userId } },
    { $unwind: '$tags' },
    { $lookup: { from: 'tags', localField: 'tags', foreignField: '_id', as: 'tagInfo' } },
    { $unwind: '$tagInfo' },
    { $group: { _id: '$tagInfo.name', totalMinutes: { $sum: '$durationMinutes' } } }
]);
```
