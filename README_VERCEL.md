# Cosplay Shoot Manager — Vercel Deployment Guide

This document explains how to run the project locally and deploy it to Vercel (static frontend + serverless API). It focuses on the actual steps, required environment variables, and a few serverless-specific notes.

## Quick overview
- Frontend: Vite + React (client/)
- Backend: Express.js (server/), exposed to Vercel as a serverless function at `/api/*` via `api/server.ts`
- Build output: `dist/public` (produced by `vite build`)

## Required environment variables (set these in Vercel Project Settings or locally)
- `DATABASE_URL` — Postgres connection string
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `GOOGLE_MAPS_API_KEY` — (optional) Google Maps Places API key
- `GOOGLE_SERVICE_ACCOUNT` / `GOOGLE_SERVICE_ACCOUNT_KEY` — (optional) service account for Google integrations
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` — (optional) email sending
- `PORT` — not required on Vercel; used locally (default: 5000)

Keep secrets secure in the Vercel dashboard (Project > Settings > Environment Variables).

## Local development
1. Install dependencies
```powershell
npm install
```

2. Start dev server (local Express + Vite middleware)
```powershell
npm run dev
```

This starts the full app on `http://localhost:5000` (Vite dev + API). Use PowerShell to set any environment variables in the same terminal before running.

## Build for production locally
```powershell
npm run vercel-build
```
- This runs `vite build` and outputs static files into `dist/public`.

If you want to bundle the server for testing locally you can still use the original `build` script (bundles server to `dist`), but for Vercel we rely on its Node builder for the `api/server.ts` entry.

## Deploy to Vercel
1. Push the repo to a Git provider (GitHub, GitLab, etc.).
2. Create a new Vercel project and import the repository.
3. Ensure the following in Vercel project settings:
   - Build command: `npm run vercel-build`
   - Output directory: `dist/public` (configured by `vercel.json` in this repo)
   - Add the environment variables listed above.
4. Deploy (from the Vercel UI or via the CLI):
```powershell
npm i -g vercel
vercel login
vercel --prod
```

Vercel will build the static frontend and will treat `api/server.ts` as the Node serverless entrypoint. Routes are configured in `vercel.json` so `/api/*` is routed to the serverless handler and other routes fall back to `dist/public/index.html`.

## Serverless-specific notes & recommendations
- Sessions: Avoid in-memory session stores (memorystore, memory) when running serverless. Prefer:
  - Supabase-auth-based cookie flow (stateless), or
  - persistent store (Redis) if you must use express-session.
- File uploads: Lambdas have limited disk and short timeouts. Prefer direct client -> Supabase Storage uploads (signed URLs) to avoid routing large files through the lambda.
- Long-running/background tasks: Offload to background workers or services (Supabase functions, a separate worker host, or serverless jobs). Lambdas are ephemeral.
- WebSockets: Serverless lambdas don't host persistent sockets. Use a managed WebSocket provider or separate server for real-time features.

## Performance
- Vite built assets show some large chunks (>500KB). To improve load times:
  - Use dynamic imports to split big pages/components.
  - Add `build.rollupOptions.output.manualChunks` to `vite.config.ts` to separate vendor code.
  - Audit large dependencies and lazy-load heavy libraries.

## Troubleshooting
- If the build fails locally due to native or bundling issues, prefer allowing Vercel to build the serverless handler (`api/server.ts`) rather than bundling it locally with esbuild.
- Run `npm run vercel-build` locally to confirm the static frontend builds correctly.

## Useful commands
```powershell
# dev
npm run dev

# build frontend for prod
npm run vercel-build

# typecheck
npm run check

# run tests
npm run test
```

## Next steps (optional enhancements)
- Convert session handling to stateless Supabase cookie flow.
- Implement direct-to-Supabase client uploads for avatar and image uploads.
- Add manualChunks and code-splitting to reduce bundle size.

If you'd like, I can add a short `DEPLOY.md` with exact Vercel UI steps and recommended env var values for staging vs production.