# Mojo Mining

Cooperative mining operations manager for Star Citizen — real-time party coordination, scouting, refinery tracking, and payout splitting.

> Unofficial fan tool. Not affiliated with Cloud Imperium Games. Data referenced via [UEXcorp.space](https://uexcorp.space).

## What it does

Mojo Mining helps a Star Citizen mining party coordinate a session from start to finish:

- **Create or join an operation** with a 6-character invite code
- **Party view** — live overview of ships, crew, and status across the fleet
- **Scout view** — pin rocks/clusters with location, mass, and ore composition
- **Miner view** — track assigned rock, cargo fill per ore, and call for a bag swap
- **Hauler view** — refinery queue, TDD prices, payout calculator
- **Summary view** — refinery jobs, recorded sales, and a payout breakdown with `mo.TRADER` commands ready to copy into game chat

Everything syncs in real time across all connected players via Supabase Realtime — no refreshing needed.

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs) for local UI state
- [Supabase](https://supabase.com) (Postgres + Realtime) as the backend
- [Lucide React](https://lucide.dev) icons

## Getting started

```bash
npm install
npm run dev
```

Create a `.env` file in the project root (see `.env.example` if present):

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The anon/publishable key is safe to expose client-side — access is controlled by Supabase Row Level Security policies, not key secrecy.

## Build

```bash
npm run build
```

## Project structure

```
src/
  api/          Supabase CRUD + UEX API client
  components/   Reusable UI pieces, modals, cards
  data/         Static reference data (ship capacities, etc.)
  hooks/        Realtime subscription hook
  lib/          Supabase client setup
  store/        Zustand store — all state + actions
  types/        Shared TypeScript types
  views/        Party, Scout, Miner, Hauler, Summary
```

## Status

Actively in development. See [Issues](../../issues) and [Milestones](../../milestones) for the current roadmap.
