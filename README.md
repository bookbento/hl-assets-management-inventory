# IT Assets Inventory

A Full-stack IT Assets Inventory management system built with Next.js (Frontend) and NestJS (Backend) using a Monorepo structure managed by pnpm.

## Project Structure

```text
.
├── backend/            # NestJS API (Port 3000)
├── frontend/           # Next.js Application (Port 3001)
├── docker-compose.yml  # Database (PostgreSQL) and services setup
└── pnpm-workspace.yaml # Monorepo workspace configuration
```

## Prerequisites

- Node.js (v20+)
- pnpm
- Docker & Docker Compose

## Getting Started

### 1. Setup Environment

Copy `.env.example` to `.env` in both `frontend` and `backend` directories.

### 2. Start Infrastructure

Run the database using Docker:

```bash
docker-compose up -d db
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Development

To run both frontend and backend simultaneously:

```bash
pnpm dev
```

Or run them individually:

```bash
pnpm frontend:dev
pnpm backend:dev
```

### 5. Run แบบ Clone มาใหม่เลย

ตามลำดับ

- root

```bash
docker-compose up -d db
pnpm install
pnpm run dev
```

- backend

```bash
pnpm backend:prisma:generate
pnpm backend:prisma:push
```

## Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Shadcn UI, TanStack Query
- **Backend:** NestJS, Prisma ORM, PostgreSQL
- **Language:** TypeScript
- **Package Manager:** pnpm
