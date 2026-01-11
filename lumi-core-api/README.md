# lumi-core-api

Cloudflare Workers API for LUMINA BULIGE

## Purpose
- Webhooks (Wise payment notifications)
- API endpoints
- Domain: api.luminabulige.com/*

## Structure
```
lumi-core-api/
├── src/
│   └── index.ts        # Main worker entry point
├── wrangler.toml       # Cloudflare Workers configuration
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Endpoints
- `GET /health` - Health check endpoint
- `POST /webhooks/wise` - Wise payment webhook receiver
- `GET|HEAD /webhooks/wise` - Wise URL verification

## Development

### Prerequisites
- Node.js >= 18
- Wrangler CLI (`npm install -g wrangler`)

### Local Development
```bash
npm install
npm run dev
```

### Deployment
```bash
npm run deploy
```

## Configuration

### Environment Variables (Cloudflare Dashboard)
- `WISE_WEBHOOK_PUBLIC_KEY_PEM` - RSA public key for verifying Wise webhook signatures

### D1 Database Binding
- `DB` - D1 database binding for storing webhook events

Database schema:
```sql
CREATE TABLE wise_webhook_events (
  id TEXT PRIMARY KEY,
  received_at INTEGER NOT NULL,
  event_type TEXT,
  payload_json TEXT NOT NULL,
  raw_b64 TEXT NOT NULL
);
```

## References
- See `RESPONSIBILITY.md` in repository root for system ownership
- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
