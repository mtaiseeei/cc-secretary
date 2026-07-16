# Sprint 009 — G1 配管: 三層記憶と journal 副作用

- Type: main
- 主眼: 会話体験を大きく変える前に、活動・決定・相談文脈を安全に記録する配管を作る。既存シームの主処理を保ち、成功した事実だけをjournalへ追加する。
- 依存: sprint-008 done。改名後の `yasashii-secretary` 配布構成と全回帰が緑であること。

## 外から見える成果

1. 成果物、TODO、決定、topic、設定変更が正規のシームを通ると、日付別journalへ事実が追記される。
2. 結論に至らない相談の要点を `memory/topics/` に保存できる。
3. TODOを完了・持ち越しでき、期限が無くても扱える。
4. `MEMORY.md` がtopicsを索引し、journalを月単位に畳み、200行上限を守る。
5. `CC_SECRETARY_NOW` で時刻を固定し、同じテストが同じ日付結果を返す。

## スコープ

### A. journal純追加

- 日付別 `memory/journal/YYYY-MM-DD.md` と、末尾appendだけを行う `scripts/lib/journal.sh` の `journal_append` を提供する。
- `memory-tools.sh journal-add <sec> <did|decided|next|note> "<本文>"` を提供する。
- 空本文、未知type、境界外、失敗した主処理を記録しない。既存行の更新・削除機能を作らない。
- journal自体は事実ログとして無確認追記できるが、決定・topicの内容確認は上位の節目プロトコルに残す。

### B. シーム副作用

- `save-deliverable`、`todo-add`、`todo-done`、`todo-carry`、`remember-decision`、`topic-add`、settings設定変更の成功後に、対応する事実をjournalへ追記できる共通経路を用意する。
- settings本体はsprint-011。ここでは後から同じjournal経路へ接続できる境界を作り、未実装機能を現在できると案内しない。
- journal追記失敗時に主処理が成功したように見える／二重追記される等の曖昧な状態を残さない。期待する原子性の扱いをprogressに記録する。

### C. topicsとTODO

- `topic-add` で確認済みの要点を `memory/topics/` に保存し、`MEMORY.md` を追従させる。会話全文は保存しない。
- `todo-done` / `todo-carry` は `backup/sprint-007-010-plan` の旧実装をそのまま復元せず、journal統合形に書き直す。
- TODO期限は任意。期限なしの追加・完了・持ち越しが成立する。

### D. reindexと時刻

- decisions、preferences、topicsを索引し、journalは月単位1行に畳む。
- `MEMORY.md` は200行以内。超過時は既存0/2/3終了コード契約を壊さず、exit 0＋stderr警告で退避提案につなぐ。
- 日付依存処理は `CC_SECRETARY_NOW` を優先し、未指定時だけ現在時刻を使う。ロケール依存の曜日を出さない。
- 自動コミットメッセージは、何をしたかが分かる日本語1行を維持する。

## スコープ外

- timelineの表示・検索、朝夕体験、決定検出プロトコル（sprint-010）。
- settings UIとpreferences v2（sprint-011）。
- weekly（sprint-012）。
- 過去decision行の書換、journalの編集・削除。

## 受入基準

1. **純追加（C3/C5）**: 同一journalの既存内容がbyte単位で保たれ、新規行は末尾だけに増える。更新・削除コマンドが存在しない。
2. **入力拒否（C3/C5）**: 空本文、未知type、境界外、基点symlinkを非ゼロで拒否し、拒否前の副作用が0件。
3. **シーム副作用（C3）**: 各対象シームの成功で正しいtypeの1行が1回だけ増え、主処理失敗時には増えない。
4. **決定の純追加（C3/C5）**: 既存decisionを変更せず、新しい日付ファイルへ変更履歴を追加できる。
5. **topic（C1/C3）**: topic要点が保存され、索引が追従し、会話全文・外部データ本文が保存されない。
6. **TODO（C1/C3）**: 期限あり・期限なしの完了／持ち越しが成立し、旧実装の単純復元ではなくjournal副作用を持つ。
7. **reindex（C3）**: topicsを含み、journalを月単位に畳む。200行以内ケースと超過警告ケースを固定fixtureで確認する。
8. **固定時刻（C3）**: `CC_SECRETARY_NOW` で日付境界を固定し、同一入力の再実行で同じ日付・順序を得る。曜日依存なし。
9. **記憶保護（C5）**: 空上書き禁止、削除2段階、索引追従、path guardを全新規導線が通る。
10. **無回帰（C6）**: sprint-008までの全回帰＋新規assertが0 FAIL。既存シームの主な外部挙動が変わっていない。

## 評価証跡

- 固定時刻を使った一時workspaceのコマンドと生成tree。
- 各シーム成功／失敗前後のjournal差分。
- topics、TODO、MEMORY 200行境界のfixture結果。
- 全回帰のPASS/FAIL集計。

## 参照

- `docs/spec/features.md` F05/F07/F17/F19
- `docs/spec/domain.md` 三層記憶・journal・TODO・MEMORY.md
- `docs/spec/constraints.md` 記憶保護・限定例外・決定性
