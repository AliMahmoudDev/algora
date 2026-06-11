# CLAUDE.md — Algora Project Context

> **Last updated:** June 11, 2026
> **Maintainer:** Ali Mahmoud ([@AliMahmoudDev](https://github.com/AliMahmoudDev))
> **Repo:** [github.com/AliMahmoudDev/algora](https://github.com/AliMahmoudDev/algora)
> **Live:** [algora-io.vercel.app](https://algora-io.vercel.app)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture & File Structure](#architecture--file-structure)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [API Contracts (Detailed)](#api-contracts-detailed)
7. [Design System](#design-system)
8. [Internationalization (i18n)](#internationalization-i18n)
9. [Content Copy (Full EN/AR)](#content-copy-full-enar-reference)
10. [Authentication](#authentication)
11. [Code Execution (Judge0 CE)](#code-execution-judge0-ce)
12. [Development Commands](#development-commands)
13. [CI/CD Pipeline](#cicd-pipeline)
14. [Deployment](#deployment)
15. [Code Standards & Conventions](#code-standards--conventions)
16. [Current Progress & Status](#current-progress--status)
17. [Pending Tasks](#pending-tasks)
18. [Future Ideas & Roadmap](#future-ideas--roadmap)
19. [Open Questions](#open-questions)
20. [Architecture Decisions Log](#architecture-decisions-log)
21. [Session History](#session-history)

---

## Project Overview

**Algora** is a bilingual (Arabic RTL + English LTR) competitive programming and algorithms learning platform. It provides algorithmic problems with real-time code execution, automated test case evaluation, a Monaco-powered code editor, user dashboards with activity tracking, a competitive leaderboard system, and AI-powered guidance. The platform targets Arabic-speaking CS students and self-learners aged 16-25 who want to practice algorithms in a modern, beautiful, and accessible environment with full Arabic language support — a rarity in the competitive programming space.

### Core User Flow

1. **Landing** → User sees hero section, features, problem previews, "Start Solving" CTA
2. **Auth** → Create account (email/password) or sign in with GitHub/Google OAuth
3. **Browse Problems** → Search, filter by difficulty/category/status, sort, paginate
4. **Solve** → Read bilingual description, write code in Monaco Editor (Python/JS/C++/Java), Run/Submit via Judge0 CE
5. **Track Progress** → Dashboard (stats, streaks, activity), Profile (bio, calendar, skills), Submissions history, Leaderboard

### Key Goals

- Provide a world-class bilingual algorithms practice platform
- Build competitive/motivating experience (leaderboard, streaks, points)
- Establish Algora as the go-to platform for Arabic-speaking developers preparing for interviews/CP

---

## Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | TypeScript, SSR/SSG, API routes, standalone output |
| **Runtime** | Bun 1.3 | Package manager (`bun.lock`), script runner |
| **UI** | Tailwind CSS v4 + shadcn/ui | 48 Radix-based components, "new-york" variant |
| **Auth** | NextAuth v5 (beta) | Credentials + GitHub + Google, JWT strategy |
| **Database** | SQLite via Prisma ORM v6 | File at `prisma/db/custom.db`, no migration history |
| **i18n** | next-intl v4.13 | `localePrefix: always`, en + ar with RTL |
| **Code Exec** | Judge0 CE (`ce.judge0.com`) | Free, no API key, 4 languages, 15s timeout |
| **Editor** | @monaco-editor/react v4.7 | VS Code-grade code editor in browser |
| **State** | React useState/useEffect + TanStack Query | Client-side state management |
| **Forms** | react-hook-form v7 + Zod v4 | Form validation |
| **Icons** | Lucide React | Stroke-based SVG icons |
| **Charts** | Recharts v2.15 | Data visualization (installed, for future use) |
| **Animation** | Framer Motion 12 | Installed for future use |
| **Hosting** | Vercel | Production deployment, auto-deploy on push to main |

---

## Architecture & File Structure

```
algora/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions: lint + build
├── agent-ctx/                        # Agent work records (phase docs)
│   ├── 1-algora-landing-page.md
│   └── 2-algora-phase2.md
├── download/                         # Generated/downloaded assets
├── messages/
│   ├── en.json                        # English translations (14 namespaces)
│   └── ar.json                        # Arabic translations (14 namespaces)
├── prisma/
│   ├── schema.prisma                  # DB schema (User, Problem, Submission, UserProblem)
│   ├── seed.ts                        # Seeds 14 problems into DB
│   └── db/
│       └── custom.db                  # SQLite database (gitignored)
├── public/
│   ├── algora_logo.png
│   ├── logo.svg
│   ├── og-image.png
│   ├── icon-192.png
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root passthrough layout
│   │   ├── page.tsx                   # Redirects to /en
│   │   ├── globals.css                # Full theme + Tailwind + animations
│   │   ├── sitemap.ts                 # Dynamic sitemap generator
│   │   ├── [locale]/
│   │   │   ├── layout.tsx             # Main layout (fonts, metadata, providers)
│   │   │   ├── page.tsx               # Landing page (all sections)
│   │   │   ├── loading.tsx            # Full-page spinner
│   │   │   ├── not-found.tsx          # 404 page
│   │   │   ├── auth/
│   │   │   │   ├── signin/page.tsx    # Sign in (OAuth + credentials)
│   │   │   │   ├── signup/page.tsx    # Sign up form
│   │   │   │   └── callback/page.tsx  # OAuth callback
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx           # Stats, activity, skill breakdown
│   │   │   ├── leaderboard/
│   │   │   │   └── page.tsx           # Ranked users + podium
│   │   │   ├── problems/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx           # Problem list (search/filter/paginate)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # Problem view (description + editor)
│   │   │   ├── profile/
│   │   │   │   └── page.tsx           # User profile + activity calendar
│   │   │   ├── settings/
│   │   │   │   └── page.tsx           # Editor prefs, language, theme
│   │   │   ├── submissions/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx           # Submission history
│   │   │   ├── terms/page.tsx
│   │   │   └── privacy/page.tsx
│   │   └── api/
│   │       ├── route.ts               # Health check → "Hello, world!"
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts  # NextAuth handlers
│   │       │   └── signup/route.ts         # POST signup
│   │       ├── dashboard/stats/route.ts    # GET user stats
│   │       ├── execute/route.ts           # POST code execution (Judge0)
│   │       ├── leaderboard/route.ts       # GET ranked users
│   │       ├── problems/route.ts          # GET problems (list/single)
│   │       ├── profile/route.ts           # GET + PATCH user profile
│   │       ├── submissions/route.ts       # GET user submissions
│   │       ├── submit/route.ts             # POST submit solution
│   │       └── user-problems/route.ts      # GET user problem statuses
│   ├── components/
│   │   ├── CTASection.tsx              # Final CTA with gold glow
│   │   ├── CodeEditor.tsx              # Monaco editor wrapper
│   │   ├── FeaturesSection.tsx         # 3 feature cards
│   │   ├── Footer.tsx                   # Dark footer with links
│   │   ├── HeroSection.tsx              # Hero with animated code
│   │   ├── HowItWorksSection.tsx       # 3-step process
│   │   ├── LoadingSpinner.tsx           # Loading spinner
│   │   ├── Navbar.tsx                  # Fixed top navbar + mobile menu
│   │   ├── ProblemsSection.tsx         # 4 sample problem cards
│   │   ├── StatsSection.tsx             # 4 stat counters
│   │   ├── providers/
│   │   │   └── session-provider.tsx     # NextAuth SessionProvider
│   │   └── ui/                         # 48 shadcn/ui components (DO NOT edit manually)
│   ├── data/
│   │   └── mock-problems.ts            # 14 problems (reference only, not used by APIs)
│   ├── hooks/
│   │   ├── use-auth.ts                # Supabase auth hook (legacy, not active)
│   │   ├── use-mobile.ts              # Mobile detection hook
│   │   └── use-toast.ts                # Toast notifications
│   ├── i18n/
│   │   ├── request.ts                 # next-intl request config
│   │   └── routing.ts                 # Locale routing (en, ar)
│   ├── lib/
│   │   ├── auth.ts                    # NextAuth config (GitHub, Google, Credentials)
│   │   ├── auth-client.ts             # Client-side auth re-exports
│   │   ├── db.ts                      # Prisma client singleton (globalThis cached)
│   │   ├── judge0.ts                  # Judge0 CE code execution engine
│   │   ├── supabase/
│   │   │   ├── client.ts              # Supabase browser client (legacy)
│   │   │   └── server.ts              # Supabase server client (legacy)
│   │   └── utils.ts                   # cn() utility (clsx + tailwind-merge)
│   └── middleware.ts                   # Auth middleware for protected routes
├── .env, .env.local.example
├── .gitignore
├── Caddyfile                          # Reverse proxy config (port 81)
├── CLAUDE.md                          # THIS FILE — project context
├── bun.lock
├── components.json                    # shadcn/ui config
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Database Schema

**Engine:** SQLite (Prisma ORM v6)
**File:** `prisma/db/custom.db` (gitignored)
**Migration method:** `prisma db push` (no migration files)

### Entity Relationships

```
User 1──* Submission    *──1 Problem
User 1──* UserProblem    *──1 Problem
```

### Models

#### User
| Column | Type | Notes |
|---|---|---|
| id | String (cuid, PK) | Unique identifier |
| email | String (unique) | Login identifier |
| name | String? | Display name |
| password | String? | bcrypt hashed (null for OAuth) |
| image | String? | Avatar URL from OAuth |
| bio | String (default: "") | Max 500 chars |
| emailVerified | DateTime? | Verification timestamp |
| createdAt / updatedAt | DateTime | Timestamps |

#### Problem
| Column | Type | Notes |
|---|---|---|
| id | String (cuid, PK) | Unique identifier |
| title / titleAr | String | Bilingual titles |
| slug | String (unique) | URL-safe (e.g., "two-sum") |
| description / descriptionAr | String | Bilingual descriptions (Markdown) |
| difficulty | String | "Easy", "Medium", "Hard" |
| category | String | Primary category |
| tags | String | JSON array (stored as string) |
| examples | String | JSON array of {input, output, explanation} |
| constraints / constraintsAr | String? | Bilingual constraints |
| acceptanceRate | Float (default: 0) | Percentage |
| starterCode | String? | JSON map: {python, javascript, cpp, java} |
| testCases | String? | JSON array: [{input, expectedOutput}] |
| hints | String? | JSON array of hints (unused currently) |
| orderIndex | Int (default: 0) | Display order |
| isPublished | Boolean (default: true) | Visibility toggle |
| createdAt / updatedAt | DateTime | Timestamps |

#### Submission (immutable once created)
| Column | Type | Notes |
|---|---|---|
| id | String (cuid, PK) | Unique identifier |
| code | String | Submitted source code |
| language | String | python, javascript, cpp, java |
| status | String | Accepted, Wrong Answer, Compilation Error, Runtime Error, TLE |
| runtime | Float? | Average execution time (seconds) |
| memory | Float? | Peak memory (KB) |
| testCasesPassed / testCasesTotal | Int | Test case results |
| userId | String (FK → User, cascade) | Submitting user |
| problemId | String (FK → Problem, cascade) | Problem solved |
| createdAt / updatedAt | DateTime | Timestamps |

#### UserProblem
| Column | Type | Notes |
|---|---|---|
| id | String (cuid, PK) | Unique identifier |
| status | String (default: "Not Started") | "Not Started", "Attempted", "Solved" |
| attempts | Int (default: 0) | Total submissions for this problem |
| bestRuntime / bestMemory | Float? | Best performance for solved submissions |
| userId | String (FK → User, cascade) | User |
| problemId | String (FK → Problem, cascade) | Problem |
| **@@unique**([userId, problemId]) | | One record per user-problem pair |

### JSON Field Formats

**tags:** `["Array", "Hash Map"]`
**examples:** `[{ "input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "..." }]`
**starterCode:** `{ "python": "def solution():\n    pass\n", "javascript": "function solution() {\n  \n}\n", "cpp": "...", "java": "..." }`
**testCases:** `[{ "input": "2 7 11 15\n9", "expectedOutput": "0 1" }]`

### Seed Data
- **Script:** `bun run prisma/seed.ts`
- **Source:** `src/data/mock-problems.ts` (14 problems)
- **Operation:** `upsert` by `slug` (idempotent, safe to re-run)
- **Breakdown:** 5 Easy, 7 Medium, 2 Hard

---

## API Routes

All API routes are under `src/app/api/`. Response format: `{ data: ... }` for success, `{ error: "message" }` for errors.

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api` | GET | None | Health check |
| `/api/auth/[...nextauth]` | * | None | NextAuth core handler |
| `/api/auth/signup` | POST | None | Create user (name, email, password) |
| `/api/problems` | GET | None | List all / get by `?id=` or `?slug=` |
| `/api/execute` | POST | None | Run code with custom stdin (Run button) |
| `/api/submit` | POST | Optional | Submit against all test cases, save to DB |
| `/api/submissions` | GET | Required (userId) | User submission history |
| `/api/user-problems` | GET | Required (userId) | User's problem statuses |
| `/api/profile` | GET/PATCH | Required (userId) | Get profile / Update bio |
| `/api/leaderboard` | GET | None | Ranked users (Easy=10, Medium=25, Hard=50 pts) |
| `/api/dashboard/stats` | GET | Optional | Stats, activity, skill breakdown |

### Key API Details

**Submit flow:**
1. Fetch problem from DB by problemId
2. Parse testCases JSON
3. Run each test case via Judge0 CE
4. Compare stdout with expectedOutput
5. Save Submission to DB (if userId provided)
6. Update UserProblem record (status, attempts, bestRuntime/Memory)
7. Return results with per-test-case pass/fail

**Leaderboard points:** Easy = 10pts, Medium = 25pts, Hard = 50pts (calculated from DB, not mock data)

**Dashboard stats:** Dynamic totals from `db.problem.count()` (not hardcoded)

---

## API Contracts (Detailed)

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://algora-io.vercel.app/api`

### Response Format
- Success: `{ "data": { ... } }`
- Error: `{ "error": "Human-readable error message" }`

### HTTP Status Codes
| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created (signup, submission) |
| 400 | Bad Request (missing/invalid fields) |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict (duplicate email/signup) |
| 500 | Internal Server Error |

---

#### `GET /api`
- **Auth:** None
- **Response:** `{ "message": "Hello, world!" }`

---

#### `POST /api/auth/[...nextauth]`
- **Auth:** None (handled by NextAuth internally)
- **Body:** Varies by action
- **Response:** NextAuth standard session/token response

---

#### `POST /api/auth/signup`
- **Auth:** None
- **Body:**
```json
{
  "name": "Ali Mahmoud",
  "email": "ali@example.com",
  "password": "securepassword123"
}
```
- **Validation:** name (required), email (valid format, unique), password (min 8 chars)
- **Response (201):**
```json
{
  "id": "clx...",
  "email": "ali@example.com",
  "name": "Ali Mahmoud",
  "image": null,
  "bio": "",
  "createdAt": "2025-01-15T...",
  "updatedAt": "2025-01-15T..."
}
```
- **Errors:** 400 (validation), 409 (email exists)

---

#### `GET /api/problems`
- **Auth:** None
- **Query Params:**
  - No params → All published problems ordered by `orderIndex`
  - `?id=clx...` → Single problem by ID
  - `?slug=two-sum` → Single problem by slug
- **Response (all):**
```json
{
  "problems": [
    {
      "id": "clx...",
      "title": "Two Sum",
      "titleAr": "مجموع عددين",
      "slug": "two-sum",
      "description": "## Description\n...",
      "descriptionAr": "## الوصف\n...",
      "difficulty": "Easy",
      "category": "Hash Table",
      "tags": ["Array", "Hash Map"],
      "examples": [{ "input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9" }],
      "constraints": "2 <= nums.length <= ...",
      "constraintsAr": "...",
      "acceptanceRate": 78.5,
      "starterCode": { "python": "def solution():\n    pass\n", "javascript": "function solution() {\n  \n}\n", "cpp": "...", "java": "..." },
      "testCases": [{ "input": "2 7 11 15\n9", "expectedOutput": "0 1" }],
      "orderIndex": 1,
      "isPublished": true
    }
  ]
}
```
- **Errors:** 404 (problem not found)

---

#### `POST /api/execute`
- **Auth:** None
- **Body:**
```json
{
  "code": "def solve():\n    print('hello')\n\nsolve()",
  "language": "python",
  "stdin": "some input"
}
```
- **Supported Languages:** `python` (71), `javascript` (63), `cpp` (54), `java` (62)
- **Response:**
```json
{
  "stdout": "hello\n",
  "stderr": "",
  "compile_output": "",
  "statusCode": 0,
  "statusDescription": "Accepted",
  "time": "0.04",
  "memory": 3400
}
```
- **Errors:** 400 (missing fields, unsupported language), 500 (Judge0 timeout)

---

#### `POST /api/submit`
- **Auth:** Optional (userId in body enables DB persistence)
- **Body:**
```json
{
  "code": "def twoSum(nums, target):\n    ...",
  "language": "python",
  "problemId": "clx...",
  "userId": "user_cuid..."
}
```
- **Process:** Fetch problem → Parse testCases → Run each via Judge0 → Compare stdout → Save submission → Update UserProblem
- **Response:**
```json
{
  "status": "Accepted",
  "testCasesPassed": 3,
  "testCasesTotal": 3,
  "results": [
    { "input": "2 7 11 15\n9", "expected": "0 1", "actual": "0 1", "passed": true },
    { "input": "3 2 4\n6", "expected": "1 2", "actual": "1 2", "passed": true },
    { "input": "3 3\n6", "expected": "0 1", "actual": "0 1", "passed": true }
  ],
  "runtime": 0.05,
  "memory": 3400,
  "submissionId": "sub_cuid..."
}
```
- **Errors:** 400 (missing fields, no test cases), 404 (problem not found), 500 (execution failed)

---

#### `GET /api/submissions`
- **Auth:** Required (userId in query)
- **Query:** `userId` (required), `problemId` (optional filter)
- **Response:**
```json
[
  {
    "id": "sub_...",
    "code": "def twoSum(...)",
    "language": "python",
    "status": "Accepted",
    "runtime": 0.05,
    "memory": 3400,
    "testCasesPassed": 3,
    "testCasesTotal": 3,
    "createdAt": "2025-01-15T...",
    "problem": {
      "title": "Two Sum",
      "titleAr": "مجموع عددين",
      "slug": "two-sum",
      "difficulty": "Easy"
    }
  }
]
```

---

#### `GET /api/user-problems`
- **Auth:** Required (userId in query)
- **Query:** `userId` (required)
- **Response:**
```json
[
  { "problemId": "clx...", "status": "Solved", "attempts": 3, "bestRuntime": 0.04, "bestMemory": 3200 },
  { "problemId": "cly...", "status": "Attempted", "attempts": 1, "bestRuntime": null, "bestMemory": null }
]
```

---

#### `GET /api/profile`
- **Auth:** Required (userId in query)
- **Query:** `userId` (required)
- **Response:**
```json
{
  "user": { "id": "...", "name": "Ali", "email": "ali@...", "image": "...", "bio": "..." },
  "stats": { "problemsSolved": 5, "totalSubmissions": 12, "successRate": 42, "currentStreak": 3 },
  "activityData": [0, 0, 1, 2, 0, 1, 0, 0, ...],
  "skillTags": ["Arrays", "Hash Table", "Dynamic Programming"],
  "bio": "CS student passionate about algorithms"
}
```

#### `PATCH /api/profile`
- **Auth:** Required (userId in query)
- **Query:** `userId` (required)
- **Body:** `{ "bio": "Updated bio text (max 500 chars)" }`
- **Response:** `{ "bio": "Updated bio text..." }`

---

#### `GET /api/leaderboard`
- **Auth:** None
- **Points:** Easy=10, Medium=25, Hard=50
- **Response:**
```json
{
  "data": [
    {
      "rank": 1,
      "userId": "user_...",
      "userName": "Ali Mahmoud",
      "userImage": "https://...",
      "problemsSolved": 12,
      "totalSubmissions": 28,
      "successRate": 43,
      "points": 230,
      "bestRuntime": 0.02
    }
  ]
}
```

---

#### `GET /api/dashboard/stats`
- **Auth:** Optional (returns zeros without userId)
- **Query:** `userId` (optional)
- **Response:**
```json
{
  "solved": 5,
  "attempted": 8,
  "total": 14,
  "successRate": 63,
  "currentStreak": 3,
  "submissionsThisWeek": 4,
  "recentActivity": [
    {
      "id": "sub_...",
      "problemId": "clx...",
      "problemTitle": "Two Sum",
      "problemTitleAr": "مجموع عددين",
      "problemDifficulty": "Easy",
      "status": "accepted",
      "language": "python",
      "createdAt": "2025-01-15T...",
      "runtime": 0.04,
      "memory": 3200,
      "testCasesPassed": 3,
      "testCasesTotal": 3
    }
  ],
  "skillBreakdown": {
    "Easy": { "solved": 3, "total": 5 },
    "Medium": { "solved": 2, "total": 7 },
    "Hard": { "solved": 0, "total": 2 }
  }
}
```

---

## Design System

### Theme
- **Vibe:** Dark-first competitive programming platform (LeetCode meets premium Arabic learning)
- **Inspiration:** LeetCode dark mode, Vercel dashboard, Linear app
- **Theme:** Dark only — no light mode support

### Colors

| Role | Variable / Value | Usage |
|---|---|---|
| Page background | `#0D0D12` (`--algora-bg-primary`) | Main body background |
| Secondary bg | `#161622` (`--algora-bg-secondary`) | Elevated surfaces, mobile menu |
| Card background | `#1A1A2E` (`--algora-card-bg`) | Cards, panels, dropdowns |
| Primary accent | `#F59E0B` (`--algora-gold`) | CTAs, active states, highlights |
| Success / Easy | `#10B981` (`--algora-green`) | Accepted status, Easy badges |
| Tags / Medium | `#6366F1` (`--algora-purple`) | Tags, Medium badges |
| Error / Hard | `#EF4444` (`--algora-red`) | Error states, Hard badges |
| Primary text | `#E2E8F0` (`--algora-text-primary`) | Headings, primary content |
| Muted text | `#94A3B8` (`--algora-text-muted`) | Secondary text |
| Dim text | `#64748B` (`--algora-text-dim`) | Timestamps, tertiary labels |
| Borders | `rgba(255,255,255,0.08)` | Card borders, dividers |

### Difficulty Colors

| Difficulty | Badge BG | Badge Text | Dot |
|---|---|---|---|
| Easy | `bg-algora-green/15` | `text-algora-green border-algora-green/30` | `bg-algora-green` |
| Medium | `bg-algora-gold/15` | `text-algora-gold border-algora-gold/30` | `bg-algora-gold` |
| Hard | `bg-algora-red/15` | `text-algora-red border-algora-red/30` | `bg-algora-red` |

### Typography
- **Headings + Body:** Inter (Google Fonts, `--font-inter`)
- **Code / Mono:** IBM Plex Mono (Google Fonts, `--font-ibm-plex-mono`)
- **Monaco Editor:** JetBrains Mono (fallback to IBM Plex Mono)
- **Arabic text:** Inter (supports Arabic glyphs)

### Border Radius
- Buttons, badges: `rounded-lg`
- Cards, panels: `rounded-xl`
- Modals, overlays: `rounded-2xl`

### Animations (CSS in globals.css)
- `fadeInUp` (0.6s) — Opacity 0→1, translateY 20px→0
- `float` (6s) — Floating effect infinite
- `glow-pulse` (3s) — Gold glow pulse infinite
- `blink-cursor` (1s) — Code cursor blink
- `slide-in-left/right` (0.6s) — Horizontal slide
- `gold-glow` — Permanent gold box-shadow on primary buttons
- `card-hover` (0.3s) — Lift effect on hover

### Component Library
- **shadcn/ui** (48 components in `src/components/ui/`) — DO NOT edit manually, use CLI
- Custom components in `src/components/` (Navbar, Footer, CodeEditor, etc.)

### Layout Patterns
- **Landing:** Sticky Navbar → Hero → Features → Stats → Problems → HowItWorks → CTA → Footer
- **Problem View:** Split pane (react-resizable-panels) — left: description, right: Monaco editor, bottom: console
- **Dashboard:** Single-column, max-w-7xl — stat cards grid → two-column (activity + skill breakdown | continue solving)
- **Leaderboard:** Top-3 podium → user rank banner → full table

---

## Internationalization (i18n)

**Package:** next-intl v4.13
**Locales:** `en` (LTR), `ar` (RTL)
**Routing:** `localePrefix: 'always'` — all routes: `/{locale}/path`

### Config Files
- `src/i18n/routing.ts` — locale list, default locale, prefix mode
- `src/i18n/request.ts` — server-side request config, message loading
- `src/middleware.ts` — locale detection + auth middleware

### Translation Files
- `messages/en.json` — English (14 namespaces: Navbar, HeroSection, FeaturesSection, StatsSection, ProblemsSection, HowItWorksSection, CTASection, Footer, Auth, Problems, Leaderboard, ProblemView, Privacy, Terms)
- `messages/ar.json` — Arabic (same namespaces)

### Usage
- **Client components:** `useTranslations('Namespace')` from `next-intl`
- **Server components:** `getTranslations('Namespace')` from `next-intl/server`
- **Locale in components:** `useLocale()` hook for route building
- **HTML dir attribute:** Set automatically by locale layout (`dir="rtl"` for Arabic)

### Rules
- Every new user-facing string MUST have both EN and AR translations
- Never hardcode English or Arabic text in components
- Always update BOTH translation files simultaneously

---

## Content Copy (Full EN/AR Reference)

### Global
| Key | EN | AR |
|---|---|---|
| Site Name | Algora | ألجورا |
| Tagline | Master Algorithms. Code the Future. | أتقن الخوارزميات. اكتب المستقبل. |
| Brand Description | A bilingual learning platform for algorithms and problem-solving. Available in Arabic & English with AI-powered guidance. | منصة تعليمية ثنائية اللغة للخوارزميات وحل المسائل. متوفرة بالعربية والإنجليزية مع إرشادات ذكية. |

### Navbar
| Key | EN | AR |
|---|---|---|
| home | Home | الرئيسية |
| problems | Problems | المسائل |
| features | Features | المميزات |
| about | About | عن المنصة |
| signIn | Sign In | تسجيل الدخول |
| signUp | Sign Up | إنشاء حساب |
| profile | Profile | الملف الشخصي |
| signOut | Sign Out | تسجيل الخروج |
| dashboard | Dashboard | لوحة التحكم |
| mobileMenu | Toggle menu | القائمة |

### Hero Section
| Key | EN | AR |
|---|---|---|
| badge | Now with AI-Powered Assistance | الآن مع مساعدة الذكاء الاصطناعي |
| title1 | Master Algorithms. | أتقن الخوارزميات. |
| title2 | Code the Future. | اصنع المستقبل. |
| description | A bilingual learning platform for algorithms and problem-solving. Available in Arabic & English with AI-powered guidance. | منصة تعليمية ثنائية اللغة للخوارزميات وحل المشكلات. متاحة بالعربية والإنجليزية مع إرشاد مدعوم بالذكاء الاصطناعي. |
| startSolving | Start Solving | ابدأ الحل |
| viewProblems | View Problems | تصفح المسائل |
| problems | Problems | مسألة |
| languages | Languages | لغات |
| powered | AI | ذكاء اصطناعي |
| andGrowing | And Growing | في تزايد مستمر |

### Features Section
| Key | EN | AR |
|---|---|---|
| badge | Features | المميزات |
| title | Everything You Need to | كل ما تحتاجه |
| titleHighlight | Succeed | للنجاح |
| aiAssistant.title | AI-Powered Assistant | مساعد بالذكاء الاصطناعي |
| aiAssistant.description | Get step-by-step algorithm explanations from our AI chatbot. | احصل على شروحات خطوة بخطوة للخوارزميات من روبوت الدردشة الذكي. |
| bilingual.title | Bilingual Learning | تعليم ثنائي اللغة |
| bilingual.description | Full Arabic and English support with RTL layout. | دعم كامل للعربية والإنجليزية مع تخطيط RTL. |
| editor.title | Real Code Editor | محرر أكواد حقيقي |
| editor.description | Write, run, and debug code in a Monaco-style editor. | اكتب وشغّل واصحح أخطاء أكوادك في محرر على طراز Monaco. |

### Stats Section
| Key | EN | AR |
|---|---|---|
| algorithmicProblems | Algorithmic Problems | مسألة خوارزمية |
| languagesSupported | Languages Supported | لغات مدعومة |
| smartExplanations | Smart Explanations | شروحات ذكية |
| learnAnytime | Learn Anytime | تعلم في أي وقت |
| arabicEnglish | Arabic + English | العربية + الإنجليزية |
| poweredAssistant | Powered Assistant | مساعد ذكي |
| alwaysAvailable | Always Available | متاح دائماً |

### Problems Section
| Key | EN | AR |
|---|---|---|
| badge | Problems | المسائل |
| title | Practice Real | تحدّيات حقيقية |
| titleHighlight | Challenges | للتدريب |
| viewAll | View all 50+ problems | عرض جميع المسائل 50+ |

### How It Works
| Key | EN | AR |
|---|---|---|
| badge | How It Works | كيف تعمل |
| title | Start Learning in | ابدأ التعلم في |
| titleHighlight | 3 Steps | 3 خطوات |
| step1.title | Choose a Problem | اختر مسألة |
| step1.description | Browse our curated library of algorithmic challenges. | تصفح مكتبتنا المختارة من التحديات الخوارزمية. |
| step2.title | Write Your Solution | اكتب حلّك |
| step2.description | Use our integrated code editor to write your solution. | استخدم محرر الأكواد المتكامل لكتابة حلّك. |
| step3.title | Get AI Feedback | احصل على تقييم ذكي |
| step3.description | Receive detailed, personalized feedback from our AI assistant. | استقبل ملاحظات مفصلة وشخصية من مساعدنا الذكي. |

### CTA Section
| Key | EN | AR |
|---|---|---|
| title | Ready to Start Your | مستعد لبدء |
| titleHighlight | Journey | رحلتك؟ |
| getStarted | Get Started — It's Free | ابدأ الآن — مجاناً |
| noCreditCard | No credit card required · Free forever · Start solving in seconds | لا حاجة لبطاقة ائتمان · مجاني للأبد · ابدأ الحل في ثوانٍ |

### Footer
| Key | EN | AR |
|---|---|---|
| platform | Platform | المنصة |
| resources | Resources | المصادر |
| company | Company | الشركة |
| problems | Problems | المسائل |
| features | Features | المميزات |
| pricing | Pricing | الأسعار |
| documentation | Documentation | التوثيق |
| blog | Blog | المدوّنة |
| community | Community | المجتمع |
| about | About | عن المنصة |
| contact | Contact | اتصل بنا |
| privacy | Privacy | الخصوصية |
| copyright | © 2026 Algora. All rights reserved. | © 2026 ألغورا. جميع الحقوق محفوظة. |

### Auth — Sign In
| Key | EN | AR |
|---|---|---|
| title | Welcome Back | مرحباً بعودتك |
| subtitle | Sign in to continue your learning journey | سجّل الدخول لمتابعة رحلة التعلم الخاصة بك |
| email | Email Address | البريد الإلكتروني |
| password | Password | كلمة المرور |
| submit | Sign In | تسجيل الدخول |
| noAccount | Don't have an account? | ليس لديك حساب؟ |
| signUpLink | Sign Up | إنشاء حساب |
| orContinueWith | Or continue with | أو تابع باستخدام |
| github | Sign in with GitHub | تسجيل الدخول بواسطة GitHub |
| google | Sign in with Google | تسجيل الدخول بواسطة Google |

### Auth — Sign Up
| Key | EN | AR |
|---|---|---|
| title | Create Your Account | أنشئ حسابك |
| subtitle | Start your algorithmic journey today | ابدأ رحلتك الخوارزمية اليوم |
| name | Full Name | الاسم الكامل |
| confirmPassword | Confirm Password | تأكيد كلمة المرور |
| submit | Create Account | إنشاء حساب |
| hasAccount | Already have an account? | لديك حساب بالفعل؟ |
| signInLink | Sign In | تسجيل الدخول |

### Problems Page
| Key | EN | AR |
|---|---|---|
| title | Problem Set | مجموعة المسائل |
| subtitle | Sharpen your skills with curated algorithmic challenges | صقل مهاراتك مع تحديات خوارزمية مختارة |
| search | Search problems... | ابحث في المسائل... |
| difficulty | Difficulty | الصعوبة |
| category | Category | الفئة |
| status | Status | الحالة |
| all | All | الكل |
| easy | Easy | سهل |
| medium | Medium | متوسط |
| hard | Hard | صعب |
| notStarted | Not Started | لم تبدأ |
| solved | Solved | تم الحل |
| attempted | Attempted | تمت المحاولة |
| acceptanceRate | Acceptance Rate | نسبة القبول |
| noResults | No problems found matching your criteria | لا توجد مسائل تطابق معاييرك |
| clearFilters | Clear Filters | مسح الفلاتر |

### Problem View
| Key | EN | AR |
|---|---|---|
| description | Description | الوصف |
| editor | Editor | المحرر |
| runCode | Run Code | تشغيل الكود |
| submit | Submit | إرسال |
| console | Console | وحدة التحكم |
| selectLanguage | Select Language | اختر اللغة |
| examples | Examples | الأمثلة |
| constraints | Constraints | القيود |
| relatedTags | Related Tags | الوسوم ذات الصلة |
| input | Input | المدخل |
| output | Output | المخرج |
| explanation | Explanation | الشرح |
| noOutput | No output yet. Run your code to see results. | لا يوجد مخرج بعد. شغّل الكود لرؤية النتائج. |
| submitSuccess | All test cases passed! ✓ | جميع حالات الاختبار نجحت! ✓ |
| submitFail | Some test cases failed. Try again. | بعض حالات الاختبار فشلت. حاول مرة أخرى. |
| runtime | Runtime | وقت التنفيذ |
| memory | Memory | الذاكرة |
| submissions | Submissions | الحلول المقدمة |

### Leaderboard
| Key | EN | AR |
|---|---|---|
| title | Leaderboard | لوحة المتصدرين |
| rank | Rank | الترتيب |
| user | User | المستخدم |
| problemsSolved | Solved | المحلولة |
| points | Points | النقاط |
| successRate | Success Rate | نسبة النجاح |
| totalSubmissions | Submissions | المحاولات |
| bestRuntime | Best Time | أفضل وقت |
| you | You | أنت |
| noData | No submissions yet. Solve some problems to appear on the leaderboard! | لا توجد محاولات بعد. حل بعض المشاكل لتظهر في لوحة المتصدرين! |
| topPerformers | Top Performers | أفضل المشاركين |
| yourRank | Your Rank | ترتيبك |

### Form Validation Messages
| Key | EN | AR |
|---|---|---|
| invalidEmail | Please enter a valid email address | يرجى إدخال عنوان بريد إلكتروني صالح |
| passwordRequired | Password is required | كلمة المرور مطلوبة |
| passwordMinLength | Password must be at least 6 characters | يجب أن تكون كلمة المرور 6 أحرف على الأقل |
| invalidCredentials | Invalid email or password | البريد الإلكتروني أو كلمة المرور غير صحيحة |
| nameRequired | Name is required | الاسم مطلوب |
| passwordMismatch | Passwords do not match | كلمات المرور غير متطابقة |

---

## Authentication

**Provider:** NextAuth.js v5 (beta)
**Strategy:** JWT (session.user.id available throughout)
**Providers:**
1. **Credentials** — Email + bcrypt-hashed password (salt: 12)
2. **GitHub OAuth** — Requires GITHUB_ID + GITHUB_SECRET env vars
3. **Google OAuth** — Requires GOOGLE_ID + GOOGLE_SECRET env vars

### Config
- `src/lib/auth.ts` — NextAuth configuration
- `src/lib/auth-client.ts` — Client re-exports (signIn, signOut, useSession, SessionProvider)

### Protected Routes
- Middleware protects: `/dashboard`, `/profile`, `/settings` (with locale prefix)
- Unauthenticated users → redirect to `/{locale}/auth/signin`

### Access Model
- **Public:** Landing, problems listing, leaderboard, auth pages, privacy, terms
- **Authenticated:** Solve problems, dashboard, profile, settings, submissions, submit code

### Important Notes
- Supabase Auth SDK exists in codebase but is NOT used for authentication (legacy)
- Only NextAuth handles authentication
- No admin role exists yet

---

## Code Execution (Judge0 CE)

**Endpoint:** `ce.judge0.com`
**Cost:** Free, no API key required
**Engine:** `src/lib/judge0.ts`

### Supported Languages

| Language | Judge0 ID |
|---|---|
| Python | 71 |
| JavaScript | 63 |
| C++ | 54 |
| Java | 62 |

### Configuration
- 2 fallback instances for reliability
- 15-second timeout per submission
- Returns: stdout, stderr, compile_output, time, memory, statusCode

### Rules
- NEVER execute user-submitted code on the application server
- ALWAYS use Judge0 CE for code execution

---

## Development Commands

```bash
# Install dependencies
bun install

# Initialize database (first time or after schema change)
bunx prisma db push
bun run prisma/seed.ts

# Start dev server (http://localhost:3000)
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Run linting
bun run lint

# Prisma commands
bun run db:push        # Apply schema to DB
bun run db:generate    # Generate Prisma client
bun run db:migrate     # Run migrations
bun run db:seed        # Seed 14 problems
bun run db:reset       # Drop + recreate DB + re-seed

# Type checking
bunx tsc --noEmit
```

---

## CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

### Workflow
| Step | Action |
|---|---|
| Trigger | Push to `main`, PR to `main` |
| Runner | ubuntu-latest, Node 24 (forced) |
| Setup | Bun 1.3 (`oven-sh/setup-bun@v2`) |
| Cache | `node_modules` via `actions/cache@v4` |
| Install | `bun install --frozen-lockfile` |
| Generate | `bunx prisma generate` |
| Lint | `bun run lint` |
| Build | `bun run build` |

### CI Environment
- `DATABASE_URL=file:./db/custom.db` (dummy for build)
- `AUTH_SECRET=dev-secret-for-ci`
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`

---

## Deployment

### Environments
| Env | Platform | URL |
|---|---|---|
| Production | Vercel | `algora-io.vercel.app` |
| Preview | Vercel | Auto-generated per PR |
| Local | Bun | `localhost:3000` |

### Vercel Config
- **Auto-deploy:** Push to `main` → production, other branches → preview
- **Build Command:** `bun run build`
- **Output:** `.next` (standalone mode)
- **Node.js:** 18.x or 20.x

### Environment Variables (Required)
| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path: `file:./db/custom.db` |
| `AUTH_SECRET` | NextAuth JWT signing secret |

### Environment Variables (Optional — OAuth)
| Variable | Description |
|---|---|
| `GITHUB_ID` | GitHub OAuth App client ID |
| `GITHUB_SECRET` | GitHub OAuth App client secret |
| `GOOGLE_ID` | Google OAuth client ID |
| `GOOGLE_SECRET` | Google OAuth client secret |

### Database Persistence Warning
SQLite is ephemeral on Vercel — the DB file is wiped on each deployment. For production persistence, consider:
1. Vercel Postgres or Supabase PostgreSQL (recommended for scale)
2. Vercel Blob storage for the DB file
3. External SQLite host (Turso, Fly.io)

---

## Code Standards & Conventions

### General
- Keep modules small and single-purpose
- Fix root causes, not symptoms
- All code must compile with `bun run build`
- Use `'use client'` ONLY when browser interactivity is needed

### TypeScript
- Strict mode enabled, avoid `any`
- Validate external input at API boundaries with Zod
- Define interfaces for all API request/response shapes

### Next.js
- Default to Server Components
- Use `next/link` `<Link>` for ALL navigation — NEVER bare `<a href>`
- Use `next-intl` for ALL user-facing text

### Styling
- Use Tailwind custom color tokens (e.g., `bg-algora-gold`), NOT raw hex
- Follow border radius scale: `rounded-lg` (buttons), `rounded-xl` (cards), `rounded-2xl` (modals)
- All borders: `rgba(255,255,255,0.08)` or algora tokens
- Dark theme only
- Test responsive at 375px, 768px, 1024px, 1280px

### API Routes
- Validate input before processing, return 400 for invalid
- Always try/catch, return 500 on failure
- Consistent response shapes: `{ data: ... }` or `{ error: "message" }`
- Proper HTTP status codes: 200, 201, 400, 401, 404, 409, 500

### Data
- JSON fields: `JSON.stringify()` before storage, `JSON.parse()` after retrieval
- Submissions are immutable
- `db/custom.db` is gitignored

### Naming
- **Files:** `kebab-case.tsx/ts`
- **Components:** `PascalCase` exports
- **Functions:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **DB tables:** `PascalCase` in Prisma
- **API routes:** `kebab-case` directories

### Git
- **Branch:** All work on `main` (feature branches for large changes)
- **Commit messages:** Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`, `test:`, `ci:`)
- **Author:** `AliMahmoudDev` (`git config user.name "AliMahmoudDev" && git config user.email "AliMahmoudDev@users.noreply.github.com"`)
- **Push:** Always push to `origin main` after each unit of work
- **CI:** Must pass green (lint + build)

---

## Current Progress & Status

### What's Built and Working

- Landing page with all sections (Hero, Features, Stats, Problems, HowItWorks, CTA, Footer)
- Full i18n (Arabic RTL + English LTR) with 14 translation namespaces
- Authentication (NextAuth v5: Credentials + GitHub + Google)
- 14 problems seeded in DB with bilingual content
- Problem listing (search, filter, sort, paginate — 6/page)
- Problem view (split-pane: description + Monaco editor, 4 languages, Run/Submit)
- Real code execution via Judge0 CE (Run and Submit)
- Submit flow: runs all test cases, saves to DB, updates UserProblem
- Dashboard with real stats from DB (solved, attempted, streak, activity, skill breakdown)
- Profile page (bio, 84-day activity calendar, skill tags)
- Settings page (editor prefs, language, theme, danger zone)
- Leaderboard with points system (Easy=10, Medium=25, Hard=50)
- Submissions history page
- All navigation buttons functional (fixed 15+ dead links)
- All API routes wired to DB (no mock data dependencies)
- CI/CD pipeline (GitHub Actions: lint + build)
- Deployed on Vercel at algora-io.vercel.app

### What Uses Mock Data (Still Reference Only)
- `src/data/mock-problems.ts` — 14 problems used ONLY by seed script and some styling configs
  - `difficultyOrder`, `difficultyConfig`, `categoryList` exports are still used by dashboard page for styling
  - All API routes fetch from DB, NOT from this file

### Known Technical Debt
1. `src/lib/piston.ts` — DELETED (was duplicate of judge0.ts)
2. `src/hooks/use-auth.ts` — Legacy Supabase hook, not actively used
3. `src/lib/supabase/` — Legacy Supabase clients, not actively used for auth
4. `ignoreBuildErrors: true` in next.config.ts — TypeScript errors suppressed
5. `noImplicitAny: false` in tsconfig.json — Should be tightened
6. Dual config: `tailwind.config.ts` (v3-style) + `@tailwindcss/postcss` (v4-style active)
7. Console.error calls in client-side code should use proper error handling

---

## Pending Tasks

### High Priority
- [ ] **Remove `@auth/supabase-adapter`** from package.json (dead dependency)
- [ ] **Database persistence strategy** — SQLite is ephemeral on Vercel, need production solution

### Medium Priority
- [ ] **SEO Enhancement** — Open Graph meta tags, structured data (JSON-LD), per-page `generateMetadata`
- [ ] **Rate limiting** on `/api/execute` and `/api/submit`
- [ ] **Clean up client-side console.error** → proper error handling/toast
- [ ] **Remove Supabase legacy code** (`src/lib/supabase/`, `src/hooks/use-auth.ts`)
- [ ] **Update .env.local.example** to remove Supabase vars

### Low Priority
- [ ] Fix `ignoreBuildErrors` → resolve actual TypeScript errors
- [ ] Tighten `noImplicitAny: true` in tsconfig.json
- [ ] CSP headers (Content Security Policy)
- [ ] CORS configuration for API routes
- [ ] Error tracking (Sentry or similar)
- [ ] Analytics (Vercel Analytics or Google Analytics)

---

## Future Ideas & Roadmap

### Short-Term (Next 1-2 months)
1. **Admin Panel** — UI for CRUD operations on problems (add, edit, delete, toggle published)
2. **More Problems** — Expand from 14 to 50+ problems across all difficulties
3. **SEO** — Open Graph, Twitter cards, sitemap (exists), structured data, per-page metadata

### Medium-Term (3-6 months)
4. **AI Hints System** — LLM-powered hints when user is stuck (using z-ai-web-dev-sdk or similar)
5. **Editorial Solutions** — Expert-written solution explanations in Arabic and English
6. **Achievements/Badges** — Milestone badges (first solve, 7-day streak, all-easy, etc.)
7. **Contest Mode** — Timed competitions with live leaderboard updates
8. **Custom Domain** — Configure `algora.dev` on Vercel

### Long-Term (6-12 months)
9. **Community Discussions** — Problem discussion threads, user comments
10. **Video Editorials** — Embedded video explanations for select problems
11. **Pair Programming** — Real-time collaborative code editor (WebSocket)
12. **Mobile App** — React Native or PWA for practicing on mobile
13. **Export to Resume** — Generate PDF summary of solved problems and ranking
14. **Database Migration** — Migrate from SQLite to PostgreSQL (Supabase or Vercel Postgres)
15. **Notification System** — Email/webhook notifications for contest starts, new problems
16. **Problem Bookmarking** — Save problems for later
17. **Code Templates** — User-created code snippets/templates
18. **Dark/Light Theme Toggle** — If community requests it (currently dark-only)

---

## Open Questions

1. **Database for production:** Supabase PostgreSQL or Vercel Postgres? SQLite is ephemeral on Vercel.
2. **Custom domain:** When will `algora.dev` be configured? DNS + Vercel setup needed.
3. **Rate limiting strategy:** Vercel middleware, external service, or in-memory?
4. **Problem images:** Should problems support diagram images? Where to store?
5. **User avatars:** Currently OAuth only. Allow custom avatar uploads?
6. **Mobile PWA:** Add PWA manifest for "Add to Home Screen"?
7. **More languages:** Add Go, Rust, TypeScript, C# support in Judge0?
8. **Collaborative features:** Real-time pair programming — what technology? (WebSocket, CRDT, Y.js?)
9. **Monetization strategy:** Free forever, or premium features (contest hosting, company accounts)?

---

## Architecture Decisions Log

| Decision | Rationale | Date |
|---|---|---|
| SQLite for initial development | Simpler setup, no external service, file-based for easy local dev | Jan 2025 |
| NextAuth over Supabase Auth | More flexible providers, JWT without external service, better middleware | Jan 2025 |
| Judge0 CE over Piston | Free, no API key, supports all 4 languages, reliable | Jan 2025 |
| Monaco Editor over CodeMirror | VS Code-grade experience, built-in autocomplete, better language support | Jan 2025 |
| Bun over npm/yarn/pnpm | Faster installs, built-in TypeScript, project uses bun.lock | Jan 2025 |
| Dark theme only | Matches CP aesthetic (LeetCode-like), reduces complexity | Jan 2025 |
| next-intl over react-i18next | Better App Router integration, automatic locale routing | Jan 2025 |
| Gold accent (#F59E0B) | Distinctive, premium feel, stands out from blue/purple tools | Jan 2025 |
| Standalone output mode | Required for Vercel deployment with Bun runtime | Jan 2025 |
| Removed Supabase Auth | Dual auth was conflicting; unified on NextAuth only | Jun 2025 |
| Phased out mock-problems.ts from APIs | All API routes now query DB directly; mock kept as seed reference only | Jun 2025 |
| Fixed 15+ dead navigation buttons | Wired all buttons to real routes with next/link + locale prefix | Jun 2025 |

---

## Session History

### Session 2 (Jun 11, 2026) — Navigation Fixes + Backend Wiring + Context File
- Fixed 15 dead buttons/links (HeroSection, CTASection, ProblemsSection, Navbar, Footer)
- Fixed Dashboard button routing (was `/problems`, now `/dashboard`)
- Replaced all `<a>` with `<Link>` for client-side routing
- Initialized DB (`prisma db push + seed`) — 14 problems in SQLite
- Wired Submit to send userId → submissions persist in DB
- Migrated `/api/submit` to use DB testCases
- Migrated `/api/leaderboard` to use DB difficulty for points
- Migrated `/api/dashboard/stats` to use dynamic totals from DB
- Migrated Dashboard page to fetch problems from API instead of mock
- Deleted `src/lib/piston.ts` (dead duplicate code)
- Created comprehensive CLAUDE.md project context file
- **Push:** Commits on main

### Session 1 (Jun 11, 2026) — Continued from previous context
- Fixed non-functional navigation buttons across the app
- Performed full project audit
- Removed all mock-data dependencies from API routes
- Wired everything to real database

### Session 0 (Jan 2025) — Initial Development
- Built entire project from scratch through multiple sessions
- Created CI pipeline, fixed ESLint errors, cleaned up repo
- Completed Phases 1-7 (Foundation → Landing → Problems/Editor → Auth → User Features → CI/CD → Polish)

---

## Important Notes for AI Assistants

1. **Bilingual is mandatory** — Every new user-facing string needs both EN and AR translations
2. **Dark theme only** — Never add light mode
3. **Gold accent (#F59E0B)** is the brand identity — use for primary CTAs
4. **Judge0 CE only** — Never switch code execution provider without approval
5. **SQLite for now** — Schema must be SQLite-compatible
6. **No Supabase Auth** — Only NextAuth is the auth provider
7. **next/link always** — Never use `<a href>` for internal navigation
8. **shadcn/ui components** — Never edit files in `src/components/ui/` manually; use CLI
9. **JSON DB fields** — Always stringify before write, parse after read
10. **Conventional commits** — Use `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc.
11. **Git author** — Always use `AliMahmoudDev` as git user
12. **Before each session** — Run `git pull` to avoid merge conflicts
13. **After each session** — Update this file (progress, decisions, session notes)
