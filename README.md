# Graphora

Graphora is a powerful, full-stack graph-based data visualization and analysis platform. It allows users to upload datasets, generate complex graph structures, and explore them through an interactive web interface.

## Overview

Graphora is built as a modern monorepo designed for performance, scalability, and developer experience. It leverages a distributed architecture with a high-performance backend, a reactive frontend, and specialized workers for heavy computation.

## Tech Stack

### Frontend (`apps/web`)

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **State Management**: [TanStack Query](https://tanstack.com/query) & [Apollo Client](https://www.apollographql.com/docs/react/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Visualization**: [React Force Graph](https://github.com/vasturiano/react-force-graph)
- **UI Components**: Shared primitives via `packages/ui` (based on shadcn/ui)

### Backend (`apps/server`)

- **Framework**: [NestJS](https://nestjs.com/) with [Fastify](https://www.fastify.io/)
- **API**: [GraphQL](https://graphql.org/) (via Mercurius)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Better-Auth](https://www.better-auth.com/)
- **Storage**: [AWS S3](https://aws.amazon.com/s3/) (Object Storage)
- **Task Queue**: [BullMQ](https://docs.bullmq.io/) (Redis-backed)

### Computation Worker (`apps/worker`)

- **Runtime**: Python 3.x
- **Graph Analysis**: [NetworkX](https://networkx.org/)
- **Processing**: [NumPy](https://numpy.org/) & [SciPy](https://scipy.org/)
- **Task Consumer**: [BullMQ](https://docs.bullmq.io/) (Python implementation)

### Shared Packages (`packages/*`)

- `ui`: Shared React components and global styles.
- `auth`: Unified authentication configuration.
- `db`: Shared Prisma schema and database clients.
- `env`: Type-safe environment variable validation (Zod).
- `config`: Shared ESLint, TypeScript, and Prettier configurations.

## Key Features

- **Interactive Graph Visualization**: Explore large-scale networks with 2D force-directed layouts.
- **Dataset Management**: Upload, edit, and version your datasets (CSV/JSON).
- **Automated Graph Generation**: Transform raw data into structured graphs using specialized Python workers.
- **Real-time Metrics**: View graph properties like degree distribution, centrality, and connectivity.
- **Secure Authentication**: Robust session management and social login support.
- **Optimized Deployment**: High-performance architecture optimized for Vercel and Fly.io.

## Project Structure

```text
graphora/
├── apps/
│   ├── web/           # Next.js Frontend
│   ├── server/        # NestJS Backend API
│   └── worker/        # Python Computation Worker
├── packages/
│   ├── ui/            # Shared UI Library
│   ├── auth/          # Shared Auth Logic
│   ├── db/            # Database Schema & Client
│   ├── env/           # Environment Validation
│   └── config/        # Tooling Configurations
└── infra/             # Deployment & Docker configs
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS) & [pnpm](https://pnpm.io/)
- [Python 3.10+](https://www.python.org/)
- [Docker](https://www.docker.com/) (for Redis and PostgreSQL)
- [Bun](https://bun.sh/) (Optional, used for server runtime)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/graphora.git
   cd graphora
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` in the root and in respective `apps/*` directories.

4. Start development environment:
   ```bash
   pnpm run dev
   ```

### Database Management

Sync the Prisma schema with your database:

```bash
pnpm run db:push
```

## 🚢 Deployment

Graphora is optimized for a hybrid deployment:

- **Web**: Hosted on [Vercel](https://vercel.com).
- **Server**: Hosted on [Fly.io](https://fly.io) or Docker.
- **Worker**: Hosted as a separate background process or container.

### Cross-Domain Auth

We use **Vercel Rewrites** to proxy `/graphql` and `/api/auth` requests to the backend, ensuring first-party cookie stability and avoiding CORS issues.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
