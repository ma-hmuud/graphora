FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ packages/
COPY apps/server/ apps/server/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter server build
RUN pnpm prune --prod

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "apps/server/dist/index.mjs"]
