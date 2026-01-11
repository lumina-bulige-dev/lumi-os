# GitHub Copilot Instructions for lumi-os

## Project Overview

This repository (`lumi-os`) is the canonical source of truth for all core operating system components of LUMINA BULIGE. It contains:
- Core OS definitions and META rules
- System rules (financial floors, SAFE_NULL, statict2x, etc.)
- Algorithms (state → action → reaction update system)
- Specifications officially adopted by A:HQ (Headquarters Layer)

**Golden Rule**: "If it is not in lumi-os, it is not official."

## Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Library**: React 18
- **Deployment**: Cloudflare Pages and Workers
- **Package Manager**: npm

## Project Structure

```
/luminabulige_app/    # Main UI application (app.luminabulige.com)
/lumi-core-api/       # API endpoints and webhooks (api.luminabulige.com)
/lumi-core-web/       # Web/LP/Blog (luminabulige.com)
/rules/               # System rules and constraints
/protocols/           # Communication protocols
/specifications/      # Official specifications
/diagrams/            # Architecture diagrams
```

See `RESPONSIBILITY.md` for the single source of truth on repository structure.

## Code Standards and Conventions

### TypeScript
- Use TypeScript for all new files
- Prefer explicit typing over implicit
- Current config has `strict: false` but aim for type safety where possible
- Use modern ES2017+ features

### React/Next.js
- Use functional components
- Follow Next.js App Router conventions
- Place components in appropriate directories under `/app`
- Use client components (`'use client'`) only when necessary

### File Organization
- Keep related files together by feature/domain
- Follow the existing directory structure
- Maintain clear separation between domains (A/B/C/D/E classes)

### Naming Conventions
- Files: Use camelCase for TypeScript files (e.g., `HomeClient.tsx`)
- Components: Use PascalCase for React components
- Constants: Use UPPER_SNAKE_CASE for constants
- Variables: Use camelCase

## Domain Boundaries (Critical)

**Constitutional Rule**: "Not crossing specialized domains is the only way to keep LUMI from breaking."

### Class System
- **A:HQ**: OS creation, META creation, rule approval (only A can write to lumi-os)
- **B:INFRA**: Algorithm implementation (cannot create/modify rules)
- **C:PRODUCT**: UI/UX implementation (must obey OS constraints exactly)
- **D:GTM**: Messaging/LP/communication (must obey regulatory boundaries)
- **E:DEEP**: Ideas and intuition (not authoritative until adopted by A:HQ)

**Important**: Never allow cross-domain violations. Each class operates strictly within its domain.

## Financial System Rules

### Core Algorithms
- State representation: `state_t = { balance_total, paket_floor, fixed_must, living_min, risk_score, hidden_cost_month }`
- Action representation: `action_t = { amount, type, fee_visible, fee_effective }`
- Update function: `reaction(state_t, action_t) → state_{t+1}`

### Safety Constraints
- Never violate financial floors silently
- Always track hidden costs
- Risk score must respond to user behavior
- Every action must update OS deterministically

### AUTO_AURORA_ROUTER Rules
1. LUMI fee only when `saving > 0`
2. Require `user_gain ≥ 0` (never cause losses)
3. No proposals when RED (floor violation), `LUMI_fee = 0`
4. Always require user approval (no automatic execution)
5. Store all logs in tamper-proof format

## Build and Development

### Build Commands
```bash
npm run build    # Build Next.js application
npm run start    # Start production server
```

### Project Setup
- TypeScript configuration is in `tsconfig.json`
- Next.js configuration is in `next.config.js`
- Dependencies are managed via `package.json`

## Git Workflow

- GitHub is the source of truth
- Main branch contains canonical specifications
- Follow the contribution protocol: E → AI_E → A:HQ adoption → lumi-os
- Only A:HQ may push canonical updates

## Key Documents

- `README.md`: Project overview and architecture
- `RESPONSIBILITY.md`: Single source of truth for system ownership
- `LUMI_CONSTITUTION_v1.0.md`: Constitutional rules
- `LUMI_CLASS_MODEL_v1.x.md`: Class system model

## Security and Compliance

- Follow fintech regulatory boundaries
- Never expose sensitive financial data
- Maintain audit trails for all financial operations
- Respect privacy and data protection requirements

## Code Review Guidelines

- Ensure changes respect domain boundaries
- Verify financial safety constraints are maintained
- Check for consistency with existing OS rules
- Validate that changes align with the class system
- Ensure no regulatory violations

## Testing

- Test financial calculations thoroughly
- Validate state transitions
- Ensure floor constraints are never violated
- Test edge cases for risk scenarios

## Additional Notes

- The repository contains both production code and canonical specifications
- `luminabulige_app` contains the main UI application
- Current production LP is served from root `index.html` (migration to `lumi-core-web` planned)
- Cloudflare Dashboard Editor is for emergencies only
- Never route `app.luminabulige.com/*` to Workers (see RESPONSIBILITY.md)
