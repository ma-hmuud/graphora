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

# Copy necessary files from base
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/server/dist ./apps/server/dist
COPY --from=base /app/apps/server/package.json ./apps/server/package.json
COPY --from=base /app/packages/auth ./packages/auth
COPY --from=base /app/packages/db ./packages/db
COPY --from=base /app/packages/env ./packages/env

# Expose port (matches server/src/main.ts:31)
EXPOSE 3001

# Start server
CMD ["bun", "start", "--cwd", "apps/server"]
