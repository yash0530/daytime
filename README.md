# Daytime Project Specification

## Overview
Daytime is a mobile-friendly web application designed to help users track and visualize their daily activities. The application emphasizes a clean, "pristine white" aesthetic and provides intuitive tools for logging time, managing tags, and analyzing productivity through calendars and graphs.

## Core Features

### 1. Authentication
-   **Login/Signup Screen**: Simple, secure entry point.
-   **User isolation**: Each user has their own private data.

### 2. Activity Logging
-   **Input Interface**:
    -   Users can enter an activity description (e.g., "Worked", "Watched F1").
    -   Users can specify duration (e.g., "2 hours", "30 mins").
    -   **Tags**: Users can assign tags. New tags are created automatically upon first use.
-   **Recent/Recurring**: Previously used activities/tags appear as suggestions or a list for quick entry.

### 3. Visualization & Dashboard
-   **Calendar View**:
    -   Full calendar support showing activity summaries per day.
    -   Monthly and weekly views.
-   **Data Analytics**:
    -   **Bar Graphs**: Compare duration of different tags/activities.
    -   **Line Graphs**: Track trends over time (e.g., "Work" hours over the last 7 days).

### 4. UI/UX Design
-   **Aesthetic**: "Pristine white", minimalist, clean typography.
-   **Responsiveness**: Fully optimized for mobile devices (touch-friendly inputs, readable graphs on small screens).

## Technical Architecture

### Stack
-   **Runtime**: Bun.js (Fast JavaScript runtime)
-   **Frontend**: React.js
-   **Database**: MongoDB
-   **Deployment**: Designed for easy deployment (e.g., standard Docker container or Bun-friendly hosts).

### Data Model (Conceptual)

#### User
-   `_id`: ObjectId
-   `username`: String
-   `passwordHash`: String

#### Tag
-   `_id`: ObjectId
-   `userId`: ObjectId (Ref -> User)
-   `name`: String (e.g., "Work", "Entertainment", "Study")
-   `color`: String (Hex code for visualization)

#### Activity
-   `_id`: ObjectId
-   `userId`: ObjectId (Ref -> User)
-   `description`: String
-   `durationMinutes`: Number
-   `date`: Date
-   `tags`: [ObjectId] (Ref -> Tag)

## Development Roadmap
1.  **Setup**: Initialize Bun + React project structure.
2.  **Backend Core**: Setup API for Auth and Activities.
3.  **Frontend Core**: Build Login and basic Logger interface.
4.  **Data Viz**: Integrate charting library (e.g., Recharts or Chart.js) and Calendar component.
5.  **Refinement**: Apply "pristine white" styling and mobile optimizations.