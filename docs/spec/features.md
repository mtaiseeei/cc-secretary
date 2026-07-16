# Features

機能IDと、ユーザーから見える振る舞いの正本。F01〜F16 は受け入れ済みの既存機能、F17〜F22 は 2026-07-15 方針転換で追加・再定義した機能。

## 既存機能（F01〜F16）

| ID | 機能 | 外から見える結果 |
|---|---|---|
| F01 | マーケットプレイス配布 | `yasashii-secretary` を public / MIT で配布し、Shin-sibainu/cc-company の単段クレジットを維持する |
| F02 | 3コマンド導入 | marketplace add → install → `/secretary` で導入できる |
| F03 | 薄いルーター | 自然な言い回しを必要なスキルへ段階ロードし、全機能を一度に読まない |
| F04 | オンボーディング | 5問以内で `secretary/` を安全に生成し、`git init` と初回ローカルコミットを行う |
| F05 | 記憶ケア | 空上書き禁止、削除2段階、索引追従、`_resume.md` による再開を提供する |
| F06 | daily | 外部予定・タスクとローカルTODOを根拠つきで突き合わせる |
| F07 | 自動コミット | 節目で何をしたか分かる日本語メッセージをローカルcommitし、pushしない |
| F08 | 成果物規約 | `docs/YYYY/MM/YYYY-MM-DD_<title>.md` に frontmatter つきで保存する |
| F09 | Google 接続 | Gmail / Calendar / Drive の公式コネクタ接続と診断を案内する |
| F10 | 文言ルール | 一般技術用語を保ち、馴染みの薄い語だけ短く補足し、3行報告と進行表示を守る |
| F11 | Microsoft 接続 | Microsoft 365 公式コネクタの接続と確認を案内する |
| F12 | Notion 接続 | 任意で Notion の公式接続を案内する |
| F13 | 接続診断 | 実エラーを根拠に原因と対処を伝える |
| F14 | やさしいハーネス提供 | **再定義**: 同梱せず、別repo `yasashii-harness` を正本として提供する |
| F15 | build | `yasashii-harness` の有無を確認し、無ければ3コマンド案内、あれば開発ループへ接続する |
| F16 | 公開ドキュメント | README 前半で非エンジニアが導入でき、後半で技術者が設計とライセンスを確認できる |

## 新機能（F17〜F22）

### F17 journal — 活動記録

- `memory-tools.sh journal-add <sec> <did|decided|next|note> "<本文>"` で日次ログへ末尾追記できる。共通の追記境界は `scripts/lib/journal.sh` の `journal_append` とする。
- 成果物保存、TODO追加・完了・持ち越し、決定記録、topic追加、設定変更を行う定義済みシームは、成功した事実を journal へ自動追記する。
- 空本文を拒否し、既存行の書換・削除シームを提供しない。
- `_resume.md` は作業の中断点、journal の `next` は翌日への申し送りとして使い分ける。

### F18 timeline — 時系列表示と検索

- `memory-tools.sh timeline <sec> [--from/--to] [--type decisions|journal|all] [--grep <キーワード>]` で決定と活動を逆時系列の Markdown に整形する。
- 同一入力から同一出力を返し、LLMの要約に依存しない。
- 「先週なにしてた」「今日やったこと」「いつ決めた」「7月に決まったこと」を期間・種類・キーワードに対応づける。
- 出力を保存してと言われた場合は既存の成果物保存規約に従う。

### F19 節目プロトコル — 決定と相談文脈の記録

- 決定の合図を会話中に検出し、原文のまま1行確認して `remember-decision` へ渡す。既定は都度、設定により締めのまとめ確認へ切り替えられる。
- 会話の締めで、その日の `decided` が0件なら会話を読み返し、拾い漏れを確認する。
- 結論に至らない相談が一区切りしたら、要点を案件メモに残す旨を1行確認して `topic-add` へ渡す。
- topicは `memory/topics/` に保存し、会話全文や逐語ログは残さない。

### F20 settings — パーソナライズ

- 初回と途中変更を同じ `settings` で扱う。初回は既存項目に「仕事・役割」「説明の詳しさ」を加え5問以内、口調は聞かず標準で開始する。
- 「もっとフランクに」「専門用語そのままで」「呼び方を変えて」を受け、変更前に例文を見せて確認し、反映後に覚えた内容を宣言する。
- `memory-tools.sh pref-set` は指定した構造化項目だけを更新し、`memory-tools.sh pref-note-add` は秘書のメモへ追記する。全文の read-modify-write を要求しない。
- 自発的に秘書のメモへ追加するときも1行確認する。
- 役割は保存するだけでなく、提案・例示・用語補足の題材へ反映する。

### F21 週次ふりかえり

- 毎回、対象週の日次 journal 原本から振り返りを作り、要約の要約をしない。
- 決定・活動・翌週への申し送りを区別し、矛盾の統合や古い月の退避はユーザー確認後に行う。
- 外部データを使う場合は出典を行内に明記し、本文を複製しない。

### F22 yasashii-harness の上流追随

- 本機能の実装・正本は別repo `yasashii-harness` に置く。`yasashii-secretary` は参照導線だけを持つ。
- `mtaiseeei/yasashii-harness` はpublic・`fork=false`の独立downstreamで、`origin` を自身、`upstream` を `mtaiseeei/agentic-harness` に向け、fb9c303を初期基点とする。
- 配布識別子はmarketplace `yasashii-harness` とplugin `harness` を分け、`harness@yasashii-harness` で導入する。remote manifestのrepository / homepage / sourceと必要なCodex marketplace識別子をdownstreamへ揃える。
- 本文・スキル・agents・runtimeロジックの差分を「見出しに `yasashii` を含む追加セクションのみ」に限定し、上流由来の実装行を書換・削除しない。機械的例外は宣言済みの配布識別metadata fieldだけとする。
- `gentle-overlay/`、アンカー、`metadata-overrides.json`、`scripts/sync-harness.sh`、やさしい版 agents 3種、独自回帰により、上流merge後も差分と規律を検証できる。
- 上流HEADの前進は警告、取り込み済み上流＋overlayとの不一致、未分類の新規・削除ファイル、アンカー不在は失敗として扱う。
- fork badge／parent relation／同じforkからの上流PRは提供しない。上流変更は本機能のスコープ外であり、将来あらためて明示承認された場合だけ `agentic-harness` 側の別branch / PR手順に分離する。

## Gテーマと機能の対応

| テーマ | 主な機能 |
|---|---|
| G1 | F05 F06 F07 F08 F17 F18 F19 F21 |
| G2 | F04 F10 F20 |
| G3 | F14 F15 F22 |
| G4 | F10 F14 F15 F20 F22 |
