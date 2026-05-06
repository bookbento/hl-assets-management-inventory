# frontend/Dockerfile
# Stage 1: Install dependencies and build the Next.js application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy frontend package files
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy frontend source
COPY frontend/ .

# Copy only the prisma schema from backend to avoid copying seed.ts which breaks Next.js build
COPY backend/prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma@5 generate

# Build-time env vars for Next.js (NEXT_PUBLIC_* must be available at build time)
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Stage 2: Serve the Next.js application
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy the standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3001

# Next.js standalone server uses PORT env var
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
