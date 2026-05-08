# backend/Dockerfile
FROM node:22-alpine AS builder

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN pnpm install --frozen-lockfile

COPY backend/ backend/

WORKDIR /app/backend

RUN pnpm exec prisma generate
RUN pnpm build

FROM node:22-alpine AS runner

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

WORKDIR /app

COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main"]
