# Sprint 012 Progress — G1仕上げ: weeklyと索引退避運用

## ステータス

**実装完了 — Evaluator評価待ち**

## 開始時の判断ゲート

- **dashboard: 見送り。** G1の最小可視化であるtimelineはSprint 010で合格済みだが、実利用者の反応を示す証跡がない。dashboardはG1必須ではなく、無断でscopeを広げない。
- **migration: 見送り。** 第2期配布は新規セットアップ想定で、既存ユーザーがいることを示す証跡がない。既存記憶に触れるmigrationを推測で追加しない。
- Sprint 012では、契約どおり**週次ふりかえり（weekly）と索引退避運用だけ**を実装する。

## 実装した内容

### 1. 日次journal原本から作るweekly

- `plugins/yasashii-secretary/scripts/lib/weekly.sh`を追加した。
  - `CC_SECRETARY_NOW`または`--week YYYY-MM-DD`を基準に、月曜〜日曜の固定週を計算する。
  - activeな`memory/journal/`と退避済み`memory/archive/journal/YYYY-MM/`から、対象週の日次journal原本だけを毎回直接読む。過去の週次成果物は入力にしない。
  - `did`、`decided`、`next`を別セクションに分け、原本ファイル名を各行へ残す。
  - decisionは新しい記録を先に表示するが、`変更:`を含む原文と変更履歴は統合・要約しない。統合候補はユーザー確認へ回す。
  - 同じ原本と固定週ならbyte単位で同じ結果を返す。閲覧だけでは成果物、journal、commitを増やさない。
- `plugins/yasashii-secretary/skills/weekly/SKILL.md`を追加した。
  - 外部事実を補うときは、現在turnで実コネクタから得たサービス名＋URL/ID＋日付だけを使い、本文を複製しない。
  - 「保存して」と明示された場合だけ、既存`save-deliverable`シームで成果物とjournalを各1件作り、その後に日本語local commitを1回作る。pushはしない。
  - 通常報告は`rules/plain-language.md`のserializerだけを正本とし、weekly側に3行schemaを複製していない。
- `memory-tools.sh`へ`weekly`コマンドを公開し、`secretary`ルーター、`memory-care`、README、公開ガイドから参照できるようにした。

### 2. MEMORY.md 199／200／201行と月単位退避

- `plugins/yasashii-secretary/scripts/lib/memory-index.sh`を拡張した。
  - 199行と200行はexit 0・警告なし。
  - 201行相当では索引を200行以内に維持し、exit 0のままstderrへ古い月の退避候補、残る参照、timeline/weeklyへの影響を出す。
  - active月と退避済み月を区別して索引し、退避済み原本への参照を失わない。
- `plugins/yasashii-secretary/scripts/lib/memory-archive.sh`を追加した。
  - `archive-plan <secretary> [YYYY-MM]`は対象件数、退避先、残る参照、影響を提示するだけで、副作用はない。
  - `archive-month <secretary> YYYY-MM --confirm`だけが実行可能。未確認はexit 3、現在月はexit 2で拒否する。
  - 退避は削除ではなく、月の全原本を`memory/archive/journal/YYYY-MM/`へ移動する。索引更新までを一組として扱い、失敗時は原本と索引を戻す。同月の退避済み原本がすでにある場合は、無断mergeせずexit 3で止める。
  - `memory/archive`が境界外symlinkの場合はexit 3で拒否し、外部ファイルを変更しない。
- `timeline.sh`とweeklyの両方を退避領域対応にし、退避後も同じ期間指定で原本を閲覧できるようにした。
- 新規セットアップ用テンプレートへ`memory/archive/journal/.gitkeep`を追加した。既存ユーザーmigrationは追加していない。

### 3. 回帰スイート

- `scripts/sprint-012-regression.sh`を追加し、38 assertを実装した。
  - 固定週、月跨ぎ、0件、原本一覧、分類、外部根拠、決定の最新優先と非統合、閲覧副作用0。
  - 明示保存時だけ成果物＋journal＋日本語local commitが各1件増える一時fixture。
  - MEMORY.mdの199／200／201行相当、警告内容、対象提示、未確認・キャンセル副作用0。
  - 確認後の月退避、MEMORY索引、退避後timeline/weekly、現在月拒否、同月archiveとの無断merge拒否、symlink境界拒否。
- `scripts/regression-check.sh` section 17へ専用回帰を接続した。
- 全体のskill構文・参照検査へweeklyを加え、全11 skillのname一意性と`${CLAUDE_PLUGIN_ROOT}`参照を検査するようにした。
- Sprint 011のserializer唯一正本とpreferences v2の67 assert、Sprint 010のtimeline等56 assertも再実行し、互換性を確認した。

## 検証結果

| 検証 | 結果 |
|---|---|
| `bash scripts/sprint-012-regression.sh` | `PASS=38 FAIL=0` |
| `bash scripts/sprint-011-regression.sh` | `PASS=67 FAIL=0` |
| `bash scripts/sprint-010-regression.sh` | `PASS=56 FAIL=0` |
| `bash scripts/regression-check.sh --offline` | `PASS=290 FAIL=0` |
| `bash scripts/regression-check.sh --online` | `PASS=291 FAIL=0`、`REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact`、`ONLINE=PASS repo=mtaiseeei/yasashii-harness` |
| `bash -n`（追加・変更shell） | 成功 |
| `git diff --check` | 成功 |

オンライン検査はGitHub APIで公開`mtaiseeei/yasashii-harness`の実在と参照metadataを確認した。ローカルの`agentic-harness`には読み書きしていない。`yasashii-harness`にも変更を加えていない。

## 起動・操作方法

- Web UI: なし。Claude Code pluginのため、評価URLは`N/A`。
- plugin導入後、`/secretary`から次の自然言語で確認する。
  - `今週を振り返って`
  - `2026-07-27から2026-08-02を振り返って`
  - `古いjournalの退避候補を見せて`
- シームを直接確認する場合:

```bash
plugins/yasashii-secretary/skills/memory-care/scripts/memory-tools.sh weekly <secretary> --week 2026-08-02
plugins/yasashii-secretary/skills/memory-care/scripts/memory-tools.sh archive-plan <secretary> 2026-06
plugins/yasashii-secretary/skills/memory-care/scripts/memory-tools.sh archive-month <secretary> 2026-06 --confirm
```

- 回帰コマンド:

```bash
bash scripts/sprint-012-regression.sh
bash scripts/regression-check.sh --offline
bash scripts/regression-check.sh --online
```

## Evaluator向け具体シナリオ

1. 固定fixtureで「今週を振り返って」を実行し、月曜〜日曜、原本一覧、did/decided/nextの分離、新しいdecision優先、変更履歴の原文保持を確認する。
2. 保存を依頼しない会話では成果物・journal・commitが0件増、別turnで「保存して」と明示した場合だけ各1件増えることを確認する。
3. 199／200／201行相当を実行し、201だけstderr警告があり、exit 0かつMEMORY.mdが200行以内であることを確認する。
4. 退避対象の提示後にキャンセルし、副作用0を確認する。次に別fixtureで対象月を明示確認し、退避後もtimelineとweeklyが原本を返すことを確認する。
5. preferences既定値で週次結果を通常報告し、物理3行・提案1つ以下・無断整理なしを確認する。「くわしく」を明示したfixtureだけ物理4行（補足1つ）になることを確認する。
6. `bash scripts/regression-check.sh --online`を実行し、全回帰と外部参照導線が0 FAILであることを確認する。

## 既知の制約・未実装

- dashboardは、timelineへの実利用者反応の証跡が得られるまで見送り。G1達成条件には含めない。
- migrationは、第2期の既存ユーザーが確認されるまで見送り。既存記憶へ推測で変更を加えていない。
- restoreシーム、自動削除、無確認decision統合、外部データ本文の保存は契約どおり対象外。
- Generatorは機械回帰と固定fixtureを実施済み。週次模擬会話の3行／4行最終出力は、独立Evaluatorが実際のplugin操作で最終判定する。
