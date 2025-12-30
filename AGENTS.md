# AGENTS.md

Markdown presentation editor with real-time preview and AI assistance.

> **For AI Agents**: Quick reference for code generation. Human developers see `docs/` for details.

## Quick Start

```bash
bun install
cp backend/.env.example backend/.env  # Optional: for AI features
cd backend && bun run dev    # localhost:3001
cd frontend && bun run dev   # localhost:5173
```

## Architecture

```
Frontend (React) → Hono RPC → Backend (Hono/Bun)
                                    ↓
                      Marp CLI (export) / AI Agents (generation)
```

## Commands

| Command | Location | Description |
|---------|----------|-------------|
| `bun install` | root | Install all dependencies |
| `bun run check` | root | Lint & format (Biome) |
| `bun run knip` | root | Detect unused code |
| `bun run dev` | frontend | Start frontend (port 5173) |
| `bun run dev` | backend | Start backend (port 3001) |
| `bun run build` | frontend | Production build |
| `bun run typecheck` | frontend/backend | Type check |

## Rules

### Do

- Use Bun (`bun install`, `bun run dev`)
- Run Biome from project root (`bun run check`)
- Use Hono RPC for frontend-backend communication (no direct fetch)
- Validate all backend inputs with Zod
- Add `.js` extension to relative imports in backend

### Don't

- Use npm/node (except Puppeteer on Windows)
- Use ESLint/Prettier (Biome only)
- Use `any` type
- Hardcode secrets (use `.env` + `Bun.env`)
- Leave unused exports (run `bun run knip` to detect)

## UI/UX Decisions

- Dark Mode by default
- shadcn/ui components (Radix UI based)
- Inter font family
- Semantic color variables (`bg-background`, `text-foreground`)

## Gotchas

### ESM in Backend

- `"type": "module"` requires `.js` extension on relative imports
- Use `fileURLToPath(import.meta.url)` instead of `import.meta.dir`

### Puppeteer on Windows

- Bun has compatibility issues with Puppeteer on Windows
- `backend/src/lib/marp.ts` spawns with `node` instead of `bun`

### Monorepo

- Biome is installed at root only
- Keep same package versions across all workspaces
- After updates: delete `node_modules` and `bun.lock`, then reinstall

### Hono RPC Types

- `packages/shared/` contains type-only definitions
- Frontend imports from `@marp-editor/shared`
- Keep shared package free of runtime dependencies

### AI Architecture

- Orchestrator Pattern: Intent analysis → Agent routing → Tool calling
- Human-in-the-loop: Tools have no `execute` function, frontend handles Apply/Discard
- Tools: `propose_edit`, `propose_insert`, `propose_replace`, `propose_plan`
- Agents: `architect` (planning), `editor` (content), `general` (conversation)

## Structure

```
marp-web-editor/
├── frontend/           # Vite + React + Tailwind
│   └── src/
│       ├── components/ # UI components (ui/, editor/, ai/)
│       ├── hooks/      # useMarp, useMarpChat, useThemeLoader
│       └── lib/        # API client, stores, utilities
├── backend/            # Hono + Bun
│   └── src/
│       ├── routes/     # API endpoints (ai, export, themes, templates, images)
│       ├── lib/ai/     # orchestrator, agents/, tools, config
│       └── lib/marp.ts # Marp CLI wrapper (export)
│   ├── themes/         # Custom theme CSS files
│   ├── templates/      # Slide templates (.md + templates.json)
│   └── guidelines/     # AI generation guidelines (base-rules.md, themes/)
├── packages/shared/    # Hono RPC type definitions
├── biome.json          # Linter/Formatter config (root only)
└── package.json        # Bun workspaces config
```

## Documentation

- Keep `docs/` for human developers, `AGENTS.md` for AI agents
- Update both when making significant changes
- No `Last Updated` dates (Git tracks history)

For detailed information:
- [DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Setup & troubleshooting
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design
- [AI.md](./docs/AI.md) - AI implementation
- [DOCKER.md](./docs/DOCKER.md) - Docker environment
