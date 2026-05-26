# Backend Admin

Admin API server for the AI Mentor platform.

## Tech Stack

- Node.js
- Express
- Sequelize
- PostgreSQL / Neon DB
- JWT authentication
- Zod validation

## Setup

```bash
cd backendAdmin
npm install
```

Create a `.env` file from the example file in this folder and fill in the required values for the server, database, authentication, and super admin seed account.

## Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

By default, the admin backend runs separately from the main backend.

## Seed Super Admin

To create the first super admin account:

```bash
npm run seed:superadmin
```

Make sure the seed account values are configured in your local `.env` file before running this command.

## API Routes

The admin routes are mounted at:

```txt
/api/admin
/admin
```

Health check:

```txt
GET /health
```

## Main Features

- Admin login and logout
- Admin profile management
- Password change
- Super admin admin-management
- Course management
- User management
- Enrollment, payment, and report views
- Admin notifications

## Scripts

```bash
npm run dev
npm start
npm run seed:superadmin
npm run lint
```
