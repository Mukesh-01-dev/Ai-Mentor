# AI Mentor — Learning Platform

An AI-powered learning management system with course management, analytics, community discussions, and AI-generated video lessons.

## Features

- 📚 Course Management & Purchasing
- 📊 Learning Analytics
- 💬 Community Discussions
- 🔐 User Authentication (JWT + Google OAuth)
- 🤖 AI-Generated Lesson Videos (Gemini + TTS + FFmpeg)

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Sequelize
- **Database**: PostgreSQL
- **AI Service**: Python + FastAPI + Google Gemini
- **Auth**: Firebase (Google OAuth) + JWT

## Prerequisites

- Node.js v18+
- PostgreSQL v14+
- Python 3.10+
- FFmpeg
- npm

## Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd AI-Mentor-Updated
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your database credentials and secrets in .env
npm run dev
```
> See [`backend/README.md`](./backend/README.md) for full setup guide.

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Fill in your Firebase credentials in .env
npm run dev
```
> See [`frontend/README.md`](./frontend/README.md) for full setup guide.

### 4. Setup AI Service
```bash
cd ai_service
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
# Fill in Gemini and Cloudinary keys in .env
cd backend
uvicorn api:app --reload --port 8000
```
> See [`ai_service/README.md`](./ai_service/README.md) for full setup guide.

## Environment Variables

Each service has its own `.env` file. Copy the `.env.example` in each folder and fill in your values.

| Service | Key variables |
|---|---|
| `backend/` | `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `AI_SERVICE_URL` |
| `frontend/` | `VITE_API_BASE_URL`, `VITE_FIREBASE_*` |
| `ai_service/backend/` | `GEMINI_API_KEY`, `CLOUDINARY_*` |

## Running the Application

Start all three services in separate terminals:

```bash
# Terminal 1 — Backend API
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — AI Service
cd ai_service && .\venv\Scripts\activate && cd backend && uvicorn api:app --reload --port 8000
```

Then open **http://localhost:5173** in your browser.

## Project Structure

```
AI-Mentor-Updated/
├── backend/       # Node.js + Express REST API
├── frontend/      # React + Vite web application
└── ai_service/    # Python + FastAPI AI lesson generator
```

## About

This project was developed as part of an internship. All rights reserved by the respective authors and organisation.
