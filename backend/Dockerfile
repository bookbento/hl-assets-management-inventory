# backend/Dockerfile
# Stage 1: Build the NestJS application
FROM node:22-alpine AS builder

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json ./
RUN pnpm install --no-frozen-lockfile

COPY . .
RUN npx prisma generate
RUN pnpm run build

# Stage 2: Run the production application
FROM node:22-alpine AS runner

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl

WORKDIR /app

# Copy everything needed from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose the port the app runs on
EXPOSE 3000

CMD ["node", "dist/main"]
