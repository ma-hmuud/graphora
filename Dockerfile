# Build stage with Node.js (to use npm/pnpm)
FROM node:22-slim AS base

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.33.0

# Copy monorepo files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and config files
COPY apps/server ./apps/server
COPY packages/auth ./packages/auth
COPY packages/db ./packages/db
COPY packages/env ./packages/env
COPY packages/config ./packages/config
COPY tsconfig.json turbo.json ./

# Generate Prisma client
RUN pnpm --filter=@graphora/db db:generate

# Build
RUN pnpm build --filter=server

# Production image with Bun
FROM oven/bun:1-slim AS production

WORKDIR /app

# Install curl for pnpm installation and openssl for Prisma
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=10.33.0 sh -
ENV PATH="/root/.local/share/pnpm:$PATH"

# Copy monorepo files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/src/prisma/schema.prisma ./apps/server/src/prisma/schema.prisma
COPY apps/server/dist ./apps/server/dist
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/auth/src ./packages/auth/src
COPY packages/db/package.json ./packages/db/package.json
COPY packages/db/src ./packages/db/src
COPY packages/env/package.json ./packages/env/package.json
COPY packages/env/src ./packages/env/src
COPY packages/config/package.json ./packages/config/package.json

# Install all dependencies (for Prisma generation)
RUN pnpm install

# Generate Prisma client
RUN pnpm --filter=@graphora/db db:generate

# Expose port (matches server/src/main.ts:31)
EXPOSE 3001

# Start server
CMD ["bun", "start", "--cwd", "apps/server"]
