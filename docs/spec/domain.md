# Domain

本製品のドメインはDBではなく、1つのGitHub repoにある秘書・開発・Chatworkの関係、
`secretary/` の記憶の意味、外部データを記録へ移す規則である。

## 主要概念

| 概念 | 意味 | 正本／置き場 |
|---|---|---|
| 秘書 | 記憶・整理・下調べ・成果物・開発導線を担うAI役割 | `yasashii-secretary` skills |
| public配布repo | plugin配布ソースと公開ドキュメントの正本。利用者データやChatwork live環境は置かない | `yasashii-secretary` |
| ユーザーワークスペース | 秘書・プロジェクト・Chatworkをまとめる唯一のprivate GitHub repo | repo root |
| private test workspace | 実利用と同じsingle-repo構成で実APIを評価する専用private GitHub repo | 評価用repo root |
| 秘書ディレクトリ | オンボーディングで生成しgit管理する作業領域 | `secretary/` |
| 決定 | ユーザーが確定し、確認を経て原文で残す事柄 | `memory/decisions/` |
| 活動 | 定義済みシームを通って実際に起きた事実 | `memory/journal/` |
| 相談の文脈 | 結論前の背景・経緯・固有名詞を要点化した案件メモ | `memory/topics/` |
| 中断点 | 今の作業を再開するための一時的な文脈 | `memory/_resume.md` |
| 翌日への申し送り | 次に行う事実として日付に残す項目 | journal の `next` |
| 個人設定 | 役割、言葉遣い、報告、確認方法の明示設定 | `memory/preferences.md` |
| 成果物 | 企画書・調査まとめ等の同じrepo内の正本 | `docs/YYYY/MM/` |
| 外部データ | SaaSに置いたまま参照するメール・予定等 | 公式コネクタ |
| Chatwork接続 | GitHub上の安全な保管場所（Repository Secret）にあるTokenを使う読取専用接続 | GitHub Actions |
| ルーム選択 | ユーザーが保存対象として明示したルームID集合 | 同じrepoのChatwork設定 |
| Chatwork履歴 | 選択ルームから取得済みのメッセージ | 同じrepoのChatwork履歴領域 |
| 同期状態 | 最終成功、ルームごとの取得位置、失敗理由 | 同じrepoの状態記録 |
| やさしいハーネス | 規律を緩めず開発を進める別製品 | 別repo `yasashii-harness` |

## single-repoワークスペース

```text
<private-workspace-repo>/
├── <通常のプロジェクトファイル>
├── secretary/
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── inbox/todo.md
│   ├── docs/YYYY/MM/YYYY-MM-DD_<title>.md
│   ├── projects/
│   └── memory/
│       ├── MEMORY.md
│       ├── preferences.md
│       ├── decisions/YYYY-MM-DD-decisions.md
│       ├── journal/YYYY-MM-DD.md
│       ├── topics/<トピック名>.md
│       └── _resume.md
├── <Chatworkの選択設定・同期状態・履歴>
└── <GitHub Actionsの同期設定>
```

具体的なChatwork用ファイル名はGeneratorが決めるが、設定・状態・履歴は役割を分ける。
Chatwork専用repoやsecretary専用の永続ローカルrepoは作らない。`10_sources/` に相当する汎用外部データ同期層も作らない。
public配布repoはこの構造の保存先にせず、plugin・公開README・配布検査だけを所有する。

## 実API live gate

### 評価場所

- 実APIはpublic配布repoではなく、専用private test workspaceで評価する。
- test workspaceも実利用時と同じく、pluginの利用設定・生成物、`secretary/`、通常project、Chatwork設定・workflow・同期状態・履歴を1つのrepoに置く。public配布ソース自体の複製は要求しない。
- Chatwork専用repo、Secret専用repo、履歴だけのrepoへ分割しない。

### 開始条件

次がすべて揃った場合だけlive gateを開始できる。

1. ユーザーがprivate test workspaceの作成、Repository Secret設定、workflow dispatch、remote push、Chatwork API送信を明示許可している。
2. test用tokenがRepository Secretへ登録でき、token値をrepo本文や証跡へ出さない。
3. 個人情報・業務本文を評価対象にしない非機密test roomが準備されている。
4. test workspaceがprivateで、評価に必要な共同編集者とActions権限だけを持つ。

開始条件が欠ける場合は `external-live-gate-unavailable` として未検証にする。Sprintは不合格だが、
合成fixtureの失敗や実装不具合とは扱わない。条件が整った後に同じEvaluator gateを再実行する。

### 伏せ字証跡

証跡に残せるのは、private状態、Repository Secret名の存在、workflow run ID／状態、取得room件数、
選択test roomの伏せ字識別子、取得件数、commit hash、push／pull成功、検索結果状態である。
token値、不要なroom名、Chatwork本文、業務固有名詞は残さない。

### 後始末

- 評価終了後はscheduleを停止し、Repository Secretを削除し、test roomの選択を解除する。
- workflow、取得履歴、test workspaceを残す必要がある場合は、目的・保持期間・閲覧者をユーザーへ示す。
- repoや履歴の削除・archiveは別の破壊的操作として、対象と影響を示した後の明示確認でだけ行う。

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

## Chatworkの取得境界

### 初回取得

- 対象はユーザーが選択したroomだけ。
- roomごとにAPIが返せる最新100件以内を取得する。0件は正常な初期状態。
- 100件より前、またはセットアップ以前の履歴を取得済みと見せない。
- message IDが同じ項目は同一メッセージとして扱い、再取得で重複させない。

### 継続取得

- 新しい取得結果を既存履歴へ統合し、過去に取得したメッセージをAPI応答から消えたことだけで削除しない。
- 同期成功時だけ取得位置と最終成功時刻を進める。部分失敗はroom単位で区別し、全成功と見せない。
- room選択解除は「今後取得しない」という意味。取得済み履歴の削除は別の2段階確認を必要とする。
- APIの編集・削除状態を完全復元できるとは約束しない。Git履歴には取得時点の差分が残る。

### 自動取得の間隔

| 表示する選択肢 | 30日換算の概算実行回数 | 実行の意味 |
|---|---:|---|
| 30分ごと | 1,440回 | 毎時17分・47分を起点 |
| 1時間ごと（おすすめ） | 720回 | 毎時17分を起点。既定推奨 |
| 3時間ごと | 240回 | 3時間ごとの17分を起点 |
| 6時間ごと | 120回 | 6時間ごとの17分を起点 |
| 12時間ごと | 60回 | 12時間ごとの17分を起点 |
| 手動のみ | 0回 | 自動実行なし |

実行回数は回数の概算であり、GitHub Actionsの処理時間ではない。2026年7月時点でGitHub Freeの
非公開リポジトリに含まれる月2,000分は処理時間の枠であり、2,000回の実行枠ではない。
実使用量はプラン、runner、各回の処理時間で変わり、料金・利用枠も変更される可能性がある。
busy roomの最新100件が覆う時間幅は推奨材料にできるが、間隔の最終決定はユーザーが行う。

### 設定変更結果

- 初回設定結果と設定変更結果を区別する。
- 設定変更後は、現在の選択room、現在の頻度、scheduleの有効／無効を表示する。
- 変更前の初回取得件数や旧room一覧を現在結果として再表示しない。取得履歴自体は削除せず、設定結果とは分けて参照する。

### 検索結果の状態

`/chatwork search` は結果を次のいずれかとして扱う。

- `found`: 保存済み履歴に一致し、room・日付・メッセージ根拠を示せる。
- `not-found-locally`: 現在の保存済み履歴には一致しない。存在しないとは断定しない。
- `sync-declined`: ユーザーが手動同期を選ばなかった。
- `room-review-needed`: 対象roomが未選択の可能性がある。
- `sync-failed`: workflow失敗・timeout等で最新性を確認できない。
- `still-not-found`: 同期成功後も一致しないが、導入前履歴、100件制約、キーワード差、編集・削除の可能性が残る。

### 手動同期の状態遷移

1. repoの最新状態をpullする。
2. 保存済み履歴を検索する。
3. `not-found-locally` の場合だけ、同期／中止／room見直しを構造化質問で確認する。
4. 同期承認時だけworkflowを開始し、完了を待つ。
5. 成功確認後にpullし、同じ条件で再検索する。失敗・timeout時は検索結果を最新と見なさない。

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
- 節目コミットのメッセージは何をしたか分かる日本語1行。初回pushと同意済みChatwork schedule以外の予期しないpushは確認する。

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
