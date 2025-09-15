# AI Image — Comprehensive Starter (Postgres-first)

Production-ready scaffold for a digital art marketplace built with **Next.js (App Router) + TypeScript + Tailwind + Prisma + Stripe-ready checkout**. Defaults to **Postgres** (Neon/Supabase/Railway) for smooth Vercel deployments.

## Quickstart

```bash
# 1) Run the bootstrap script (this file)
chmod +x bootstrap.sh && ./bootstrap.sh

# 2) Install deps
pnpm i   # or npm i / yarn

# 3) Env
cp .env.example .env.local
# Paste your Postgres DATABASE_URL into .env.local

# 4) DB (Postgres)
pnpm db:push
pnpm db:seed

# 5) Dev
pnpm dev   # http://localhost:3000
