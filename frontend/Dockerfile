# frontend/Dockerfile
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

WORKDIR /app

# Copy workspace metadata first so pnpm can resolve the monorepo consistently.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN pnpm install --frozen-lockfile

COPY frontend/ frontend/
COPY backend/prisma/schema.prisma backend/prisma/schema.prisma

WORKDIR /app/frontend

# Build-time env vars for Next.js (NEXT_PUBLIC_* must be available at build time)
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm dlx prisma@5 generate --schema ../backend/prisma/schema.prisma
RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
