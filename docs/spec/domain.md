# Domain

本製品のドメインはDBではなく、`secretary/` のファイル構造、記憶の意味、対話から記録へ移す規則である。

## 主要概念

| 概念 | 意味 | 正本／置き場 |
|---|---|---|
| 秘書 | 記憶・整理・下調べ・成果物・開発導線を担うAI役割 | `yasashii-secretary` skills |
| 秘書ディレクトリ | オンボーディングで生成しgit管理する作業領域 | `secretary/` |
| 決定 | ユーザーが確定し、確認を経て原文で残す事柄 | `memory/decisions/` |
| 活動 | 定義済みシームを通って実際に起きた事実 | `memory/journal/` |
| 相談の文脈 | 結論前の背景・経緯・固有名詞を要点化した案件メモ | `memory/topics/` |
| 中断点 | 今の作業を再開するための一時的な文脈 | `memory/_resume.md` |
| 翌日への申し送り | 次に行う事実として日付に残す項目 | journal の `next` |
| 個人設定 | 役割、言葉遣い、報告、確認方法の明示設定 | `memory/preferences.md` |
| 成果物 | 企画書・調査まとめ等のローカル正本 | `docs/YYYY/MM/` |
| 外部データ | SaaSに置いたまま参照するメール・予定等 | 公式コネクタ |
| やさしいハーネス | 規律を緩めず開発を進める別製品 | 別repo `yasashii-harness` |

## ワークスペース構造

```text
secretary/
├── AGENTS.md
├── CLAUDE.md
├── inbox/
│   └── todo.md
├── docs/
│   └── YYYY/MM/YYYY-MM-DD_<title>.md
├── projects/
└── memory/
    ├── MEMORY.md
    ├── preferences.md
    ├── decisions/
    │   └── YYYY-MM-DD-decisions.md
    ├── journal/
    │   └── YYYY-MM-DD.md
    ├── topics/
    │   └── <トピック名>.md
    └── _resume.md
```

`10_sources/` に相当する外部データ同期層は存在しない。

## 三層記憶

| 層 | 型 | 記録経路 | 記録前確認 |
|---|---|---|---|
| 決定 | `decided` | 会話中の検出→ `remember-decision` → journal副作用 | あり。既定は都度1行 |
| 活動 | `did` / `next` / `note` | 成功したシーム→ journal副作用 | なし。事実の追記だけ |
| 相談文脈 | topic | 区切りで要点確認→ `topic-add` → journal副作用 | あり。1行 |

決定検出はLLM規律に依存するため、「活動はシームが保証するが、決定は都度＋締めで取りこぼしを回収する」と扱う。
決定文は原文で残し、勝手に膨らませない。相談文脈は会話全文を保存せず、確認済みの要点だけを残す。

## journal

### 行の型

- `did`: 実行済みの活動。
- `decided`: 確認済みの決定。decisionファイルと対応する。
- `next`: 翌日以降への申し送り。`_resume.md` の中断点とは別。
- `note`: シームを通った補足事実。自由な逐語ログには使わない。

### 操作規約

- `memory-tools.sh journal-add <sec> <did|decided|next|note> "<本文>"` は対象日ファイルの末尾にだけ追記する。各シームが共有する追記境界は `scripts/lib/journal.sh` の `journal_append` とする。
- 空本文、未知type、安全境界外を非ゼロで拒否する。既存行の更新・削除は提供しない。
- 定義済みシームは本来処理の成功後にだけ追記し、失敗した処理を活動として残さない。
- 日付は `CC_SECRETARY_NOW` で固定可能。曜日は表示しない。

## 決定の純追加モデル

- 初回決定は `memory/decisions/YYYY-MM-DD-decisions.md` へ追記する。
- 変更時は過去行を直さず、新しい日付ファイルに `変更: 「旧決定」(旧日付) → 「新決定」（理由）` の意味を持つ新規行を足す。
- timelineは新しい決定を優先して見せるが、履歴は失わない。

## MEMORY.md と reindex

- `MEMORY.md` は1行1参照の索引で、上限は200行。
- decisions、preferences、topics を索引し、journal は日次行を並べず月単位1行に畳む。
- reindex はtopics追加・削除にも追従する。
- 200行超過を予測した場合、処理自体は `exit 0` を保ち stderr へ警告し、古い月の退避を提案する。自動退避・自動削除はしない。

## timeline

`memory-tools.sh timeline <sec> [--from <日付>] [--to <日付>] [--type decisions|journal|all] [--grep <キーワード>]`

- journalとdecisionsを日付キーで読み、逆時系列のMarkdownに整形する。
- 日付範囲とtypeを組み合わせられる。`--grep` は日付だけでは答えられない横断検索を担う。
- 同一入力・同一固定時刻ではbyte単位で同一出力になることを目標とする。
- 保存依頼時だけ既存 `save-deliverable` で成果物化する。

## TODO

- `inbox/todo.md` は既存TODOの正本。
- 追加、完了、持ち越しをシームで扱い、期限は任意フィールド。
- `todo-done` と `todo-carry` は `backup/sprint-007-010-plan` の旧実装をそのまま戻さず、journal統合形として再構成する。

## preferences.md v2

```markdown
## 基本
- 呼び方:
- お仕事・役割:
- 主に使うサービス:

## 言葉遣い
- 口調: 丁寧（標準） | フランク | きっちり敬語
- 専門用語: ふつう | ことば添え | そのままOK
- 報告の詳しさ: みじかく | くわしく
- 決定の確認: 都度 | まとめて

## 口調のお手本
- NG:
- OK:

## 秘書のメモ
```

既定値は、口調=丁寧（標準）、専門用語=ふつう、報告=みじかく（3行）、決定確認=都度。
`memory-tools.sh pref-set <セクション> <キー> <値>` は指定行だけを更新し、`memory-tools.sh pref-note-add <本文>` は秘書のメモに追記する。
設定変更前は例文プレビューで確認し、変更後はjournalへ `did` を追記して節目コミットする。

## 口調プリセットと役割の適用

- `standard`、`friendly`、`formal` の3プリセットを提供し、NG/OK例ペアを設定へ複写できる。
- 関西弁・執事風など濃いキャラクターは同梱しない。
- お仕事・役割は、営業なら商談メモ、講師なら講義資料、経営なら数字のまとめ、のように提案・例示・用語補足の題材へ使う。
- 毎セッション `preferences.md` を読み、output styleだけに依存しない。

## 成果物・外部根拠・コミット

- 成果物は `docs/YYYY/MM/YYYY-MM-DD_<title>.md`。frontmatterに `createdAt` と `tags` を持ち、1ファイル1トピック、見出しに固有名詞を入れる。
- 外部根拠はサービス名＋URL/ID＋日付で示し、本文を保存しない。
- 節目コミットのメッセージは何をしたか分かる日本語1行。pushは明示時のみ。

## `yasashii-harness` との境界

- `yasashii-secretary` の build は別repoプラグインの存在を確認し、未導入なら3コマンドで案内する。
- `yasashii-harness` が Planner / Generator / Evaluator、`gentle-overlay/`、sync健全性、独自回帰を所有する。
- `mtaiseeei/yasashii-harness` は独立public downstream repoで、GitHub API上 `fork=false`。GitHubのparent relationには依存しない。
- downstreamのremote topologyは、`origin=https://github.com/mtaiseeei/yasashii-harness.git`、読取専用の `upstream=https://github.com/mtaiseeei/agentic-harness.git`。fb9c303がdownstream HEADの履歴から到達可能でなければならない。
- 配布識別は marketplace `yasashii-harness` とplugin `harness` を組み合わせた `harness@yasashii-harness`。marketplace manifestは `repository=mtaiseeei/yasashii-harness`、pluginは `source=./plugins/harness`、plugin manifestの `repository` / `homepage` は `https://github.com/mtaiseeei/yasashii-harness` を指し、必要なCodex marketplace識別子も同じ配布元へ揃える。
- 上流由来行への例外は `gentle-overlay/metadata-overrides.json` に宣言した配布識別metadata fieldだけ。syncは期待値の完全一致とallowlist外変更0件を検査する。
- `yasashii-secretary` 側のoffline回帰は、案内・3コマンドの構造、同梱コピー・agents・旧ベースラインの不在を検査する。online検査はGitHub APIでrepo実在、public、owner/name、`fork=false`、remote manifestのname / source / repository / homepageと3コマンドの整合を確認する。
- ネットワーク不可はonline検査のPASSにしない。offline構造検査の成功と、Evaluatorが取得するonline証跡を別結果として記録する。
- 上流へ返す変更は `yasashii-harness` から直接送らず、`agentic-harness` 側の別branch / PR手順に分離する。
