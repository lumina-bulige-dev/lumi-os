# Cloudflare Deployment Configuration

This document describes the proper Cloudflare deployment configuration for all LUMINA BULIGE projects.

## Projects Overview

### 1. lumi-core-api (Cloudflare Workers)
- **Repository Path**: `lumi-core-api/`
- **Domain**: `api.luminabulige.com/*`
- **Purpose**: Webhooks (Wise), API endpoints
- **Build Command**: `npm install && npm run deploy` (or deploy via Wrangler)
- **Entry Point**: `src/index.ts`

**Cloudflare Dashboard Configuration:**
- Project Type: Worker
- Build command: N/A (deploy via Wrangler or git integration)
- Root directory: `lumi-core-api`

### 2. luminabulige-app (Cloudflare Pages)
- **Repository Path**: `luminabulige_app/`
- **Domain**: `app.luminabulige.com/*`
- **Purpose**: Main application UI, Wise trigger (client)
- **Framework**: Next.js with static export

**Cloudflare Dashboard Configuration:**
- Project Type: Pages
- Framework preset: `Next.js (Static HTML Export)`
- Build command: `npm run build`
- Build output directory: `out`
- Root directory: `luminabulige_app`
- Node version: 18 or later

### 3. luminabulige-verify (Cloudflare Pages)
- **Repository Path**: `luminabulige_app/`
- **Domain**: `verify.luminabulige.com/*` or subdirectory
- **Purpose**: Verification/admin interface
- **Framework**: Next.js (same as luminabulige-app)

**Cloudflare Dashboard Configuration:**
- Project Type: Pages
- Framework preset: `Next.js (Static HTML Export)`
- Build command: `npm run build`
- Build output directory: `out`
- Root directory: `luminabulige_app`
- Node version: 18 or later

**Note**: This might be the same deployment as luminabulige-app but accessed via different domain or path.

### 4. luminabulige-admin (Cloudflare Pages)
- **Repository Path**: `luminabulige_app/`
- **Domain**: `admin.luminabulige.com/*` or subdirectory
- **Purpose**: Admin interface
- **Framework**: Next.js (same as luminabulige-app)

**Cloudflare Dashboard Configuration:**
- Project Type: Pages
- Framework preset: `Next.js (Static HTML Export)`
- Build command: `npm run build`
- Build output directory: `out`
- Root directory: `luminabulige_app`
- Node version: 18 or later

**Note**: This might be the same deployment as luminabulige-app but accessed via different domain or path.

### 5. lumi-core-web (Cloudflare Pages)
- **Repository Path**: `lumi-core-web/` (future) or `/` (current: index.html)
- **Domain**: `luminabulige.com/*`
- **Purpose**: Landing page, blog, legal, about

**Cloudflare Dashboard Configuration:**
- Project Type: Pages
- Build command: None (static HTML)
- Build output directory: `/` (root)
- Root directory: `/` (or `lumi-core-web` when migrated)

## Build Requirements

### For Next.js Projects (luminabulige_app)
- Node.js version: 18 or later
- Build produces static HTML export in `out/` directory
- All dependencies must be in `package.json`

### For Worker (lumi-core-api)
- TypeScript support via Wrangler
- D1 database binding required
- Environment variables configured in Cloudflare dashboard

## Troubleshooting Build Failures

### Common Issues

1. **Wrong Root Directory**: Make sure the "Root directory" setting in Cloudflare Pages points to the correct subdirectory (e.g., `luminabulige_app` not `/`)

2. **Missing Dependencies**: Ensure all dependencies are listed in `package.json` including dev dependencies needed for build

3. **Node Version**: Set the `NODE_VERSION` environment variable to `18` or later in Cloudflare Pages settings

4. **Build Output Directory**: For Next.js with `output: "export"`, the output directory should be `out` not `.next`

5. **Build Command**: Use `npm run build` not `npm build`

### Verification Steps

Before deployment, verify locally:

```bash
# For luminabulige_app
cd luminabulige_app
npm install
npm run build
ls out/  # Should contain index.html and other static files

# For lumi-core-api
cd lumi-core-api
npm install
npm run dev  # Test locally with Wrangler
```

## Environment Variables

### lumi-core-api Worker
Set these in Cloudflare Workers dashboard:
- `WISE_WEBHOOK_PUBLIC_KEY_PEM`: RSA public key for Wise webhook verification

### luminabulige_app Pages
Set these in Cloudflare Pages dashboard (if any):
- (Add environment variables as needed)

## References
- Main repository structure: see `RESPONSIBILITY.md`
- Next.js static export: https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Cloudflare Workers: https://developers.cloudflare.com/workers/
