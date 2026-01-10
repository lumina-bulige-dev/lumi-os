# LUMI OS - Local Development Setup Guide

This guide provides step-by-step instructions for setting up the LUMI OS development environment on your local machine.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Development Server](#running-the-development-server)
4. [Building the Project](#building-the-project)
5. [Working with lumi-core-api (Cloudflare Workers)](#working-with-lumi-core-api-cloudflare-workers)
6. [Testing](#testing)
7. [Project Structure](#project-structure)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js**: Version 20.x or later (LTS recommended)
  - Download from: https://nodejs.org/
  - Check version: `node --version`
  
- **npm**: Version 9.x or later (comes with Node.js)
  - Check version: `npm --version`
  - **Alternative**: You can use `pnpm` or `yarn` if preferred

- **Git**: For version control
  - Download from: https://git-scm.com/
  - Check version: `git --version`

### Supported Operating Systems

- **Linux**: Ubuntu 20.04+, Debian 11+, or other modern distributions
- **macOS**: macOS 11 (Big Sur) or later
- **Windows**: Windows 10/11 with WSL2 recommended, or native Windows

### Optional Tools

- **Docker**: For containerized development (optional)
- **Cloudflare Wrangler CLI**: For deploying and testing Cloudflare Workers locally
- **VSCode** or your preferred code editor

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/lumina-bulige-dev/lumi-os.git
cd lumi-os
```

### 2. Install Dependencies

#### Main Project (Next.js Application)

```bash
# Using npm (default)
npm install

# Or using pnpm
pnpm install

# Or using yarn
yarn install
```

#### lumi-core-api (Cloudflare Workers)

```bash
cd lumi-core-api
npm install
cd ..
```

### 3. Verify Installation

After installation, verify that dependencies are correctly installed:

```bash
# Check that node_modules exists
ls -la node_modules

# Verify Next.js is installed
npx next --version
```

## Running the Development Server

### Start the Next.js Development Server

```bash
npm run build
npm run start
```

The application will be available at:
- **Local**: http://localhost:3000

Note: This project uses `next build` and `next start` as it is configured with `output: "export"` in `next.config.js`. For hot-reload development, you can add a `dev` script to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

Then run:
```bash
npm run dev
```

### Auto-reload on Changes

When using `npm run dev`, the development server will automatically reload when you make changes to:
- React components in `/app`
- TypeScript/JavaScript files
- CSS files
- Configuration files

## Building the Project

### Production Build

Create an optimized production build:

```bash
npm run build
```

This will:
1. Compile TypeScript files
2. Bundle and optimize JavaScript
3. Generate static files in the `/out` directory (for static export)
4. Optimize images and assets

### Test Production Build Locally

After building, test the production build:

```bash
npm run start
```

## Working with lumi-core-api (Cloudflare Workers)

The `lumi-core-api` directory contains Cloudflare Workers code for the API layer.

### Local Development with Wrangler

```bash
cd lumi-core-api

# Install wrangler if not already installed
npm install

# Start local development server
npx wrangler dev
```

This will start a local Cloudflare Workers environment.

### Deploy to Cloudflare (Production)

```bash
cd lumi-core-api

# Deploy to production
npm run deploy
```

**Note**: You'll need Cloudflare credentials configured:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Configure Wrangler

Check `lumi-core-api/wrangler.toml` for configuration options.

## Testing

Currently, this project does not have automated tests configured. If you'd like to add testing:

### Recommended Testing Tools

- **Jest**: For unit testing
- **React Testing Library**: For component testing
- **Playwright** or **Cypress**: For E2E testing

### Running Linters

To maintain code quality, you can add linting tools:

```bash
# Install ESLint (optional)
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Run linter
npx eslint . --ext .ts,.tsx,.js,.jsx
```

## Project Structure

```
lumi-os/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lumi-core-api/         # Cloudflare Workers API
│   ├── src/               # Worker source code
│   ├── package.json       # API dependencies
│   └── wrangler.toml      # Cloudflare configuration
├── lumi-core-web/         # Mock data and web core
│   └── mock/              # Mock JSON payloads
├── protocols/             # Protocol definitions
├── rules/                 # System rules
├── specifications/        # Specifications
├── package.json           # Main dependencies
├── tsconfig.json          # TypeScript configuration
├── next.config.js         # Next.js configuration
└── README.md              # Project overview
```

## Troubleshooting

### Common Issues

#### 1. Node Version Mismatch

**Problem**: Errors related to Node.js version compatibility.

**Solution**: Use Node.js 20.x or later. Use `nvm` (Node Version Manager) to switch versions:

```bash
# Install nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node 20
nvm install 20
nvm use 20
```

#### 2. npm install Fails

**Problem**: Installation fails with permission errors or network issues.

**Solutions**:

```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install

# Or use --legacy-peer-deps flag
npm install --legacy-peer-deps
```

#### 3. Port 3000 Already in Use

**Problem**: Another application is using port 3000.

**Solution**: Stop the other application or use a different port:

```bash
PORT=3001 npm run dev
```

#### 4. TypeScript Errors

**Problem**: TypeScript compilation errors.

**Solution**: Ensure you have the correct TypeScript version:

```bash
npm install --save-dev typescript@^5.7.0
```

#### 5. Cloudflare Wrangler Issues

**Problem**: Wrangler commands fail.

**Solution**:

```bash
# Authenticate with Cloudflare
npx wrangler login

# Check configuration
npx wrangler whoami
```

#### 6. Build Errors Related to Path Aliases

**Problem**: Build fails with "Cannot find module '@/app/components/...'".

**Solution**: This is a known issue with the repository. The `@` path alias may not be configured in `tsconfig.json`. You can either:

1. Add path aliases to `tsconfig.json`:
```json
{
  "compilerOptions": {
    ...
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

2. Or use relative imports instead of `@/` aliases in the affected files.

**Note**: Some parts of the codebase may have pre-existing build issues. Focus on the areas you're working on.

### Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/lumina-bulige-dev/lumi-os/issues)
2. Review the main [README.md](README.md) for project context
3. Check the official Next.js documentation: https://nextjs.org/docs
4. Check Cloudflare Workers documentation: https://developers.cloudflare.com/workers/

## Environment Variables

If your project requires environment variables, create a `.env.local` file:

```bash
# Example .env.local
NEXT_PUBLIC_API_URL=http://localhost:8787
```

**Note**: Never commit `.env.local` or any file containing secrets to version control.

## CI/CD

The project includes GitHub Actions workflows:

- **deploy-workers.yml**: Automatically deploys `lumi-core-api` to Cloudflare Workers on push to `main` branch

To run CI checks locally, you can:

```bash
# Build the project
npm run build

# Check TypeScript types
npx tsc --noEmit
```

## Next Steps

After setting up your development environment:

1. Read the [README.md](README.md) to understand the LUMI OS architecture
2. Review the canonical specifications in `/specifications`
3. Check the system rules in `/rules`
4. Explore the mock data in `/lumi-core-web/mock`

## Contributing

This is the canonical LUMI OS repository. Only A:HQ (Headquarters Layer) has write access to modify OS rules and specifications. For contribution workflow, refer to the main README.md.

---

**Last Updated**: 2026-01-10
