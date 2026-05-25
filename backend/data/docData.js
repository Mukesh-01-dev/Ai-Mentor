const docData = [
  {
    id: "getting-started",
    title: "Getting Started",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content: [
          {
            type: "paragraph",
            text: "Welcome to the official developer documentation for the UptoSkills AI Mentor Platform. This guide serves as the definitive reference for engineers contributing to the codebase."
          },
          {
            type: "paragraph",
            text: "Our platform is an enterprise-grade Learning Management System (LMS) enhanced by Generative AI. It is designed to be highly scalable, modular, and maintainable. Whether you are building new frontend features or optimizing backend database queries, these docs will guide you through our established patterns."
          }
        ]
      },
      {
        id: "core-principles",
        title: "Core Engineering Principles",
        content: [
          {
            type: "list",
            items: [
              "Scalability First: We utilize stateless JWT authentication and a decoupled architecture so the API can scale horizontally.",
              "Security by Design: All routes are strictly protected by role-based middleware. Credentials and secrets are never checked into version control.",
              "Performance: The frontend leverages Vite for rapid HMR and optimized production bundles. The backend utilizes indexed PostgreSQL tables and connection pooling.",
              "Developer Experience (DX): We enforce strict ESLint/Prettier rules, conventional commits, and modular folder structures to minimize cognitive load."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "architecture",
    title: "Architecture & Structure",
    sections: [
      {
        id: "system-design",
        title: "System Design",
        content: [
          {
            type: "paragraph",
            text: "The platform operates as a modern Client-Server API architecture:"
          },
          {
            type: "list",
            items: [
              "Client (Frontend): A React 19 Single Page Application (SPA) served via Vite. Styling is handled exclusively by Tailwind CSS v4 using a centralized design system. State is managed via React Context.",
              "API Gateway (Backend): An Express.js REST API. Routes map to specific Controller functions which execute business logic.",
              "Data Access Layer (DAL): Sequelize ORM interacting with a PostgreSQL database.",
              "External Services: Gemini API for the AI Chat mentor, Razorpay/Stripe for global payment processing, and Firebase for auxiliary services."
            ]
          }
        ]
      },
      {
        id: "project-structure",
        title: "Project Directory Structure",
        content: [
          {
            type: "paragraph",
            text: "The repository follows a strict monorepo-style separation of concerns. Below is the comprehensive tree structure:"
          },
          {
            type: "code",
            language: "text",
            text: "ai-mentor/\n├── backend/                  # Express.js REST API\n│   ├── config/               # DB connections & environment config\n│   ├── controllers/          # Business logic & request handlers\n│   ├── data/                 # Static JSON data (like these docs)\n│   ├── middlewares/          # JWT auth & role-based guards\n│   ├── models/               # Sequelize schemas & associations\n│   ├── routes/               # Express route definitions\n│   ├── utils/                # Helper functions (e.g., token generation)\n│   ├── .env                  # Environment variables (Ignored)\n│   └── server.js             # Application entry point\n│\n└── frontend/                 # React 19 Client Application\n    ├── public/               # Static assets (images, icons)\n    ├── src/\n    │   ├── assets/           # Bundled assets (CSS, images)\n    │   ├── components/       # Reusable UI components\n    │   │   ├── common/       # Buttons, Modals, Loaders\n    │   │   └── video/        # Custom video player components\n    │   ├── context/          # React Context (Auth, Theme, Sidebar)\n    │   ├── hooks/            # Custom React hooks (e.g., useScrollspy)\n    │   ├── pages/            # Top-level route views (Dashboard, Courses)\n    │   ├── service/          # API wrapper functions (Axios/fetch calls)\n    │   ├── App.jsx           # Root component & Route definitions\n    │   └── main.jsx          # React DOM mounting & Provider wrapping\n    ├── .env                  # Environment variables (Ignored)\n    ├── tailwind.config.js    # Tailwind configuration\n    └── vite.config.js        # Vite bundler configuration"
          }
        ]
      },
      {
        id: "db-schema",
        title: "Database Schema & Relationships",
        content: [
          {
            type: "paragraph",
            text: "Models are defined in `backend/models/`. The application uses a relational schema with strictly defined Foreign Keys to ensure data integrity."
          },
          {
            type: "code",
            language: "javascript",
            text: "// Core Relationships defined in backend/models/modelAssociations.js\n\n// A User can enroll in multiple courses, generating progress tracking records\nUser.hasMany(CourseProgress, { foreignKey: 'userId' });\nCourseProgress.belongsTo(User, { foreignKey: 'userId' });\n\n// The Course hierarchy: Course -> Modules -> Lessons\nCourse.hasMany(Module, { foreignKey: 'courseId' });\nModule.hasMany(Lesson, { foreignKey: 'moduleId' });\n\n// Community interactions\nUser.hasMany(CommunityPost, { foreignKey: 'userId' });\nCommunityPost.hasMany(Comment, { foreignKey: 'postId' });"
          }
        ]
      }
    ]
  },
  {
    id: "setup",
    title: "Environment Setup",
    sections: [
      {
        id: "installation",
        title: "Installation & Execution",
        content: [
          {
            type: "paragraph",
            text: "The environment requires Node.js v18 or higher."
          },
          {
            type: "code",
            language: "bash",
            text: "# 1. Install dependencies for both environments\ncd frontend && npm install\ncd ../backend && npm install\n\n# 2. Run the development servers concurrently\n# In terminal tab 1 (Backend - runs on port 5000):\ncd backend && npm run dev\n\n# In terminal tab 2 (Frontend - runs on port 5173):\ncd frontend && npm run dev"
          }
        ]
      },
      {
        id: "env-vars",
        title: "Environment Variables (.env)",
        content: [
          {
            type: "paragraph",
            text: "Configuration is strictly managed via `.env` files. You must duplicate the `.env.example` templates and fill in your keys."
          },
          {
            type: "code",
            language: "bash",
            text: "# backend/.env\nPORT=5000\nNODE_ENV=development\nDATABASE_URL=postgresql://user:password@localhost:5432/aimentor\nJWT_SECRET=super_secret_jwt_key_here\nGEMINI_API_KEY=AIzaSy_your_gemini_key\nRAZORPAY_KEY_ID=rzp_test_xxxxxx\nRAZORPAY_KEY_SECRET=yyyyyy\nSTRIPE_SECRET_KEY=sk_test_xxxxxx\n\n# frontend/.env\nVITE_API_URL=http://localhost:5000\nVITE_RAZORPAY_KEY_ID=rzp_test_xxxxxx\nVITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxx"
          }
        ]
      }
    ]
  },
  {
    id: "api",
    title: "API Reference",
    sections: [
      {
        id: "auth-flow",
        title: "Authentication Flow",
        content: [
          {
            type: "paragraph",
            text: "Authentication is stateless, utilizing JSON Web Tokens (JWT). The frontend stores the token and attaches it to the `Authorization` header for all requests to protected routes."
          },
          {
            type: "code",
            language: "javascript",
            text: "// backend/middlewares/authMiddleware.js\nexport const verifyToken = (req, res, next) => {\n  const token = req.headers.authorization?.split(\" \")[1];\n  if (!token) return res.status(401).json({ error: \"Access denied. No token provided.\" });\n\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded;\n    next();\n  } catch (ex) {\n    res.status(401).json({ error: \"Invalid token.\" });\n  }\n};"
          }
        ]
      },
      {
        id: "standard-endpoints",
        title: "Endpoint Examples",
        content: [
          {
            type: "paragraph",
            text: "All routes must return a standardized JSON format containing a `success` boolean. Do not send raw HTML error traces."
          },
          {
            type: "code",
            language: "javascript",
            text: "// Example: AI Chat Endpoint Payload (POST /api/ai/chat)\n\n// REQUEST BODY\n{\n  \"userPrompt\": \"Can you explain React hooks?\",\n  \"context\": {\n    \"courseId\": \"react-101\",\n    \"lessonId\": \"hooks-intro\"\n  }\n}\n\n// RESPONSE (200 OK)\n{\n  \"success\": true,\n  \"reply\": \"React hooks allow you to use state...\",\n  \"usageData\": { \"tokens\": 145 }\n}"
          }
        ]
      }
    ]
  },
  {
    id: "deployment",
    title: "Deployment & CI/CD",
    sections: [
      {
        id: "prod-deployment",
        title: "Production Infrastructure",
        content: [
          {
            type: "list",
            items: [
              "Frontend (Vercel/Netlify): Connected to the GitHub repository. Triggers `npm run build` on pushes to the `main` branch. Utilizes global edge caching.",
              "Backend (Render/AWS): Runs `npm ci` followed by `node server.js`. Placed behind an NGINX reverse proxy or AWS API Gateway for rate-limiting.",
              "Database (Neon/RDS): A managed PostgreSQL instance. Migrations must be run via `npx sequelize-cli db:migrate --env production` prior to backend restarts."
            ]
          }
        ]
      },
      {
        id: "rollback",
        title: "Rollback Protocol",
        content: [
          {
            type: "paragraph",
            text: "If a critical bug reaches production, follow these steps strictly:"
          },
          {
            type: "list",
            items: [
              "1. Revert the commit in Git: `git revert <commit-hash>`.",
              "2. If a database migration caused the issue, you MUST run a down-migration (`npx sequelize-cli db:migrate:undo`) BEFORE reverting the code.",
              "3. Push the revert to the `main` branch to trigger an automatic CI/CD rebuild."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "standards",
    title: "Engineering Standards",
    sections: [
      {
        id: "code-conventions",
        title: "Code Conventions",
        content: [
          {
            type: "list",
            items: [
              "ES Modules: Always use `import/export`, never `require()`.",
              "React Hooks: Custom business logic must be extracted into custom hooks (e.g., `useAuth`, `useScrollspy`).",
              "Tailwind: Group utility classes logically (Layout -> Spacing -> Typography -> Colors). Avoid excessively long inline classes.",
              "Error Handling: Backend controllers must wrap async functions in try/catch and pass errors to the centralized Express error handler."
            ]
          }
        ]
      },
      {
        id: "git-workflow",
        title: "Git Workflow & Branching",
        content: [
          {
            type: "paragraph",
            text: "Strict adherence to conventional branching is required to pass automated CI pipelines."
          },
          {
            type: "list",
            items: [
              "`feat/short-desc`: For new features (e.g., `feat/razorpay-integration`).",
              "`fix/short-desc`: For bug fixes (e.g., `fix/blank-screen-dashboard`).",
              "`refactor/short-desc`: For code cleanup without altering behavior.",
              "`chore/short-desc`: For dependency updates or config changes."
            ]
          }
        ]
      },
      {
        id: "pr-guidelines",
        title: "Pull Request Checklist",
        content: [
          {
            type: "paragraph",
            text: "A Pull Request will not be approved unless it meets the following criteria:"
          },
          {
            type: "list",
            items: [
              "A descriptive title and summary of WHY the change was made.",
              "Screenshots or GIFs included if the PR involves UI/UX changes.",
              "Zero ESLint/Prettier warnings (verified locally via `npm run lint`).",
              "Manual QA passed (e.g., tested responsively across mobile/desktop viewports)."
            ]
          }
        ]
      }
    ]
  }
];

export default docData;
