# AI Mentor — Backend (Node.js API)

The Express.js REST API backend for the **AI Mentor** learning platform. It handles authentication, course management, user data, community posts, analytics, and acts as a secure proxy to the Python AI service.

---

## ✨ Features

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

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js v4 |
| ORM | Sequelize v6 |
| Database | PostgreSQL |
| Auth | JWT (`jsonwebtoken`) + bcryptjs |
| Email | Nodemailer |
| File Upload | Multer |
| Cloud Storage | Cloudinary SDK |
| Dev Server | Nodemon |

---

## 📁 Project Structure

```
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
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the values. This project expects a single Postgres connection string from Neon (or any hosted Postgres) in `DATABASE_URL`.

```env
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
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- An active Neon (or other hosted Postgres) project and its connection string
- npm

### Installation (Neon)

```bash
# From the project root
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL to the Neon connection string

# Start in development mode (with auto-reload)
npm run dev
```

The API will be available at **http://localhost:5000**.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with Nodemon (auto-restart on changes) |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint to check for code issues |

---

## 🗄️ Database Setup (Neon)

The backend uses **Sequelize** with PostgreSQL and expects a full connection string in `DATABASE_URL`.

1. Create a Neon project at https://neon.tech and create or use the default branch.
2. From the Neon dashboard, copy the Postgres connection string (the `postgres://...` URL). Make sure the string includes SSL (Neon requires SSL / `sslmode=require`).
3. Paste the Neon connection string into `DATABASE_URL` inside your `.env`.
4. On server startup, Sequelize will **sync all models** (`sequelize.sync({ alter: true })`), creating or altering tables as needed.

Notes:
- If you need a separate read-only or replica connection, obtain the appropriate URL from Neon and set additional env vars as needed.
- For production, follow Neon best practices: restrict branch access, use the recommended role, and rotate credentials as required.

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user (email + password) |
| `POST` | `/login` | Login with email & password → returns JWT |
| `POST` | `/google-login` | Login/register via Firebase Google OAuth token |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password/:token` | Reset password using token from email |

### Users — `/api/users`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/profile` | Get current user profile | ✅ |
| `PUT` | `/profile` | Update name, bio, profile picture | ✅ |
| `POST` | `/purchase/:courseId` | Purchase a course | ✅ |

### Courses — `/api/courses`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all courses |
| `GET` | `/:id` | Get course details with lessons |

### AI Video — `/api/ai`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/generate-video` | Generate an AI lesson video (with DB caching) | ✅ |
| `GET` | `/status/:jobId` | Poll generation job status | ✅ |
| `GET` | `/transcript/:filename` | Fetch transcript text (with DB caching) | — |
| `GET` | `/video/:courseId/:filename` | Proxy video stream from AI service | — |

### Community — `/api/community`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | List community posts | ✅ |
| `POST` | `/` | Create a new post | ✅ |

### Analytics — `/api/analytics`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Get learning analytics for user | ✅ |

### Sidebar — `/api/sidebar`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Get sidebar navigation data | ✅ |

---

## 🔒 Authentication Flow

1. User registers or logs in → server returns a **JWT** (30-day expiry).
2. Frontend stores the JWT and sends it in every protected request as:
   ```
   Authorization: Bearer <token>
   ```
3. The `authMiddleware.js` `protect` function verifies the token and attaches the full `req.user` object to protected routes.

---

## 🤖 AI Video Caching

The AI route (`/api/ai/generate-video`) implements a **cache-first** strategy:
1. Check the `AIVideo` table for an existing record matching `(courseId, lessonId, celebrity)`.
2. If found, verify the video still exists in the AI service.
3. If the cache is valid → return immediately (no generation cost).
4. If cache is stale/missing → call the Python AI service, then save the result to the DB.
5. When the job completes and a Cloudinary URL is available, it is persisted to the `AIVideo` record for CDN serving.
