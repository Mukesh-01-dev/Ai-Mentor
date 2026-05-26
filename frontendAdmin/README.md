# Frontend Admin

React admin dashboard for managing the AI Mentor platform.

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- Lucide React
- jsPDF / autoTable
- Zod

## Setup

```bash
cd frontendAdmin
npm install
```

Create a `.env` file from the example file in this folder and configure it to point to the admin backend API.

## Run

Development:

```bash
npm run dev
```

The admin dashboard runs on:

```txt
http://localhost:5174
```

## Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Main Pages

- Login
- Dashboard
- Courses
- Users
- Enrollments
- Payments
- Reports
- Profile
- Settings

## Authentication

The admin dashboard uses a JWT token after login and sends authenticated requests to the backend through the Vite API proxy.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```
