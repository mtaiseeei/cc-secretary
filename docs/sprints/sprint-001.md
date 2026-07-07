# Sprint 001 — 動く初回体験（骨組み＋インストール＋オンボーディング）

- Phase: P1（秘書コア）
- 主眼: **非エンジニアが3コマンドでプラグインを入れ、`/secretary` を初めて呼ぶと、やさしい数問だけで「秘書の家」（`secretary/`）ができ、`git init` と最初のコミットまで完了する。** これが本製品の「動く」最小スライス。
- 依存: なし（最初のメインスプリント）

## なぜこのスプリントか

DESIGN.md の Phase 1 は onboarding / memory / daily / 出力規約 / 自動コミット / setup-google を含むが、全部を一度に作らない。
最初のスプリントは「**インストールできて、初回体験が最後まで通り、秘書の家が実在する**」ことに絞る（薄いが縦に貫通したスライス）。
記憶ケア・daily・コネクタは後続スプリント（002, 003）に回す。非エンジニアにとっての「おっ、動いた」を最短で作るのが狙い。

## スコープ（含む）

### 1. プラグイン骨組みとインストール導線（F01, F02）
- 最小骨格は company にならい4点: `.claude-plugin/marketplace.json` + `plugins/cc-secretary/.claude-plugin/plugin.json` + `plugins/cc-secretary/.mcp.json` + `plugins/cc-secretary/skills/secretary/SKILL.md`。
  - `.mcp.json` は、cc-secretary が公式リモートコネクタ優先のため中身は最小でよい（company の `_NOTE` 埋め込み方式を参考に、コネクタは Claude 側設定で繋ぐ旨を注記する程度）。コネクタ固有設定を先取り実装しない。
- `marketplace.json`: `cc-secretary` を配布するマーケットプレイス定義。**`forkedFrom` フィールドで元作者 Shin-sibainu/cc-company（MIT）のクレジットを明記**（単段。inoshinichi/bootcamp-company は必須クレジットに含めない）。
- `plugin.json`: プラグイン定義（名前・説明・バージョン・提供スキル）。
- ライセンス `LICENSE`（MIT）と最低限のクレジット表記を置く（本格的な README 整備は sprint-006）。
- インストールは cc-company と同じ3コマンド（marketplace add → install → `/secretary`）で通ること。

### 2. 薄いルーター `/secretary`（F03・今回は最小）
- `plugins/cc-secretary/skills/secretary/SKILL.md`: 薄いルーター。frontmatter（`name` 等）が有効。
- 今回は「初回か2回目以降か」を見分け、初回ならオンボーディングへ、2回目以降は簡単な受付（この時点では機能一覧の入口案内で可）に振る、最小のモード判定でよい。
- 起動時に全機能を読み込まない段階ロードの形をとる（後続スキルは未実装でも参照構造だけ用意）。

### 3. オンボーディング（F04）
- `plugins/cc-secretary/skills/onboarding/SKILL.md`: 初回セットアップ。
- **やさしい数問**（例: 呼び方 / 主に使うサービス〔Google・Microsoft・まだ決めてない〕/ 秘書に任せたいこと）。各質問は2〜3択＋具体例、日常語。
- 回答をもとに `secretary/` を生成する（構造は `docs/spec/domain.md` 準拠）:
  ```
  secretary/
  ├── AGENTS.md          ← 6規律入り（下記）
  ├── CLAUDE.md          ← AGENTS.md へのポインタのみ
  ├── inbox/             （空でよい。.gitkeep 可）
  ├── docs/              （空でよい）
  ├── projects/          （空でよい）
  └── memory/
      ├── MEMORY.md      ← 記憶の目次（初期テンプレ）
      ├── decisions/     （初期は空 or 初回決定を1件記録）
      └── preferences.md ← 回答から呼び方・使うサービス等を反映
  ```
- 生成した `secretary/` で `git init` し、日本語メッセージで**最初のコミット**を作る。
- 完了報告は3行型:「秘書の家ができました（場所を日常語で）／中に何が入っているか一言／次にできること一言」。

### 4. 生成 `AGENTS.md` の6規律（F04, constraints）
生成される `secretary/AGENTS.md` に、`docs/spec/constraints.md` の6規律を必ず含める:
1. スコープ（`secretary/` 配下のみ・資格情報禁止）
2. 根拠ルール（サービス名＋リンク＋日付）
3. 出力規約（`YYYY-MM-DD_<title>.md`・frontmatter 必須）
4. 記憶保護（空上書き禁止・削除前警告・MEMORY.md 索引最新化）
5. 自動コミット（節目でローカル commit・push は明示時のみ）
6. 報告の型（3行・言い換え併記・次の一言）

### 5. 非エンジニア文言ルール（F10・今回は骨子）
- `plugins/cc-secretary/rules/plain-language.md`: 報告3行型・日常語彙・進行の見せ方（計画→道具→確認→結果）・英語エラー翻訳の骨子を置き、SKILL.md / onboarding から参照する。

### 6. テンプレート
- `templates/` にワークスペース雛形（`AGENTS.md`・`CLAUDE.md`・`memory/MEMORY.md`・`memory/preferences.md` の初期形）を置き、オンボーディングがこれを実体化して回答で穴埋めする方式にする（生成の決定性・検証可能性のため）。

## スコープ外（このスプリントでやらない）

- 記憶ケアの本体（保護発火・`_resume.md`・振り返り）→ sprint-002
- 今日やること（daily）・コネクタ参照・出力規約の実運用 → sprint-003
- setup-google / setup-microsoft / Notion → sprint-003, 004
- やさしいハーネス・build → sprint-005
- 本格 README・使い方 docs → sprint-006
- 自動コミットの「節目ごと」運用（今回はオンボーディング完了時の初回コミットのみ）→ 一般化は sprint-002

## 受入基準（この契約は厚めに定義する）

Evaluator は `docs/spec/rubric.md` の方法で以下を検証する。証跡（実行コマンドと結果）を feedback に残すこと。

1. **マニフェスト有効性（C2, ゼロ許容）**: `marketplace.json` と `plugin.json` が有効な JSON で必須フィールドが揃い、参照する skills/rules のパスが実在する。`jq .` または `python3 -m json.tool` でパース成功。
   - **クレジット方針（C5, ゼロ許容）**: 配布物のクレジット（`marketplace.json` の `forkedFrom`・LICENSE・README）が **Shin-sibainu/cc-company・MIT** を含み、**inoshinichi/bootcamp-company を必須クレジットとして掲げていない**こと。回帰スクリプトがこの方針を明示的に検査する。
2. **スキル構文（C2）**: `secretary/SKILL.md` と `onboarding/SKILL.md` の frontmatter が有効、`name` が一意、段階ロードの参照先が実在（未実装スキルへのデッドリンクがない）。
3. **オンボーディング生成物（C1, C3）**: テンプレート実体化のドライラン（対話 Claude に依存しないスクリプト）で、`secretary/` が `docs/spec/domain.md` の構造どおりに生成される。`AGENTS.md` に6規律すべてが含まれる（grep で6項目確認）。`CLAUDE.md` は `AGENTS.md` へのポインタのみ。`memory/MEMORY.md` が索引の初期形。
4. **git 初期化（C1, C3）**: 生成された `secretary/` で `git init` 済み、最初のコミットが日本語メッセージで1件存在し、**push されていない**（リモート設定・push 実行がない）。
5. **非エンジニア体験（C4）**: オンボーディングの質問文・完了報告が日常語＋具体例で、報告が3行型（「次に何が起きるか」を含む）。`rules/plain-language.md` が SKILL/onboarding から参照されている。
6. **安全・規律（C5, ゼロ許容）**: `~/workspace/agentic-harness` に一切書き込みがない。外部データ同期層を作っていない。資格情報を書き込む/コミットする記述がない。
7. **無回帰（C6）**: Generator が上記1〜6を守る回帰スクリプトを用意し、実行コマンドを progress に記録している。

## Generator への引き継ぎメモ（実装の自由度）

- スキルの内部プロンプト設計・テンプレートの穴埋め方式は Generator の裁量。ただし**生成の決定性**（同じ回答→同じ構造）を満たすこと。
- **参考にしてよい company の一次情報**（`~/workspace/inbox/company`、MIT・クレジット継承、**読むだけ**）:
  - オンボーディングの質問→生成フロー: `skills/.../SKILL.md` の 24-220 行付近（5問→ワークスペース生成）。cc-secretary はこれを**やさしい数問**に簡素化する。
  - テンプレ方式: `references/claude-md-template.md` の `{{PLACEHOLDER}}` 変数方式＋変数リファレンス表が、`templates/` の穴埋め生成の好例。
  - MEMORY.md 索引ルールは SKILL.md 867-872 行付近（本体は sprint-002 で実装）。
  - `.mcp.json` の `_NOTE` 埋め込み方式は company を参照。
- **company にない・新規実装が必要な点**: company は `git init` しない設計なので、**初回 `git init` + 最初の自動コミット**は cc-secretary の新規実装。
- 「秘書＋道具箱」メタファーを保ち、**部署制・キーワード振り分け表・部署間 inbox 通知・`departments.md`・`case-NNN` 必須生成は持ち込まない**（company の該当箇所: SKILL.md 335-348/494-523/383-417 行、departments.md 192 行以降。反面教師として参照するだけ）。
- 回帰スクリプトは、オンボーディング生成物を一時ディレクトリに実体化して構造・6規律・git 状態を assert する形が扱いやすい。

## 参照

- `docs/spec/features.md` F01 F02 F03 F04 F10 / `docs/spec/domain.md`（ワークスペース構造）/ `docs/spec/constraints.md`（絶対ルール・6規律）/ `docs/spec/ui.md`（初回体験）/ `docs/spec/rubric.md`（検証方法）
- 参考実装（読み取り専用）: `~/workspace/inbox/company`
