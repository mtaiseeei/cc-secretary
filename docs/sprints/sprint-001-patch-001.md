# Sprint 001 Patch 001 — templates 配置とパス解決の堅牢化

- Type: micro
- Base sprint: sprint-001（合格済み）
- Phase: P1（秘書コア）
- 主眼: オンボーディングの雛形が**実インストール時にも確実に参照できる**ようにする。テンプレートを配布プラグイン配下へ移し、SKILL の参照を `${CLAUDE_PLUGIN_ROOT}` 相対に統一する。

## なぜ Type: micro か

- 変更は**オンボーディングの1フロー**に限定され、ユーザーから見た振る舞い（数問→ワークスペース生成→git init→初回コミット）は**不変**。内部のパス解決を堅牢化するだけ。
- 既存の回帰スイート（53 assert）がこの生成導線を既にカバーしている。assert のパスを新配置に追従させるのみで、新しい振る舞いの検証は不要。
- したがって軽量評価（**機能完全性・動作安定性・回帰なし**のみ）で足りる。UX/安全/独自性の再評価は不要（クレジット方針・6規律・push 禁止などの不変条件は本パッチで変更しない）。

## 課題（Generator/Evaluator 双方が指摘）

`templates/` がリポジトリ直下にあるが、配布プラグインの実体は `plugins/cc-secretary/`（marketplace の source）。実インストール時に onboarding スキルが `templates/` を確実に参照できる保証がない。

## スコープ（含む）

1. **移設**: `templates/`（リポジトリ直下）→ `plugins/cc-secretary/templates/` に移動。中身（`AGENTS.md` / `CLAUDE.md` / `memory/MEMORY.md` / `memory/preferences.md` の初期形）は変えない。
2. **参照の統一**: onboarding / secretary の SKILL からの雛形参照を **`${CLAUDE_PLUGIN_ROOT}/templates/...`** に統一する。リポジトリ直下相対や絶対パス直書きを排除。
3. **回帰スクリプトのパス追従**: 既存 53 assert のうち templates 参照・生成物検証が、新配置と `${CLAUDE_PLUGIN_ROOT}` 解決に追従するよう更新。assert 総数・カバー範囲は減らさない。

## スコープ外

- オンボーディングの質問内容・生成物の構造・6規律・git init/コミット挙動の変更（本パッチでは触らない）。
- 次スプリント（記憶ケア・daily 等）の機能。

## sprint-001 契約との関係

- 本パッチは sprint-001 スコープ項目6（`templates/` をリポジトリ直下に置く）の**配置決定を supersede** する。以後の正本は `docs/spec/domain.md`「テンプレートの配置とパス解決」。
- sprint-001 の他の受入基準（マニフェスト・スキル構文・生成物・git・体験・安全・無回帰・クレジット方針）は不変で、引き続き満たすこと。

## 受入基準（micro 軽量評価）

Evaluator は以下のみを検証し、証跡（実行コマンドと結果）を feedback に残す。

1. **機能完全性**: 雛形が `plugins/cc-secretary/templates/` に存在し、SKILL の参照がすべて `${CLAUDE_PLUGIN_ROOT}` 相対（リポジトリ直下相対・絶対直書きの残存ゼロ、grep で確認）。ドライランでオンボーディング生成物が従来どおり `docs/spec/domain.md` の構造で生成される。
2. **動作安定性**: 開発時のリポジトリ配置でパスが解決し、生成が失敗しない。`${CLAUDE_PLUGIN_ROOT}` 未設定時のフォールバック挙動（もしくは前提）が壊れていない。
3. **無回帰（ゼロ許容）**: 既存 53 assert がパス追従後も全パス。新規失敗ゼロ。次スプリント機能の混入なし。

## 参照

- `docs/spec/domain.md`（テンプレートの配置とパス解決・確定）/ `docs/spec/constraints.md`（配布ファイルは `plugins/cc-secretary/` 配下・`${CLAUDE_PLUGIN_ROOT}` 参照）
- `docs/sprints/sprint-001.md`（ベース契約）/ `docs/feedback/sprint-001.md`（指摘の一次情報）
