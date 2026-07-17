---
createdAt: 2026-07-15
tags:
  - 方針
  - 提案
status: approved（2026-07-16 村山さん承認。8章全項目＋0-a・0-bの追加決定を含む。実装は Codex が担当し、Planner による spec/契約への正本化から開始する）
---

# yasashii-secretary 実現方針書（2026-07-15 方針転換・批評反映版)

sprint-007〜010（朝夕定例化・会議・メール・週次）の白紙化を受けた再設計方針。
9エージェント（repo棚卸し／上流差分／Web調査3本／統合／批評3本）による調査・ドラフト・
adversarial 批評を経て、批評指摘を反映した確定候補版。

対象は4テーマ:

- **G1【最優先】** 相談したり話したりするだけでコンテキストがキレイに溜まる。「何がいつ決まって、この日には何をしたか」がキレイに見える
- **G2【次点】** settings スキルによるパーソナライズ。職業・役職・言葉遣い・技術知見の深浅で変わる「100人100通りの秘書」。初回起動時＋途中変更可
- **G3** 上流 agentic-harness（56ce693 → fb9c303）の巻き取りと、反復可能な巻き取り手順の確立
- **G4** やさしいハーネスの再定義: やさしさ＝言葉遣い・報告・先回り提案。規律・3Agent分離・評価閾値は一切緩めない

## 0-a. 追加決定（2026-07-16 承認）

1. **実装は Codex が担当する**。本方針書が唯一の引き継ぎ正本。ハーネス駆動開発（Planner→Generator→Evaluator）のループはこのリポジトリで従来どおり回す
2. **リポジトリ名を Local・Remote ともに `yasashii-secretary` に変更**する。プラグイン名・marketplace.json・README も追従し、**非エンジニア向けであることを名前とREADMEの両方で強調**する。副次効果として、既存の Shin-sibainu/cc-secretary との名前衝突問題（2026-07-15 に保留した論点）はこの改名で解消される
3. **やさしいハーネスの正本は別リポジトリに分離**する。同梱コピー方式（DESIGN.md の旧決定「ハーネス複製を同梱」）を廃し、`mtaiseeei/yasashii-harness` を新設して正本とする。yasashii-secretary には**参照の仕方（インストール案内・接続導線）だけ**を置く（my-vault の案件ノートと workspace の作業リポジトリを分ける運用と同じ型）。DESIGN.md の該当決定は Planner が改訂する

## 0-b. Sprint 008 spec-issue 追補決定（2026-07-16 承認）

1. `mtaiseeei/yasashii-harness` は GitHub fork ではなく、**独立した public downstream repo** として新設する。GitHub API 上の正しい状態は `full_name=mtaiseeei/yasashii-harness`、`private=false`、`fork=false`
2. downstream の remote は、書込先 `origin=https://github.com/mtaiseeei/yasashii-harness.git` と、読取専用の上流 `upstream=https://github.com/mtaiseeei/agentic-harness.git` を分ける。初期基点は `fb9c303` とし、上流追随は `upstream/main` から行う
3. 親repo `mtaiseeei/agentic-harness` は移管・改名・変更しない。GitHub の fork badge、parent relation、同じforkから上流へPRする導線は非ゴール。上流へ返す変更は本作業のスコープ外であり、将来あらためて明示承認された場合だけ、yasashii-harnessの実装とは別の `agentic-harness` 側branch / PR手順として扱う
4. repo形態を変えても、別repo正本、本文・agents・runtimeロジックは `yasashii` 見出しの追加だけ、上流由来の実装行の書換・削除禁止、`gentle-overlay/`、sync健全性、3 agents、node無し時の `inherit`、独自回帰、上流前進はwarningという規律は維持する。配布識別metadataの機械的例外だけは次項のallowlist規約に従う
5. ローカル `~/workspace/agentic-harness` は全面的な操作禁止対象とする。ファイル編集だけでなく、checkout / switch、commit、branch作成・変更、remote変更、生成物作成、複製元としての利用、当該checkoutを対象にしたコマンド実行を禁止する。参照元はGitHub上の `mtaiseeei/agentic-harness` のみとする
6. 独立downstreamを配布可能にするため、**配布識別metadataだけ**を機械的例外として変更できる。`.claude-plugin/marketplace.json` は marketplace `name=yasashii-harness` / `repository=mtaiseeei/yasashii-harness`、plugin `name=harness` / `source=./plugins/harness` とする。plugin manifest の `repository` / `homepage` は `https://github.com/mtaiseeei/yasashii-harness` を指し、必要なCodex marketplace識別子等も同じ配布元へ揃える。plugin本体の `name` は `harness` のまま維持し、導入識別子を `harness@yasashii-harness` とする
7. metadata例外は `gentle-overlay/metadata-overrides.json`（宣言的overlay兼allowlist）に、対象ファイル、JSON field、期待値を列挙して正本化する。このallowlistに無い上流由来の実装行、スキル本文、agents、runtimeロジックの書換・削除は禁止し、文書・agentsへのやさしさ差分は従来どおり `yasashii` 見出しの追加だけとする。sync後はmetadataの期待値完全一致とallowlist外変更0件を機械検査する

## 0. 不変の前提（本方針のすべてはこれらと矛盾しない）

- 外部データのローカル同期層は作らない（公式コネクタで都度参照・根拠明記）
- 記憶と成果物は `secretary/` にローカル保存し自動コミット、push はしない
- 一般的な技術用語はそのまま使う（過度な平易化の禁止）
- `~/workspace/agentic-harness` は全面操作禁止。編集、checkout、commit、branch、remote変更、生成物作成、複製元利用を含め一切触らず、参照元はGitHubの `mtaiseeei/agentic-harness` に限定する。やさしさ差分は独立downstream `mtaiseeei/yasashii-harness` にだけ置く
- public + MIT、単段クレジット（Shin-sibainu/cc-company）継承
- 記憶保護（空上書き禁止・削除2段階・索引追従）と封じ込め（path-guard.sh 経由）

## 1. 現状認識（2026-07-15 白紙化完了後）

- main HEAD = 1b361c4（sprint-007 実装3コミットを revert 済み）。作業ツリーはクリーン
- sprint-007〜010 の企画（spec 改稿＋契約）と sprint-007 実装の全量は `backup/sprint-007-010-plan` ブランチに退避済み。morning/evening/todo-done/todo-carry の実装は `git show` で個別復元できる
- **初期状態では regression-check.sh section 12 が必ず失敗していた**（ベースラインが上流 56ce693 ピン留めのまま、GitHub上流が fb9c303 に前進）。Sprint 008初回実装は268 PASS / 0 FAILまで復旧したが、存在しない `yasashii-harness` URLを文字列だけでPASSさせる欠陥がEvaluatorにより判明した。独立downstreamの実在検査を含むsection 12への再改訂が、引き続き後続Sprintの前提ブロッカー
- 白紙化した sprint-007 の revert 理由は「規模」でも「品質」でもなく**製品方針の転換**（記録: 本ファイル）。ただし新スプリントは同規模の塊を避けて分割する（実現性批評2）

## 2. G1 — 相談するだけで溜まり、キレイに見える

### 2-1. 記録の三層構造

現状の本質的な穴は3つ: (1) 記録が「覚えて」等のトリガワード完全依存、(2) 「この日何をしたか」のビューが不在、(3) reindex が decisions/preferences しか索引しない。

対策として記録を**三層**に分け、それぞれ記録経路と確認フローを変える:

| 層 | 内容 | 記録経路 | ユーザー確認 |
|---|---|---|---|
| 決定（decided） | 「〜にしよう」「じゃあそれで」と決まった事柄 | 秘書が会話中に検出 → **1行確認** → remember-decision | あり（1行、流せば進む） |
| 活動（did / next） | 成果物保存・TODO完了・設定変更などシームを通った事実 | **シームの副作用として自動追記**（journal-add） | なし（追記専用の事実ログ） |
| 相談の文脈（topics） | 結論に至らない相談の経緯・案件の背景・固有名詞 | 相談が一区切りついたら「要点を案件メモに残しますね」と**1行確認** → topic-add | あり（1行） |

- 三層目（topics）は完全性批評1への対応。決定に落ちない「相談したこと」そのものの受け皿を、器（`memory/topics/`）だけでなく**記録経路・シーム・確認フローまで**定義する
- **決定の検出は LLM 規律に依存する**（実現性批評1）。これを正直に設計に織り込み、二段構えにする:
  1. 都度: ルーター＋AGENTS.md の「節目プロトコル」（決定の合図語を列挙、1行確認して記録）
  2. 回収: 会話の締め（evening / 「今日はここまで」）で、**その日の decided 行が0件なら会話を読み返して拾い漏れを確認する**手順をプロトコルに必須化
  - product.md には「活動は確実に溜まる（シーム保証）。決定は都度＋締めの二段構えで取りこぼしを回収する」と正直に書く
- 決定の文言は**原文で残す**（勝手に膨らませない）。要約は週次ふりかえりの仕事

### 2-2. データモデル

```
secretary/
  memory/
    MEMORY.md                  # 索引。200行上限を明文化
    preferences.md             # G2 で v2 に拡張
    decisions/YYYY-MM-DD-decisions.md   # 既存を拡張（ADRライト・純追加方式）
    journal/YYYY-MM-DD.md      # ★新設: 日次活動ログ（追記専用）
    topics/<トピック名>.md      # ★新設: 案件・相談の文脈メモ
    _resume.md                 # 既存のまま（journal の next 行と役割分担を明記: _resume は「作業の中断点」、next は「翌日への申し送り」）
  inbox/todo.md                # 既存 + todo-done / todo-carry 復元（期限は任意フィールドとして仕様化）
  docs/YYYY/MM/                # 成果物（既存規約のまま）
```

- **journal は追記専用**。`journal-add <sec> <did|decided|next|note> "<本文>"` は末尾 append のみ、空本文は拒否（exit 非0）、既存行の書換シームは作らない。この「事実ログはシーム副作用に限り無確認でよい」という記憶保護規律の例外は **constraints.md に不変条件として明文化**する（原則適合批評5）
- 副作用を持たせるシーム: save-deliverable / todo-add / todo-done / todo-carry / remember-decision / topic-add / settings の設定変更。実装は `scripts/lib/journal.sh` に journal_append を1つ作り各シームから呼ぶ
- **decisions の変更は純追加方式**（原則適合批評4）: 過去ファイルの行は書き換えない。決定が変わったら**新しい日付ファイルに**「変更: 『定員30名』(2026-07-15) → 『定員40名』（理由）」と書き、timeline 表示時に新しい方を優先する。取り消し線での行内改変はしない
- reindex 拡張: topics/ を索引対象に追加、journal/ は月単位1行に畳む、MEMORY.md 200行上限。**超過時は exit 0 ＋ stderr 警告**（既存の終了コード契約 0/2/3 を壊さない。実現性批評3）
- 自動コミットのメッセージを「何をしたか1行（日本語・固有名詞入り）」に規約化 → `git log` がそのまま予備のタイムラインになる（journal と git の二重化）
- タイムスタンプは `CC_SECRETARY_NOW` 環境変数で注入可能にし、回帰テストは固定時刻で決定性を assert（実現性批評7）。曜日表示はロケール依存のため出さない（または日付から決定的に算出）

### 2-3. 可視化 — G1 達成の定義

- **G1 達成の最小可視化 = timeline シーム**と明示的に定義する（完全性批評2）。dashboard.html は「強化」の位置づけで別判断（8章）
- `memory-tools.sh timeline <sec> [--from/--to] [--type decisions|journal|all] [--grep <キーワード>]` を新設。journal/ と decisions/ を読み、日付キー・逆時系列の Markdown を**決定的に**整形（LLM 非関与、同一入力→同一出力で回帰テスト可能）
- `--grep` がキーワード検索を担う: 「Zoomの件いつ決めたっけ」→ decisions 横断検索で該当行＋日付を提示。期間一覧だけでは「いつ決めたっけ」に答えられない
- ルーター語彙: 「先週なにしてたっけ」「今日やったこと見せて」→ timeline --type journal ／「いつ決めたっけ」「7月に決まったこと」→ timeline --type decisions（--grep 併用）
- 「保存して」と言われたら timeline 出力を save-deliverable で成果物化

### 2-4. 記録過多・劣化への対策

1. journal に書くのは「シームを通った事実」と「確認済みの決定・相談要点」のみ。会話全文・逐語ログは書かない
2. 週次ふりかえりは**毎回、日次 journal の原本から**生成（要約の要約禁止）
3. 索引の鮮度: 200行上限＋月単位畳み込み＋古い月の退避提案（memory-care の週次提案に統合）
4. 矛盾解決は「純追加＋新しい方優先表示」（保存時）と「統合はユーザー確認後」（週次）の二段
5. 外部データを根拠に journal に書くときは出典を行内明記（本文は複製しない）

## 3. G2 — 100人100通りの秘書

### 3-1. settings スキル

新スキル `skills/settings/SKILL.md`。**初回（onboarding から呼ばれる）と途中変更（いつでも再入可能）を1つのスキルで受ける**。

- 初回: 現行3問に **Q4 お仕事・役割**（自由回答＋例提示）、**Q5 説明の詳しさ**（3択1タップ）を追加した5問以内（F04「やさしい数問」の許容範囲は要確認 → 8章）
- 口調は初回に聞かず、デフォルト（丁寧・堅すぎない）で開始して「いつでも『設定変えたい』で変えられます」と初回報告で一言添える（progressive profiling。初回に聞くべきかは8章で確認）
- 途中変更の発話例: 「もっとフランクにして」「専門用語そのままでいいよ」「呼び方を〜にして」→ settings が受け、**変更前に例文プレビューを見せて確認**（既存の2段階規律と同型）→ 反映後「こう覚えました」と宣言 → journal に did 行 → 節目コミット
- **preferences の更新は行単位シームに落とす**（実現性批評6）: `pref-set <セクション> <キー> <値>`（該当行のみ置換）と `pref-note-add <本文>`（「秘書のメモ」へ追記専用）を新設。LLM の全文 read-modify-write による手書き行の欠落事故を構造的に防ぐ
- 「秘書のメモ」への自発追記（「その言い方いいね」を拾う）も**1行確認**を挟む（節目プロトコルと同じ型。完全性批評10）

### 3-2. preferences.md v2 スキーマ

```markdown
## 基本（static）
- 呼び方 / お仕事・役割 / 主に使うサービス
## 言葉遣い（categorical）
- 口調: 丁寧（標準）｜フランク｜きっちり敬語   ← templates/tones/ の3プリセット
- 専門用語: ふつう（既定）｜ことば添え｜そのままOK
- 報告の詳しさ: みじかく（既定・3行）｜くわしく（3行+補足1つ）
- 決定の確認: 都度（既定）｜まとめて（会話の締めに一括確認）
## 口調のお手本（NG/OK 例ペア。プリセットから複写され、ユーザーの反応で育つ）
## 秘書のメモ（non-categorical・会話から育つ自由メモ）
```

- **専門用語の既定値は「ふつう」＝現行不変条件と同一挙動**（原則適合批評1)。「ことば添え」は opt-in で、補足対象は馴染みの薄い語＋そのユーザーの職業から見て未知と思われる語に限定。コミット・ファイル等の一般語には既定で添えない（変わるのは併記の粒度であって語彙自体ではない）
- 「決定の確認: 都度/まとめて」を categorical フィールドとして持つ（自由メモに挙動スイッチを埋めない。完全性批評10）
- NG/OK 例ペア方式を採用（例示は抽象指示より効く）。ただし濃いキャラクター（関西弁・執事風等）は初期同梱しない。必要な利用者が自分で例ペアを追加できる余地だけを保つ（実現性批評8。要確認 → 8章）
- persona drift 対策: 口調の正本をファイル外部化し毎セッション読み直す。output styles には依存しない

### 3-3. 適用機構 — plain-language.md の二部化

- **第1部（全員共通・回帰対象・不変）**: 一般技術用語はそのまま／進行の見せ方／エラー翻訳／押しつけない
- **第2部（その人に合わせる・preferences が正本）**: 毎回 preferences.md の「言葉遣い」「口調のお手本」「基本」を読み従う。preferences が無い・空なら既定値で動く
- **役割の写像**（完全性批評3）: 第2部に「基本（static）の役割を読み、提案・例示・用語補足の題材を役割に寄せる」規律と具体例を明記（営業→商談メモ、講師→講義資料、経営→数字のまとめ）。「収集するだけで使われない設定」を作らない
- 全スキル冒頭の定型句を「plain-language.md **と preferences.md** を読む」に更新。agents 3種へは G3 のオーバーレイ節経由で同じ1行を入れる（上流非改変と両立）
- **先行タスク（この順序を守らないと C4/C6 ゼロ許容と衝突）**: constraints.md の「報告3行」「語リスト」条項と rubric C4 を「既定値＋opt-in 上書き」型に再定義し、regression section 5/9 の検査を更新してから実装に入る
- **注意（要ユーザー承認）**: 「報告3行以内」は配布テンプレ `templates/CLAUDE.md` / `templates/AGENTS.md` の絶対ルールにも書かれている。spec だけでなく**憲章テンプレの文言改訂**が必要（原則適合批評2 → 8章）
- 「パーソナライズされた挙動そのものは回帰対象外、rubric は既定値で採点」を constraints.md に明文化（将来の評価器が分岐挙動を誤採点しない）

## 4. G3 — やさしいハーネスの別リポジトリ化と上流巻き取り

### 4-0. リポジトリ分離（2026-07-16 追加決定を反映）

やさしいハーネスの正本は同梱をやめ、**別リポジトリ `yasashii-harness`** に置く。

- **yasashii-harness（新設・正本）**: `mtaiseeei/yasashii-harness` を独立public downstream repoとして作り、`origin` は自身、`upstream` は `mtaiseeei/agentic-harness` に向ける（fb9c303 ベース）。やさしさ差分・sync検証機構・やさしい版 agents（planner/generator/evaluator）はすべてここで管理する。上流巻き取りは `git fetch upstream` 後の `upstream/main` の統合を基本とし、本文差分を「見出しに yasashii を含む追加セクションのみ」（上流行の書換・削除禁止）に保つ。例外は配布識別metadataだけで、`gentle-overlay/metadata-overrides.json` に対象fieldと期待値をallowlistとして宣言する。4-2〜4-3 のオーバーレイ・合成一致検証は「上流同期後の健全性チェック」としてこのリポジトリ側に実装する。上流変更は本作業のスコープ外であり、将来あらためて明示承認された場合だけ、このrepoから直接PRせず `agentic-harness` 側の別branch / PR手順に分離する
- **yasashii-secretary（参照のみ）**: `plugins/*/harness/` の同梱コピーと `agents/` を撤去する。build スキルは「yasashii-harness marketplace の `harness` plugin が入っているか」を確認し、無ければ3コマンドインストールを日常語で案内する**参照導線**に変える。regression section 12 は「同梱物の非改変検査」から、offlineの案内・同梱不在検査と、GitHub APIによるrepo実在・public・`fork=false`・owner/name・marketplace/plugin manifest・3コマンド整合のonline検査へ再設計する。ネットワーク不可はonline健全性のPASSにせず、offline結果と分離して `UNVERIFIED` 等で報告し、Sprint合格にはEvaluatorのonline証跡を必須とする
- `~/workspace/agentic-harness` は引き続き**全面操作禁止**。yasashii-harness はGitHub上の `upstream` remoteからfetchして追随し、ローカルcheckoutを複製元・検査対象・コマンド実行先にしない
- この分離は Anthropic のプラグイン設計指針「狭く1つの問題をよく解くプラグインが残る」にも合致する（秘書と開発ハーネスを独立に更新・配布できる）

以下 4-1〜4-3 の機構設計は **yasashii-harness リポジトリ側の実装内容**として読む。

### 4-1. 前提

- 旧同梱版のやさしさ差分は「見出しを持つ追加セクション」のみ、計43行・4ファイル（harness-loop 9行 / planner 14行 / generator・evaluator 各10行）。独立downstreamでは見出し語を `yasashii` に統一し、上流行の書換・削除を禁止する（実現性批評9）
- 上流は `plugins/harness/` 配下に再編済み。**hooks/hooks.json・session-start.sh・skills/using-harness・commands/harness.md・.codex-plugin が新規に存在**し、取捨の判断が必要（原則適合批評3）

### 4-2. 作業内容

1. **上流対応表を正本化**: 「GitHub remote `upstream` の `plugins/harness/*` → downstream の同一パス `plugins/harness/*`」の対応表と、yasashiiとして利用する面／利用しない面＋理由を明記する
   - 保持する上流資産: init-guidance.sh、templates一式、harness-loop/SKILL.md、resolve/check-runtime-config.mjs、templates/.harness/{config.toml,.gitignore}、vendor/smol-toml（LICENSE・READMEクレジットを継承）、using-harness、commands、hooks、plugin manifest
   - hooks等を `yasashii-secretary` へ同梱・二重登録しない。独立downstreamにある上流資産を削除して帳尻を合わせず、利用しない理由を対応表に残す
   - 同期後、`${CLAUDE_PLUGIN_ROOT}` だけでなく **`$PLUGIN_ROOT` 形式の参照もデッドリンク検査**し、参照断が無いことを確認（実現性批評5の検査すり抜け対策）
   - `.claude-plugin/marketplace.json` は marketplace `name=yasashii-harness`、`repository=mtaiseeei/yasashii-harness`、plugin `name=harness`、`source=./plugins/harness` に揃える。plugin manifestは `name=harness` を維持し、`repository` / `homepage` は `https://github.com/mtaiseeei/yasashii-harness` を指す。必要なCodex marketplace識別子も同じ配布元へ揃え、`harness@yasashii-harness` で一意に導入できるようにする
   - 上記metadata差分は `gentle-overlay/metadata-overrides.json` にJSON field単位で宣言し、それ以外のmetadataや上流由来行の変更を許可しない
2. **node 呼び出しを薄いラッパーシームで包む**（実現性批評5): `harness/scripts/run-runtime-config.sh`（仮）— node があれば .mjs を実行、無ければ「inherit で続行」を決定的に出力して exit 0。上流の「必ず node を実行」文とオーバーレイの「無ければ inherit」文の矛盾解決を LLM 読解に委ねない。**「node を PATH から外した状態で build スキルが一周する」ことを受け入れ基準に含める**
3. **ベースライン再記録**: upstream remoteの fb9c303 を初期基点として記録し、downstream HEADから到達可能であることを検査する
4. **fail 条件の再設計**（原則適合批評8): 回帰の fail は「downstream各管理ファイル＝取り込み済み上流スナップショット＋オーバーレイの合成結果と一致」に置く。**上流 HEAD の前進は fail ではなく「巻き取り候補あり」の警告**に格下げ — 上流が1コミット進むたびに全赤になる構造を再生産しない

### 4-3. 反復可能な巻き取り手順

- やさしさ差分を `gentle-overlay/`（挿入セクション md 断片＋アンカー定義 anchors.tsv＋配布識別metadataの宣言的overlay兼allowlist `metadata-overrides.json`）に正本化
- `scripts/sync-harness.sh` 新設: `git fetch upstream` → upstream HEAD記録 → 対応表に従い同期（upstreamへは読み取りのみ）→ **upstreamツリーとの全ファイル差分を列挙し、対応表に無い新規/削除ファイルがあれば failして報告**（完全性批評5。次回の smol-toml 型の追加を取りこぼさない）→ アンカー直後にオーバーレイ挿入（アンカー不在なら fail）→ metadata overlayをfield単位で適用 → metadata期待値の完全一致とallowlist外の上流行変更0件を検査 → ベースライン再生成 → 回帰実行。再実行しても diffゼロ（冪等）
- 機械同期の後に「上流の新セクションが yasashii 規約と矛盾しないか」の目視レビューを手順に1行入れる
- 運用ルール（constraints.md へ）: 本文・agents・runtimeロジックのやさしさ改変は「見出しに yasashii を含む追加セクション」のみ。上流行の書き換え・削除は禁止。配布識別metadataだけは宣言済みallowlistのfieldに限り機械適用できる。上流変更は本作業のスコープ外であり、将来あらためて明示承認された場合だけ `agentic-harness` 側の別branch / PR手順に分離する。スプリント開始時に `sync-harness.sh --check` を回す

## 5. G4 — やさしいハーネスの再定義

product.md に追記する定義文:

> やさしいハーネスの「やさしい」とは、**ユーザーに見える面**（言葉遣い・報告・次の一手の先回り提案）がやさしいという意味である。**やること自体はやさしくしない**: 規律（6規律・根拠・記憶保護・封じ込め）、3 Agent 分離（Planner / Generator / Evaluator）、評価閾値と回帰ゼロ許容は、一切削らず、緩めない。処理負荷や規律遵守率を下げることは「やさしさ」ではない。

実装層の割当:

| やさしさの要素 | 実装層 |
|---|---|
| 言葉遣い | rules/plain-language.md（二部化。G2 と同一機構） |
| 進行の見せ方 | harness-loop のオーバーレイ節（計画→実装→検証のどこにいるか毎回宣言） |
| 報告 | agents 3種のオーバーレイ節（3行既定＋preferences 参照） |
| 内部用語の翻訳 | build スキル（Planner=段取り係 等の言い換え併記表。用語自体は隠さない） |
| **先回り提案** | templates/AGENTS.md「報告の型」＋各スキル末尾 |

先回り提案の規約（新設）: 報告の3行目を「次の一手の提案」に標準化 — 提案は1つまで／やるかはユーザーが決める（勝手に着手しない）／根拠を一言添える／思いつかないときは無理に作らない。

rubric に「やさしさ軸」を足すかは要判断（8章）。足す場合も C 系ゼロ許容とトレードオフにしない別軸とする。

## 6. スプリント計画

**番号は sprint-008 から振り直す**（sprint-007 は git 履歴に「実装→revert」が残るため再利用しない。state.md に「sprint-007: superseded — 2026-07-15 製品方針転換により白紙化、backup/sprint-007-010-plan に退避」と記録する。原則適合批評6）。

```
sprint-008: 配布物の再編【最優先。section 12 復旧を兼ねる】
            — リポジトリ改名（local/remote とも yasashii-secretary）＋プラグイン名・
              marketplace.json・README の追従（非エンジニア向け強調）＋文言スイープ
            — yasashii-harness 独立downstreamリポジトリ新設（origin/upstream・fb9c303・オーバーレイ・sync 検証・独自回帰）
            — 本体からの同梱ハーネス撤去と参照導線化、regression section 12 再設計
sprint-009: G1 配管層 — journal.sh・シーム副作用・journal-add/topic-add・
            todo-done/carry 復元・reindex 拡張・CC_SECRETARY_NOW・回帰
            （既存シームの外部挙動を変えない純粋な配管。単独で安全に合格可能）
sprint-010: G1 体験層 — timeline（--grep 含む）・節目プロトコル・
            daily 内 morning/evening モードへの復元統合・ルーター語彙
sprint-011: G2 — 先行タスク（constraints/rubric/憲章テンプレの「既定値+上書き」再定義）
            → preferences v2・settings・pref-set/pref-note-add・plain-language 二部化・tones 3種
sprint-012: G1 仕上げ — 週次ふりかえり（原本から生成）・索引退避運用・
            （判断次第で）dashboard.html
```

補足: sprint-008 の改名・分離は挙動（インストールコマンド・プラグイン名）に触れるため、
ハーネス外の直接修正にせず1スプリントとして回す。やさしさ差分の見出し規約は
「cc-secretary を含む」から「yasashii を含む」へ改名時に揃える。

- 順序の理由: section 12 が壊れたままでは以降の Evaluator が回らないため G3 が先。配管（009）と体験（010）の分割は「revert された旧 sprint-007 より大きい塊を積まない」ため（実現性批評2）。G2 は settings の変更記録が journal に乗る依存があるため G1 配管の後
- **LLM 規律部分の検証方針**（完全性批評4): 決定検出・口調遵守・先回り提案は grep で挙動を検証できない。rubric C3 のドライランに**模擬会話シナリオ検査**を明記する — 「決定を含む模擬会話3本で節目確認が出るか」「decided 0件の日の締めで拾い漏れ確認が走るか」「preferences 3設定で同一タスクの報告がどう変わるか」を Evaluator の手動シナリオとして受け入れ基準に載せる
- 各スプリントの受け入れ基準詳細は、本方針承認後に Planner が契約化する

## 7. 変更対象ファイル（全実装時）

- 新設: `skills/{settings,weekly}/SKILL.md`、`scripts/lib/journal.sh`、`templates/memory/journal/`・`templates/memory/topics/`（.gitkeep 契約）、`templates/tones/{standard,friendly,formal}.md`、`scripts/sync-harness.sh`、`gentle-overlay/*`、`harness/scripts/{resolve,check}-runtime-config.mjs`＋`run-runtime-config.sh`（ラッパー）、`harness/templates/.harness/*`、`harness/vendor/smol-toml/`、（判断次第）`templates/dashboard.html`
- `morning` / `evening` は独立SKILLを新設せず、既存 `skills/daily/SKILL.md` 内の朝・日中・夕方モードとして統合する。白紙化前の旧実装はそのまま復元せず、journal・timeline・TODO・`_resume.md` の役割分担へ合わせて書き直す
- 変更: ルーター／onboarding（Q4・Q5）／memory-tools.sh（journal-add・topic-add・timeline・pref-set・pref-note-add・reindex 拡張）／workspace-tools.sh（副作用＋todo-done/carry＋期限任意フィールド）／rules/plain-language.md（二部化）／`templates/AGENTS.md`・**`templates/CLAUDE.md`（憲章の報告規約改訂・承認済み）**／templates/memory/preferences.md（v2）／build スキル（参照導線化）／**docs/spec/{product,constraints,domain,rubric,features,ui}.md**（domain.md を忘れない — memory 構造の正本）／regression-check.sh（section 12 再設計）／README（改名・非エンジニア強調・クレジット）／リポジトリ名（local/remote）・plugins ディレクトリ名・marketplace.json
- **yasashii-harness リポジトリ側（新設）**: 独立public downstream一式＋origin/upstream remote＋gentle-overlay/（metadata-overrides.jsonを含む）＋sync検証スクリプト＋やさしい版 agents 3種＋独自回帰。smol-tomlクレジット等の上流由来クレジットはdownstream側で継承
- 撤去（yasashii-secretary から）: `plugins/*/harness/` 同梱コピー、`plugins/*/agents/`、scripts/harness-source-baseline.sha256（ベースライン検査は yasashii-harness 側の責務へ）
- 新機能ID: F17 journal（活動記録）/ F18 timeline（時系列表示・検索）/ F19 節目プロトコル（決定・相談の記録）/ F20 settings（パーソナライズ）/ F21 週次ふりかえり / F22 sync-harness（巻き取り）※Planner が正式採番

## 8. 要判断事項（**2026-07-16: 全9項目とも推奨どおり承認済み**）

| # | 論点 | 推奨 |
|---|---|---|
| 1 | 憲章テンプレ（templates/CLAUDE.md・AGENTS.md）の絶対ルール「報告3行以内」を「既定3行・preferences 明示時のみ拡張可」へ改訂してよいか | 改訂する（G2 の前提） |
| 2 | 決定確認の既定粒度 | 都度1行（「まとめて」は preferences で切替可能に） |
| 3 | 口調を初回オンボーディングで聞くか／5問構成の可否 | 聞かない（デフォルト開始＋後から変更）。5問は許容 |
| 4 | 濃いキャラプリセット（関西弁・執事風等）の同梱 | 同梱しない。例ペアを育てるチュートリアルは本プラグインの必須導線にしない |
| 5 | dashboard.html | timeline 先行（G1 達成の最小可視化＝timeline と定義）。dashboard は反応を見て sprint-012 で判断 |
| 6 | 既存利用者向けの移行シーム（journal/ 新設・preferences v1→v2 の migrate） | sprint-012時点で既存利用者の証跡がなければ追加しない。既存利用者がいる場合は別途追加判断する |
| 7 | hooks の同梱 | 見送り（回帰の「hooks 非同梱」不変条件と衝突。採用時は不変条件再定義が先行タスク） |
| 8 | 「昨日の状態に戻して」（restore シーム） | 今回スコープ外と明言（product.md の売り文句には「秘書が git で履歴を守っている」事実だけ書き、restore 機能は謳わない） |
| 9 | rubric に「やさしさ軸」を追加するか | 追加する（C 系ゼロ許容とは独立の軸として） |

## 参照

- 調査・批評の生データ: ワークフロー wf_0a1d5b23-bc5（journal.jsonl）
- 白紙化前の全量: `backup/sprint-007-010-plan` ブランチ
- GitHub upstream: `mtaiseeei/agentic-harness` @ fb9c303
- 操作禁止のローカルcheckout: `~/workspace/agentic-harness`（編集・checkout・commit・branch・remote変更・生成物作成・複製元利用・コマンド対象化をすべて禁止）
