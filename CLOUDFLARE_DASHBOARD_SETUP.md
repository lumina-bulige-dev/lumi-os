# Cloudflare Dashboard Configuration Guide

This guide provides step-by-step instructions for configuring Cloudflare deployments in the dashboard.

## Problem

The Cloudflare deployments are failing because the dashboard configuration doesn't match the repository structure documented in `RESPONSIBILITY.md` and `CLOUDFLARE_DEPLOYMENT.md`.

## Required Fixes

### 1. lumi-core-api (Cloudflare Workers)

**Current Issue**: Deployment fails because the entry point cannot be found.

**Required Configuration**:
- Navigate to: Cloudflare Dashboard → Workers & Pages → lumi-core-api
- **Root directory**: `lumi-core-api`
- **Main module**: `src/index.ts`
- **Build command**: Not required (Wrangler handles TypeScript compilation)
- **Environment variables** (in Settings → Variables):
  - `WISE_WEBHOOK_PUBLIC_KEY_PEM`: [Your RSA public key]
- **D1 Database binding** (in Settings → Bindings):
  - Variable name: `DB`
  - D1 Database: [Your database name]

**Alternative**: Deploy via Wrangler CLI from local machine:
```bash
cd lumi-core-api
npm install
npx wrangler login
npx wrangler deploy
```

### 2. luminabulige-app (Cloudflare Pages)

**Current Issue**: Build fails, possibly due to incorrect root directory or build settings.

**Required Configuration**:
- Navigate to: Cloudflare Dashboard → Workers & Pages → luminabulige-app
- **Framework preset**: `Next.js (Static HTML Export)`
- **Root directory**: `luminabulige_app` (note: underscore, not hyphen)
- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Environment variables** (in Settings → Environment variables):
  - `NODE_VERSION`: `18` or `20`
  - Add any other environment variables your app needs

**Important**: The root directory MUST be `luminabulige_app` (with underscore), not `/` or `luminabulige-app`

### 3. luminabulige-verify (Cloudflare Pages)

**Current Issue**: This appears to be a separate deployment of the same app.

**Recommendation 1** - If this is meant to be a separate subdomain of the same app:
- **Option A**: Delete this separate Pages project and configure a custom domain/subdomain in the main luminabulige-app project to point to the `/v` route

**Recommendation 2** - If this must be a separate deployment:
- Use the same configuration as luminabulige-app:
  - **Framework preset**: `Next.js (Static HTML Export)`
  - **Root directory**: `luminabulige_app`
  - **Build command**: `npm run build`
  - **Build output directory**: `out`
  - **Environment variables**: `NODE_VERSION=18`

### 4. luminabulige-admin (Cloudflare Pages)

**Current Issue**: Same as luminabulige-verify - appears to be a separate deployment of the same app.

**Recommendation 1** - If this is meant to be a separate subdomain accessing admin routes:
- **Option A**: Delete this separate Pages project and configure a custom domain in the main luminabulige-app project

**Recommendation 2** - If this must be a separate deployment:
- Use the same configuration as luminabulige-app:
  - **Framework preset**: `Next.js (Static HTML Export)`
  - **Root directory**: `luminabulige_app`
  - **Build command**: `npm run build`
  - **Build output directory**: `out`
  - **Environment variables**: `NODE_VERSION=18`

## Step-by-Step: Updating an Existing Pages Project

1. Go to Cloudflare Dashboard
2. Navigate to **Workers & Pages**
3. Click on the project name (e.g., "luminabulige-app")
4. Go to **Settings** → **Builds & deployments**
5. Click **Edit configuration**
6. Update the following fields:
   - Production branch: `main` (or your default branch)
   - Framework preset: Select `Next.js (Static HTML Export)` from dropdown
   - Root directory (optional): Enter `luminabulige_app`
   - Build command: `npm run build`
   - Build output directory: `out`
7. Click **Save**
8. Go to **Settings** → **Environment variables**
9. Add variable: `NODE_VERSION` = `18`
10. Click **Save**
11. Go back to **Deployments** and click **Retry deployment** on the latest failed deployment

## Step-by-Step: Updating Workers Project

1. Go to Cloudflare Dashboard
2. Navigate to **Workers & Pages**
3. Click on the worker name (e.g., "lumi-core-api")
4. Go to **Settings** → **Variables**
5. Add required environment variables:
   - `WISE_WEBHOOK_PUBLIC_KEY_PEM`: [Your key]
6. Go to **Settings** → **Bindings**
7. Add D1 Database binding:
   - Variable name: `DB`
   - Select your D1 database
8. Click **Deploy** to redeploy

## Verification

After making these changes, you should:

1. Trigger a new deployment by pushing a commit to the connected branch
2. Monitor the build logs in Cloudflare Dashboard → Deployments
3. Look for these success indicators:
   - ✓ Build successful
   - ✓ Deployment successful
   - Build output shows: "Route (app)" with page list

## Common Errors and Solutions

### Error: "No such file or directory"
- **Cause**: Root directory is set incorrectly
- **Solution**: Set root directory to `luminabulige_app` (with underscore)

### Error: "npm: command not found"
- **Cause**: Node.js is not available in the build environment
- **Solution**: Set `NODE_VERSION` environment variable to `18` or `20`

### Error: "Build failed"
- **Cause**: Missing dependencies or incorrect build command
- **Solution**: 
  1. Verify package.json exists in the root directory
  2. Verify build command is `npm run build`
  3. Check that all dependencies are listed in package.json

### Error: "Output directory not found"
- **Cause**: Build output directory setting doesn't match Next.js config
- **Solution**: Set build output directory to `out` (not `.next`)

### Worker Error: "Cannot find module 'src/index.ts'"
- **Cause**: Worker root directory or entry point is incorrect
- **Solution**: 
  1. Set root directory to `lumi-core-api`
  2. Ensure wrangler.toml has `main = "src/index.ts"`
  3. Redeploy using Wrangler CLI if dashboard deploy fails

## References

- Cloudflare Pages Framework Guides: https://developers.cloudflare.com/pages/framework-guides/
- Next.js on Cloudflare Pages: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- Cloudflare Workers Configuration: https://developers.cloudflare.com/workers/configuration/
- Project deployment docs: See `CLOUDFLARE_DEPLOYMENT.md` in this repository
