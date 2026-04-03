# NKortex AI Offline Backend Technical Documentation

## Overview
NKortex AI is structured to run as a local SaaS utilizing Next.js, Node.js, Prisma, PostgreSQL/MongoDB, and local offline instances of models via Ollama. It bypasses any external API endpoints ensuring data privacy and operational stability.

## Prerequisites
- Node.js (v18+)
- Postgresql (or Docker for DB runtime)
- Docker Desktop (Required for LLM Ollama runtime out of the box).
- RAM: Minimum 8GB (4GB reserved explicitly for local LLM usage container)

## Installation Guide (Local Development Deployment)

1. Set up Docker stack (Databases & Model Node)
```bash
docker-compose up -d
```
This boots up PostgreSQL on `5432` and Ollama on `11434`.

2. Pull lightweight model into local Ollama via container shell:
```bash
docker exec -it nkortex-ai-ollama run phi
```
> Note: use `phi` for ultra-low memory consumption, or `llama3` if scaling.

3. Update Dependencies:
```bash
npm install
npm install @prisma/client node-cron
```

4. Run Prisma database initialization:
Update `.env` locally with: `DATABASE_URL="postgresql://user:password@localhost:5432/nkortex"`
```bash
npx prisma generate
npx prisma db push
```

5. Run local scheduling and routing node:
```bash
npm run dev
```

## System Architecture Details & Scalability

### Database
Implemented relational entities (`Internship`, `User`, `Bookmark`, `ChatSession`, `Message`) via **Prisma ORM**.
- **Optimization Strategy:** Memory constraint bounds implemented via `MemoryManager.ts`, forcing DB constraints keeping token arrays slim at 10 exchanges per transaction, protecting local LLM overload.
- Postgres scales smoothly out-of-the-box locally, though connections pool mappings can be scaled easily using Prisma Accelerate properties when porting externally.

### AI Engine (OfflineNLP & Config)
`src/lib/AgentLogic.ts` drives offline intelligence routing locally.
- Provides fallback systems intercepting network gaps.
- Internships are accurately classified locally against internal criteria locally (Location and Job Domains) using exact text algorithms without cloud inference limits. 

### Advanced Usage Tracking Monitor Config
Since offline limits govern infrastructure instead of API keys, the user memory objects mapped locally track tokens explicitly under the specific ChatSession DB boundaries. Administrative users map endpoints locally inside `Role: ADMIN` rules.

*Future Scalability:*
When shifting from local 16GB operation -> VPS Production instances -> add Nginx reverse proxies on port 3000 mapping domains directly, and scale the Docker configuration replica resources natively!
