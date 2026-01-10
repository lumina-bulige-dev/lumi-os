# Contributing to LUMI OS
# LUMI OSへの貢献

Thank you for your interest in contributing to LUMI OS!

LUMI OSへの貢献に興味をお持ちいただきありがとうございます！

---

## Important: Class-Based Contribution Model
## 重要：クラスベースの貢献モデル

LUMI OS follows a strict class-based governance model. Please read this carefully before contributing.

LUMI OSは厳格なクラスベースのガバナンスモデルに従っています。貢献する前にこれを注意深くお読みください。

### Class Structure / クラス構造

**A:HQ (Headquarters Layer / 本部層)**
- **Authority**: OS creation, META rules, algorithm approval
- **Repository Access**: Write access to lumi-os
- **Role**: Only A:HQ can approve and merge changes to canonical OS documents

**B:INFRA (Infrastructure Layer / インフラ層)**
- **Authority**: Implementation of approved algorithms and rules
- **Restrictions**: Cannot create or modify rules
- **Contribution**: Code implementation, API development

**C:PRODUCT (Product Layer / プロダクト層)**
- **Authority**: UI/UX implementation
- **Restrictions**: Must obey OS constraints exactly
- **Contribution**: Frontend development, user experience improvements

**D:GTM (Go-To-Market Layer / GTM層)**
- **Authority**: Messaging, landing pages, communication
- **Restrictions**: Must obey rules and regulatory boundaries
- **Contribution**: Documentation, marketing materials

**E:DEEP (Deep Source Layer / 深層ソース層)**
- **Authority**: Source of ideas, intuition, deep-dive content
- **Status**: Not authoritative until approved by A:HQ
- **Contribution**: Proposals, research, concepts

---

## Contribution Workflow / 貢献ワークフロー

### For External Contributors / 外部貢献者向け

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone
   git clone https://github.com/YOUR_USERNAME/lumi-os.git
   cd lumi-os
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow existing code style
   - Write clear commit messages
   - Test your changes locally

4. **Submit a Pull Request**
   - Clearly describe what you're changing and why
   - Reference any related issues
   - Indicate which class layer your contribution relates to (B/C/D/E)

5. **Wait for Review**
   - A:HQ will review your contribution
   - Changes to core OS documents require A:HQ approval
   - Implementation code (B/C layers) may be reviewed by designated maintainers

### Internal Contribution Flow / 内部貢献フロー

```
E (Deep Source) 
  → AI_E structuring 
    → A:HQ adoption 
      → lumi-os (canonical)
```

All classes must read from the main branch of this repository.

すべてのクラスはこのリポジトリのmainブランチから読み取る必要があります。

---

## What Can I Contribute? / 何に貢献できますか？

### ✅ Welcome Contributions / 歓迎される貢献

- **Bug Fixes**: Code bugs, typos, broken links
  **バグ修正**：コードのバグ、タイプミス、壊れたリンク

- **Implementation Code**: API endpoints, UI components, utilities
  **実装コード**：APIエンドポイント、UIコンポーネント、ユーティリティ

- **Documentation**: Setup guides, tutorials, examples
  **ドキュメント**：セットアップガイド、チュートリアル、例

- **Tests**: Unit tests, integration tests, test infrastructure
  **テスト**：ユニットテスト、統合テスト、テストインフラ

- **Development Tools**: Build scripts, CI/CD improvements
  **開発ツール**：ビルドスクリプト、CI/CD改善

- **Accessibility**: A11y improvements, ARIA labels
  **アクセシビリティ**：A11y改善、ARIAラベル

- **Performance**: Optimization, caching, loading improvements
  **パフォーマンス**：最適化、キャッシング、読み込み改善

### ⚠️ Restricted Contributions / 制限される貢献

The following require A:HQ approval and may be rejected if submitted without prior discussion:

以下はA:HQの承認が必要で、事前の議論なしに提出された場合は却下される可能性があります：

- **OS Rules Changes**: Modifications to `/rules/*`
  **OSルールの変更**：`/rules/*`の変更

- **Specifications**: Changes to `/specifications/*`
  **仕様**：`/specifications/*`の変更

- **Protocols**: Changes to `/protocols/*`
  **プロトコル**：`/protocols/*`の変更

- **Core OS**: Changes to `/lumi-os/*`
  **コアOS**：`/lumi-os/*`の変更

- **Constitutional Documents**: LUMI_CONSTITUTION, CLASS_MODEL, etc.
  **憲法文書**：LUMI_CONSTITUTION、CLASS_MODEL等

### ❌ Not Accepted / 受け入れられない貢献

- Changes that violate class boundaries
  クラス境界を違反する変更

- Dark patterns or coercive UX
  ダークパターンまたは強制的なUX

- Unauthorized lending, custody, or leverage features
  許可されていない貸付、保管、レバレッジ機能

- Code that bypasses OS safety rules
  OS安全規則を迂回するコード

- Breaking changes without migration path
  移行パスのない破壊的変更

---

## Code Standards / コード規範

### JavaScript/TypeScript

- Use TypeScript for new code
  新しいコードにはTypeScriptを使用

- Follow existing code style
  既存のコードスタイルに従う

- No unused imports or variables
  未使用のインポートや変数を含めない

- Meaningful variable and function names
  意味のある変数名と関数名

### React Components

- Functional components with hooks
  Hooksを使用した関数コンポーネント

- Props interface for TypeScript
  TypeScript用のProps interface

- Accessibility attributes (aria-*, role)
  アクセシビリティ属性（aria-*、role）

### Git Commit Messages

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Example:**
```
feat: Add user balance display component

- Created BalanceCard component
- Integrated with lumi-core-api
- Added loading and error states

Closes #123
```

---

## Development Setup / 開発セットアップ

See [DEVELOPMENT.md](./DEVELOPMENT.md) for complete setup instructions.

完全なセットアップ手順については[DEVELOPMENT.md](./DEVELOPMENT.md)を参照してください。

Quick start:
```bash
git clone https://github.com/lumina-bulige-dev/lumi-os.git
cd lumi-os
npm install
npm run dev
```

---

## Testing / テスト

**Current Status**: No test suite configured

**現在の状況**：テストスイート未設定

If you're adding tests (which would be a great contribution!):
- Use Jest for unit tests
- Use React Testing Library for component tests
- Use Playwright or Cypress for E2E tests

テストを追加する場合（素晴らしい貢献になります！）：
- ユニットテストにはJestを使用
- コンポーネントテストにはReact Testing Libraryを使用
- E2EテストにはPlaywrightまたはCypressを使用

---

## Pull Request Process / プルリクエストプロセス

1. **Update Documentation**: If adding features, update relevant docs
   **ドキュメントを更新**：機能を追加する場合は、関連するドキュメントを更新

2. **Follow Code Standards**: Ensure code follows existing patterns
   **コード規範に従う**：コードが既存のパターンに従っていることを確認

3. **Keep Changes Focused**: One feature/fix per PR
   **変更を集中させる**：PR1つにつき1つの機能/修正

4. **Write Clear Description**: Explain what and why, not just how
   **明確な説明を書く**：方法だけでなく、何を、なぜを説明

5. **Link Related Issues**: Use "Closes #123" or "Fixes #456"
   **関連するIssueをリンク**：「Closes #123」または「Fixes #456」を使用

6. **Be Patient**: Reviews may take time, especially for core changes
   **忍耐強く**：特にコア変更のレビューには時間がかかる場合があります

---

## Code Review / コードレビュー

When your PR is reviewed, you may receive:
- **Approval**: Your changes are accepted
- **Request Changes**: Modifications needed before merge
- **Comments**: Questions or suggestions for improvement

PRがレビューされると、以下を受け取る可能性があります：
- **承認**：変更が受け入れられました
- **変更要求**：マージ前に修正が必要
- **コメント**：質問または改善の提案

Please respond to all comments and push updates to your branch.

すべてのコメントに返信し、ブランチに更新をプッシュしてください。

---

## Conduct / 行動規範

- Be respectful and professional
  尊重とプロフェッショナルさを保つ

- Welcome newcomers and help them learn
  新規参加者を歓迎し、学習を支援

- Give and receive constructive feedback
  建設的なフィードバックを与え、受け取る

- Focus on what is best for the project
  プロジェクトにとって最善なことに焦点を当てる

- Respect class boundaries and governance model
  クラス境界とガバナンスモデルを尊重

---

## Questions? / 質問がありますか？

- **General Questions**: Open a GitHub Discussion
  **一般的な質問**：GitHub Discussionを開く

- **Bug Reports**: Open a GitHub Issue
  **バグレポート**：GitHub Issueを開く

- **Feature Proposals**: Open an Issue with [Feature Request] tag
  **機能提案**：[Feature Request]タグ付きでIssueを開く

- **Security Issues**: See SECURITY.md (if available)
  **セキュリティ問題**：SECURITY.mdを参照（利用可能な場合）

---

## License / ライセンス

By contributing, you agree that your contributions will be licensed under the MIT License.

貢献することにより、あなたの貢献がMITライセンスの下でライセンスされることに同意したことになります。

---

## Acknowledgments / 謝辞

Thank you to all contributors who help make LUMI OS better!

LUMI OSをより良くするために協力してくださるすべての貢献者に感謝します！

---

**Last Updated / 最終更新**: 2026-01-10
**Version / バージョン**: 1.0.0
