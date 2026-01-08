# COPAPI Implementation Summary

## Overview
This document summarizes the implementation of the 4 Core OS Policy APIs (COPAPI) as specified in `specifications/LUMI_CORE_HOME_MVP_API_POLICY_v1.0.md`.

## Implemented APIs

### 1. GET /api/v1/core/home_state
**Purpose**: Returns home screen summary data

**Path**: `/api/v1/core/home_state` or `/core/home_state`

**Method**: GET

**Query Parameters** (optional, for testing):
- `state`: "safe" | "warning" | "danger" (defaults to "safe")

**Response Example**:
```json
{
  "balance_total": 320000,
  "paket_bigzoon": 300000,
  "floor_status": "SAFE",
  "challenge": {
    "day_in_challenge": 7,
    "is_safe_null_today": true,
    "safe_move_limit": 0
  },
  "heart": {
    "risk_mode": "NORMAL"
  }
}
```

**Implementation**: Currently uses mock data from `src/mocks/home_state.ts`. Set `DATA_MODE=mock` environment variable to enable mock mode.

---

### 2. POST /api/v1/os/reaction
**Purpose**: Core OS calculation engine - computes state transitions based on actions

**Path**: `/api/v1/os/reaction` or `/os/reaction`

**Method**: POST

**Request Body**:
```json
{
  "state": {
    "balance_total": 320000,
    "paket_floor": 250000,
    "fixed_must": 120000,
    "living_min": 80000,
    "risk_score": 35,
    "hidden_cost_month": 4500
  },
  "action": {
    "amount": 50000,
    "type": "international_transfer",
    "fee_visible": 300,
    "fee_effective": 0.012,
    "fee_current": 950,
    "fee_candidate_list": [
      { "provider": "wise", "fee_total": 730 },
      { "provider": "bank_x", "fee_total": 880 }
    ]
  },
  "options": {
    "include_router_decision": true,
    "include_diagnostics": true
  }
}
```

**Response Example**:
```json
{
  "state_before": { ... },
  "state_after": {
    "balance_total": 270000,
    "paket_floor": 250000,
    "fixed_must": 120000,
    "living_min": 80000,
    "risk_score": 42,
    "hidden_cost_month": 5450
  },
  "metrics": {
    "delta_gap": -50000,
    "safety_gap_before": 70000,
    "safety_gap_after": 20000,
    "floor_status_before": "SAFE",
    "floor_status_after": "WARN",
    "zone_before": "Aurora",
    "zone_after": "Dark"
  },
  "alerts": [
    {
      "level": "warning",
      "code": "FLOOR_WARN",
      "message": "この支払いで、床との距離が 20,000 円まで近づきます。"
    }
  ],
  "router_decision": { ... },
  "diagnostics": { ... }
}
```

**Features**:
- Calculates balance changes
- Determines floor status (SAFE/WARN/RED)
- Computes safety gaps and zones
- Generates alerts based on floor proximity
- Optional router decision calculation (Aurora fee optimization)
- Optional diagnostics for debugging

---

### 3. POST /api/v1/goal/buffer
**Purpose**: Calculate floor (paket_bigzoon) based on financial parameters

**Path**: `/api/v1/goal/buffer` or `/goal/buffer`

**Method**: POST

**Request Body**:
```json
{
  "fixed_must": 120000,
  "living_min": 80000,
  "buffer_multiplier": 50000
}
```

**Response Example**:
```json
{
  "paket_bigzoon": 250000,
  "components": {
    "fixed_must": 120000,
    "living_min": 80000,
    "buffer_multiplier": 50000
  },
  "formula": "paket_bigzoon = fixed_must + living_min + buffer_multiplier"
}
```

**Formula**: `paket_bigzoon = fixed_must + living_min + buffer_multiplier`

---

### 4. GET /api/v1/links/wise
**Purpose**: Returns Wise referral link

**Path**: `/api/v1/links/wise` or `/links/wise`

**Method**: GET

**Response Example**:
```json
{
  "url": "https://wise.com/jp/invite/asd/luminabulige"
}
```

**Configuration**: Set `WISE_REFERRAL_URL` environment variable to configure the referral URL.

---

## Environment Variables

- `DATA_MODE`: Set to "mock" to use mock data (default for MVP)
- `WISE_REFERRAL_URL`: Wise referral link URL
- `ADMIN_KEY`: Admin authentication key (for protected endpoints)
- `INVITE_SIGNING_KEY`: Key for invite token signing

---

## Path Normalization

The API automatically normalizes paths by:
1. Removing `/api/v1` prefix
2. Removing trailing slashes
3. Supporting both full and shortened paths

Examples:
- `/api/v1/core/home_state` → `/core/home_state`
- `/api/v1/os/reaction/` → `/os/reaction`

---

## Testing

Run the logic test:
```bash
node /tmp/test-api-simple.js
```

This verifies:
- Mock data structure
- Path normalization
- Floor calculation logic
- OS reaction calculations
- Zone determinations

---

## Integration Notes

The frontend in `app/` is ready to consume these APIs:
- `app/lib/api.ts` contains fetch functions
- `app/lib/types.ts` defines TypeScript types
- `app/lib/mapper.ts` maps API responses to UI state

Currently, the frontend uses hardcoded mock data. To integrate:
1. Update `app/HomeClient.tsx` to call `fetchHomeState()` from `app/lib/api.ts`
2. Set the worker URL in production environment
3. Configure environment variables in Cloudflare Workers

---

## Compliance with Specification

✓ All 4 required APIs implemented as specified in `LUMI_CORE_HOME_MVP_API_POLICY_v1.0.md`
✓ Response formats match canonical specification
✓ MVP safety rules enforced (calculation only, no execution)
✓ No prohibited functionality (lending, custody, leverage, investment)
✓ Mock data mode for development and testing
✓ TypeScript typing for type safety

---

## Future Enhancements

- Database integration for real user data
- Production authentication and authorization
- Rate limiting and quota management
- Logging and monitoring
- Performance optimization
- Comprehensive test suite
