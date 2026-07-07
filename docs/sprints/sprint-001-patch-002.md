# Sprint 001 Patch 002 — 過度な平易化の一掃（文言規約の改訂反映）

- Type: patch（通常）※ micro ではない。理由は下記。
- Base: 合格済みスプリント群（sprint-001 / 002）が生成した配布物の文言。関連 patch: sprint-001-patch-001。
- Phase: P1（秘書コア）
- 主眼: 2026-07-08 のユーザー指示による**文言方針の改訂**を、既存の配布物すべてに反映する。幼稚なメタファー（「秘書の家」等）を排し、一般に通じる技術用語はそのまま使う方針（改訂 `docs/spec/ui.md`）に合わせる。
- **着手タイミング**: **sprint-003 完了後に実装する**。理由: Generator が sprint-003 で `skills/secretary/SKILL.md`・`skills/daily/`・`skills/setup-google/` を編集中のため、同一ファイルの並行変更を避ける。

## なぜ Type: micro ではないか

- 変更が**複数のスキル・テンプレート・ルールファイル**（onboarding / secretary / memory-care / daily / setup-google、templates、rules/plain-language.md、plugin.json、workspace-tools.sh のメッセージ）に**またがる**。micro の条件「1画面・1フローに限定」を満たさない。
- ただし振る舞いは変えず**文言のみ**なので、評価の重点は C1（一掃の網羅性）・C4（改訂 ui.md への適合）・C5（幼稚メタファー禁止・不変条件）・C6（無回帰）に置く。

## 背景（ユーザー指示の趣旨）

- 「秘書の家」という言い方をやめ、「**秘書ディレクトリ**」または「**秘書フォルダ**」と呼ぶ。
- 極端に技術用語を廃しすぎている。**一般的な技術用語（ディレクトリ・フォルダ・コミット・インストール・コネクタ 等）は積極的に使う**。過度な平易化はかえって分かりにくい。
- 対象は Claude Code を使う「技術に多少関心のある非エンジニア」。
- 「他の部分でもそういった過度な平易化がないか、Patch を切って更新して」。

方針の正本は改訂後の `docs/spec/ui.md`「対象読者の再定義」「体験の原則」と `docs/spec/constraints.md` の絶対ルール3。

## スコープ（含む）

改訂 `docs/spec/ui.md` の語彙方針に合わせ、以下の**配布物の文言**を改訂する。

1. **「秘書の家」等のメタファーを一掃**し、「秘書ディレクトリ（`secretary/`）／秘書フォルダ」に統一。着手時点で該当が見込まれるファイル（実装時に grep で再確認）:
   - `plugins/cc-secretary/skills/onboarding/SKILL.md`（複数箇所: 見出し「秘書の家を作る」・完了メッセージ等）
   - `plugins/cc-secretary/skills/secretary/SKILL.md`（挨拶・案内文言）
   - `plugins/cc-secretary/skills/memory-care/SKILL.md`（「秘書＋道具箱」言及の文言調整）
   - `plugins/cc-secretary/templates/memory/MEMORY.md`・`templates/memory/decisions/_first-decision.md`（初期記載）
   - `plugins/cc-secretary/rules/plain-language.md`（例文「秘書の家のフォルダを作っています」等）
   - `plugins/cc-secretary/.claude-plugin/plugin.json`（`description` の「秘書の家」）
   - `plugins/cc-secretary/scripts/workspace-tools.sh`（`refuse` メッセージの「秘書の家」）
   - ※ sprint-003 完了後に再 grep し、setup-google / daily に混入した分も一掃する。
2. **過度な平易化の是正**: `rules/plain-language.md` を改訂 ui.md 準拠に書き換える。一般に通じる技術用語はそのまま使う／言い換え・補足は馴染みの薄い語（OAuth・リポジトリ・frontmatter・MCP・トークン・環境変数 等）に初出のみ／「専門用語は必ず言い換え併記」という旧規定を撤廃。各 SKILL の「報告は3行以内・専門用語は言い換え併記…」の一文も新方針の表現に更新。
3. **進行語彙の扱い**: 「計画→道具→確認→結果」は第1回座学と接続する**段階の呼び名**として維持してよい（技術用語を避ける意味ではないと明記）。ただし個別の技術説明では一般語をそのまま使う。

## スコープ外

- 機能・生成物の構造・保護規則・git 挙動の変更（**文言のみ**。振る舞いは一切変えない）。
- 「秘書＋道具箱」という**設計メタファー自体**の廃止（DESIGN.md 由来の内部概念。ユーザー向け文言で幼稚に多用しないだけ）。
- `docs/`（spec・DESIGN・contracts）側の文言。DESIGN.md・CLAUDE.md はユーザー管理で触らない。spec/*.md は Planner が別途整備済み。

## 受入基準（検証可能な形）

Evaluator は以下を assert し、証跡を `docs/feedback/sprint-001-patch-002.md` に残す。

1. **メタファー一掃（C5, ゼロ許容）**: 配布物（`plugins/**`・`templates/**`）に対する `grep -rn "秘書の家"` の結果が**ゼロ件**。「おうち／お家」等の同種比喩もゼロ。
2. **語彙方針への適合（C4）**: `rules/plain-language.md` と各 SKILL の文言が改訂 `docs/spec/ui.md`「体験の原則」に適合（一般語はそのまま使う旨・馴染みの薄い語のみ初出補足・「必ず言い換え併記」旧規定の撤廃を確認）。「専門用語は必ず言い換えを併記」に相当する旧文言が配布物に残っていない（grep 確認）。
3. **呼称の統一（C1）**: `secretary/` を指す表現が「秘書ディレクトリ／秘書フォルダ」に統一され、完了メッセージ等が改訂 ui.md の例に沿う。
4. **振る舞い不変（C3, 動作安定性）**: オンボーディング生成物の構造・記憶保護・封じ込め・git 挙動が従来どおり（文言変更が機能を壊していない）。
5. **無回帰（C6, ゼロ許容）**: 既存回帰スイート（**111 assert**）が全パス。文言 assert がある場合は新方針に追従して更新（旧文言を期待する assert を残さない）。push なし（`git remote` 空）。

## Generator への引き継ぎメモ

- **着手は sprint-003 完了後**。着手時にまず `grep -rn "秘書の家\|お家\|おうち" plugins templates` と `grep -rn "言い換えを併記\|専門用語は必ず" plugins templates` で現況を洗い直す（sprint-003 追加分を含む）。
- 「秘書＋道具箱」は残してよいが、ユーザー向け文言で概念の置き換えに多用しない。
- `rules/plain-language.md` は本パッチの中心。改訂 ui.md をそのまま反映する（そのまま使う語／初出補足する語のリストを含める）。
- 回帰スイートに旧文言（「秘書の家」等）を期待する assert があれば新方針に更新。文言のネガティブテスト（「秘書の家」不在）を追加すると堅い。
- パス参照は `${CLAUDE_PLUGIN_ROOT}` 相対を維持。push しない。

## 参照

- `docs/spec/ui.md`（改訂・語彙方針の正本）/ `docs/spec/constraints.md`（絶対ルール3・報告の型）/ `docs/spec/rubric.md`（C4 採点）
- `docs/sprints/sprint-001.md`・`sprint-002.md`（配布物の出所）/ `docs/sprints/sprint-003.md`（新規文言は新方針で書かれる前提）
