# LUMINA BULIGE Repo Responsibility (Single Source of Truth)

## App (Cloudflare Pages)
repo: lumina-bulige-dev
root: luminabulige_app/
domain: app.luminabulige.com/*
purpose: UI / Wise trigger (client)

## API (Cloudflare Workers)
repo: lumina-bulige-dev
path: lumi-core-api/src/index.ts
domain: api.luminabulige.com/*
purpose: webhooks/wise, API endpoints

## Web/LP (Cloudflare Pages)
repo: lumina-bulige-dev
root: lumi-core-web/
domain: luminabulige.com/*
purpose: /blog /legal /about

## Rules
- GitHub is the source of truth
- Cloudflare Dashboard Editor is emergency-only
- Never route app.luminabulige.com/* to Workers
