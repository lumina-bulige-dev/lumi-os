# /watch API

## Endpoint
POST `https://poc-ai.luminabulige.workers.dev/watch`

## Auth
Header: `X-LB-Token: <YOUR_LB_TOKEN>`

## Example (curl)
```bash
curl -i -X POST "https://poc-ai.luminabulige.workers.dev/watch" \
  -H "Content-Type: application/json" \
  -H "X-LB-Token: <YOUR_LB_TOKEN>" \
  --data '{"mode":"summarize","text":"これはテストです","lang":"ja"}'
