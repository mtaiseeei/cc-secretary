# Sprint 009 Progress — G1配管: 三層記憶とjournal副作用

## ステータス

**実装完了 — Evaluator評価待ち**

## 実装内容

- `scripts/lib/journal.sh` に共通境界 `journal_append` を追加した。
  - `did` / `decided` / `next` / `note` の4typeだけを受け付ける。
  - 空本文、改行を含む本文、未知type、path guard違反を副作用前に拒否する。
  - `CC_SECRETARY_NOW` を優先し、`memory/journal/YYYY-MM-DD.md` へ1件1行で末尾追加する。
  - journalの初回作成と同時に`MEMORY.md`の月索引を更新する。journalの更新・削除コマンドは提供しない。
- `scripts/lib/memory-index.sh` にreindexの単一実装を分離した。
  - preferences、decisions、topicsを索引し、journalは同月の日次ファイルを1行へ畳む。
  - 200行超過予測時は索引を200行以内に保ち、stderrへ古い月の退避提案を出す。原本の自動削除・自動退避はしない。
- `memory-tools.sh` をjournal統合形へ更新した。
  - `journal-add <sec> <did|decided|next|note> <本文>` を追加した。
  - `topic-add <sec> <トピック名> <確認済み要点>` を追加し、`memory/topics/`と索引へ反映する。
  - `remember-decision` は過去ファイルを変更せず、新しい日付ファイルへの追加と`decided` journalを一組で行う。
  - settings本体は未実装のまま、sprint-011が同じ`journal_append ... did`へ接続できる境界だけを用意した。
- `workspace-tools.sh` の正規シームをjournalへ接続した。
  - `save-deliverable` → `did`
  - `todo-add` → `next`。既存の根拠必須を維持し、期限は任意の第4引数にした。
  - `todo-done` → `did`。旧実装の行削除を戻さず、確認後に`[x]`と完了日を残す形へ書き直した。
  - `todo-carry` → `next`。確認後に持ち越し日を追記する形へ書き直した。
- onboarding雛形へ`memory/journal/`と`memory/topics/`を追加した。配布`AGENTS.md`、memory-care、daily、secretaryの案内も同じ構造とコマンドへ揃えた。
- `scripts/sprint-009-regression.sh`（41 assert）と、全体回帰section 14を追加した。

## 原子性の扱い

シームは、まず主ファイル・journal・`MEMORY.md`のpath guardを通し、変更前の主ファイルと索引を一時退避する。
主処理後にjournal追加またはreindexが失敗した場合は、主ファイル・journal・索引を変更前へrollbackし、非ゼロで終了する。
これにより、通常のプロセス実行中に「主処理だけ成功したように見える」「journalだけ二重に残る」状態を防ぐ。

これは複数ファイルをまたぐOSレベルのトランザクションではないため、電源断やプロセス強制終了の瞬間まで完全に原子的とはしない。
この制約下でも、各ファイルは同一ファイルシステム上の退避と置換を使い、通常のコマンド失敗は自動回帰でrollbackを実証した。

## 検証結果

### Sprint 009実動作回帰

- コマンド: `bash scripts/sprint-009-regression.sh`
- 結果: `PASS=41 FAIL=0`、exit 0。
- 主な証跡:
  - journal既存prefixのbyte一致と末尾1行追加。
  - 空本文・未知type・不正時刻・基点symlinkの拒否前後で副作用0。
  - 成果物、TODO追加2種、TODO完了、TODO持ち越し、決定、topic、settings接続境界の8イベントが各1回だけ増加。
  - 主処理失敗4件ではjournal増加0。
  - journal側を意図的に壊したfixtureで、TODO・decision・topic・成果物と索引のrollback。
  - topic索引、同月journal集約、別月分離、200行上限＋stderr警告。
  - 同じ固定時刻・同じ入力でjournalがbyte一致し、曜日表記なし。

### 全回帰

- コマンド: `bash scripts/regression-check.sh --online`
- 結果: `PASS=275 FAIL=0`、exit 0。
- online結果: `ONLINE=PASS repo=mtaiseeei/yasashii-harness`。
- offline単独も共通reindex化前後で0 FAIL。最終判定には上記online runを使う。

### 構文・差分

- `bash -n`:
  - `scripts/regression-check.sh`
  - `scripts/sprint-009-regression.sh`
  - `scripts/lib/{path-guard,memory-index,journal}.sh`
  - `memory-tools.sh`
  - `workspace-tools.sh`
  - すべてexit 0。
- `git diff --check`: exit 0。
- 新規配布スクリプトと回帰スクリプトの実行権限を確認済み。

## 起動・評価引き渡し

- 製品形態: Claude Code plugin。Web UIはないためテストURLは該当なし。
- 起動:
  1. `/plugin marketplace add mtaiseeei/yasashii-secretary`
  2. `/plugin install yasashii-secretary@yasashii-secretary`
  3. `/secretary`
- Sprint 009単体回帰: `bash scripts/sprint-009-regression.sh`
- 全回帰: `bash scripts/regression-check.sh --online`

## Evaluator向け具体的シナリオ

1. `CC_SECRETARY_NOW=2026-07-21T14:05:00+09:00`で`journal-add`を2回実行し、既存byte列がprefixとして残り、末尾だけに2行増えることを確認する。
2. 成果物、期限あり／なしTODO、完了、持ち越し、決定、topicを実行し、主処理と対応typeのjournalが1対1で増えることを確認する。
3. journal保存先を壊した一時workspaceで各シームを実行し、非ゼロ終了と主ファイル・`MEMORY.md`のrollbackを確認する。
4. 過去decisionのchecksumを取り、新しい日付へ変更履歴を追加した後も過去ファイルが不変であることを確認する。
5. topic追加前の要点確認は配布SKILLの規律として残り、保存ファイルに確認済み要点だけが入り、会話全文や外部データ本文が入らないことを確認する。
6. 210 topics fixtureと複数月journal fixtureで、`MEMORY.md`が200行以内、同月1行、超過時exit 0＋stderr警告になることを確認する。

## 既知の範囲・残課題

- timeline、朝夕体験、決定検出・締め確認、相談の一区切りを判断する対話プロトコルはsprint-010の範囲で、まだ実装していない。
- settings UIとpreferences v2はsprint-011の範囲。現在はjournalへ接続する共通境界だけで、利用可能とは案内していない。
- weeklyと索引退避の実行フローはsprint-012の範囲。今回の超過時動作は警告と提案までで、自動退避しない。
- 本体repoのcommit・pushは行っていない。別repoの`yasashii-harness`も変更していない。

## 自己評価

| 基準 | スコア | 根拠 |
|---|---:|---|
| C1 完成度 | 5/5 | Sprint 009の外から見える成果と受入基準を実装 |
| C2 構文・整合 | 5/5 | shell構文、参照先、実行権限、配布構造が整合 |
| C3 機能の実証 | 5/5 | 固定時刻・成功失敗・rollback・200行境界を41 assertで実動作確認 |
| C4 非エンジニア体験 | 5/5 | 既存の3行型と正式用語を維持し、確認箇所を明示 |
| C5 安全・規律 | 5/5 | path guard、空拒否、削除2段階、純追加、索引追従、pushなし |
| C6 無回帰 | 5/5 | online全回帰275 PASS / 0 FAIL |
| C7 やさしさ | 5/5 | 確認を増やす箇所と無確認の事実追記を分離し、規律を緩めていない |
