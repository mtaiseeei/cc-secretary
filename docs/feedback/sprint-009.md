# Sprint 009 Evaluation — G1配管

## 判定

- **合格**
- **分類: なし**
- 評価日: 2026-07-16
- Generatorの自己評価を判定根拠にせず、Evaluatorが固定時刻の一時workspace、独自fixture、Sprint単体回帰、全online回帰を直接実行した。

本スプリントはGUIを持たないClaude Code pluginのshellシームとMarkdown配布物が対象である。画面・レスポンシブ・視覚品質の変更がないため、ブラウザ操作とスクリーンショットは評価対象外とした。決定検出・締め確認・相談文脈の模擬会話はsprint-010、settingsの3設定比較はsprint-011の契約範囲であり、今回は決定的な保存シームを実行して評価した。

評価中、操作禁止のローカル上流checkoutは読み取りを含め一切コマンド対象にしていない。別repo `yasashii-harness` も変更せず、online検査はGitHub APIへの読み取りだけを使用した。

## Rubric採点

| ID | 得点 | 閾値 | 判定 | 独立評価の根拠 |
|---|---:|---:|---|---|
| C1 完成度 | 5/5 | 4 | 合格 | journal、全対象シーム、topics、期限あり／なしTODO、reindex、固定時刻、rollbackを受入基準どおり確認 |
| C2 構文・整合 | 5/5 | 5 | 合格 | `bash -n`、実行権限、配布パス、テンプレ構造、online参照導線、`git diff --check`がすべて成功 |
| C3 機能の実証 | 5/5 | 4 | 合格 | 独自fixture 35/35、Sprint単体41/41。各成功シームはjournalを1行だけ増やし、主処理失敗は0行、固定時刻でbyte一致 |
| C4 非エンジニア体験 | 5/5 | 4 | 合格 | 拒否・確認・成功メッセージが日本語で、対象と次の操作を明示。一般技術用語を保ち、生の英語エラーを放置しない |
| C5 安全・規律 | 5/5 | 5 | 合格 | 純追加、空／未知type／境界外／symlink拒否、副作用0、決定履歴不変、削除2段階、索引追従、通常失敗時rollbackを実証 |
| C6 無回帰 | 5/5 | 5 | 合格 | Sprint単体 `PASS=41 FAIL=0`、全online回帰 `PASS=275 FAIL=0`。既知失敗なし |
| C7 やさしさ | 5/5 | 4 | 合格 | TODO完了・持ち越しは対象を示して確認を促し、journalの事実追記だけを無確認に限定。安全規律を緩めていない |

全軸が閾値以上で、ゼロ許容のC2・C5・C6は5/5。Sprint 009を合格と判定する。

## 受入基準ごとの結果

| # | 結果 | 独立証跡 |
|---|---|---|
| 1. journal純追加 | 合格 | 既存113 bytesをbyte一致のprefixとして保持し、末尾だけ150 bytesへ増加。更新・削除コマンドなし |
| 2. 入力拒否 | 合格 | 空本文、未知type、境界外、基点symlinkはいずれもexit 3。journal・索引・外部ファイルの副作用0 |
| 3. シーム副作用 | 合格 | 成果物、TODO追加2種、完了、持ち越し、決定、topic、settings接続境界の各成功でjournal delta=1。4種の主処理失敗はdelta=0 |
| 4. 決定の純追加 | 合格 | `2026-07-08-decisions.md`のchecksum不変。変更履歴は`2026-07-21-decisions.md`へ追加 |
| 5. topic | 合格 | `memory/topics/Zoom相談.md`に確認済み要点だけを保存し、`MEMORY.md`へ索引。会話全文・外部本文なし |
| 6. TODO | 合格 | 期限なしTODOを完了し、期限ありTODOを持ち越し。元行を消さず完了日／持ち越し日を追記し、journalも1行ずつ追加 |
| 7. reindex | 合格 | 同月journalは1行、別月は別行。ちょうど200行は警告なし、201行相当の入力はexit 0＋stderr退避警告＋出力200行 |
| 8. 固定時刻 | 合格 | `CC_SECRETARY_NOW=2026-07-21T14:05:00+09:00`でファイル名・時刻を固定。2 workspaceのjournal checksumとbytesが一致し、曜日なし |
| 9. 記憶保護 | 合格 | 新規導線はpath guardを通り、拒否前の副作用0。journal後段失敗時は主ファイル・索引・journalをrollback |
| 10. 無回帰 | 合格 | Sprint単体41 assertと全online回帰275 assertが0 FAIL |

settings本体は契約どおりsprint-011の範囲外である。今回は同じ`journal_append ... did`へ接続できる共通境界だけを確認し、現在利用可能な設定機能としては案内していない。

## 独立実行の証跡

### 1. 構文とSprint単体回帰

```text
$ bash -n scripts/regression-check.sh scripts/sprint-009-regression.sh \
    plugins/yasashii-secretary/scripts/lib/path-guard.sh \
    plugins/yasashii-secretary/scripts/lib/memory-index.sh \
    plugins/yasashii-secretary/scripts/lib/journal.sh \
    plugins/yasashii-secretary/skills/memory-care/scripts/memory-tools.sh \
    plugins/yasashii-secretary/scripts/workspace-tools.sh
exit 0

$ bash scripts/sprint-009-regression.sh
PASS journal既存内容をbyte単位で保持
PASS 8つの成功イベントが1回ずつjournalへ増える
PASS 主処理失敗4件はjournalを増やさない
PASS journal失敗時はTODO主処理をrollback
PASS journal失敗時はdecisionと索引をrollback
PASS journal失敗時はtopicと索引をrollback
PASS journal失敗時は成果物をrollback
PASS MEMORY.mdを200行以内に保つ
PASS 200行超過時は退避提案をstderrへ出す
PASS=41 FAIL=0
exit 0

$ git diff --check
exit 0
```

### 2. 全online回帰

```text
$ bash scripts/regression-check.sh --online
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
PASS=275 FAIL=0
回帰チェック合格
exit 0
```

最初のsandbox内実行は外部通信が遮断され、`ONLINE=UNVERIFIED`、`PASS=274 FAIL=1`となった。ネットワーク不可をPASSにしない設計が正しく働いた結果である。外部通信を許可した同一コマンドの再実行では上記のonline証跡を取得したため、製品側の失敗や既知失敗としては扱わない。

### 3. 固定時刻の生成tree

固定値は`CC_SECRETARY_NOW=2026-07-21T14:05:00+09:00`。一時workspaceでjournal、決定、topic、期限なしTODOを実行した。

```text
AGENTS.md
CLAUDE.md
docs/.gitkeep
inbox/todo.md
memory/MEMORY.md
memory/decisions/2026-07-08-decisions.md
memory/decisions/2026-07-21-decisions.md
memory/journal/2026-07-21.md
memory/preferences.md
memory/topics/Zoom相談.md
```

生成journalと索引の要点:

```text
# 2026-07-21 journal

- 14:05 [did] 活動
- 14:05 [decided] 決定
- 14:05 [note] 案件メモ「Zoom相談」に要点を追加
- 14:05 [next] TODO「期限なし」を追加

- [2026-07-21 の決定](decisions/2026-07-21-decisions.md) — 決定ログ
- [Zoom相談](topics/Zoom相談.md) — 案件メモ
- 2026-07 の活動 — [日次 journal](journal/)
```

### 4. Evaluator独自fixture

Generatorの回帰とは別に、`/tmp`の新規workspaceで35検査を実行した。

```text
EVIDENCE journal_bytes before=113 after=150 delta=37
EVIDENCE reject_rc empty=3 unknown=3 outside=3 base_symlink=3

EVIDENCE seam=save-deliverable    rc=0 delta=1
EVIDENCE seam=todo-add-no-due     rc=0 delta=1
EVIDENCE seam=todo-add-due        rc=0 delta=1
EVIDENCE seam=todo-done           rc=0 delta=1
EVIDENCE seam=todo-carry          rc=0 delta=1
EVIDENCE seam=remember-decision   rc=0 delta=1
EVIDENCE seam=topic-add           rc=0 delta=1
EVIDENCE seam=settings-boundary   rc=0 delta=1

EVIDENCE failed_seam=save-deliverable  rc=3 delta=0
EVIDENCE failed_seam=todo-add           rc=3 delta=0
EVIDENCE failed_seam=remember-decision  rc=2 delta=0
EVIDENCE failed_seam=topic-add           rc=3 delta=0

EVIDENCE rollback_rc todo=3 decision=3 topic=3 deliverable=3 index_unchanged=yes
EVIDENCE deterministic_cksum d1=362795397/138bytes d2=362795397/138bytes
EVALUATOR_SUMMARY PASS=35 FAIL=0
exit 0
```

成功シームは呼出し前後のjournal行数を毎回比較した。主処理失敗は同じjournalの行数とchecksumが変わらないことを確認した。rollback fixtureでは当日journalの保存先を意図的にdirectoryにし、後段のjournal失敗時にTODO・decision・topic・成果物と`MEMORY.md`が変更前へ戻ることを確認した。

### 5. 200行境界と月単位reindex

```text
EXACT_BOUNDARY rc=0 lines=200 warning_bytes=0
OVER_BOUNDARY  rc=0 lines=200
warning=警告: MEMORY.md が200行を超えるため索引を上限内に収めました。古い月のjournalを確認し、退避を検討してください（自動削除はしていません）。

2026-07-01.md + 2026-07-31.md -> `2026-07 の活動` 1行
2026-08-01.md                  -> `2026-08 の活動` 1行
```

## 安全境界の確認

- journalには更新・編集・削除コマンドがなく、末尾appendだけを提供する。
- 決定の変更は過去ファイルを書き換えず、新しい日付ファイルへ追加する。
- topicには確認済み要点だけを保存し、逐語ログやコネクタ本文を保存しない。
- TODO完了・持ち越しは対象表示と`--confirm`を分けた2段階で、元の情報を削除しない。
- `memory/journal/YYYY-MM-DD.md`をdirectoryにした異常fixtureでも、通常のコマンド失敗は主処理までrollbackする。
- repository内の新規実装に`git push`、`git remote add`、外部同期層の生成はない。
- Evaluatorは操作禁止のローカル上流checkoutへ接触せず、`yasashii-harness`にも変更を加えていない。

## 未実施項目と次Sprintへの境界

- Claude Codeへの実インストールと会話ライブ操作は未実施。Sprint 009はGUI・対話ルーター変更ではなく決定的shellシームが対象であり、固定fixtureと全online回帰で必須基準を満たした。
- timeline、朝夕体験、決定3本、decidedゼロの日、相談文脈の節目確認はsprint-010で評価する。
- preferences v2、settings確認、3設定の模擬会話はsprint-011で評価する。
- weeklyと索引退避の実行フローはsprint-012。今回は上限超過時の警告と提案までを評価した。

## 再現手順

```text
cd /Users/taisei/workspace/yasashii-secretary
bash scripts/sprint-009-regression.sh
bash scripts/regression-check.sh --online
```

期待結果は順に`PASS=41 FAIL=0`と`PASS=275 FAIL=0`。online実行にはGitHub APIへ接続できる環境が必要で、接続できない場合は`UNVERIFIED`となり合格扱いされない。
