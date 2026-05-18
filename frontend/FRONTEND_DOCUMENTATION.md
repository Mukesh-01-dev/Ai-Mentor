# AI Mentor Frontend Documentation

# Introduction

The AI Mentor frontend is a React and Vite based single page application responsible for delivering the complete user experience of the AI Mentor learning platform.

The frontend communicates with the Node.js backend API and provides:

* User authentication
* Course browsing
* AI generated lesson playback
* Community discussions
* Learning analytics
* User profile management
* Theme and language customization
* Admin dashboard access

The frontend is designed using a modular React architecture with reusable UI components, centralized context management, protected routing, API service abstraction, and responsive Tailwind based layouts.

---

# Frontend System Architecture

```text
                    ┌──────────────────────┐
                    │     User Browser     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React + Vite App   │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│ React Router   │   │ Context APIs   │   │ UI Components  │
└────────────────┘   └────────────────┘   └────────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Axios Services    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Backend API       │
                    └──────────────────────┘
```

---

# External Integrations

The frontend communicates with several external systems:

```text
Frontend Application
 ├── Express Backend API
 ├── Firebase Authentication
 ├── Cloudinary Media URLs
 ├── FastAPI AI Video Service
 ├── PostgreSQL Data via Backend
 └── i18next Translation Engine
```

---

# Tech Stack

| Category             | Technology            |
| -------------------- | --------------------- |
| Framework            | React 19              |
| Build Tool           | Vite 7                |
| Routing              | React Router DOM      |
| Styling              | Tailwind CSS          |
| State Management     | React Context API     |
| HTTP Client          | Axios                 |
| Authentication       | Firebase Google OAuth |
| Charts               | Recharts              |
| Icons                | Lucide React          |
| Notifications        | React Hot Toast       |
| Internationalization | i18next               |

---

# Folder Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── i18n/
│   ├── lib/
│   ├── pages/
│   ├── service/
│   ├── App.jsx
│   ├── main.jsx
│   ├── firebase.js
│   └── index.css
├── package.json
├── vite.config.js
└── .env
```

---

# Application Entry Flow

## main.jsx

The frontend application starts from `main.jsx`.

Responsibilities:

* Create React root
* Attach application to DOM
* Initialize providers
* Initialize routing
* Import global styles

Flow:

```text
main.jsx
   │
   ▼
<App />
   │
   ▼
React Router
   │
   ▼
Pages + Components
```

---

# Root Application Layer

## App.jsx

`App.jsx` acts as the root routing layer.

Responsibilities:

* Configure frontend routes
* Handle protected routes
* Handle admin routes
* Render layouts
* Redirect unauthorized users

---

# Routing Architecture

The frontend uses React Router DOM.

## Route Types

| Route Type       | Purpose                           |
| ---------------- | --------------------------------- |
| Public Routes    | Accessible without authentication |
| Protected Routes | Require logged in user            |
| Admin Routes     | Require admin privileges          |

---

# Route Flow Diagram

```text
User Navigation
       │
       ▼
React Router
       │
       ▼
ProtectedRoute / AdminRoute
       │
       ▼
Page Component
       │
       ▼
API Requests + UI Rendering
```

---

# Main Routes

| Route         | Description             |
| ------------- | ----------------------- |
| /login        | User login page         |
| /signup       | User registration       |
| /dashboard    | Main learning dashboard |
| /courses      | Course catalog          |
| /learning/:id | AI lesson player        |
| /analytics    | User learning analytics |
| /discussions  | Community discussions   |
| /settings     | User settings           |
| /admin        | Admin dashboard         |

---

# Authentication System

The frontend supports:

* Email/password authentication
* Google OAuth authentication
* JWT session persistence
* Password reset workflows

---

# Authentication Architecture

```text
Login Form
    │
    ▼
Axios API Request
    │
    ▼
Backend Authentication
    │
    ▼
JWT Token Response
    │
    ▼
LocalStorage Storage
    │
    ▼
Protected Route Access
```

---

# AuthContext

`AuthContext.jsx` manages global authentication state.

Responsibilities:

* Store authenticated user
* Store JWT token
* Login/logout methods
* Session persistence
* Auto authentication restore

The context prevents prop drilling across components.

---

# Google OAuth Flow

The frontend integrates Firebase Google authentication.

Flow:

```text
Google Login Button
        │
        ▼
Firebase Authentication Popup
        │
        ▼
Google Account Verification
        │
        ▼
Firebase Token
        │
        ▼
Backend API Verification
        │
        ▼
JWT Authentication
```

---

# ProtectedRoute Component

The `ProtectedRoute` component prevents unauthorized access.

Responsibilities:

* Verify authentication token
* Redirect unauthenticated users
* Render child routes for authenticated users

Example:

```text
If token exists → Render page
If token missing → Redirect to login
```

---

# AdminRoute Component

The `AdminRoute` component restricts admin pages.

Checks include:

* Admin authentication
* Role validation
* Access control

---

# Context Architecture

The frontend uses React Context API for global state.

Main contexts:

| Context        | Purpose              |
| -------------- | -------------------- |
| AuthContext    | Authentication state |
| SidebarContext | Sidebar visibility   |
| ThemeContext   | Theme state          |

---

# ThemeContext

Controls:

* Dark mode
* Light mode
* Theme persistence
* Theme toggling

The selected theme is stored locally for persistence.

---

# SidebarContext

Controls:

* Sidebar open state
* Mobile sidebar visibility
* Sidebar collapse behavior

Used across:

* Dashboard layout
* Admin panel
* Mobile responsive navigation

---

# Component Architecture

The frontend follows reusable component architecture.

```text
Pages
  │
  ▼
Reusable Components
  │
  ▼
UI Elements
```

---

# Component Categories

| Category             | Responsibility        |
| -------------------- | --------------------- |
| Auth Components      | Login/signup forms    |
| Common Components    | Shared reusable UI    |
| Video Components     | Video playback system |
| Layout Components    | Header/sidebar        |
| Analytics Components | Charts and metrics    |

---

# Layout System

Main layout components:

* Header
* Sidebar
* Mobile navigation
* Dashboard wrappers

Responsibilities:

* Navigation
* Theme controls
* User profile display
* Notifications
* Responsive layouts

---

# Course System

The course module handles:

* Course listing
* Course previews
* Lesson playback
* Course purchasing
* Learning progress

---

# Course Flow

```text
Course List Page
       │
       ▼
Course Preview Page
       │
       ▼
Purchase / Enrollment
       │
       ▼
Learning Page
       │
       ▼
AI Video Playback
```

---

# CoursePage.jsx

Responsibilities:

* Fetch all courses
* Render course cards
* Handle filtering/searching
* Navigation to previews

---

# CoursePreview.jsx

Displays:

* Course information
* Lesson overview
* Pricing
* Enrollment options
* Instructor details

---

# LearningPage.jsx

The learning page is the core educational interface.

Responsibilities:

* Load lessons
* Request AI videos
* Display transcripts
* Track watched videos
* Save learning progress

---

# AI Video Generation Flow

```text
User Opens Lesson
       │
       ▼
Frontend Requests AI Video
       │
       ▼
Backend AI Endpoint
       │
       ▼
FastAPI AI Service
       │
       ▼
Generated Video
       │
       ▼
Frontend Video Player
```

---

# Video Player System

Responsibilities:

* Stream AI videos
* Display playback controls
* Handle loading states
* Manage transcripts
* Track watch history

---

# Watched Videos System

The frontend stores and displays:

* Previously watched lessons
* Video history
* Recently viewed content

Features:

* Resume learning
* Continue watching
* Playback tracking

---

# Community Discussion System

The discussion module supports:

* Course discussions
* Global discussions
* Replies
* Likes/dislikes
* Reporting

---

# Community Architecture

```text
Discussion Page
       │
       ▼
Community Components
       │
       ▼
Axios Requests
       │
       ▼
Backend Community APIs
```

---

# Discussion Features

Users can:

* Create posts
* Reply to discussions
* Like/dislike posts
* Edit replies
* Report inappropriate content

---

# Reporting System

Flow:

```text
User Reports Content
        │
        ▼
Frontend Report Modal
        │
        ▼
Backend Report Endpoint
        │
        ▼
Admin Dashboard Moderation
```

---

# Analytics System

The analytics module provides:

* Learning progress
* Course completion
* Watch statistics
* Engagement metrics

---

# Analytics Architecture

```text
Backend Analytics Data
          │
          ▼
Axios Fetch Requests
          │
          ▼
Recharts Visualization
          │
          ▼
Interactive Dashboard UI
```

---

# Recharts Integration

Charts used include:

* Line charts
* Bar charts
* Pie charts
* Progress graphs

Purpose:

* Improve learning visualization
* Display user progress
* Show engagement statistics

---

# Settings System

The settings page manages:

* Profile editing
* Notification preferences
* Theme switching
* Language settings
* Password updates

---

# Settings Architecture

```text
Settings Page
      │
      ▼
Panel Rendering System
      │
      ▼
Controlled Input Forms
      │
      ▼
Backend Profile APIs
```

---

# Controlled Form System

The frontend uses controlled React inputs.

Advantages:

* Real time validation
* State synchronization
* Dynamic updates
* Better form control

---

# Appearance System

The appearance module controls:

* Dark mode
* Theme persistence
* Visual preferences

Theme selection is preserved using local storage.

---

# Internationalization System

The frontend supports multilingual content using i18next.

Responsibilities:

* Dynamic translation loading
* Language switching
* Translation persistence

---

# Translation Architecture

```text
User Selects Language
          │
          ▼
I18next Changes Locale
          │
          ▼
Translation Files Loaded
          │
          ▼
UI Re-rendered
```

---

# Styling Architecture

The frontend uses Tailwind CSS.

Advantages:

* Utility first design
* Faster UI development
* Responsive layouts
* Consistent styling

---

# Responsive Design System

The UI supports:

* Desktop devices
* Tablets
* Mobile devices

Responsive techniques:

* Tailwind breakpoints
* Flexible layouts
* Adaptive navigation
* Mobile sidebars

---

# API Communication Layer

The frontend communicates with backend APIs using Axios.

Responsibilities:

* GET requests
* POST requests
* PUT requests
* DELETE requests
* Authentication headers

---

# Axios Architecture

```text
React Components
        │
        ▼
Axios Service Layer
        │
        ▼
Backend REST APIs
```

---

# Axios Features

Features include:

* Base URL configuration
* Token attachment
* Error interception
* Centralized requests

---

# Error Handling System

The frontend handles:

* API errors
* Authentication errors
* Validation failures
* Loading states
* Empty states

---

# Toast Notification System

The frontend uses React Hot Toast.

Used for:

* Success messages
* Error alerts
* Loading notifications
* User feedback

---

# Loading State Management

Common loading systems:

* Page loading
* Button loading
* API request loading
* Skeleton screens

Purpose:

Improve user experience during asynchronous operations.

---

# Environment Variables

## Required Variables

```env
VITE_API_BASE_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

# Vite Configuration

`vite.config.js` handles:

* Development server
* API proxying
* Environment loading
* Build optimization

---

# API Proxy System

```text
Frontend Request
      │
      ▼
Vite Proxy
      │
      ▼
Backend API
```

Purpose:

Prevent CORS issues during local development.

---

# Firebase Integration

Firebase is used only for:

* Google OAuth login
* Google account verification

The frontend initializes Firebase inside:

```text
firebase.js
```

---

# Build Process

The frontend uses Vite production builds.

Command:

```bash
npm run build
```

Responsibilities:

* Bundle optimization
* Asset optimization
* Code splitting
* Production compilation

---

# Performance Optimizations

## Lazy Loading

Used for:

* Large pages
* Heavy analytics components
* Route optimization

---

# Memoization

The frontend uses:

* useMemo
* useCallback
* Optimized rendering

Purpose:

Reduce unnecessary re-renders.

---

# Rendering Optimization

Techniques include:

* Controlled component rendering
* State separation
* Component reuse
* Efficient conditional rendering

---

# Security Measures

## JWT Protection

Tokens are attached to protected requests.

---

## Protected Routes

Unauthorized users cannot access protected pages.

---

## Input Validation

Frontend validates:

* Email formats
* Required fields
* Password constraints
* Form data

---

# Local Development Setup

## Installation

```bash
cd frontend
npm install
```

---

# Development Server

```bash
npm run dev
```

Application runs on:

```text
http://localhost:5173
```

---

# Production Deployment

Frontend can be deployed using:

* Vercel
* Netlify
* Render
* Firebase Hosting

---

# Deployment Flow

```text
GitHub Repository
        │
        ▼
Production Build
        │
        ▼
Hosting Platform
        │
        ▼
Live Frontend Application
```

---

# Future Improvements

Potential future upgrades:

* Zustand or Redux
* React Query
* WebSockets
* Real time chat
* PWA support
* Offline caching
* Automated testing
* Storybook integration
* SSR support
* Micro frontend architecture

---

# Conclusion

The AI Mentor frontend is a scalable and modular React application designed to provide:

* AI powered learning
* Interactive educational experiences
* Community collaboration
* Learning analytics
* Secure authentication
* Responsive user interfaces