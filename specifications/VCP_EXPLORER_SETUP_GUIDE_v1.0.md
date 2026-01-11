# VCP_EXPLORER_SETUP_GUIDE_v1.0

**Visual Control Panel Explorer — Development Setup Guide**

🔔 **A-CORE / CANONICAL SPECIFICATION**

※本ファイルは A：HQ（Founder＋LUMI_A）のみ編集可。  
B／C／D／E／F／G は参照のみとし、文言の引用・改変は禁止とする。

本ファイルは LUMI OS 正本（lumi-os/）の一部であり、  
内容の改変・加筆・派生仕様の生成・PR 提案は A：HQ 以外のクラスには認められない。

**If it is not in lumi-os, it is not official.**

---

## 0. Purpose

VCP Explorer (Visual Control Panel Explorer) は、LUMI OS の開発・検証・デバッグを行うための開発者向けツールセットの総称である。

本ドキュメントは、以下のユースケースに対応する：

1. **B：INFRA** が API endpoints を開発・テストする環境
2. **C：PRODUCT** が UI components を構築・検証する環境  
3. **A：HQ** が OS の整合性を検証する環境
4. **F：GOV** がコンプライアンス監査を実施する環境

---

## 1. System Requirements

### 1.1 Minimum Requirements

- **Node.js**: v18.0.0 以上（推奨 v20.x LTS）
- **npm**: v9.0.0 以上
- **Git**: 2.30.0 以上
- **OS**: macOS 11+, Ubuntu 20.04+, Windows 10+ (WSL2推奨)

### 1.2 Recommended Development Environment

- **IDE**: Visual Studio Code 1.80+ with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
- **Browser**: Chrome 100+ または Firefox 100+ (Developer Tools 必須)
- **Terminal**: bash, zsh, または PowerShell 7+

---

## 2. Repository Structure

```
lumi-os/
├── app/                    # C：PRODUCT - Web UI components
│   ├── lib/               # Shared libraries and utilities
│   │   ├── api.ts         # API client functions
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── homeState.ts   # State management
│   │   └── mapper.ts      # Data transformation utilities
│   ├── HomeClient.tsx     # Main home screen component
│   └── page.tsx           # Next.js page entry point
├── specifications/         # A：CORE - Official specifications
│   ├── AURORA_CORE_v1.0.md
│   ├── HOME_SCREEN_OS_v1.0.md
│   └── MVP_API_REACTION_v1.0.md
├── protocols/             # A：CORE - Operating protocols
│   └── AUTO_CANONICAL_FLOW_PROTOCOL_v1.0.md
├── rules/                 # A：CORE - System rules
│   ├── AURORA_FEE_SPLIT_ALPHA_v1.0.md
│   └── MONEY_FLOW_STABILIZER_v1.0.md
└── lumi-os/              # Core OS definitions
    └── core-os/
```

---

## 3. Initial Setup

### 3.1 Clone Repository

```bash
# Clone the official lumi-os repository
git clone https://github.com/lumina-bulige-dev/lumi-os.git
cd lumi-os
```

### 3.2 Verify Git Configuration

```bash
# Verify you're on the correct branch
git branch -a

# Check repository status
git status
```

### 3.3 Environment Preparation

LUMI OS は現時点では外部パッケージマネージャーを使用していないため、  
Node.js と npm のセットアップのみ必要である。

```bash
# Verify Node.js version
node --version  # Should output v18.0.0 or higher

# Verify npm version
npm --version   # Should output v9.0.0 or higher
```

---

## 4. Development Workflow

### 4.1 Reading the Canonical Specifications

開発を開始する前に、必ず以下のドキュメントを読むこと：

1. **README.md** - Repository overview and governance model
2. **LUMI_CONSTITUTION_v1.0.md** - Core constitutional principles
3. **LUMI_CLASS_MODEL_v1.x.md** - Class boundaries (A/B/C/D/E/F)
4. **specifications/** - All relevant specification documents

### 4.2 Class Boundary Rules (重要)

各クラスは厳密に定義された責任範囲内でのみ作業すること：

**A：HQ**
- OS creation and rule approval
- META rules and algorithm approval  
- **Only A can write to lumi-os**

**B：INFRA**
- Implements algorithms defined in specifications
- **May not create or modify rules**
- **May not cross into lending/custody/leverage/investment arenas**

**C：PRODUCT**
- UI/UX implementations
- **Must obey OS constraints exactly**
- Implements based on specifications in specifications/

**D：GTM**
- Messaging, landing pages, communication
- **Must obey rules and regulatory boundaries**

**E：DEEP**
- Source of ideas and intuition
- **Not authoritative** - everything must route through A before becoming specification

**F：GOV**
- Regulatory compliance review
- Fintech boundary verification

### 4.3 Understanding the API Structure

LUMI OS は以下の API endpoints を使用する：

#### Core State API
```
GET https://luminabulige.com/api/v1/core/home_state
```

Response schema (`app/lib/types.ts` 参照):
```typescript
{
  balance_total: number;
  paket_bigzoon: number;
  floor_status: "SAFE" | "WARNING" | "DANGER";
  challenge: {
    day_in_challenge: number;
    is_safe_null_today: boolean;
    safe_move_limit: number;
  };
  heart: {
    risk_mode: "NORMAL" | "TIRED" | "RED";
  };
}
```

#### Aurora/Wise Affiliate API
```
GET https://luminabulige.com/api/v1/links/wise_affiliate
```

Response:
```json
{
  "wise_referral_url": "https://wise.com/invite/..."
}
```

---

## 5. Working with the Web Application

### 5.1 Local Development

現時点での Web アプリケーションは Next.js ベースで構築されている。

```bash
# If package.json exists in the future
npm install

# Start development server
npm run dev
```

**現時点での制約:**
- Web アプリケーションは Cloudflare Workers 環境で動作想定
- ローカル開発サーバーのセットアップは B：INFRA により今後整備される予定

### 5.2 Testing API Integration

API との統合をテストする際は、`app/lib/api.ts` を参照：

```typescript
import { fetchHomeState, fetchWiseReferral } from "./lib/api";

// Example usage
const state = await fetchHomeState();
console.log("Current floor status:", state.floor_status);

const wiseLink = await fetchWiseReferral();
console.log("Wise referral URL:", wiseLink.wise_referral_url);
```

### 5.3 Mock Data Testing

Production API が利用不可能な場合、`lumi-core-web` ディレクトリの mock data を使用可能：

```
lumi-core-web/
  mock/
    home_state/
      home_state.safe.json
      home_state.warning.json
      home_state.danger.json
```

---

## 6. Compliance and Safety Checks

### 6.1 Prohibited Actions (絶対禁止)

LUMI OS 開発時に **絶対に実装してはならない** 機能：

❌ 送金の代理実行  
❌ 資金の預かり（custody）  
❌ レバレッジ取引の提供  
❌ 投資アドバイスの提供  
❌ FX・投機の推奨  
❌ 自動実行（ユーザー承認なし）  
❌ `paket_bigzoon` (floor) を下回る操作の実行

### 6.2 Required Safeguards

開発時に **必ず実装すべき** セーフガード：

✅ Floor check before any financial action  
✅ Explicit user confirmation for all transactions  
✅ Transparency in all fee calculations  
✅ Clear display of rate assumptions and timestamps  
✅ Risk mode awareness in UI state  
✅ SAFE_NULL day enforcement

---

## 7. Code Review and Contribution Protocol

### 7.1 For Internal Classes (B/C/D/E)

1. **Read the relevant specification** in `specifications/` directory
2. **Implement according to spec** - no deviation allowed
3. **Self-review against spec** before requesting review
4. **Submit to A：HQ** for canonical approval
5. **Wait for adoption** - nothing is official until in lumi-os

### 7.2 Specification Update Flow

```
E (Deep Source) 
  → AI_E structuring 
    → A:HQ adoption 
      → lumi-os (canonical)
```

Only A：HQ may push canonical updates.

### 7.3 Version Control Rules

- All official specs follow semantic versioning: `_v{MAJOR}.{MINOR}.md`
- Never modify a versioned spec - create a new version
- Changelog entries required for all OS-level changes
- Commit messages must reference the class and specification

---

## 8. Debugging and Troubleshooting

### 8.1 Common Issues

**Issue: API returns 403 or 401**
- Check if you're using the correct API endpoint URL
- Verify authentication headers (if implemented)
- Ensure you're not violating rate limits

**Issue: Type mismatches in TypeScript**
- Verify `app/lib/types.ts` matches current API specification
- Check `specifications/MVP_API_REACTION_v1.0.md` for canonical type definitions
- Ensure no local modifications to official types

**Issue: Floor status calculation incorrect**
- Verify `balance_total` and `paket_bigzoon` values
- Check `floor_status` logic in backend matches OS specification
- Review `MONEY_FLOW_STABILIZER_v1.0.md` for floor calculation rules

### 8.2 Verification Commands

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Verify file structure
tree -L 2 app/

# Check git status for uncommitted changes
git status

# Verify you're on the correct branch
git branch
```

---

## 9. Deployment Considerations

### 9.1 Production Environment

- Production API: `https://luminabulige.com`
- All deployments must pass F：GOV review
- Regulatory compliance verification required before production
- Never deploy without A：HQ approval

### 9.2 Environment Variables

When environment variables are implemented, they must follow this pattern:

```bash
# API Configuration
API_BASE_URL=https://luminabulige.com
API_VERSION=v1

# Feature Flags (controlled by A：HQ)
ENABLE_AURORA_SIMULATOR=false
ENABLE_30DAY_CHALLENGE=true
```

### 9.3 Monitoring and Logging

- All financial actions must be logged immutably
- Floor violations must trigger immediate alerts
- Risk mode changes must be recorded with timestamp
- User consent must be stored for all significant actions

---

## 10. Security Guidelines

### 10.1 Data Protection

- Never log sensitive user data (balance, personal info)
- Use HTTPS for all API communications
- Implement proper CORS policies
- Validate all user inputs on both client and server

### 10.2 Code Security

- No hardcoded secrets or API keys in source code
- Use environment variables for configuration
- Implement rate limiting on API endpoints
- Follow principle of least privilege

---

## 11. Additional Resources

### 11.1 Official Documentation

- `README.md` - Repository overview
- `specifications/` - All canonical specifications
- `protocols/` - Operating protocols
- `rules/` - System rules and constraints

### 11.2 Key Specifications to Read

1. **HOME_SCREEN_OS_v1.0.md** - Home screen philosophy and requirements
2. **AURORA_CORE_v1.0.md** - Fee transparency core structure
3. **MVP_API_REACTION_v1.0.md** - API response specifications
4. **LUMI_CORE_HOME_MVP_API_POLICY_v1.0.md** - API policy and governance

### 11.3 Important Protocols

1. **AUTO_CANONICAL_FLOW_PROTOCOL_v1.0.md** - Canonical update workflow
2. **L-DEFENSE_PROTOCOL_v1.0.md** - Defense and safety protocols
3. **AI_FEEDBACK_RIGHTS_PROTOCOL_v1.0** - AI feedback guidelines

---

## 12. Contact and Support

### 12.1 Questions and Clarifications

For questions about:
- **Specifications**: Refer to A：HQ and canonical docs in lumi-os
- **Implementation**: Check relevant class guidelines (B/C/D/E/F)
- **Compliance**: Route through F：GOV for fintech boundary questions

### 12.2 Issue Reporting

When reporting issues:
1. Specify which class you belong to (A/B/C/D/E/F)
2. Reference the relevant specification document
3. Describe the observed vs. expected behavior
4. Include relevant code/logs (without sensitive data)

---

## 13. Changelog

### v1.0 (Initial Release)
- Established VCP Explorer setup guide structure
- Defined system requirements and development workflow
- Documented class boundaries and contribution protocol
- Added API structure and integration guidelines
- Included compliance, security, and deployment considerations

---

**Adopted by A：HQ**: 2026-01-11  
**Status**: CANONICAL

---

**End of VCP_EXPLORER_SETUP_GUIDE_v1.0**
