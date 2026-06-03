# graphora

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Fastify, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Fastify** - Fast, low-overhead web framework
- **Bun** - Runtime environment (Server runs on Bun)
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth (with Vercel Rewrites for cross-domain stability)
- **Turborepo** - Optimized monorepo build system

## Deployment Architecture

This project is optimized for a cross-platform deployment:
- **Frontend**: Hosted on [Vercel](https://vercel.com) (`apps/web`).
- **Backend**: Hosted on [Fly.io](https://fly.io) (`apps/server`).
- **Database**: PostgreSQL (Prisma).

### Cross-Domain Authentication (Vercel + Fly.io)

To resolve browser issues with third-party cookies (`state_mismatch`), we use **Vercel Rewrites**. The frontend proxies all `/api/auth/*` and `/graphql` requests to the Fly.io server. This makes authentication cookies "First-Party" and extremely stable.

**Crucial Configuration:**
- `BETTER_AUTH_URL` on the Fly.io server MUST point to the **Vercel Frontend URL** (e.g., `https://graphora-visualizer.vercel.app`).
- `NEXT_PUBLIC_SERVER_URL` on Vercel MUST point to the **Fly.io Server URL** (e.g., `https://graphora-server.fly.dev`).

## CI/CD Workflow

The project uses path-based deployment triggers to optimize build times and costs:

- **CI**: Runs on every PR/Push if any code in `apps/` or `packages/` changes.
- **Server Deploy**: Triggers only when `apps/server/`, `packages/`, or server config files change.
- **Web Deploy**: Managed by Vercel with an "Ignored Build Step" checking for changes in `apps/web/` or `packages/`.

## Database Setup

This project uses PostgreSQL with Prisma ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `.env` files with your PostgreSQL connection details.

3. Sync the schema:

```bash
pnpm exec prisma db push
```

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@graphora/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Project Structure

```
graphora/
├── apps/
│   ├── web/         # Frontend application (Next.js)
│   └── server/      # Backend API (Fastify)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:server`: Start only the server
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run db:push`: Push schema changes to database
- `pnpm run db:generate`: Generate database client/types
- `pnpm run db:migrate`: Run database migrations
- `pnpm run db:studio`: Open database studio UI
