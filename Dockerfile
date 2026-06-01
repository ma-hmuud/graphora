# Build stage with Node.js
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

# Production image with Node.js
FROM node:22-slim AS production

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@10.33.0

# Copy monorepo files from build context
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server ./apps/server
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/auth/src ./packages/auth/src
COPY packages/db/package.json ./packages/db/package.json
COPY packages/db/src ./packages/db/src
COPY packages/env/package.json ./packages/env/package.json
COPY packages/env/src ./packages/env/src
COPY packages/config/package.json ./packages/config/package.json
COPY tsconfig.json turbo.json ./

# Copy dist from build stage
COPY --from=base /app/apps/server/dist ./apps/server/dist

# Install all dependencies (for Prisma generation)
RUN pnpm install

# Generate Prisma client
RUN pnpm --filter=@graphora/db db:generate

# Expose port (matches server/src/main.ts:31)
EXPOSE 3001

# Start server
CMD ["node", "apps/server/dist/index.mjs"]
