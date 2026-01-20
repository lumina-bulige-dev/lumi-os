---
name: "B1: Admin(AZR) 管制UI スケルトン"
about: "AZR 管制UIのルーティングと認証ガードのスケルトン"
title: "B1: Admin(AZR) 管制UI スケルトン（/azr/*, human-only）"
labels: ["area:azr", "type:ui"]
assignees: []
---

# B1: Admin(AZR) 管制UI スケルトン（/azr/*, human-only）

## 担当
- @TBD

## 期日
- YYYY-MM-DD

## やること
- ルーティング（Next app router）

```
app/(azr)/azr/
  console/page.tsx
  backlog/page.tsx
  audit/page.tsx
  settings/page.tsx
```

- middleware.ts で /azr/* に認証/署名ガード
- 画面に明記：「Decision support. No automatic approvals.」
- 枠のみ：Decision Flow / Operator Notes / Suggestions / Open Risks / Runbook（読取りUI可）

## DoD
- /azr/console が 200（管理者のみアクセス）
- 画面に No automatic approvals 表記
