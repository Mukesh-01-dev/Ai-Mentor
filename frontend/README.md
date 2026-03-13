# AI Mentor — Frontend

The React + Vite frontend for the **AI Mentor** learning platform. It provides a complete student and admin experience including course browsing, AI-powered video lessons, community discussions, analytics, and user account management.

---

## ✨ Features

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
| 🌐 i18n | Multi-language support via `i18next` |

---

## 🛠 Tech Stack

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

## 📁 Project Structure

```
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
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Backend API base URL (proxied via Vite)
VITE_API_BASE_URL=http://localhost:5000

# Firebase project credentials (for Google OAuth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Tip:** Get Firebase credentials from the [Firebase Console](https://console.firebase.google.com/).
> Enable **Google Sign-In** under *Authentication → Sign-in method*.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Backend server running on `http://localhost:5000` (see `../backend/README.md`)

### Installation

```bash
# From the project root
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your credentials

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 🔀 Routing Overview

| Path | Page | Access |
|---|---|---|
| `/` | Redirects based on auth status | Public |
| `/login` | Login page | Public only |
| `/signup` | Sign up page | Public only |
| `/forgot-password` | Forgot password | Public only |
| `/reset-password/:token` | Reset password | Public only |
| `/dashboard` | User dashboard | Protected |
| `/courses` | Course catalogue | Protected |
| `/course-preview/:courseId` | Course detail/preview | Public |
| `/learning/:id` | AI lesson player | Protected |
| `/discussions` | Community discussions | Protected |
| `/analytics` | Learning analytics | Protected |
| `/watchedvideos` | Watched video history | Protected |
| `/settings` | Account settings | Protected |
| `/admin` | Admin panel | Admin only |

---

## 🔌 API Communication

All API calls are proxied through Vite to the backend at `http://localhost:5000`. The proxy is configured in `vite.config.js`:

```js
proxy: {
  "/api": {
    target: env.VITE_API_BASE_URL,
    changeOrigin: true,
  },
}
```

This means frontend calls to `/api/...` are transparently forwarded to the backend without CORS issues during development.
