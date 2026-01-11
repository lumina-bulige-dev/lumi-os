# GitHub Copilot instructions

## Repository overview
- Next.js 14 static-export app in `/app` using TypeScript. Root hosts canonical specification documents (e.g., `LUMI_*`, `rules/`, `specifications/`) that should only change when explicitly requested.
- No automated tests are defined; primary command is the static build.

## Development workflow
- Runtime: Node 18+.
- Install dependencies: `npm install`.
- Build/export: `npm run build`.
  - Baseline export currently fails for `/v` because `useSearchParams` is not wrapped in a suspense boundary.
  - Baseline export currently fails for `/api/verify` because `request.url` is used alongside `dynamic = "error"`.
  - If these issues are unchanged, note them rather than modifying behavior unless explicitly asked.
- Do not commit build outputs or `node_modules/`.

## Coding guidance
- Favor existing patterns in `/app` (server vs. client components); keep changes minimal and avoid new dependencies unless required.
- Treat canonical policy/spec documents as source of truth; avoid edits without explicit direction.
- Keep configuration files unchanged unless the task requires it.
