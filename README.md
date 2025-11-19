# Tascape

Tascape is an internal task and resource management dashboard built with Next.js. It helps operations teams balance workloads, monitor project health, and keep activity logs centralized. The app combines Kanban-style task management, smart reassignments, team capacity tracking, and CRUD flows for projects, teams, members, and tasks.

## Features

- **Kanban task board** with project/member filters, search, and drag-friendly columns (Pending/In Progress/Done).
- **Smart task re-assignment** endpoint and UI flow that redistributes low/medium priority tasks across members when capacity is exceeded.
- **Team member summary** widget showing per-member capacity, utilization highlights (red/yellow), and current task load.
- **Recent re-assignment feed** powered by activity logs for quick auditing.
- **Team management** cards with inline edit/delete actions and member badges.
- **Task & team forms** using Formik + Yup validation, capacity warnings, and auto-assignment helpers.
- **Global toast feedback** (Sonner) for success/error states across mutations.

## Tech Stack & Key Packages

- **Framework:** Next.js 16 (App Router) with React 19 and Turbopack dev server.
- **Styling & UI:** Tailwind CSS 4, Radix UI primitives (accordion, dialog, select, dropdown), class-variance-authority, tailwind-merge.
- **State/Data:** TanStack Query for fetching/mutations, Axios for HTTP, Zustand for auth store.
- **Forms & Validation:** Formik + Yup.
- **Icons & UX:** Lucide React, Sonner toasts, cmdk/nextjs-toploader for polish.
- **Backend:** Next.js API routes, Mongoose ODM, JWT authentication, bcryptjs for hashing.

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd tascape
pnpm install
```

> Node.js 18+ is recommended. The dev server is configured to run on port **4001**.

### 2. Configure Environment Variables

Create a `.env.local` file in the project root with the following values:

```.env.local
DB_USER_NAME
DB_NAME
DB_PASSWORD
JWT_SECRET
NEXT_PUBLIC_API_BASE_URL
```

### 3. Run the App

```bash
pnpm run dev        # starts Next.js on http://localhost:4001
pnpm run lint       # optional lint check
pnpm run build && pnpm start   # production build & serve
```

## Project Structure Highlights

- `src/app/(root)/tasks` – Task board pages and granular components.
- `src/app/api/*` – Next.js server routes for tasks, members, projects, auth, and the re-assign logic.
- `src/components/page/*` – Dashboard widgets such as team summaries and recent reassignments.
- `src/hooks/*` – Encapsulated TanStack Query hooks for data access.
- `src/lib/*` – Shared utilities (auth helpers, Axios client, DB connection).

## What’s Next

1. Connect to your MongoDB cluster and seed initial projects/teams/members.
2. Configure auth flows (sign-in/up pages are scaffolded).
3. Extend the dashboard with reporting, notifications, or integrations specific to your workflow.

Happy shipping! 🚀
