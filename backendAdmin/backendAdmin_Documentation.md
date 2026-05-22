# AI Mentor — Backend Admin Documentation

## Introduction
The `backendAdmin` module is an isolated Express.js management service running on Node.js. It acts as the dedicated administrative terminal for the *AI Mentor* platform, providing content moderation, system configuration overrides, analytical metrics aggregation, dynamic schema toggles, database auditing, and validation logic.

---

## Architecture Overview

```text
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
```
---

## Folder Structure

```text
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
```
---


## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Runtime Environment** | Node.js | Server-side execution environment |
| **Framework** | Express.js v4 | Web routing framework for management configurations |
| **Data Validation** | Zod | Robust schema validation for runtime request filtering |
| **ORM** | Sequelize v6 | Controls administrative migrations, status checks, and data queries |
| **Style & Standard** | ESLint v9 | Enforces backend syntax patterns and operational consistency |

---

## Functional Operations & Control Flow

### 1. Dynamic Status and Deletion Pipeline
Instead of applying destructively hard removals across databases, the Admin panel defaults to safe entity visibility state switches:

```text
[Dashboard Request Action] ──> [Zod Schema Check] ──> [Admin Middleware Route Gate]
                                                             │
                                                             ▼
[Database Record Mutator] <── [Disable / Soft-Delete] <── [Controller Handler]
```
### 2. Live Schema Expansions (`add_column.js` / `list_tables.js`)
* **`list_tables.js`:** Runs system-level metadata diagnostics against the active relational environment, surfacing indices and structural compositions safely.
* **`add_column.js`:** A specialized CLI tool providing a secure method for executing database schema alterations dynamically across models without standard migration bottlenecks.

---

## API & Route Formats

### Data Integrity Safeguarding (`/schemas`)
Requests are guarded by **Zod-based structural runtime validation parameters**. Any structural payload misalignment triggers an immediate payload rejection error before touching database layers.

### Administrative Route Control Modules (`/routes`)
* **Content Management:** Endpoints built to create, update, or deprecate system-wide resources (e.g., managing operational courses, editing lesson components).
* **System Toggles:** Modules processing custom status checks, feature toggle controls, user visibility restrictions, and platform reporting logs.

---

## Administrative API Directory

### 1. Course Management APIs (`/api/admin/courses`)

| Method | Endpoint | Administrative Use |
| :--- | :--- | :--- |
| **POST** | `/` | **Create New Course:** Initializes a new educational track in the database with title, descriptions, price structures, and category tags. |
| **PUT** | `/:id` | **Update Course Details:** Overrides existing parameters of a specific course, allowing administrators to modify descriptions, price points, or update the syllabus structure. |
| **DELETE** | `/:id` | **Toggle Visibility / Archive:** Executes a safe visibility flag switch (soft-delete) to remove the course from the public frontend catalog without wiping historical enrollment metrics. |

### 2. Lesson & Content Orchestration (`/api/admin/lessons`)

| Method | Endpoint | Administrative Use |
| :--- | :--- | :--- |
| **POST** | `/` | **Append Lesson Module:** Injects a new instructional step or lesson object into an existing course track. |
| **PUT** | `/:id` | **Edit Lesson Meta:** Modifies specific lesson criteria, timing, title structures, or underlying text transcripts. |
| **DELETE** | `/:id` | **Remove Lesson Component:** Detaches a lesson module from a course syllabus path. |

### 3. User & Moderation Controls (`/api/admin/users` & `/api/admin/moderation`)

| Method | Endpoint | Administrative Use |
| :--- | :--- | :--- |
| **GET** | `/` | **Audit User Directory:** Pulls the global registration registry to monitor platform signups, access permissions, and account creation timelines. |
| **PATCH** | `/:id/status` | **Account Access Suspension:** Instantly toggles account access status flags to ban or restrict users violating community guidelines. |
| **DELETE** | `/comments/:id` | **Forum Content Moderation:** Destructively removes flagged community messages, toxic comments, or spam posts from discussion boards. |

### 4. Metrics & Diagnostics (`/api/admin/analytics` & `/api/admin/system`)

| Method | Endpoint | Administrative Use |
| :--- | :--- | :--- |
| **GET** | `/summary` | **Aggregated Analytics Engine:** Computes system-wide performance telemetry, processing total revenue, course completion ratios, active session counts, and signup growth curves. |
| **GET** | `/db-status` | **Database Schema Health Check:** Executes internal table metadata diagnostics to verify connection integrity and indexes with the relational database layer. |

---
## Configuration & Local Setup

### Environment Settings (`.env.example`)
Create a copy of `.env.example` named `.env` inside the `backendAdmin` folder root:

```bash
# PostgreSQL Connection Data Link 
DATABASE_URL=postgres://admin:password@endpoint.neon.tech/dbname?sslmode=require

# Admin Microservice Variables
PORT=5001
JWT_ADMIN_SECRET=your_isolated_admin_jwt_secret
```
### System Installation Instructions

1. **Install Administrative Dependencies:**
   ```bash
   cd backendAdmin
   npm install
   ```
2. **Run Linter Quality Check:**
   ```bash
   npm run lint
   ```
3. **Boot Development Environment:**
   ```bash
   npm run dev
The backend administration sub-tier service api gateway maps live directly on `http://localhost:5001`.

