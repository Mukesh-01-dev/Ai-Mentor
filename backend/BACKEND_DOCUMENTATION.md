# AI Mentor Backend Documentation

## Introduction

The AI Mentor backend is a Node.js and Express.js REST API responsible for authentication, course management, analytics, AI video generation workflows, community discussions, reporting systems, notifications, payment handling, and integration with external services.

The backend acts as the central communication layer between:

  * Frontend applications
  * PostgreSQL database
  * Python AI microservice
  * Cloudinary media storage
  * Email services
  * Authentication providers


The project follows a modular architecture where routes handle API endpoints, controllers contain business logic, models manage database entities, and middleware handles authentication and validation.

---

# System Architecture

```text
Frontend Client
      │
      ▼
Express Routes
      │
      ▼
Middleware Layer
(Authentication, Validation, Authorization)
      │
      ▼
Controllers
(Business Logic)
      │
      ▼
Sequelize Models
      │
      ▼
PostgreSQL Database
```

The backend also communicates with external services:

```text
Backend API
 ├── PostgreSQL (Neon)
 ├── Cloudinary
 ├── FastAPI AI Service
 ├── Nodemailer SMTP
 └── Firebase Google OAuth
```

---

# Tech Stack

| Category           | Technology                     |
| ------------------ | ------------------------------ |
| Runtime            | Node.js                        |
| Framework          | Express.js                     |
| ORM                | Sequelize                      |
| Database           | PostgreSQL                     |
| Authentication     | JWT + bcryptjs                 |
| OAuth              | Firebase Google Authentication |
| AI Service         | FastAPI                        |
| File Upload        | Multer                         |
| Cloud Storage      | Cloudinary                     |
| Email Service      | Nodemailer                     |
| Validation         | Zod                            |
| Development Server | Nodemon                        |

---

# Folder Structure

```text
backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── schemas/
├── scripts/
├── utils/
├── videos/
├── seeds/
├── server.js
└── package.json
```

---

# Config Layer

## config/db.js

Responsible for:

* Creating Sequelize connection
* Connecting to PostgreSQL database
* Handling SSL configuration
* Exporting database instance

The backend uses a single PostgreSQL connection string from environment variables.

Example responsibilities:

* Initialize Sequelize
* Authenticate database connection
* Sync models
* Handle connection errors

---

# Route Layer

Routes define API endpoints and connect them to controllers.

Example flow:

```text
/api/users/profile
        │
        ▼
userRoutes.js
        │
        ▼
userController.js
```

Each route file focuses on one domain.

## Main Route Files

| File               | Responsibility          |
| ------------------ | ----------------------- |
| auth.js            | Authentication          |
| userRoutes.js      | User management         |
| courseRoutes.js    | Courses and lessons     |
| communityRoutes.js | Community discussions   |
| analyticsRoutes.js | Learning analytics      |
| aiRoutes.js        | AI video generation     |
| sidebarRoutes.js   | Sidebar navigation data |

---

# Middleware Layer

Middleware executes before controllers.

## authMiddleware.js

The `protect` middleware verifies JWT tokens.

Authentication flow:

1. Read Authorization header
2. Extract JWT token
3. Verify token using JWT_SECRET
4. Fetch user from database
5. Attach user to `req.user`
6. Continue request

Example:

```text
Authorization: Bearer jwt_token
```

If verification fails:

* Return 401 Unauthorized
* Prevent controller execution

---

## Admin Middleware

Used for protected admin routes.

Responsibilities:

* Verify admin token
* Check admin role
* Restrict super admin routes

---

## Validation Middleware

Validation middleware ensures request bodies match expected schemas.

The backend uses Zod validation schemas.

Validation checks include:

* Required fields
* Email format
* Password length
* Object structure
* Enum validation

---

# Controller Layer

Controllers contain business logic.

Responsibilities include:

* Database queries
* Authentication logic
* Data transformation
* Error handling
* External API communication

Controllers should not directly handle routing logic.

---

# Authentication System

## Registration Flow

1. User submits registration form
2. Password is hashed using bcrypt
3. User record created in database
4. JWT token generated
5. Token returned to frontend

---

## Login Flow

1. User submits email and password
2. Backend checks database user
3. Compare password using bcrypt
4. Generate JWT token
5. Return authenticated response

---

## Google OAuth Flow

1. Frontend authenticates using Firebase
2. Firebase token sent to backend
3. Backend verifies token
4. User created if not existing
5. JWT generated
6. User logged in

---

## Password Reset Flow

### Forgot Password

1. User submits email
2. Reset token generated
3. Token stored temporarily
4. Email sent using Nodemailer
5. Reset link delivered

### Reset Password

1. User opens reset link
2. Backend validates token
3. Password hashed
4. User password updated
5. Old token invalidated

---

# Database Models

## User Model

Stores:

* Name
* Email
* Password hash
* Avatar URL
* Purchased courses
* Preferences
* Notification settings
* Analytics data

Important features:

* Password hashing hooks
* JWT integration
* User profile management

---

## Course Model

Stores:

* Course title
* Description
* Thumbnail
* Lessons
* Category
* Instructor
* Pricing

Relationships:

* Users can purchase courses
* Courses contain lessons

---

## CommunityPost Model

Stores:

* Post content
* Author
* Replies
* Likes/dislikes
* Report status
* Visibility state

Features:

* Reporting system
* Moderation support
* Reply editing
* Soft hide/unhide support

---

## AIVideo Model

Stores cached AI generated videos.

Fields include:

* Course ID
* Lesson ID
* Celebrity voice
* Video URL
* Transcript
* Cloudinary URL
* Generation status

Purpose:

Reduce repeated AI generation costs.

---

# AI Video Generation System

The backend acts as a proxy between frontend and FastAPI AI service.

Flow:

```text
Frontend
   │
   ▼
Node.js Backend
   │
   ▼
FastAPI AI Service
   │
   ▼
Generated Video
```

---

## Video Generation Flow

1. Frontend requests video generation
2. Backend checks AIVideo cache
3. If cached:

   * Return existing video
4. If not cached:

   * Call AI service
   * Generate video
   * Upload to Cloudinary
   * Save metadata in database
   * Return response

---

## Transcript Handling

The backend can:

* Fetch transcript from AI service
* Cache transcript in database
* Reuse cached transcript

---

# Community System

The community system supports:

* Global discussions
* Course discussions
* Replies
* Likes/dislikes
* Reporting
* Moderation
* Hidden content

---

## Reporting Workflow

1. User reports content
2. Report stored in database
3. Admin dashboard fetches reports
4. Admin can:

   * Resolve report
   * Hide content
   * Unhide content
   * Delete content

---

# Analytics System

The analytics module tracks:

* User activity
* Course progress
* Learning time
* Enrollments
* Engagement metrics

Used for:

* Dashboard visualizations
* User insights
* Admin analytics

---

# Notification System

The notification system supports:

* Admin notifications
* User notifications
* Read/unread tracking
* Clear all notifications

Features:

* Mark as read
* Notification persistence
* Real time ready architecture

---

# File Upload System

The backend uses Multer for handling uploads.

Flow:

```text
Frontend Upload
      │
      ▼
Multer Middleware
      │
      ▼
Cloudinary Upload
      │
      ▼
Database URL Storage
```

Uploaded assets include:

* Profile images
* Course thumbnails
* AI generated videos

---

# Cloudinary Integration

Cloudinary is used for:

* Image hosting
* Video hosting
* CDN delivery
* Media optimization

Advantages:

* Reduced backend storage usage
* Faster media delivery
* Global CDN support

---

# Email System

The backend uses Nodemailer.

Used for:

* Password reset emails
* Verification emails
* Notification emails

SMTP credentials are stored in environment variables.

---

# API Design Principles

The backend follows REST principles.

## Example Route Structure

```text
GET    /api/courses
POST   /api/courses
GET    /api/users/profile
PUT    /api/users/profile
DELETE /api/community/:id
```

---

# Error Handling

The backend uses centralized error handling.

Typical response format:

```json
{
  "message": "Error message"
}
```

Common status codes:

| Status | Meaning               |
| ------ | --------------------- |
| 200    | Success               |
| 201    | Resource Created      |
| 400    | Bad Request           |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 404    | Not Found             |
| 500    | Internal Server Error |

---

# Security Measures

## Password Security

* Passwords hashed using bcrypt
* Plain passwords never stored

---

## JWT Security

* Protected routes require tokens
* Tokens verified server-side
* Expiration supported

---

## Environment Variables

Sensitive credentials are stored in `.env`.

Includes:

* Database URL
* JWT secret
* Cloudinary credentials
* SMTP credentials
* AI service URL

---

## CORS Protection

Backend only allows configured frontend origins.

---

# Environment Variables

## Required Variables

```env
NEON_DATABASE_URL=
JWT_SECRET=
PORT=
AI_SERVICE_URL=
FRONTEND_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

# Local Development Setup

## Installation

```bash
cd backend
npm install
```

---

## Environment Setup

Create:

```text
.env
```

Add required environment variables.

---

## Start Development Server

```bash
npm run dev
```

Server runs on:

```text
http://localhost:5000
```

---

# Database Synchronization

Sequelize synchronizes models during startup.

Responsibilities:

* Create missing tables
* Alter schema
* Maintain relationships

---

# Deployment Architecture

## Backend Deployment

Can be deployed on:

* Render
* Railway
* VPS
* AWS
* DigitalOcean

---

## Database Deployment

Uses Neon PostgreSQL cloud database.

---

## Media Hosting

Cloudinary hosts uploaded media assets.

---

# Performance Optimizations

## AI Video Caching

Prevents repeated expensive AI generation.

---

## Database Query Optimization

Uses Sequelize associations and optimized queries.

---

## CDN Media Delivery

Cloudinary CDN improves loading speed.

---

# Future Improvements

Potential future enhancements:

* Redis caching
* WebSockets
* Swagger API documentation
* Rate limiting
* Refresh token authentication
* Microservice separation
* Queue based AI processing
* Real time notifications
* Docker deployment
* Automated testing

---

# Conclusion

The AI Mentor backend is a modular and scalable Node.js API designed to support:

* AI powered learning
* Course management
* Community interaction
* Analytics
* Authentication
* Media processing
* Admin management
