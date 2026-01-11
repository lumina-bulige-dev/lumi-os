# GitHub Copilot instructions

## Repository overview
- Next.js 14 static-export app in `/app` using TypeScript. Root hosts canonical specification documents (e.g., `LUMI_*`, `rules/`, `specifications/`) that should only change when explicitly requested.
- No automated tests are defined; primary command is the static build.

## Development workflow
- Runtime: Node 18+.
- Install dependencies: `npm install`.
- Build/export: `npm run build` (current baseline fails during static export for `/v` due to `useSearchParams` missing a suspense boundary, and for `/api/verify` because `request.url` is used with `dynamic = "error"`; mention if unchanged rather than editing unless asked).
- Do not commit build outputs or `node_modules/`.

## Coding guidance
- Favor existing patterns in `/app` (server vs. client components); keep changes minimal and avoid new dependencies unless required.
- Treat canonical policy/spec documents as source of truth; avoid edits without explicit direction.
- Keep configuration files unchanged unless the task requires it.
