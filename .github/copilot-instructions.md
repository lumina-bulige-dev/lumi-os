# GitHub Copilot Instructions for lumi-os

## Repository Overview

**lumi-os** is the canonical specification repository for LUMINA BULIGE—a financial OS designed to prevent user harm, not maximize profit. It is the single source of truth for:
- Core OS definitions and META rules
- Financial algorithms (state → action → reaction)
- System rules (financial floors, SAFE_NULL, statict2x, etc.)
- Specifications officially adopted by A:HQ (Headquarters Layer)

**Critical principle**: "If it is not in lumi-os, it is not official."

## Technology Stack

- **Frontend**: Next.js 14 with React 18, TypeScript 5.7
- **Deployment**: Cloudflare Pages (static export via `next build`)
- **API**: Cloudflare Workers (in `lumi-core-api/`)
- **Build**: Node.js 20, npm
- **TypeScript**: Strict mode is disabled (`"strict": false` in tsconfig.json)

## Build & Test Commands

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Start production server
npm start

# Deploy API (Cloudflare Workers)
cd lumi-core-api && npx wrangler deploy --env production
```

## Architecture & Repository Structure

### Deployment Domains
- **app.luminabulige.com**: Main UI (from `luminabulige_app/`)
- **api.luminabulige.com**: API endpoints/webhooks (from `lumi-core-api/`)
- **luminabulige.com**: Web/LP - currently from root `index.html`, future: `lumi-core-web/`

### Class System (Immutable Boundaries)

The LUMI system operates with strict class boundaries. **Never cross these domains:**

- **A:HQ** (Headquarters): OS creation, META rules, algorithm approval, canonical updates
  - Only A:HQ can write to lumi-os
  - Only A:HQ can run automatic consistency checks
  
- **B:INFRA** (Infrastructure): Implements algorithms defined in lumi-os
  - May not create or modify rules
  - May not cross into lending/custody/leverage/investment
  
- **C:PRODUCT**: UI/UX implementations
  - Must obey OS constraints exactly
  
- **D:GTM**: Messaging/LP/communication
  - Must obey rules and regulatory boundaries
  
- **E:DEEP**: Source of ideas, intuition, deep-dive content
  - Not authoritative—must route through A:HQ before becoming specification

## Core OS Rules & Algorithms

### Financial Safety Components
1. **paket_bigzoon**: Minimum survival + fixed obligations buffer (never violate)
2. **SAFE_NULL Day**: Break harmful loops, reset decision pressure
3. **statict2x Rule**: Behavioral brake to prevent action frequency spikes
4. **1D Rule**: Disable multi-option decisions under cognitive overload
5. **RULE_ROPE_LOCK**: High-risk state requiring explicit slowing operations
6. **Aurora/Dark Zoning**: Risk-score-driven behavioral environments

### State Model
```typescript
state_t = {
    balance_total,
    paket_floor,
    fixed_must,
    living_min,
    risk_score,
    hidden_cost_month
}
```

### Update Function
`reaction(state_t, action_t) → state_{t+1}`

Every financial action must:
- Never violate floors silently
- Accumulate hidden costs
- Update risk score deterministically
- Maintain audit trail

## Coding Conventions

### TypeScript
- TypeScript strict mode is **disabled** in this project
- Use `.ts` for logic, `.tsx` for React components
- Prefer explicit type annotations for public APIs
- Allow implicit types for internal implementation

### File Organization
- Keep canonical documents (`.md` specs) at repository root
- App code in `luminabulige_app/app/`
- API code in `lumi-core-api/src/`
- Shared types in appropriate subdirectories

### Comments & Documentation
- Prefer self-documenting code
- Add comments for complex financial logic or OS constraints
- Document all META rules and safety boundaries
- Use bilingual comments (EN/JA) for core specifications

## Important Constraints

### Security & Regulatory
- Never expose Cloudflare tokens or secrets
- All financial actions require explicit user approval
- No automatic execution of financial operations
- Maintain immutable audit logs for all financial transactions
- AUTO_AURORA_ROUTER rules:
  - Fee only when `saving > 0`
  - `user_gain ≥ 0` mandatory (never harm user)
  - No proposals when floor is violated (RED state)
  - Fee split parameter: `0.10 ≤ alpha ≤ 0.75`

### Immutable Rules
- **Never** allow optimization that violates `paket_bigzoon` floor
- **Never** auto-execute financial decisions without user consent
- **Never** cross class boundaries (A/B/C/D/E system)
- **Never** modify canonical specifications without A:HQ approval

### Deployment
- GitHub is the source of truth—never edit directly in Cloudflare Dashboard
- Cloudflare Dashboard is for emergency viewing/logs only
- Workers routes: `api.luminabulige.com/*` only
- Never route `app.luminabulige.com/*` to Workers

## Design Philosophy

### Core Principles (from LUMI_CONSTITUTION)
- **No prediction**: Illuminate one step before breaking, don't predict future
- **No commands**: Never instruct, assert, or threaten users
- **User autonomy**: Final decisions always belong to the user
- **Human dignity**: Success ≠ character, failure ≠ character

### Definition of Success
- **Failure**: Trapping users in dependency
- **Success**: Users no longer need the system

## Git Workflow

### Contribution Protocol
1. E writes raw content (no editing)
2. Label with class: A-CORE / B-INFRA / C-PRODUCT / D-GTM / E-DIVE
3. AI_E structures the content
4. A:HQ decides: Adopt / Hold / Reject
5. Adopted items enter lumi-os as canonical

### Commit Messages
- Use clear, descriptive messages
- Reference issue numbers when applicable
- Keep commits focused and atomic

## When Working on Code Changes

1. **Always** check if changes violate class boundaries
2. **Always** verify financial floors are not silently violated
3. **Always** ensure user approval is required for financial actions
4. **Always** maintain deterministic state updates
5. **Always** preserve audit trails
6. **Never** introduce automatic financial execution
7. **Never** compromise user autonomy or dignity
8. **Never** modify canonical specs without understanding the META rules

## Reference Documents

Key files to consult:
- `README.md`: Repository purpose and governance
- `RESPONSIBILITY.md`: System ownership map (single source of truth)
- `LUMI_CONSTITUTION_v1.0.md`: Core principles and philosophy
- `LUMI_CLASS_MODEL_v1.x.md`: Class system details
- `LUMI_WHAT_CANONICAL_POLICY_v1.0.md`: Canonical governance rules

## Testing Approach

- Test financial algorithms for floor violations
- Verify state transitions are deterministic
- Ensure user approval checkpoints exist
- Validate risk score calculations
- Test boundary conditions for all financial operations
