# Progress — sprint-001（動く初回体験）

- Phase: P1
- Status: 実装完了・自己検証済み（Evaluator へ引き渡し）
- 実装者: Generator

## やったこと（実装サマリ）

プラグイン4点骨格 + オンボーディング + やさしい言葉ルール + テンプレ雛形 + LICENSE + 回帰チェックを実装した。

### 作成ファイル一覧

| ファイル | 役割 | 対応 |
|---|---|---|
| `.claude-plugin/marketplace.json` | マーケットプレイス定義。`forkedFrom` で Shin-sibainu/cc-company をクレジット | F01, 受入1 |
| `plugins/cc-secretary/.claude-plugin/plugin.json` | プラグイン定義（name/description/version） | F01, 受入1 |
| `plugins/cc-secretary/.mcp.json` | 最小・`_NOTE` 方式。`mcpServers` は空（コネクタは Claude 側設定で接続する旨を注記） | 受入1, 6 |
| `plugins/cc-secretary/skills/secretary/SKILL.md` | 薄いルーター。`secretary/` 有無で初回/2回目を判定。未実装スキルへはリンクせず入口案内のみ | F03, 受入2 |
| `plugins/cc-secretary/skills/onboarding/SKILL.md` | 初回セットアップ。やさしい3問→穴埋め対応表→テンプレ実体化→git init→日本語初回コミット→3行完了報告 | F04, 受入3,4,5 |
| `plugins/cc-secretary/rules/plain-language.md` | 報告3行型・日常語彙・進行語彙（計画→道具→確認→結果）・英語エラー翻訳の骨子 | F10, 受入5 |
| `templates/AGENTS.md` | 生成 `secretary/AGENTS.md` の雛形。6規律入り＋穴埋め変数 | F04, 受入3 |
| `templates/CLAUDE.md` | `AGENTS.md` へのポインタのみ | 受入3 |
| `templates/memory/MEMORY.md` | 記憶の目次（1行索引）の初期形 | 受入3 |
| `templates/memory/preferences.md` | 呼び方・使うサービス・任せたいことを反映 | 受入3 |
| `templates/memory/decisions/_first-decision.md` | 初回決定ログの雛形（`YYYY-MM-DD-decisions.md` にリネームして実体化） | 受入3 |
| `templates/{inbox,docs,projects}/.gitkeep` | 空フォルダを git 追跡させる目印 | 受入3 |
| `LICENSE` | MIT。元作者 Shin-sibainu/cc-company のクレジット明記 | F01, 受入1 |
| `scripts/regression-check.sh` | 受入1〜6の回帰チェック（テンプレ実体化ドライラン） | 受入7 |

## 回帰チェックの実行方法

```bash
bash scripts/regression-check.sh
```

- 対話 Claude に依存しない。固定回答でテンプレを一時ディレクトリ（`mktemp`）に実体化し、構造・6規律・CLAUDE.md ポインタ・MEMORY.md 索引・git 状態（init 済み・日本語コミット1件・push なし）を assert する。
- 一時ディレクトリは終了時に削除。`~/workspace/agentic-harness` には一切書き込まない。
- **クレジット方針（単段）を明示検査する**: (a) `marketplace.json` の `forkedFrom` が Shin-sibainu/cc-company を指す（値まで検査）、(b) `LICENSE` に MIT と Shin-sibainu/cc-company のクレジットがある、(c) 配布物（marketplace.json / plugin.json / LICENSE / `plugins/` 配下）に inoshinichi/bootcamp-company を必須クレジットとして掲げていない。これらは負テスト（bootcamp-company 混入・forkedFrom 変更・cc-company 削除）でいずれも FAIL することを確認済み（骨抜きでない）。
- **実行結果（自己検証）: PASS=53 / FAIL=0（合格）**。

## 受入基準への対応（自己評価）

1. **マニフェスト有効性**: 満たす。`python3 -m json.tool` でパース成功、必須フィールド・source 実在に加え、単段クレジット方針（forkedFrom=Shin-sibainu/cc-company・LICENSE の MIT/cc-company 明記・配布物に bootcamp-company を掲げない）を明示検査。
2. **スキル構文**: 満たす。`name` は `secretary`/`onboarding` で一意。段階ロードの参照先（onboarding・plain-language）に加え、SKILL 内の `templates/...`・`docs/spec/...` 相対参照もデッドリンク検査対象に含め、全て実在。未実装スキルへのデッドリンクなし（入口案内のみ）。
3. **オンボーディング生成物**: 満たす。`docs/spec/domain.md` 準拠の木を決定的に生成。`AGENTS.md` に6規律すべて（`規律1`〜`規律6` マーカー＋キーワード）。`CLAUDE.md` はポインタのみ。`MEMORY.md` は索引初期形。
4. **git 初期化**: 満たす。`secretary/` 単独で `git init`、日本語メッセージの初回コミット1件、リモート未設定・upstream なし（push されていない）。
5. **非エンジニア体験**: 満たす。質問文・完了報告は日常語＋具体例。完了報告は3行型で「次に何が起きるか」を含む。`plain-language.md` を両 SKILL から参照。
6. **安全・規律**: 満たす。`.mcp.json` は `mcpServers` 空（同期層なし）。`10_sources` 型なし。資格情報の実値なし・「資格情報を書かない/push しない」を AGENTS.md に明記。harness 非書込。
7. **無回帰**: 満たす。`scripts/regression-check.sh`（53 assert）を用意し実行コマンドを本ファイルに記録。クレジット方針の assert は負テストで有効性を確認済み（骨抜きでない）。

自己採点（rubric 基準・目安）: C1=5 / C2=5 / C3=5 / C4=4〜5 / C5=5 / C6=5。

## Evaluator への検証手順（推奨）

1. `bash scripts/regression-check.sh` を実行し PASS=53/FAIL=0 を確認（証跡をコマンド出力ごと feedback へ）。
2. マニフェストを個別に `python3 -m json.tool .claude-plugin/marketplace.json` / `... plugins/cc-secretary/.claude-plugin/plugin.json` で再確認。
3. `plugins/cc-secretary/skills/*/SKILL.md` の frontmatter `name` 一意・参照パス実在を目視 or grep。
4. 生成物の内容確認をしたい場合、スクリプト内の実体化ロジックを一時ディレクトリで手動再現し `secretary/AGENTS.md` を目視（6規律・言い換え併記）。
5. 非エンジニア文言: `plugins/cc-secretary/skills/onboarding/SKILL.md` の質問文・完了報告が日常語＋具体例・3行型・「次」を含むことを確認。生の英語エラー露出がないこと。

## 既知の制約・引き継ぎ事項

- **手動ライブ確認は未実施**: サインイン済みで実際に marketplace add → install → `/secretary` を走らせる確認は本環境では行っていない（rubric 6 の「未実施の手動確認」に該当）。スクリプト検証をゲートとする。
- **段階ロードの参照表記**: SKILL.md 内の参照は、検証容易性のためリポジトリ相対パス（`plugins/cc-secretary/...`）で記述した。実インストール時のパス解決は Claude の実行文脈に依存する（下記 spec-issue 候補を参照）。
- **後続スプリントのスキルは未実装**: daily / memory-care / setup-google 等はスコープ外。ルーターは入口案内のみで、デッドリンクを避けるためファイルリンクは張っていない。

## 仕様に対する気づき（spec-issue 候補・報告）

- **`templates/` の配置とインストール後のパス解決（要 Planner 判断）**: DESIGN.md・sprint-001 は `templates/` をリポジトリ直下に置くと定めており、その通り実装した。ただし配布プラグインの実体は `plugins/cc-secretary/`（marketplace `source`）であり、インストール後にオンボーディングが repo 直下の `templates/` を確実に参照できるか（`${CLAUDE_PLUGIN_ROOT}` 相対か、marketplace リポジトリ全体がキャッシュされる前提か）は spec で未確定。sprint-001 の受入（リポジトリ構造・実体化ロジック）は満たすため本スプリントはブロックしないが、実運用前に「templates を `plugins/cc-secretary/templates/` に移す」または「onboarding が `${CLAUDE_PLUGIN_ROOT}` 相対でテンプレを探す」のいずれかを Planner が明確化することを推奨。
- **クレジットは単段方針で確定・解消済み**: クレジット方針はオーケストレーター経由でユーザーに確認され、**単段（元作者 Shin-sibainu/cc-company・MIT のみ）** が正式確定した。Planner が正本（`docs/spec/constraints.md` L40-43・`docs/sprints/sprint-001.md` 受入基準1 ほか）を単段方針に改訂済み。現在の実装（`forkedFrom`・LICENSE の単段クレジット）は改訂後の正本に合致する。差し戻し feedback（sprint-001）で指摘された「回帰スクリプトのクレジット assert が骨抜き」は、単段方針を明示検査する形（forkedFrom 値検査＋LICENSE クレジット検査＋配布物への bootcamp-company 非掲載検査、負テストで有効性確認済み）に修正して解消した。仕様と実装の食い違いは無い。
- **Planner 生成の spec/sprint ファイルが git 未追跡（参考情報）**: `docs/spec/*` `docs/sprints/*` 等がリポジトリに未コミット（tracked は `CLAUDE.md` と `docs/DESIGN.md` のみ）。Generator の管掌外のため触っていないが、オーケストレーターの記録・追跡の観点で共有する。
