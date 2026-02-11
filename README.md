# AI Tutor - Learning Platform

An AI-powered learning management system with course management, analytics, and discussion features.

## Features

- 📚 Course Management
- 📊 Learning Analytics
- 💬 Discussion Room with AI Suggestions
- 🔐 User Authentication (JWT)
- 🎥 Video-based Learning

## Tech Stac
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **AI Services**: Gemini API for AI-powered features

## Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd db-updated
```

### 2. Setup Backend
```bash
cd backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database and API credentials

# Run database migrations (if any)
# Start the server
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your Firebase credentials

# Start the development server
npm run dev
```

### 4. Setup AI Service (Optional)
```bash
cd ai_service/backend
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your Gemini API key

# Start the AI service (see ai_service/README.md for details)
python api.py
```

## Environment Variables

### Backend (.env)
```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
PORT=5000
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Running the Application

1. Start PostgreSQL and create your database
2. Start the backend server: `cd backend && npm run dev`
3. Start the frontend: `cd frontend && npm run dev`
4. Open http://localhost:5173 in your browser

## Project Structure

```
db-updated/
├── backend/          # Express.js backend API
├── frontend/         # React + Vite frontend
└── ai_service/      # Python AI services (Wav2Lip, TTS, etc.)
```

## License

MIT
