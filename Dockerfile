# Dockerfile for backend (Node.js + Prisma)
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package.json backend/pnpm-lock.yaml* .
RUN npm i -g pnpm && pnpm install --frozen-lockfile
COPY backend/prisma ./prisma
RUN npx prisma generate
COPY backend/src ./src
RUN pnpm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY backend/.env.example .env
EXPOSE 4000
CMD ["node", "dist/index.js"]
