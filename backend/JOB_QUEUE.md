# Redis + BullMQ Job Queue Complete Documentation

# 1. Introduction

In modern applications, some tasks take a long time to complete.

Example:
- AI video generation
- Email sending
- Image processing
- PDF generation
- Video rendering
- AI model inference

If these heavy tasks run directly inside the API request:
- server becomes slow
- request times out
- frontend freezes
- multiple users crash backend

To solve this problem we use:

- Redis
- BullMQ
- Worker
- Job Queue

---

# 2. What is a Job Queue

A Job Queue is a waiting system for background tasks.

Example:

```text
User Request
   ↓
Add Task to Queue
   ↓
Worker Processes Task
   ↓
Task Completed
```

Instead of processing heavy work instantly, tasks are stored in a queue and processed later in the background.

---

# 3. What is Redis

Redis is an in-memory database.

Redis is:
- extremely fast
- lightweight
- temporary storage system

BullMQ uses Redis to:
- store jobs
- manage queue
- track failed jobs
- retry jobs
- manage workers

Redis itself does NOT process jobs.

Redis only stores and manages queue data.

---

# 4. What is BullMQ

BullMQ is a Node.js queue library.

BullMQ helps:
- create queues
- add jobs
- process jobs
- retry failed jobs
- run background workers

BullMQ internally uses Redis.

---

# 5. What is a Worker

Worker is a separate process.

Worker continuously checks:
- Is there any pending job?

If yes:
- worker picks the job
- processes the task
- marks it completed

Without worker:
- jobs remain stuck forever

---

# 6. Architecture

```text
Frontend
   ↓
Backend API
   ↓
BullMQ Queue
   ↓
Redis
   ↓
Worker
   ↓
Heavy Processing
   ↓
Database Save
```

---

# 7. Example Flow

Example:
User clicks "Generate AI Video"

Frontend sends request:

```text
POST /generate-video
```

Backend:
- creates job
- stores job in Redis queue

Worker:
- detects new job
- generates AI video
- uploads result
- saves DB data

Frontend:
- polls status endpoint
- receives completed video

---

# 8. Why Job Queue is Important

Without queue:
- every request blocks server
- request timeout happens
- multiple users crash backend

With queue:
- backend stays fast
- scalable architecture
- background processing
- stable production system

---

# 9. Redis Setup Using Docker (Recommended)

# Install Docker Desktop

Download Docker Desktop:

https://www.docker.com/products/docker-desktop/

Install and start Docker.

---

# Pull Redis Image

```bash
docker pull redis
```

---

# Run Redis Container

```bash
docker run -d --name redis-stack -p 6379:6379 redis
```

Explanation:

- `-d`
  Detached mode

- `--name redis-stack`
  Container name

- `-p 6379:6379`
  Maps Redis port

- `redis`
  Redis image name

---

# Check Running Containers

```bash
docker ps
```

You should see:

```text
redis-stack
```

---

# Start Existing Redis Container

```bash
docker start redis-stack
```

---

# Stop Redis Container

```bash
docker stop redis-stack
```

---

# Remove Redis Container

```bash
docker rm redis-stack
```

---

# Check Redis Version

```bash
docker exec -it redis-stack redis-cli INFO server
```

Look for:

```text
redis_version:8.x.x
```

BullMQ requires:
- Redis version >= 5

---

# 10. Redis Setup Without Docker (Windows)

# Install Redis

Download Redis for Windows.

OR

Use Memurai.

---

# Start Redis Server

```bash
redis-server
```

---

# Check Redis Running

```bash
redis-cli ping
```

Expected output:

```text
PONG
```

---

# Redis Default Port

```text
6379
```

---

# Important Problem

Old Windows Redis versions often use:

```text
Redis 3.x
```

BullMQ requires:

```text
Redis >= 5
```

So Docker Redis is highly recommended.

---

# 11. Install BullMQ and Redis Client

Inside backend project:

```bash
npm install bullmq ioredis
```

---

# 12. Create Queue File

Example:

```js
// backend/queues/videoQueue.js

import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

export const videoQueue = new Queue(
  "videoQueue",
  { connection }
);
```

---

# 13. Add Job to Queue

Example controller:

```js
await videoQueue.add("generate-video", {
  courseId,
  lessonId,
  celebrity,
});
```

Explanation:
- `"generate-video"` = job name
- object = job data

---

# 14. Create Worker

Example:

```js
import { Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "videoQueue",
  async (job) => {

    console.log(job.data);

    // heavy processing

  },
  { connection }
);
```

---

# 15. Run Worker

Worker runs separately from backend.

Command:

```bash
node backend/workers/videoWorker.js
```

---

# 16. Recommended Terminal Structure

Use separate terminals.

# Terminal 1 → Backend

```bash
npm run dev
```

---

# Terminal 2 → Worker

```bash
node backend/workers/videoWorker.js
```

---

# Terminal 3 → Frontend

```bash
npm run dev
```

---

# Terminal 4 → AI Service

```bash
uvicorn api:app --reload
```

---

# 17. How Queue Works Internally

When job added:

```text
videoQueue.add()
```

BullMQ:
- stores job in Redis

Worker:
- listens continuously

When job detected:
- worker locks job
- processes task
- marks completed

Redis updates:
- waiting
- active
- completed
- failed

---

# 18. Queue States

BullMQ jobs can have states:

```text
waiting
active
completed
failed
delayed
paused
```

---

# 19. Retry Failed Jobs

Example:

```js
await videoQueue.add(
  "generate-video",
  data,
  {
    attempts: 3,
  }
);
```

If job fails:
- BullMQ retries automatically

---

# 20. Delayed Jobs

Example:

```js
delay: 5000
```

Means:
- run after 5 seconds

---

# 21. Job Concurrency

Example:

```js
new Worker(
  "videoQueue",
  processor,
  {
    concurrency: 5
  }
);
```

Worker processes:
- 5 jobs simultaneously

---

# 22. Common Redis Errors

# Error

```text
Redis version needs to be greater or equal than 5
```

Cause:
- old Redis version

Fix:
- use Docker Redis

---

# Error

```text
ECONNREFUSED 127.0.0.1:6379
```

Cause:
- Redis not running

Fix:

```bash
docker start redis-stack
```

---

# Error

```text
Connection terminated unexpectedly
```

Cause:
- internet/database issue
- not Redis issue

---

# 23. Advantages of Job Queue

- non-blocking backend
- scalable
- reliable
- retry system
- background processing
- production ready
- handles multiple users

---

# 24. Real World Usage

Companies using queue systems:
- YouTube
- Netflix
- Uber
- WhatsApp
- Instagram

They use queues for:
- notifications
- uploads
- AI processing
- video rendering
- recommendation systems

---

# 25. Final Recommended Stack

Backend:
- Node.js
- Express
- BullMQ
- Redis
- PostgreSQL

AI Service:
- FastAPI
- FFmpeg
- Edge-TTS

Infrastructure:
- Docker Redis

---

# 26. Most Important Commands

# Start Redis

```bash
docker start redis-stack
```

---

# Run Backend

```bash
npm run dev
```

---

# Run Worker

```bash
node backend/workers/videoWorker.js
```

---

# Run Frontend

```bash
npm run dev
```

---

# Run FastAPI AI Service

```bash
uvicorn api:app --reload
```

---

# 27. Final Summary

Redis:
- stores queue data

BullMQ:
- manages jobs and workers

Queue:
- waiting line for tasks

Worker:
- processes tasks in background

Job Queue Architecture:
- prevents blocking
- improves scalability
- makes backend production ready