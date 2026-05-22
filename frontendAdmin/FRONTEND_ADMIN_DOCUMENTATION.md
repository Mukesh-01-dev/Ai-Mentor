# AI Mentor Frontend Admin Documentation

# Introduction

The Frontend Admin application is the administrative control panel of the AI Mentor platform. It is built using React and Vite and provides administrative interfaces for managing users, courses, reports, enrollments, payments, analytics, notifications, and platform moderation.

The admin frontend communicates with the dedicated backendAdmin API server and provides secure access control for administrators and super administrators.

The system is designed using modular React architecture with reusable UI components, protected admin routes, responsive dashboard layouts, centralized API communication, and scalable page based rendering.

---

# Frontend Admin System Architecture

```text
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
```

---

# Main Responsibilities

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

# Tech Stack

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

# Folder Structure

```text
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
```

---

# Application Startup Flow

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
Protected Routes
    │
    ▼
Admin Layout
    │
    ▼
Dashboard Pages
```

---

# Root Application Layer

## App.jsx

The `App.jsx` file is the root controller of the frontend admin application.

Responsibilities:

- Route rendering
- Page switching
- Authentication checks
- Layout rendering
- Sidebar rendering
- Header rendering
- Dashboard rendering
- Route synchronization

---

# Dynamic Page Rendering System

The admin panel uses dynamic page rendering.

```js
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
```

The selected route dynamically renders the corresponding page component.

Advantages:

- Cleaner architecture
- Reusable layout system
- Reduced route duplication
- Easier scalability

---

# Routing Architecture

The frontend admin uses React Router DOM.

---

# Route Flow

```text
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
```

---

# Main Routes

| Route | Description |
|---|---|
| /login | Admin login page |
| /dashboard | Dashboard analytics |
| /courses | Course management |
| /users | User management |
| /enrollments | Enrollment tracking |
| /payments | Payment monitoring |
| /reports | Report moderation |
| /profile | Admin profile |
| /settings | Dashboard settings |

---

# Authentication System

The frontend admin uses JWT authentication.

The token is stored locally after successful login.

---

# Authentication Flow

```text
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
```

---

# Login System

Responsibilities:

- Validate admin credentials
- Handle API login requests
- Store authentication token
- Redirect authenticated admin
- Handle invalid login states

---

# Protected Route System

Protected routes prevent unauthorized dashboard access.

Checks include:

- Token existence
- Token validity
- Authentication status

Unauthorized users are redirected to `/login`.

---

# Super Admin Authorization

Certain actions are restricted to super admins.

Examples include:

- Creating admins
- Deleting admins
- Updating admin permissions
- Managing platform level settings

---

# Layout System

The admin dashboard uses reusable layout architecture.

Main layout components:

- AdminSidebar
- Header
- Dashboard wrappers
- Mobile navigation
- Content containers

---

# Sidebar Architecture

The sidebar manages:

- Navigation
- Active page highlighting
- Mobile responsiveness
- Sidebar collapsing
- Route navigation

---

# Sidebar Navigation Flow

```text
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
```

---

# Header Component

The header controls:

- Search functionality
- Notification access
- Theme switching
- Admin profile
- Mobile sidebar toggle

---

# Dashboard System

The dashboard provides platform insights.

Displayed data includes:

- Total users
- Total enrollments
- Revenue metrics
- Active courses
- User growth
- Platform activity

---

# Dashboard Architecture

```text
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
```

---

# Recharts Integration

Charts include:

- Revenue charts
- Enrollment trends
- User growth graphs
- Activity statistics

Purpose:

- Data visualization
- Better administrative insights
- Monitoring platform performance

---

# Course Management System

The course module handles:

- Course listing
- Course creation
- Course editing
- Course deletion
- Course analytics

---

# Course Management Flow

```text
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
```

---

# Course Creation System

Admins can:

- Add course titles
- Add descriptions
- Upload thumbnails
- Create lessons
- Add pricing
- Publish courses

---

# Course Editing System

Features:

- Update course content
- Replace thumbnails
- Modify pricing
- Edit lessons
- Manage publish status

---

# User Management System

The user module handles:

- User listing
- User searching
- User banning
- User deletion
- User status management

---

# User Moderation Workflow

```text
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
```

---

# Enrollment System

The enrollment module displays:

- Purchased courses
- Enrollment dates
- Course completion
- User progress

---

# Payment Monitoring System

The payment module tracks:

- Payment history
- Revenue generation
- Transaction statuses
- Course purchases

---

# Report Moderation System

The report system manages community moderation.

Admins can:

- View reports
- Resolve reports
- Hide content
- Unhide content
- Moderate discussions

---

# Reports Workflow

```text
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
```

---

# ReportsPage.jsx

Responsibilities:

- Fetch reports
- Render moderation tables
- Handle moderation actions
- Display moderation status

---

# Notification System

The notification system supports:

- Unread notifications
- Read notifications
- Clear notifications
- Notification dropdowns

---

# Notification Flow

```text
Backend Notification Event
           │
           ▼
Frontend Fetch Notifications
           │
           ▼
Notification Rendering
```

---

# Profile Management System

Admins can:

- Update profile information
- Change profile picture
- Manage account details
- Edit personal settings

---

# Settings System

The settings module handles:

- Appearance settings
- Notification preferences
- Profile settings
- Dashboard customization

---

# Dynamic Settings Rendering

The settings page uses conditional rendering.

```js
switch (key) {
  case "profile":
    return <ProfilePanel />;
}
```

This architecture reduces route duplication and improves maintainability.

---

# Input State Management

The admin dashboard uses controlled React inputs.

Advantages:

- Better form control
- State synchronization
- Validation support
- Dynamic rendering

---

# Theme System

The dashboard supports:

- Dark mode
- Theme persistence
- Dynamic UI switching

Theme settings are stored locally.

---

# API Communication Layer

The frontend admin communicates using Axios.

Responsibilities:

- GET requests
- POST requests
- PUT requests
- DELETE requests
- Authorization headers

---

# Axios Architecture

```text
Dashboard Components
         │
         ▼
Axios Service Layer
         │
         ▼
Backend Admin APIs
```

---

# Authorization Headers

Authenticated requests include:

```text
Authorization: Bearer jwt_token
```

---

# Error Handling System

The frontend handles:

- Authentication failures
- API errors
- Validation errors
- Route errors
- Empty states

---

# Loading State System

The dashboard manages:

- Page loading
- API loading
- Table loading
- Form submission loading

Purpose:

Improve user experience during asynchronous operations.

---

# Toast Notification System

React Hot Toast is used for:

- Success notifications
- Error alerts
- Action confirmations
- API feedback

---

# Search System

Search functionality is implemented in:

- Courses page
- Users page
- Reports page
- Payments page

---

# Responsive Design System

The admin dashboard supports:

- Desktop layouts
- Tablet layouts
- Mobile layouts

Responsive techniques include:

- Tailwind breakpoints
- Mobile sidebar
- Adaptive grids
- Flexible layouts

---

# Tailwind CSS Architecture

The admin dashboard uses utility-first styling.

Advantages:

- Faster development
- Consistent UI
- Responsive design
- Reusable utilities

---

# Reusable Component Architecture

Reusable components include:

- Cards
- Tables
- Buttons
- Inputs
- Modals
- Loaders
- Dropdowns

---

# State Management Strategy

The admin dashboard primarily uses:

- useState
- useEffect
- useMemo
- useCallback

For scalable lightweight state management.

---

# Route Synchronization

The frontend synchronizes routes with pages.

Example routes:

```text
/dashboard
/courses
/users
/reports
/settings
```

Instead of rendering every page under `/dashboard`.

Advantages:

- Better browser history
- Proper navigation
- Deep linking support
- Cleaner URLs

---

# Environment Variables

## Required Variables

```env
VITE_API_BASE_URL=
```

---

# Local Development Setup

## Install Dependencies

```bash
cd frontendAdmin
npm install
```

---

# Run Development Server

```bash
npm run dev
```

Application runs on:

```text
http://localhost:5174
```

---

# Backend Connection

The frontend admin communicates with:

```text
http://localhost:3001
```

---

# Vite Proxy Architecture

```text
Frontend Request
        │
        ▼
Vite Proxy
        │
        ▼
Backend Admin API
```

Purpose:

Prevent CORS issues during local development.

---

# Production Build

Build command:

```bash
npm run build
```

---

# Deployment Platforms

Frontend admin can be deployed on:

- Vercel
- Netlify
- Render
- Firebase Hosting

---

# Production Deployment Flow

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
Live Admin Dashboard
```

---

# Security Measures

## Protected Dashboard

Unauthorized users cannot access admin routes.

---

# JWT Security

JWT tokens secure all admin API requests.

---

# Role Based Authorization

Super admin permissions protect sensitive operations.

---

# Future Improvements

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

# Conclusion

The AI Mentor Frontend Admin system is a scalable and modular React based administrative dashboard designed for:

- Platform management
- Course administration
- User moderation
- Community moderation
- Analytics monitoring
- Secure admin workflows

The architecture separates responsibilities cleanly using reusable components, protected routes, modular layouts, and centralized API communication, making the system easier to maintain, extend, and scale for future development.