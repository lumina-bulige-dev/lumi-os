# Welcome to LUMINA BULIGE - LUMI OS

**Money Flow Stabilizer — Track your floor. Build a 30-day safety record.**

![LUMI OS](39A645C2-D6DF-4BF2-8F57-7489C4C7A89F.png)

<!-- dash-content-start -->

LUMI OS is the canonical source of truth for all core operating-system components of LUMINA BULIGE. This repository contains the specifications, rules, algorithms, and web applications that power the LUMINA BULIGE money flow stabilizer system.

## Features

- 🏦 **Money Floor Protection** - Track and protect your financial floor (paket_bigzoon)
- 📊 **30-Day Safety Log** - Build a continuous safety record
- 🔒 **Privacy-First** - No custody, no holding your money
- 📈 **Aurora Fee Analyzer** - Compare hidden costs in international transfers
- 🎯 **Simple & Auditable** - Transparent financial tracking
- 📖 **Comprehensive OS Specification** - Full META rules and algorithms documented

<!-- dash-content-end -->

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Repository Structure

This monorepo contains multiple components:

- **`/luminabulige_app/`** - Main Next.js web application (app.luminabulige.com)
- **`/lumi-core-api/`** - Cloudflare Workers API
- **`/index.html`** - Static landing page (luminabulige.com)
- **`/specifications/`** - LUMI OS specifications
- **`/protocols/`** - System protocols
- **`/rules/`** - META rules and algorithms

> **Note:** The root `/app/` directory contains legacy code and should not be edited.

### Installation

Install dependencies for the main application:

```bash
cd luminabulige_app
npm install
```

Install dependencies for the API:

```bash
cd lumi-core-api
npm install
```

### Development

#### Running the Web Application

Start the development server for the main application:

```bash
cd luminabulige_app
npm run dev
```

Your application will be available at `http://localhost:3000`.

#### Running the API

Deploy or test the Cloudflare Workers API:

```bash
cd lumi-core-api
npx wrangler dev
```

### Building for Production

#### Build the Web Application

Create a production build of the Next.js application:

```bash
cd luminabulige_app
npm run build
```

#### Build Static Landing Page

The static landing page (`/index.html`) is served directly and doesn't require a build step.

### Deployment

#### Deploy the Web Application

The Next.js application uses static export (`output: "export"`):

```bash
cd luminabulige_app
npm run build
npm run start
```

#### Deploy the API

Deploy the Cloudflare Workers API:

```bash
cd lumi-core-api
npm run deploy
```

## LUMI OS Specifications

### What is "Canonical" in LUMI?

Only items that satisfy both conditions become official OS:
1. Adopted by A：HQ
2. Saved here in lumi-os

"If it is not in lumi-os, it is not official."

### Core Components

- **paket_bigzoon (Floor)** - Minimum survival + fixed obligations buffer
- **SAFE_NULL Day** - Break harmful loops and reset decision pressure
- **statict2x Rule** - Behavioral brake to prevent action frequency spikes
- **1D Rule** - Disable multi-option decision making under cognitive overload
- **Aurora / Dark Zoning** - Risk-score-driven behavioral classification

### Financial Algorithm

```
state_t = {
    balance_total,
    paket_floor,
    fixed_must,
    living_min,
    risk_score,
    hidden_cost_month
}

reaction(state_t, action_t) → state_{t+1}
```

For detailed specifications, governance model, and architectural documentation, see **[README_SPEC.md](./README_SPEC.md)**.

## System Ownership

See **[RESPONSIBILITY.md](./RESPONSIBILITY.md)** for the complete system ownership map (single source of truth).

## CLASS Boundaries

- **A：HQ** - OS creation, META creation, rule approval
- **B：INFRA** - Implements algorithms (no rule creation)
- **C：PRODUCT** - UI/UX implementations (obeys OS constraints)
- **D：GTM** - Messaging/communication (obeys regulatory boundaries)
- **E：DEEP** - Ideas and intuition (not authoritative, routed through A)

## Contributing

Only A：HQ may push canonical updates.

**Flow:**
```
E (Deep Source) → AI_E structuring → A:HQ adoption → lumi-os (canonical)
```

All classes must read from the main branch of this repo.

## License

MIT License - see [LICENSE](./LICENSE)

---

Built with ❤️ for transparent, safe money flow management.

**LUMINA BULIGE LLC** — Privacy-first · No custody · Simple & auditable
