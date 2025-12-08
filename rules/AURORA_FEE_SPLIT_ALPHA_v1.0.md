🔔A-CORE / NOTICE  
LUMI Canonical Header Policy v1.2

※本ファイルは A：HQ（Founder＋LUMI_A）のみ編集可。  
B／C／D／E は参照のみとし、文言の引用・改変は禁止とする。

本ファイルは LUMI OS 正本（lumi-os/）の一部であり、  
内容の改変・加筆・派生仕様の生成・PR 提案は A：HQ 以外のクラスには認められない。

If it is not in lumi-os, it is not official.
# AURORA_FEE_SPLIT_ALPHA v1.0  
(Distribution Rules for AUTO_AURORA_ROUTER)

## 1. Definition of α (Alpha)

Alpha (α) represents the revenue share LUMI receives **from the partner’s fee income**.  
It **never increases the user’s effective_fee_rate**, and LUMI only receives revenue when the user saves money (saving > 0).

- α applies exclusively to:  
  **partner_fee_income**  
- α does **not** apply to:  
  - user cost  
  - visible fee  
  - effective_fee_rate  

---

## 2. Default α_max (Initial Upper Bound)
理由（Rationale）:
- レベニューシェアの一般的レンジ（0.20〜0.40）内である  
- パートナー側に十分な利益を残す  
- LUMI の持続運営にも耐久性がある  
- ユーザー負担ゼロ構造と完全に整合する  

---

## 3. Guard Range for α_max

LUMI OS が許容する α_max の範囲：

0.00 ≤ α_max ≤ 0.40
### 0.40 を超える α を設定したい場合：
- **A：HQ の個別承認が必須**  
- 専用ファイルを `/rules/custom/` に作成し、案件別に明示する  

---

## 4. Immutable User-Protective Principle

Aurora ルートがユーザーに提示されるためには、以下 2 条件を全て満たすこと。

1. **effective_fee_rate が従来より悪化しない**
2. **できる限り従来より低いコストを提示する**

したがって：

- LUMI 経由が “高くなる” ケースは **完全禁止（0%）**  
- saving ≤ 0 の場合、Aurora ルートは一切提示しない  

---

## 5. Interaction with AUTO_AURORA_ROUTER

Router が saving を計算した後、分配は以下：

LUMI_fee   = saving * α
user_gain  = saving - LUMI_fee
不変ルール：

- user_gain ≥ 0 を必ず保証  
- RED（床割れ）状態では α = 0  
- LUMI_fee は必ず「ユーザーの得からのみ」発生  

---

## 6. Canonical Status

本ファイルは LUMI OS の正式仕様（canonical rule）であり、  
以下を上書きする：

- 既存の Aurora 手数料ルール草案  
- AI 生成の α 設定ドラフト  

*A：HQ により採択済み（GIT_PUSH_READY）*  





