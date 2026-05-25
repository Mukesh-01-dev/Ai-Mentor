export const docsStructure = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      { id: "introduction", title: "Introduction" },
      { id: "readme", title: "README" }
    ]
  },
  {
    id: "frontend-docs",
    title: "Frontend Client",
    items: [
      { id: "frontend-documentation", title: "Frontend Documentation" },
      { id: "frontend-admin-documentation", title: "Frontend Admin Documentation" }
    ]
  },
  {
    id: "backend-docs",
    title: "Backend API",
    items: [
      { id: "backend-documentation", title: "Backend Documentation" },
      { id: "backend-admin-documentation", title: "Backend Admin Documentation" }
    ]
  },
  {
    id: "ai-service-docs",
    title: "AI Service",
    items: [
      { id: "ai-service-documentation", title: "AI Service Documentation" }
    ]
  }
];

export const docsContent = {
  "getting-started": {
    "introduction": {
      title: "Introduction",
      description: "Getting Started with AI Mentor",
      content: `# AI Mentor — Learning Platform

AI Mentor is a modern AI-powered learning management system designed to deliver interactive, intelligent, and scalable educational experiences through artificial intelligence driven technologies. The platform combines dynamic course management, real-time analytics, community collaboration, and AI-generated educational video lessons into a unified learning ecosystem.

The system is architected using a modular multi-service structure consisting of a React-based frontend application, a Node.js REST API backend, and a dedicated Python AI microservice responsible for generating AI-assisted learning videos using Google Gemini, text-to-speech synthesis, and FFmpeg based media processing.

AI Mentor provides a complete digital learning workflow including authentication, course purchasing, lesson management, learning analytics, community discussions, and personalized AI-enhanced educational content generation.

---

## Core Features

- 📚 Course Management & Purchasing
- 📊 Learning Analytics Dashboard
- 💬 Community Discussion System
- 🔐 JWT & Google OAuth Authentication
- 🤖 AI-Generated Lesson Videos
- ☁️ Cloudinary Media Integration
- 🎥 AI Transcript & Video Processing
- 📈 Progress Tracking & Insights
- 🛡️ Protected User & Admin Routes

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Node.js + Express + Sequelize |
| Database | PostgreSQL |
| AI Service | Python + FastAPI + Google Gemini |
| Authentication | Firebase Google OAuth + JWT |
| Video Processing | FFmpeg + pyttsx3 |
| Cloud Storage | Cloudinary |

---

## System Architecture

\`\`\`text
Frontend (React + Vite)
            │
            ▼
Backend API (Node.js + Express)
            │
            ▼
AI Service (FastAPI + Gemini)
            │
 ┌──────────┼──────────┐
 ▼          ▼          ▼
Gemini    TTS      FFmpeg
Script    Audio    Video Merge
            │
            ▼
      Cloudinary CDN
            │
            ▼
      Frontend Playback
\`\`\`

## Project Structure

\`\`\`text
AI-Mentor-Updated/
├── backend/         # Node.js + Express REST API
├── frontend/        # React + Vite web application
├── ai_service/      # Python AI lesson generation service
├── backendAdmin/    # Administrative backend service
└── frontendAdmin/   # Administrative dashboard frontend
\`\`\`

## Development Environment

The platform requires the following dependencies for local development:

- Node.js v18+
- PostgreSQL v14+
- Python 3.10+
- FFmpeg
- npm

Each service maintains isolated environment variables through dedicated \`.env\` configurations to ensure modularity, security, and deployment flexibility.

## Purpose of the Platform

AI Mentor was developed to modernize digital education using artificial intelligence powered workflows. The system focuses on improving learner engagement through AI-generated educational videos, intelligent course delivery, scalable backend architecture, and collaborative learning communities.

The platform is designed with scalability, maintainability, modular development, and production-ready deployment practices in mind, making it suitable for modern e-learning ecosystems and AI-enhanced educational platforms.`
    },
    "readme": {
      title: "README",
      description: "Project Readme",
      content: `# AI Mentor — Learning Platform

An AI-powered learning management system with course management, analytics, community discussions, and AI-generated video lessons.

---

## Features

- 📚 Course Management & Purchasing
- 📊 Learning Analytics
- 💬 Community Discussions
- 🔐 User Authentication (JWT + Google OAuth)
- 🤖 AI-Generated Lesson Videos (Gemini + TTS + FFmpeg)

---

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Sequelize
- **Database**: PostgreSQL
- **AI Service**: Python + FastAPI + Google Gemini
- **Auth**: Firebase (Google OAuth) + JWT

---

## Prerequisites

- Node.js v18+
- PostgreSQL v14+
- Python 3.10+
- FFmpeg
- npm

---

## Quick Start

### 1. Clone the repository

\`\`\`bash
git clone <repository-url>
cd AI-Mentor-Updated
\`\`\`

### 2. Setup Backend

\`\`\`bash
cd backend
npm install
cp .env.example .env
# Fill in your database credentials and secrets in .env
npm run dev
\`\`\`

See backend/README.md for full setup guide.

### 3. Setup Frontend

\`\`\`bash
cd frontend
npm install
cp .env.example .env
# Fill in your Firebase credentials in .env
npm run dev
\`\`\`

See frontend/README.md for full setup guide.

### 4. Setup AI Service

\`\`\`bash
cd ai_service
python -m venv venv
.\\venv\\Scripts\\activate   # Windows
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
# Fill in Gemini and Cloudinary keys in .env
cd backend
uvicorn api:app --reload --port 8000
\`\`\`

See ai_service/README.md for full setup guide.

### 5. Setup ESLint

At the frontendAdmin and root directory run:

\`\`\`bash
npm install
\`\`\`

At the root directory run the following command:

\`\`\`bash
npm run lint
\`\`\`

This will run ESLint on all three following services:

\`\`\`bash
cd backend
npm run lint
cd frontend
npm run lint
cd frontendAdmin
npm run lint
\`\`\`

To run ESLint on a specific file:

\`\`\`bash
cd directory_name
npx eslint path/to/file.js
\`\`\`

For example:

\`\`\`bash
cd backend
npx eslint server.js
\`\`\`

Some extensions like ESLint and Error Lens are recommended to be installed in code editor for better visibility of errors.

---

## Environment Variables

Each service has its own \`.env\` file. Copy the \`.env.example\` in each folder and fill in your values.

| Service | Key variables |
|---|---|
| \`backend/\` | \`DB_NAME\` , \`DB_USER\` , \`DB_PASSWORD\` , \`JWT_SECRET\` , \`AI_SERVICE_URL\` |
| \`frontend/\` | \`VITE_API_BASE_URL\` , \`VITE_FIREBASE_*\` |
| \`ai_service/backend/\` | \`GEMINI_API_KEY\` , \`CLOUDINARY_*\` |

---

## Running the Application

Start all three services in separate terminals:

\`\`\`bash
# Terminal 1 — Backend API
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — AI Service
cd ai_service && .\\venv\\Scripts\\activate && cd backend && uvicorn api:app --reload --port 8000
\`\`\`

Then open http://localhost:5173 in your browser.

---

## Project Structure

\`\`\`text
AI-Mentor-Updated/
├── backend/       # Node.js + Express REST API
├── frontend/      # React + Vite web application
└── ai_service/    # Python + FastAPI AI lesson generator
\`\`\`

---

## About

This project was developed as part of an internship. All rights reserved by the respective authors and organisation.
`
    }
  },
  "frontend-docs": {
    "frontend-documentation": {
      title: "Frontend Documentation",
      description: "Frontend Client Documentation for AI Mentor",
      content: `# AI Mentor — Frontend

The React + Vite frontend for the AI Mentor learning platform. It provides a complete student and admin experience including course browsing, AI-powered video lessons, community discussions, analytics, and user account management.

---

## Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Email/password login, Google OAuth (Firebase), forgot/reset password |
| 📚 Courses | Browse, preview, and purchase courses; track lesson progress |
| 🤖 AI Lessons | Generate celebrity-narrated lesson videos on demand via the AI service |
| 💬 Discussions | Community discussion boards per course |
| 📊 Analytics | Personal learning statistics and progress charts (Recharts) |
| 🎥 Watched Videos | History of all viewed AI-generated lessons |
| ⚙️ Settings | Profile management, theme toggle (light/dark), language switching |
| 🛡️ Admin Panel | Manage courses, lessons, users, and uploaded videos (admin-only) |
| 🌐 i18n | Multi-language support via i18next |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Auth (Social) | Firebase (Google OAuth) |
| Charts | Recharts |
| Icons | Lucide React |
| i18n | i18next + react-i18next |
| Notifications | React Hot Toast |

---

## Project Structure

\`\`\`text
frontend/
├── public/                # Static assets
├── src/
│   ├── assets/            # Images and media
│   ├── components/        # Reusable components
│   │   ├── auth/          # Auth-specific components
│   │   ├── common/        # Shared UI components
│   │   ├── video/         # Video player components
│   │   ├── Header.jsx     # Top navigation bar
│   │   ├── Sidebar.jsx    # Navigation sidebar
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx    # Auth state & user session
│   │   ├── SidebarContext.jsx # Sidebar open/close state
│   │   └── ThemeContext.jsx   # Light/dark theme state
│   ├── i18n/              # Translation files
│   ├── lib/               # Utility helpers
│   ├── pages/             # Route-level page components
│   │   ├── LoginPage.jsx
│   │   ├── SignUpPage.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CoursesPage.jsx
│   │   ├── CoursePreview.jsx
│   │   ├── LearningPage.jsx      # AI lesson player
│   │   ├── Analytics.jsx
│   │   ├── DiscussionsPage.jsx
│   │   ├── WatchedVideos.jsx
│   │   ├── Settings.jsx
│   │   └── AdminPage.jsx
│   ├── service/           # API service layer (Axios calls)
│   ├── App.jsx            # Root router/route definitions
│   ├── firebase.js        # Firebase app initialization
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── .env.example           # Environment variable template
├── vite.config.js         # Vite + Tailwind config + API proxy
├── eslint.config.js
└── package.json
\`\`\`

---

## Environment Variables

Copy \`.env.example\` to \`.env\` and fill in the values:

\`\`\`env
# Backend API base URL (proxied via Vite)
VITE_API_BASE_URL=http://localhost:5000

# Firebase project credentials (for Google OAuth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
\`\`\`

> [!TIP]
> Get Firebase credentials from the Firebase Console. Enable Google Sign-In under **Authentication** → **Sign-in method**.

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- Backend server running on **http://localhost:5000** (see \`../backend/README.md\`)

### Installation

\`\`\`bash
# From the project root
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your credentials

# Start the development server
npm run dev
\`\`\`

The app will be available at **http://localhost:5173**.

### Available Scripts

| Script | Description |
|---|---|
| \`npm run dev\` | Start the Vite development server |
| \`npm run build\` | Build for production |
| \`npm run preview\` | Preview the production build locally |
| \`npm run lint\` | Run ESLint |

---

## Routing Overview

| Path | Page | Access |
|---|---|---|
| \`/\` | Redirects based on auth status | Public |
| \`/login\` | Login page | Public only |
| \`/signup\` | Sign up page | Public only |
| \`/forgot-password\` | Forgot password | Public only |
| \`/reset-password/:token\` | Reset password | Public only |
| \`/dashboard\` | User dashboard | Protected |
| \`/courses\` | Course catalogue | Protected |
| \`/course-preview/:courseId\` | Course detail/preview | Public |
| \`/learning/:id\` | AI lesson player | Protected |
| \`/discussions\` | Community discussions | Protected |
| \`/analytics\` | Learning analytics | Protected |
| \`/watchedvideos\` | Watched video history | Protected |
| \`/settings\` | Account settings | Protected |
| \`/admin\` | Admin panel | Admin only |

---

## API Communication

All API calls are proxied through Vite to the backend at **http://localhost:5000**. The proxy is configured in \`vite.config.js\`:

\`\`\`javascript
proxy: {
  "/api": {
    target: env.VITE_API_BASE_URL,
    changeOrigin: true,
  },
}
\`\`\`

This means frontend calls to \`/api/...\` are transparently forwarded to the backend without CORS issues during development.`
    },
    "frontend-admin-documentation": {
      title: "Frontend Admin Documentation",
      description: "Frontend Admin client documentation for AI Mentor",
      content: `# AI Mentor Frontend Admin Documentation

## Introduction

The Frontend Admin application is the administrative control panel of the AI Mentor platform. It is built using React and Vite and provides administrative interfaces for managing users, courses, reports, enrollments, payments, analytics, notifications, and platform moderation.

The admin frontend communicates with the dedicated \`backendAdmin\` API server and provides secure access control for administrators and super administrators.

The system is designed using modular React architecture with reusable UI components, protected admin routes, responsive dashboard layouts, centralized API communication, and scalable page based rendering.

---

## Frontend Admin System Architecture

\`\`\`text
                    ┌────────────────────────┐
                    │     Admin Browser      │
                    └──────────┬─────────────┘
                               │
                               ▼
                    ┌────────────────────────┐
                    │  React + Vite Admin UI │
                    └──────────┬─────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│ React Router   │   │ Admin Context  │   │ UI Components  │
└────────────────┘   └────────────────┘   └────────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
                    ┌────────────────────────┐
                    │ Axios API Service Layer│
                    └──────────┬─────────────┘
                               │
                               ▼
                    ┌────────────────────────┐
                    │ Backend Admin API      │
                    └────────────────────────┘
\`\`\`

---

## Main Responsibilities

The frontend admin dashboard handles:

- Admin authentication
- Super admin authorization
- Course management
- User moderation
- Enrollment monitoring
- Payment tracking
- Report moderation
- Notification management
- Dashboard analytics
- Admin profile management
- Theme settings
- Platform management

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite |
| Routing | React Router DOM |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Charts | Recharts |
| State Management | React Hooks + Context |
| Authentication | JWT |

---

## Folder Structure

\`\`\`text
frontendAdmin/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   ├── common/
│   │   ├── charts/
│   │   └── ui/
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── .env
\`\`\`

---

## Application Startup Flow

\`\`\`text
main.jsx
    │
    ▼
<App />
    │
    ▼
React Router
    │
    ▼
Protected Routes
    │
    ▼
Admin Layout
    │
    ▼
Dashboard Pages
\`\`\`

---

## Root Application Layer

### App.jsx

The \`App.jsx\` file is the root controller of the frontend admin application.

**Responsibilities:**

- Route rendering
- Page switching
- Authentication checks
- Layout rendering
- Sidebar rendering
- Header rendering
- Dashboard rendering
- Route synchronization

---

## Dynamic Page Rendering System

The admin panel uses dynamic page rendering.

\`\`\`javascript
const PAGE_COMPONENTS = {
  dashboard: DashboardPage,
  courses: CoursesPage,
  users: UsersPage,
  enrollments: EnrollmentsPage,
  payments: PaymentsPage,
  reports: ReportsPage,
  profile: ProfilePage,
  settings: SettingsPage,
};
\`\`\`

The selected route dynamically renders the corresponding page component.

**Advantages:**

- Cleaner architecture
- Reusable layout system
- Reduced route duplication
- Easier scalability

---

## Routing Architecture

The frontend admin uses React Router DOM.

### Route Flow

\`\`\`text
Sidebar Navigation
         │
         ▼
React Router Navigation
         │
         ▼
Protected Admin Route
         │
         ▼
Page Component Rendering
\`\`\`

### Main Routes

| Route | Description |
|---|---|
| \`/login\` | Admin login page |
| \`/dashboard\` | Dashboard analytics |
| \`/courses\` | Course management |
| \`/users\` | User management |
| \`/enrollments\` | Enrollment tracking |
| \`/payments\` | Payment monitoring |
| \`/reports\` | Report moderation |
| \`/profile\` | Admin profile |
| \`/settings\` | Dashboard settings |

---

## Authentication System

The frontend admin uses JWT authentication.

The token is stored locally after successful login.

### Authentication Flow

\`\`\`text
Admin Login Form
        │
        ▼
Axios Login Request
        │
        ▼
Backend Admin API
        │
        ▼
JWT Token Response
        │
        ▼
LocalStorage Token Storage
        │
        ▼
Protected Dashboard Access
\`\`\`

### Login System

**Responsibilities:**

- Validate admin credentials
- Handle API login requests
- Store authentication token
- Redirect authenticated admin
- Handle invalid login states

### Protected Route System

Protected routes prevent unauthorized dashboard access.

Checks include:

- Token existence
- Token validity
- Authentication status

Unauthorized users are redirected to \`/login\`.

### Super Admin Authorization

Certain actions are restricted to super admins.

Examples include:

- Creating admins
- Deleting admins
- Updating admin permissions
- Managing platform level settings

---

## Layout System

The admin dashboard uses reusable layout architecture.

**Main layout components:**

- AdminSidebar
- Header
- Dashboard wrappers
- Mobile navigation
- Content containers

### Sidebar Architecture

The sidebar manages:

- Navigation
- Active page highlighting
- Mobile responsiveness
- Sidebar collapsing
- Route navigation

#### Sidebar Navigation Flow

\`\`\`text
Admin Clicks Sidebar Item
           │
           ▼
useNavigate()
           │
           ▼
Route Change
           │
           ▼
Page Component Render
\`\`\`

### Header Component

The header controls:

- Search functionality
- Notification access
- Theme switching
- Admin profile
- Mobile sidebar toggle

---

## Dashboard System

The dashboard provides platform insights.

**Displayed data includes:**

- Total users
- Total enrollments
- Revenue metrics
- Active courses
- User growth
- Platform activity

### Dashboard Architecture

\`\`\`text
Dashboard Page
      │
      ▼
Analytics Cards
      │
      ▼
Charts + Tables
      │
      ▼
Backend Analytics APIs
\`\`\`

### Recharts Integration

Charts include:

- Revenue charts
- Enrollment trends
- User growth graphs
- Activity statistics

**Purpose:**

- Data visualization
- Better administrative insights
- Monitoring platform performance

---

## Course Management System

The course module handles:

- Course listing
- Course creation
- Course editing
- Course deletion
- Course analytics

### Course Management Flow

\`\`\`text
Courses Page
      │
      ▼
Axios API Requests
      │
      ▼
Backend Course APIs
      │
      ▼
Course Table Rendering
\`\`\`

### Course Creation System

Admins can:

- Add course titles
- Add descriptions
- Upload thumbnails
- Create lessons
- Add pricing
- Publish courses

### Course Editing System

**Features:**

- Update course content
- Replace thumbnails
- Modify pricing
- Edit lessons
- Manage publish status

---

## User Management System

The user module handles:

- User listing
- User searching
- User banning
- User deletion
- User status management

### User Moderation Workflow

\`\`\`text
Admin Opens Users Page
          │
          ▼
Fetch User Data
          │
          ▼
Render User Table
          │
          ▼
Moderation Actions
\`\`\`

---

## Enrollment System

The enrollment module displays:

- Purchased courses
- Enrollment dates
- Course completion
- User progress

---

## Payment Monitoring System

The payment module tracks:

- Payment history
- Revenue generation
- Transaction statuses
- Course purchases

---

## Report Moderation System

The report system manages community moderation.

Admins can:

- View reports
- Resolve reports
- Hide content
- Unhide content
- Moderate discussions

### Reports Workflow

\`\`\`text
User Reports Content
         │
         ▼
Backend Stores Report
         │
         ▼
Frontend Admin Fetches Reports
         │
         ▼
Admin Moderates Content
\`\`\`

### ReportsPage.jsx

**Responsibilities:**

- Fetch reports
- Render moderation tables
- Handle moderation actions
- Display moderation status

---

## Notification System

The notification system supports:

- Unread notifications
- Read notifications
- Clear notifications
- Notification dropdowns

### Notification Flow

\`\`\`text
Backend Notification Event
           │
           ▼
Frontend Fetch Notifications
           │
           ▼
Notification Rendering
\`\`\`

---

## Profile Management System

Admins can:

- Update profile information
- Change profile picture
- Manage account details
- Edit personal settings

---

## Settings System

The settings module handles:

- Appearance settings
- Notification preferences
- Profile settings
- Dashboard customization

### Dynamic Settings Rendering

The settings page uses conditional rendering.

\`\`\`javascript
switch (key) {
  case "profile":
    return <ProfilePanel />;
}
\`\`\`

This architecture reduces route duplication and improves maintainability.

---

## Input State Management

The admin dashboard uses controlled React inputs.

**Advantages:**

- Better form control
- State synchronization
- Validation support
- Dynamic rendering

---

## Theme System

The dashboard supports:

- Dark mode
- Theme persistence
- Dynamic UI switching

Theme settings are stored locally.

---

## API Communication Layer

The frontend admin communicates using Axios.

**Responsibilities:**

- GET requests
- POST requests
- PUT requests
- DELETE requests
- Authorization headers

### Axios Architecture

\`\`\`text
Dashboard Components
         │
         ▼
Axios Service Layer
         │
         ▼
Backend Admin APIs
\`\`\`

### Authorization Headers

Authenticated requests include:

\`Authorization: Bearer jwt_token\`

### Error Handling System

The frontend handles:

- Authentication failures
- API errors
- Validation errors
- Route errors
- Empty states

### Loading State System

The dashboard manages:

- Page loading
- API loading
- Table loading
- Form submission loading

**Purpose:**

Improve user experience during asynchronous operations.

### Toast Notification System

React Hot Toast is used for:

- Success notifications
- Error alerts
- Action confirmations
- API feedback

### Search System

Search functionality is implemented in:

- Courses page
- Users page
- Reports page
- Payments page

---

## Responsive Design System

The admin dashboard supports:

- Desktop layouts
- Tablet layouts
- Mobile layouts

**Responsive techniques include:**

- Tailwind breakpoints
- Mobile sidebar
- Adaptive grids
- Flexible layouts

### Tailwind CSS Architecture

The admin dashboard uses utility-first styling.

**Advantages:**

- Faster development
- Consistent UI
- Responsive design
- Reusable utilities

---

## Reusable Component Architecture

Reusable components include:

- Cards
- Tables
- Buttons
- Inputs
- Modals
- Loaders
- Dropdowns

---

## State Management Strategy

The admin dashboard primarily uses:

- \`useState\`
- \`useEffect\`
- \`useMemo\`
- \`useCallback\`

For scalable lightweight state management.

---

## Route Synchronization

The frontend synchronizes routes with pages.

Example routes:

- \`/dashboard\`
- \`/courses\`
- \`/users\`
- \`/reports\`
- \`/settings\`

Instead of rendering every page under \`/dashboard\`.

**Advantages:**

- Better browser history
- Proper navigation
- Deep linking support
- Cleaner URLs

---

## Environment Variables

### Required Variables

\`VITE_API_BASE_URL=\`

---

## Local Development Setup

### Install Dependencies

\`\`\`bash
cd frontendAdmin
npm install
\`\`\`

### Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Application runs on:

\`http://localhost:5174\`

### Backend Connection

The frontend admin communicates with:

\`http://localhost:3001\`

### Vite Proxy Architecture

\`\`\`text
Frontend Request
        │
        ▼
Vite Proxy
        │
        ▼
Backend Admin API
\`\`\`

**Purpose:**

Prevent CORS issues during local development.

### Production Build

Build command:

\`\`\`bash
npm run build
\`\`\`

### Deployment Platforms

Frontend admin can be deployed on:

- Vercel
- Netlify
- Render
- Firebase Hosting

### Production Deployment Flow

\`\`\`text
GitHub Repository
         │
         ▼
Production Build
         │
         ▼
Hosting Platform
         │
         ▼
Live Admin Dashboard
\`\`\`

---

## Security Measures

- **Protected Dashboard**: Unauthorized users cannot access admin routes.
- **JWT Security**: JWT tokens secure all admin API requests.
- **Role Based Authorization**: Super admin permissions protect sensitive operations.

---

## Future Improvements

Potential future upgrades:

- Redux or Zustand
- React Query
- WebSocket notifications
- Real time analytics
- Audit logs
- Advanced reporting
- Automated testing
- Docker support
- Activity tracking
- SSR optimization

---

## Conclusion

The AI Mentor Frontend Admin system is a scalable and modular React based administrative dashboard designed for:

- Platform management
- Course administration
- User moderation
- Community moderation
- Analytics monitoring
- Secure admin workflows

The architecture separates responsibilities cleanly using reusable components, protected routes, modular layouts, and centralized API communication, making the system easier to maintain, extend, and scale for future development.`
    }
  },
  "backend-docs": {
    "backend-documentation": {
      title: "Backend Documentation",
      description: "Backend API Documentation for AI Mentor",
      content: `# AI Mentor — Backend (Node.js API)

The Express.js REST API backend for the AI Mentor learning platform. It handles authentication, course management, user data, community posts, analytics, and acts as a secure proxy to the Python AI service.

---

## Features

| Feature | Description |
|---|---|
| 🔐 Authentication | JWT-based auth, Email/Password register & login, Google OAuth (Firebase), Forgot/Reset Password via Email |
| 📚 Course Management | CRUD for courses and lessons (Admin), purchase tracking per user |
| 🤖 AI Video Proxy | Secure bridge between frontend and Python AI service; video caching in DB |
| 💬 Community Posts | Create, read, and manage community discussion posts |
| 📊 Analytics | User activity and course progress analytics |
| 📌 Sidebar | Dynamic sidebar navigation data endpoint |
| 📧 Email | Password reset emails via Nodemailer |
| ☁️ Cloudinary | Cloud storage integration for media uploads |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js v4 |
| ORM | Sequelize v6 |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Email | Nodemailer |
| File Upload | Multer |
| Cloud Storage | Cloudinary SDK |
| Dev Server | Nodemon |

---

## Project Structure

\`\`\`text
backend/
├── config/
│   └── db.js                    # Sequelize + PostgreSQL connection
├── controllers/
│   ├── analyticsController.js   # Analytics query logic
│   ├── communityController.js   # Community post CRUD
│   ├── courseController.js      # Course/lesson logic + title helpers
│   ├── discussionController.js  # (Legacy) Discussion CRUD
│   ├── sidebarController.js     # Sidebar data
│   └── userController.js        # User profile management
├── middleware/
│   └── authMiddleware.js        # JWT protect middleware
├── models/
│   ├── AIVideo.js               # Cached AI-generated video records
│   ├── CommunityPost.js         # Community post model
│   ├── Course.js                # Course model
│   ├── Discussion.js            # Discussion model
│   └── User.js                  # User model (with bcrypt hooks)
├── routes/
│   ├── auth.js                  # /api/auth — register, login, Google auth, password reset
│   ├── userRoutes.js            # /api/users — profile, avatar, course purchases
│   ├── courseRoutes.js          # /api/courses — course catalogue, lesson data
│   ├── aiRoutes.js              # /api/ai — AI video generation proxy & transcripts
│   ├── communityRoutes.js       # /api/community — community posts
│   ├── analyticsRoutes.js       # /api/analytics — learning analytics
│   └── sidebarRoutes.js         # /api/sidebar — sidebar data
├── scripts/                     # Utility/seed scripts
├── utils/
│   └── sendEmail.js             # Nodemailer email utility
├── videos/                      # Local video static directory
├── .env.example                 # Environment variable template
├── server.js                    # App entry point
└── package.json
\`\`\`

---

## Environment Variables

Copy \`.env.example\` to \`.env\` and fill in the values. This project expects a single Postgres connection string from Neon (or any hosted Postgres) in \`DATABASE_URL\`.

\`\`\`env
# Complete Postgres connection string from Neon or your cloud provider
# Example (replace with your actual Neon connection string):
# NEON_DATABASE_URL=postgres://neondb_owner:password@ep-postgres-host.neon.tech:5432/neondb?sslmode=require
NEON_DATABASE_URL=your_neon_database_url

# Express server port
PORT=5000

# JWT secret key
JWT_SECRET=your_jwt_secret_key

# Python AI service URL (use deployed AI service URL or local URL during development)
AI_SERVICE_URL=http://127.0.0.1:8000

# Frontend URL (for CORS and password reset emails)
FRONTEND_URL=http://localhost:5173

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

---

## Getting Started

### Prerequisites

- Node.js v18+
- An active Neon (or other hosted Postgres) project and its connection string
- npm

### Installation (Neon)

\`\`\`bash
# From the project root
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL to the Neon connection string

# Start in development mode (with auto-reload)
npm run dev
\`\`\`

The API will be available at **http://localhost:5000**.

### Available Scripts

| Script | Description |
|---|---|
| \`npm run dev\` | Start with Nodemon (auto-restart on changes) |
| \`npm start\` | Start the production server |
| \`npm run lint\` | Run ESLint to check for code issues |

---

## Database Setup (Neon)

The backend uses Sequelize with PostgreSQL and expects a full connection string in \`DATABASE_URL\`.

1. Create a Neon project at [https://neon.tech](https://neon.tech) and create or use the default branch.
2. From the Neon dashboard, copy the Postgres connection string (the \`postgres://...\` URL). Make sure the string includes SSL (Neon requires SSL / \`sslmode=require\`).
3. Paste the Neon connection string into \`DATABASE_URL\` inside your \`.env\`.
4. On server startup, Sequelize will sync all models (\`sequelize.sync({ alter: true })\`), creating or altering tables as needed.

> [!NOTE]
> If you need a separate read-only or replica connection, obtain the appropriate URL from Neon and set additional env vars as needed.
>
> For production, follow Neon best practices: restrict branch access, use the recommended role, and rotate credentials as required.

---

## API Endpoints

### Auth — \`/api/auth\`

| Method | Endpoint | Description |
|---|---|---|
| POST | \`/register\` | Register a new user (email + password) |
| POST | \`/login\` | Login with email & password → returns JWT |
| POST | \`/google-login\` | Login/register via Firebase Google OAuth token |
| POST | \`/forgot-password\` | Send password reset email |
| POST | \`/reset-password/:token\` | Reset password using token from email |

### Users — \`/api/users\`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | \`/profile\` | Get current user profile | ✅ |
| PUT | \`/profile\` | Update name, bio, profile picture | ✅ |
| POST | \`/purchase/:courseId\` | Purchase a course | ✅ |

### Courses — \`/api/courses\`

| Method | Endpoint | Description |
|---|---|---|
| GET | \`/\` | List all courses |
| GET | \`/:id\` | Get course details with lessons |

### AI Video — \`/api/ai\`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | \`/generate-video\` | Generate an AI lesson video (with DB caching) | ✅ |
| GET | \`/status/:jobId\` | Poll generation job status | ✅ |
| GET | \`/transcript/:filename\` | Fetch transcript text (with DB caching) | — |
| GET | \`/video/:courseId/:filename\` | Proxy video stream from AI service | — |

### Community — \`/api/community\`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | \`/\` | List community posts | ✅ |
| POST | \`/\` | Create a new post | ✅ |

### Analytics — \`/api/analytics\`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | \`/\` | Get learning analytics for user | ✅ |

### Sidebar — \`/api/sidebar\`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | \`/\` | Get sidebar navigation data | ✅ |

---

## Authentication Flow

1. User registers or logs in → server returns a JWT (30-day expiry).
2. Frontend stores the JWT and sends it in every protected request as:
   \`Authorization: Bearer <token>\`
3. The \`authMiddleware.js\` protect function verifies the token and attaches the full \`req.user\` object to protected routes.

---

## AI Video Caching

The AI route (\`/api/ai/generate-video\`) implements a cache-first strategy:

1. Check the \`AIVideo\` table for an existing record matching \`(courseId, lessonId, celebrity)\`.
2. If found, verify the video still exists in the AI service.
3. If the cache is valid → return immediately (no generation cost).
4. If cache is stale/missing → call the Python AI service, then save the result to the DB.

When the job completes and a Cloudinary URL is available, it is persisted to the \`AIVideo\` record for CDN serving.`
    },
    "backend-admin-documentation": {
      title: "Backend Admin Documentation",
      description: "Backend Admin API Documentation for AI Mentor",
      content: `# AI Mentor — Backend Admin Documentation

## Introduction

The \`backendAdmin\` module is an isolated Express.js management service running on Node.js. It acts as the dedicated administrative terminal for the *AI Mentor* platform, providing content moderation, system configuration overrides, analytical metrics aggregation, dynamic schema toggles, database auditing, and validation logic.

---

## Architecture Overview

\`\`\`text
┌────────────────────────────────────────────────────────┐
│                   Admin Dashboard UI                   │
│               (React Frontend Admin Apps)              │
└───────────────────────────┬────────────────────────────┘
                            │ (Secure Admin Routes)
                            ▼
┌────────────────────────────────────────────────────────┐
│                Express.js Admin Server                 │
│       (server.js ──> Routes ──> Zod Validations)       │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│   Admin Controllers   │       │   Helper Scripts &    │
│  (Data Modification)  │       │   Schema Alterations  │
└───────────┬───────────┘       └───────────┬───────────┘
            │                               │
            ▼                               ▼
┌───────────────────────┐               ┌───────────┐
│   Sequelize Models    │──────────────>│ PostgreSQL│
│ (Alterations/Status)  │               │ (Neon DB) │
└───────────────────────┘               └───────────┘
\`\`\`

---

## Folder Structure

\`\`\`text
backendAdmin/
├── config/                  # Database connections & Sequelize management instances
├── controllers/             # Action managers (dynamic deletes, disabling status updates)
├── middleware/              # Permission checks, logging, and error-handling pipelines
├── models/                  # Core schemas supporting structural mutations 
├── routes/                  # Declared endpoint pathways specialized for administrative use
├── schemas/                 # Zod payload structures ensuring zero corrupt data entries
├── scripts/                 # Automation protocols (status updates, deletion rules)
├── .env.example             # Blueprints for setting local environmental scope variables
├── add_column.js            # Table schema modification migration runner
├── list_tables.js           # Structural diagnostic layout utility
├── server.js                # Microservice initialization gateway entry point
└── package.json             # Service metadata and dependencies manifest
\`\`\`

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| Runtime Environment | Node.js | Server-side execution environment |
| Framework | Express.js v4 | Web routing framework for management configurations |
| Data Validation | Zod | Robust schema validation for runtime request filtering |
| ORM | Sequelize v6 | Controls administrative migrations, status checks, and data queries |
| Style & Standard | ESLint v9 | Enforces backend syntax patterns and operational consistency |

---

## Functional Operations & Control Flow

### 1. Dynamic Status and Deletion Pipeline

Instead of applying destructively hard removals across databases, the Admin panel defaults to safe entity visibility state switches:

\`\`\`text
[Dashboard Request Action] ──> [Zod Schema Check] ──> [Admin Middleware Route Gate]
                                                             │
                                                             ▼
[Database Record Mutator] <── [Disable / Soft-Delete] <── [Controller Handler]
\`\`\`

### 2. Live Schema Expansions (add_column.js / list_tables.js)

- **list_tables.js**: Runs system-level metadata diagnostics against the active relational environment, surfacing indices and structural compositions safely.
- **add_column.js**: A specialized CLI tool providing a secure method for executing database schema alterations dynamically across models without standard migration bottlenecks.

---

## API & Route Formats

### Data Integrity Safeguarding (\`/schemas\`)

Requests are guarded by Zod-based structural runtime validation parameters. Any structural payload misalignment triggers an immediate payload rejection error before touching database layers.

### Administrative Route Control Modules (\`/routes\`)

- **Content Management**: Endpoints built to create, update, or deprecate system-wide resources (e.g., managing operational courses, editing lesson components).
- **System Toggles**: Modules processing custom status checks, feature toggle controls, user visibility restrictions, and platform reporting logs.

---

## Administrative API Directory

### 1. Course Management APIs (\`/api/admin/courses\`)

| Method | Endpoint | Administrative Use |
|---|---|---|
| POST | \`/\` | Create New Course: Initializes a new educational track in the database with title, descriptions, price structures, and category tags. |
| PUT | \`/:id\` | Update Course Details: Overrides existing parameters of a specific course, allowing administrators to modify descriptions, price points, or update the syllabus structure. |
| DELETE | \`/:id\` | Toggle Visibility / Archive: Executes a safe visibility flag switch (soft-delete) to remove the course from the public frontend catalog without wiping historical enrollment metrics. |

### 2. Lesson & Content Orchestration (\`/api/admin/lessons\`)

| Method | Endpoint | Administrative Use |
|---|---|---|
| POST | \`/\` | Append Lesson Module: Injects a new instructional step or lesson object into an existing course track. |
| PUT | \`/:id\` | Edit Lesson Meta: Modifies specific lesson criteria, timing, title structures, or underlying text transcripts. |
| DELETE | \`/:id\` | Remove Lesson Component: Detaches a lesson module from a course syllabus path. |

### 3. User & Moderation Controls (\`/api/admin/users\` & \`/api/admin/moderation\`)

| Method | Endpoint | Administrative Use |
|---|---|---|
| GET | \`/\` | Audit User Directory: Pulls the global registration registry to monitor platform signups, access permissions, and account creation timelines. |
| PATCH | \`/:id/status\` | Account Access Suspension: Instantly toggles account access status flags to ban or restrict users violating community guidelines. |
| DELETE | \`/comments/:id\` | Forum Content Moderation: Destructively removes flagged community messages, toxic comments, or spam posts from discussion boards. |

### 4. Metrics & Diagnostics (\`/api/admin/analytics\` & \`/api/admin/system\`)

| Method | Endpoint | Administrative Use |
|---|---|---|
| GET | \`/summary\` | Aggregated Analytics Engine: Computes system-wide performance telemetry, processing total revenue, course completion ratios, active session counts, and signup growth curves. |
| GET | \`/db-status\` | Database Schema Health Check: Executes internal table metadata diagnostics to verify connection integrity and indexes with the relational database layer. |

---

## Configuration & Local Setup

### Environment Settings (\`.env.example\`)

Create a copy of \`.env.example\` named \`.env\` inside the \`backendAdmin\` folder root:

\`\`\`env
# PostgreSQL Connection Data Link 
DATABASE_URL=postgres://admin:password@endpoint.neon.tech/dbname?sslmode=require

# Admin Microservice Variables
PORT=5001
JWT_ADMIN_SECRET=your_isolated_admin_jwt_secret
\`\`\`

### System Installation Instructions

1. **Install Administrative Dependencies**:
   \`\`\`bash
   cd backendAdmin
   npm install
   \`\`\`
2. **Run Linter Quality Check**:
   \`\`\`bash
   npm run lint
   \`\`\`
3. **Boot Development Environment**:
   \`\`\`bash
   npm run dev
   \`\`\`

The backend administration sub-tier service API gateway maps live directly on **http://localhost:5001**.`
    }
  },
  "ai-service-docs": {
    "ai-service-documentation": {
      title: "AI Service Documentation",
      description: "AI Service Documentation for AI Mentor",
      content: `# AI Mentor — AI Service Backend (Python / FastAPI)

The Python microservice behind the AI Mentor platform's "AI Lesson" feature. Given a course, topic, and a celebrity name, it:

- 📝 Generates a short educational script using Google Gemini.
- 🎙️ Converts the script to speech using pyttsx3 (offline TTS).
- 🎥 Merges the audio with a looped celebrity video using FFmpeg.
- ☁️ Uploads the final video to Cloudinary for CDN delivery.

The service exposes a FastAPI HTTP API that the Node.js backend calls as a proxy.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI + Uvicorn |
| AI / LLM | Google Gemini (gemini-2.5-flash) via google-genai |
| Text-to-Speech | pyttsx3 (offline, no API required) |
| Video Processing | FFmpeg (must be installed separately) |
| Cloud Storage | Cloudinary |
| Config | python-dotenv |

---

## Project Structure

\`\`\`text
ai_service/
├── backend/
│   ├── api.py             # Main FastAPI application (all routes & logic)
│   ├── config.py          # Loads and validates env variables
│   ├── requirements.txt   # Python dependencies
│   ├── input/             # 📂 Place your source celebrity videos here
│   │   └── modi.mp4       # Default/fallback celebrity video (REQUIRED)
│   └── .env.example       # Environment variable template
└── outputs/               # Auto-created: generated outputs
    ├── video/             # Final merged .mp4 lesson videos
    ├── audio/             # Intermediate TTS .mp3 files
    └── text/              # Generated lesson scripts (.txt)
\`\`\`

---

## Prerequisites

### 1. Python 3.10+

\`\`\`bash
python --version
\`\`\`

During Windows installation, ensure "Add Python to PATH" is checked.

### 2. FFmpeg

FFmpeg is required for merging audio and video.

Windows (via winget — recommended):

\`\`\`bash
winget install ffmpeg
\`\`\`

Manual install: Download from ffmpeg.org, extract the archive, and add the bin/ folder to your System PATH.

Verify installation:

\`\`\`bash
ffmpeg -version
\`\`\`

---

## Installation

Run all commands from the \`ai_service/\` directory.

### 1. Create a virtual environment

\`\`\`bash
# From the ai_service/ directory
python -m venv venv
\`\`\`

### 2. Activate the virtual environment

Windows (Command Prompt):

\`\`\`cmd
.\\venv\\Scripts\\activate
\`\`\`

Windows (PowerShell) — if activation fails, first run:

\`\`\`powershell
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\\venv\\Scripts\\Activate.ps1
\`\`\`

macOS / Linux:

\`\`\`bash
source venv/bin/activate
\`\`\`

### 3. Install Python dependencies

\`\`\`bash
pip install -r backend/requirements.txt
\`\`\`

---

## Configuration

### Environment Variables

Create a \`.env\` file inside \`ai_service/backend/\`:

\`\`\`bash
cp backend/.env.example backend/.env
\`\`\`

Then edit \`backend/.env\`:

\`\`\`text
# Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary credentials (for cloud video hosting)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
\`\`\`

Get a Gemini API key: Google AI Studio — free tier available.

Get Cloudinary credentials: Cloudinary Console — free tier available.

### Input Videos (Celebrity Sources)

Place source video files in \`ai_service/backend/input/\`:

- File names must match the celebrity name (lowercase): e.g., \`modi.mp4\`, \`elon.mp4\`
- \`modi.mp4\` is required — it is used as the default fallback if a requested celebrity video is not found.
- The video is looped silently and merged with the TTS audio.

---

## Running the Service

Activate your virtual environment first (see above).

From the \`ai_service/\` directory:

\`\`\`bash
cd backend
uvicorn api:app --reload --port 8000
\`\`\`

The service will be available at [http://localhost:8000](http://localhost:8000).

> [!WARNING]
> The Node.js backend must be configured with \`AI_SERVICE_URL=http://127.0.0.1:8000\` to communicate with this service.

---

## API Reference

### GET /

Health check.

Response:

\`\`\`json
{ "message": "AI Lesson Generator Backend Running" }
\`\`\`

### POST /generate

Generates an AI lesson video asynchronously (runs in background).

Request Body:

\`\`\`json
{
  "course": "ReactJS",
  "topic": "Introduction to Components",
  "celebrity": "modi"
}
\`\`\`

Response (immediately):

\`\`\`json
{
  "status": "Processing",
  "filename": "Introduction_to_Components_20240101_120000.mp4",
  "text_file": "Introduction_to_Components_20240101_120000.txt",
  "audio_file": "Introduction_to_Components_20240101_120000.mp3",
  "jobId": "Introduction_to_Components_20240101_120000"
}
\`\`\`

Use the \`jobId\` to poll \`/status/:jobId\` for completion.

### GET /status/{job_id}

Polls the status of a generation job.

Response (while processing):

\`\`\`json
{ "status": "processing" }
\`\`\`

Response (on completion):

\`\`\`json
{
  "status": "ready",
  "cloudinary_url": "https://res.cloudinary.com/..."
}
\`\`\`

Response (on failure):

\`\`\`json
{ "status": "failed" }
\`\`\`

### GET /transcript/{filename}

Returns the text content of a generated lesson script.

Response:

\`\`\`json
{ "content": "Welcome students! Today we will learn about..." }
\`\`\`

### Static File Mounts

| Mount Path | Directory Served | Description |
|---|---|---|
| \`/video-stream/{filename}\` | \`outputs/video/\` | Serves generated \`.mp4\` videos |
| \`/transcript-stream/{filename}\` | \`outputs/text/\` | Serves raw transcript \`.txt\` files |

---

## Generation Pipeline

\`\`\`text
POST /generate
     │
     ├─ 1. Gemini API → generates 50-word lesson script
     │
     ├─ 2. pyttsx3 → converts script to .mp3 audio
     │
     ├─ 3. FFmpeg → loops celebrity .mp4 + merges .mp3 audio → final .mp4
     │
     └─ 4. Cloudinary → uploads final .mp4 → stores secure_url in job_status
\`\`\`

Jobs run in FastAPI \`BackgroundTasks\`, so \`/generate\` returns immediately while processing happens in the background.

---

## Testing with Swagger

FastAPI auto-generates interactive API documentation:

1. Start the server (see above).
2. Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.
3. Click **POST /generate** → **Try it out**, enter a request body, and click **Execute**.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| FFmpeg not found | Install FFmpeg and ensure its \`bin/\` folder is in your system PATH. Restart your terminal after adding it. |
| GEMINI_API_KEY not found | Ensure \`backend/.env\` exists with a valid \`GEMINI_API_KEY\`. |
| Cloudinary credentials missing | All three Cloudinary vars (\`CLOUD_NAME\`, \`API_KEY\`, \`API_SECRET\`) must be set in \`backend/.env\`. |
| PowerShell activation error | Run \`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser\` then try \`.\\venv\\Scripts\\Activate.ps1\` again. |
| Video status stays processing | Check the terminal for FFmpeg or TTS errors. Ensure the input celebrity video exists in \`backend/input/\`. |
`
    }
  }
};
