# backend/Dockerfile
# Stage 1: Build the NestJS application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Run the production application
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled application and prisma stuff
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Expose the port the app runs on
EXPOSE 3000

CMD ["node", "dist/main"]
