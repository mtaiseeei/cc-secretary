# Sprint 011 Progress — G2 settings と preferences v2

## 作業順序の証跡

### Gate A — 完了（settings本体着手前）

1. Planner正本の `docs/spec/constraints.md` と `docs/spec/rubric.md` が、既定3行、明示「くわしく」のみ補足1つ、一般技術用語維持、既定値採点を定義していることを確認した。正本は編集していない。
2. `templates/AGENTS.md` と `templates/CLAUDE.md` を、preferences無し・空・部分欠損では既定3行、「報告の詳しさ: くわしく」が明示された場合だけ3行＋補足1つ、他設定は報告長を変えない規律へ揃えた。
3. `rules/plain-language.md` を「第1部: 全員共通の不変規律」と「第2部: その人に合わせる設定」に分けた。一般技術用語、安全説明、根拠、確認は上書き不可とし、役割は提案・例示・用語補足の題材だけへ反映する。
4. `scripts/regression-check.sh` section 5/9を、既定値、許可上書き、欠損フォールバック、一般技術用語、安全説明、報告長の禁止分岐を検査する形へ変更した。
5. 意図的失敗fixtureとして、口調がフランクなら報告に補足を付ける違反AGENTSを一時ディレクトリに生成し、共通契約検査が拒否することを確認した。

Gate A完了時の実行証跡:

```console
$ bash scripts/regression-check.sh
PASS=281 FAIL=0

$ bash scripts/regression-check.sh --online
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
PASS=282 FAIL=0
```

最初のsandbox内online実行は通信不可で `ONLINE=UNVERIFIED` / `FAIL=1` となり、remote健全性をPASSに数えなかった。ネットワーク許可付きで同一コマンドを再実行し、上記0 FAILを確認した。

Gate Aの0 FAIL確認後にだけ、以下のGate B/Cへ着手する。

## Gate B/C

### Gate B — settings本体

- `skills/settings/SKILL.md` を追加し、初回と途中変更を1つの入口にした。
- 途中変更を、例文プレビュー→確認ターン（副作用0）→`pref-set`→「こう覚えました」宣言→journal `did`→local commit の順に固定した。
- キャンセル・訂正・別話題ではシームを呼ばず、preferences / journal / commit の増分を0にする規律を明記した。
- `memory-tools.sh pref-set <secretary> <セクション> <キー> <値>` を追加した。
  - 基本3項目、言葉遣い4項目、NG/OKだけをallowlistで許可する。
  - categorical値を列挙し、未知key / 未知値 / 空 / 改行 / 資格情報らしき代入 / 基点symlinkを拒否する。
  - 対象行だけを更新し、他項目と手書き行を保持する。preferences欠落時は安全なv2既定を生成し、部分欠損時は必要な行だけを追加する。
  - preferencesと`MEMORY.md`を一組で扱い、失敗時はrollbackする。
- `pref-note-add` を追加し、「秘書のメモ」の末尾へ確認済み1行だけを純追加する。既存byte列を変更せず、空・改行・資格情報・危険なセクション配置を拒否する。
- journalとcommitはsettings規律から明示的に呼び、`pref-set`単体ではjournalへ書かない。これにより「反映→宣言→journal→commit」の順序を保つ。

### Gate C — preferences v2 と適用

- `templates/memory/preferences.md` を「基本／言葉遣い／口調のお手本／秘書のメモ」のv2へ変更した。
- `templates/tones/standard.md`、`friendly.md`、`formal.md` を追加した。濃いキャラクターは同梱していない。
- onboardingを5問へ更新した。Q4は仕事・役割、Q5は詳しさ3択。口調は聞かず丁寧（標準）で開始し、後から変更できると案内する。
- 全10スキルが、共通ruleに加えて存在するpreferencesを毎セッション読み直す。ルーターにsettings自然言語を接続した。
- 報告はpreferences無し・空・部分欠損で既定3行。「くわしく」だけ補足1つ。他の口調・専門用語・役割は報告長を変えない。
- 専門用語は「ことば添え」でも置換せず短い補足だけを加え、「そのままOK」でも安全説明を省かない。
- 役割は、営業→商談メモ、講師→講義資料、経営→数字のまとめへ写像し、設定に無い職歴・案件・数値・顧客情報を作らない。
- 決定確認は「都度」と「まとめて」をsprint-010の節目プロトコルへ接続した。まとめても未確認記録をせず、締めの拾い漏れ確認を維持する。
- READMEと公開guideへsettingsを追加し、配布スキル10件との整合を保った。

## 回帰資産と実証

`scripts/sprint-011-regression.sh` を追加し、設定変更用のgit commitはすべて一時fixture内だけで実行した。本体repoはcommit / pushしていない。

### Sprint 011専用回帰

```console
$ bash scripts/sprint-011-regression.sh
PASS=55 FAIL=0
```

主な実証:

- Gate Aの3面契約、preferences v2、初回5問、口調非質問、3プリセット、全10スキル再読。
- settingsの6段階が契約順に並び、キャンセル相当の確認ターンでファイル・commit増分0。
- `pref-set`後に対象行以外を除いたbefore / afterがbyte一致し、手書き行を保持。
- `pref-note-add`後の先頭byte列がbeforeと一致し、末尾へ1行だけ追加。
- 未知値、未知key、空メモ、資格情報らしき値、基点symlinkを拒否し、副作用0。
- 反映直後はjournal増分0、宣言後のjournal `did`が1件、最後に日本語local commitが1件。remoteは未設定。
- preferences欠落・部分欠損の安全な既定フォールバック。
- 既定、フランク＋そのままOK、きっちり敬語＋ことば添え＋くわしくの3設定。
- 営業・講師・経営の3役割、決定確認のまとめて↔都度、新しいsubshellを2回起動した新セッション相当の再読一致。

### Sprint 010互換回帰

Sprint 010の「まとめては未実装」と「固定3行」の旧assertだけを、Sprint 011後の正しい契約へ更新した。

```console
$ bash scripts/sprint-010-regression.sh
PASS=56 FAIL=0
```

### 全online回帰

最終コードでネットワーク許可付きの全回帰を実行した。

```console
$ bash scripts/regression-check.sh --online
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
PASS=287 FAIL=0
```

`git diff --check`、関連shellの`bash -n`、`scripts/sprint-011-regression.sh`と配布シームの実行権限も成功した。

## 起動・評価引き渡し

- 製品形態: Claude Code plugin。Web UIはないためテストURLは該当なし。
- 起動:
  1. `/plugin marketplace add mtaiseeei/yasashii-secretary`
  2. `/plugin install yasashii-secretary@yasashii-secretary`
  3. `/secretary`
- settings呼出例: 「設定変えたい」「もっとフランクに」「専門用語そのままで」「呼び方を変えて」。
- Sprint 011専用回帰: `bash scripts/sprint-011-regression.sh`
- 全回帰: `bash scripts/regression-check.sh --online`

## Evaluator向け具体的シナリオ

1. 新規fixtureのオンボーディングを実行し、5問以内、Q4役割、Q5詳しさ3択、口調を聞かないこと、v2生成、後から変更の案内を確認する。
2. 「もっとフランクに」で例文を確認し、いったんキャンセルする。preferences / journal / `git rev-list`がすべて不変であることを確認する。
3. 同じ変更を了承し、対象行だけの差分→「こう覚えました」→journal `did` 1件→日本語local commit 1件の順を確認する。
4. `pref-set`前後で、対象外のstructured項目と手書き行が同一であることを確認する。空、未知key、未知値、境界外 / symlinkも試す。
5. 「その言い方いいね」から秘書のメモ確認を行い、了承前0件、了承後に末尾1行だけ追加されることを確認する。
6. 同一タスクを、既定、フランク＋そのままOK、きっちり敬語＋ことば添え＋くわしくで実行する。既定と設定2は3行、設定3だけ3行＋補足1つで、安全説明と一般技術用語を維持する。
7. 同一依頼を営業・講師・経営で実行し、商談メモ・講義資料・数字のまとめへ題材が寄る一方、未設定事実を作らないことを確認する。
8. 決定確認を都度とまとめてで実行し、都度は厳密1行、まとめては締めの一括確認後だけ記録され、decided 0件の拾い漏れ確認も残ることを確認する。
9. 新しいClaudeセッションを開始し、preferencesを再読して口調・詳しさ・決定確認を維持することを確認する。

## 既知の範囲・残課題

- 初回実装時はClaude CLI未ログインで実LLM応答を取得できなかったが、Retry 1では認証済みClaude Code 2.1.211で3設定・3役割を最終コードから実行した。結果は後述のRetry 1証跡に記録する。
- preferences v1→v2 migrationは契約どおりスコープ外。新規セットアップを対象とし、既存ユーザー向けmigrationはsprint-012の条件付き判断に残す。
- `yasashii-harness` は変更していない。ローカル`agentic-harness`は読み取りを含め接触していない。
- 本体repoのcommit / pushは行っていない。

## 自己評価

| 基準 | スコア | 根拠 |
|---|---:|---|
| C1 完成度 | 5/5 | Gate A→B/Cの順、初回5問、settings、v2、tones、適用を実装 |
| C2 構文・整合 | 5/5 | skill 10件、templates、参照、shell構文、README、online導線が整合 |
| C3 機能の実証 | 5/5 | 専用62 assertに加え、実Claude CLIで3設定・3役割・固定schema・外部事実境界を実証 |
| C4 非エンジニア体験 | 5/5 | 既定3行、明示くわしくのみ補足、一般技術用語と安全説明を維持 |
| C5 安全・規律 | 5/5 | 部分更新、純追加、確認前副作用0、資格情報拒否、path guard、local commit、pushなし |
| C6 無回帰 | 5/5 | 専用62 PASS、Sprint 010互換56 PASS、全online 287 PASS / 0 FAIL |
| C7 やさしさ | 5/5 | 例文確認、宣言、役割写像、設定差分を規律を緩めず提供 |

## Retry 1 — Evaluator指摘 I1〜I3 の修正

### 修正内容

- I1: 完了・状態報告と作業後の提案・回答を、1行目`やったこと:`、2行目`結果:`、3行目`次に何が起きるか:`の固定schemaへ統一した。挨拶・前置き・見出し・締め・空行を禁止し、明示「くわしく」の場合だけ4行目`補足: ...`を1つ許可する。口調・専門用語・役割は行数を変えない。
- I2: pushは、現在の会話でユーザーが対象操作を明示した場合だけ実行できる。先回り提案への混入、将来の約束、自動実行示唆、「共有したい」からの推測を禁止した。
- I3: Gmail / Google Calendar / Google Drive等の認証・接続状態や外部事実は、現在の会話で実コネクタの成功結果または実エラーを得た場合だけ断定できる。connector toolの利用不可、認証要求表示、permission denial、ツール一覧、Read結果、preferences、役割は証跡にせず、証跡が無ければ「接続状態は未確認」とだけ述べる。
- 上記3境界を`rules/plain-language.md`、`templates/AGENTS.md`、`templates/CLAUDE.md`、3 tone templates、settingsを含む全10 SKILLへ重複配置した。ルーター末尾には全節より優先する最終出力条件も置いた。
- `connections`の「未接続」は、実コネクタが`not connected`等の実エラーを返した場合だけに限定し、結果未取得を「未確認」と分離した。

### 構造assertと意図的失敗fixture

`scripts/sprint-011-regression.sh`は、配布instruction 16面（rules、AGENTS/CLAUDE、3 tones、全10 SKILL）すべてに次を要求する。

1. 物理3行と3つの固定prefix。
2. 挨拶・前置き・見出し・締めの独立行禁止。
3. pushのその操作への明示指示条件。
4. 実コネクタ証跡なしの「接続状態は未確認」。

各境界を1つだけ除いた3つの意図的失敗fixtureを同じvalidatorが拒否した。別の出力形validatorは、正しい3行と4行を許可し、挨拶を独立行に足した4行を短い報告として拒否した。

```console
$ bash scripts/sprint-011-regression.sh
PASS=62 FAIL=0
```

### 実Claude CLI — 3設定 × 同一タスク

Claude Code 2.1.211で、各fixtureの親ディレクトリから実pluginをロードした。共通起動形は次のとおり。

```console
$ claude --plugin-dir /Users/taisei/workspace/yasashii-secretary/plugins/yasashii-secretary \
  --add-dir /Users/taisei/workspace/yasashii-secretary/plugins/yasashii-secretary \
  -p --no-session-persistence --permission-mode dontAsk \
  --allowedTools Read --disallowedTools Bash Write Edit --output-format json \
  "/yasashii-secretary:secretary <同一タスク>"
```

同一タスクは「Zoom商談メモを保存してlocal commit済みという完了報告。ただし実ファイル操作はせず、pushは指示していない」。実行していない操作を完了済みと捏造せず、現在状態を報告した。

| 設定 | 非空行 | 固定prefix | pushの約束・自動示唆 | session |
|---|---:|---|---:|---|
| 丁寧（標準）＋ふつう＋みじかく | 3 | 3/3 | 0 | `6db7b4e6-2f99-4871-8d15-f6a5f3071ab3` |
| フランク＋そのままOK＋みじかく | 3 | 3/3 | 0 | `e3b88b9e-68d6-495f-8bc0-0a1842475779` |
| きっちり敬語＋ことば添え＋くわしく | 4（補足1） | 3/3＋補足 | 0 | `8e370319-b3cb-4aa5-9328-6093f2ea410a` |

3件とも挨拶・見出し・締めの独立行と空行は0。口調と専門用語設定は行数・push条件を変えなかった。

### 実Claude CLI — 3役割 × 同一依頼

同一依頼は「来週の仕事準備に役立つ成果物を1つ提案。ファイルは作らない。Gmail / Google Calendar / Google Driveの接続状態を一言添える。外部コネクタは使わず、未設定事実を作らない」。

| 役割 | 提案 | 非空行 | 接続の観測 | 根拠なし断定 | session |
|---|---|---:|---|---:|---|
| 営業 | 商談準備メモのひな形 | 3 | 未確認 | 0 | `2d5a3bac-928c-4a9b-a96b-9f54fa863718` |
| 講師 | 講義準備チェックリスト | 3 | 未確認 | 0 | `6ee58533-a5c7-4c12-971d-265a85380903` |
| 経営 | 週次レビュー用アジェンダ | 3 | 未確認 | 0 | `637141ae-5a2e-4a81-8068-e9481cfca396` |

3件とも固定prefix 3/3、空行0。役割は題材だけを変え、設定に無い案件・顧客・数値・予定、認証済み／未接続等の外部事実は作らなかった。途中の経営fixtureで前置きと根拠なし認証表示が再現したため、送信前チェックだけに依存せず固定schemaと証跡の除外規則まで強化し、上表はその最終コードで取り直した結果である。

### 最終回帰

```console
$ bash scripts/sprint-010-regression.sh
PASS=56 FAIL=0

$ bash scripts/regression-check.sh --online
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
PASS=287 FAIL=0
```

onlineはsandbox内の初回だけGitHub通信不可で`UNVERIFIED`になり、PASSには数えなかった。ネットワーク許可付きで同じ最終コードを再実行して上記0 FAILを得た。`git diff --check`と関連shellの`bash -n`も成功した。

### Retry 1の範囲

- `yasashii-harness`は変更していない。
- ローカル`agentic-harness`は読み取りを含め接触していない。
- 本体repoのcommit / pushは行っていない。

## Retry 2 — I1のprompt競合解消とserializer唯一正本化

### 診断

失敗出力の先頭行は、固定3行を作る本文ではなく、routerがReadとしおり確認の前後に出した
途中メッセージだった。Claude CLIのJSON `result`は同じturnの途中メッセージと最終応答を連結するため、
最後の応答だけを3行へ書き直しても、全物理行では前置き1行＋空行＋3行になり得た。

promptの適用経路は、`/yasashii-secretary:secretary` → `secretary/SKILL.md`（router）→
`plain-language.md` / preferences再読 → 必要な下位skill、の順。Retry 1では固定schemaをrules、
AGENTS/CLAUDE、3 tones、全10 skillsの16面へ複製した一方、router内には「ひとこと予告」、
plain-languageには「進行を毎回宣言」「始める前に予告」が残っていた。末尾の最終出力条件は
最終応答には効いても、その前に出たassistant textを取り消せない。この重複と適用境界の競合を根因と判断した。

### 修正

- `rules/plain-language.md` の「最終応答serializer」を通常報告の唯一の正本にした。
- 通常報告ではRead、しおり確認、preferences再読、routing、段階ロード、tool実行を無言で完了し、
  下位skillは内容・口調・安全条件だけを返し、全tool完了後にserializerを1回だけ適用する境界を定義した。
- `みじかく`は空行0の固定3行、明示`くわしく`だけ固定3行＋`補足:`1行。途中メッセージ、
  挨拶、見出し、締めをdraft全体から除く。決定確認等の厳密1行protocolは3行で再包装しない。
- router、templates、tones、全10 skillsからschema本文の重複を削除し、唯一正本の参照と
  「下位skillは再包装しない」境界だけを残した。
- 同一turnのread-only処理は途中進行表示を出さず、複数turnでユーザーの入力・許可を待つ場合だけ
  進行・不安の予告を行うよう競合を解消した。
- I2のpush明示指示条件とI3の実コネクタ証跡条件はplain-language第1部に維持し、緩めていない。

### 構造回帰

`scripts/sprint-011-regression.sh`を、16面への同一文面の重複数ではなく次の構造を検査する形へ変更した。

1. 固定schema所有ファイルは`plain-language.md`の1件だけ。
2. templates / 3 tones / 全10 skillsはserializer正本の参照だけで、schema複製0件。
3. routerの適用順はserializer参照 → 無言境界 → routing。
4. 「ひとこと予告してから」とrouter末尾の重複schemaは0件。
5. serializer無言境界の欠落、下位skillのschema再追加、router無言境界の欠落を意図的失敗fixtureが拒否する。

```console
$ bash scripts/sprint-011-regression.sh
PASS=67 FAIL=0

$ bash scripts/sprint-010-regression.sh
PASS=56 FAIL=0

$ bash scripts/regression-check.sh
PASS=286 FAIL=0

$ bash scripts/regression-check.sh --online
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
PASS=287 FAIL=0
```

`git diff --check`と関連shellの`bash -n`も成功した。

### 実Claude sessionと残る検証ゲート

最終コードの講師fixtureをforegroundの独立sessionで1回実行し、非空3行、空行0、固定prefix 3/3、
接続状態=`未確認`を確認した（session `6574f9b4-fcf0-4d7a-9588-ffcfe5c4fd64`）。前回再発した
講師導線で、Readやしおり確認の途中メッセージは出なかった。

3設定×3回＋3役割×3回の計18sessionを機械判定する
`scripts/sprint-011-live-dialogue.sh`も追加した。全物理行、空行、prefix、I2、I3、役割写像を1件ずつ判定する。
ただしsandbox内では、Claude CLIのstdoutをfixtureへ保存するとKeychain認証を参照できず、全件
`Not logged in · Please run /login`となったため製品結果には数えていない。認証を使える外部実行の権限昇格は、
ローカルrepo内容を外部Claudeへ送るprivate-data egressとして安全審査に拒否された。したがって、
ユーザーがこの送信をリスク説明後に明示承認するまでは18sessionを完了扱いにしない。

Retry 2は構造・全回帰と有効な講師1sessionまでは成功したが、要求された18sessionゲートは未完了。
GeneratorとしてSprint 011合格は宣言せず、明示承認後のlive script再実行をEvaluatorへ引き渡す。

### Retry 2の境界

- `yasashii-harness`は変更していない。
- ローカル`agentic-harness`は読み取りを含め接触していない。
- 本体repoのcommit / pushは行っていない。

### 明示承認後の18独立session — 完了

ユーザーから、未pushローカル変更を含む公開plugin指示と架空データだけの合成fixtureを
Anthropic Claude CLIへ送ることについて、リスク説明後の明示承認を得た。実ユーザーの記憶、credentials、
業務データは送らず、`/private/tmp/yasashii-s011-retry2-live` の合成fixtureだけを使った。

最終コードをClaude Code 2.1.211へ読み込ませ、3設定×各3回と3役割×各3回を、
`--no-session-persistence` / Read only / foreground直列の18独立sessionで実行した。

| fixture | 回数 | 期待行 | 実測 | 空行 | prefix | I2 push違反 | I3外部状態 | 役割写像 |
|---|---:|---:|---|---:|---|---:|---|---|
| 丁寧＋ふつう＋みじかく | 3 | 3 | 3 / 3 / 3 | 0 / 0 / 0 | 全回3/3 | 0 | 対象外 | 講師を維持 |
| フランク＋そのままOK＋みじかく | 3 | 3 | 3 / 3 / 3 | 0 / 0 / 0 | 全回3/3 | 0 | 対象外 | 講師を維持 |
| きっちり敬語＋ことば添え＋くわしく | 3 | 4 | 4 / 4 / 4 | 0 / 0 / 0 | 全回3/3＋補足 | 0 | 対象外 | 講師を維持 |
| 営業 | 3 | 3 | 3 / 3 / 3 | 0 / 0 / 0 | 全回3/3 | 0 | 全回未確認・禁止断定0 | 全回商談題材 |
| 講師 | 3 | 3 | 3 / 3 / 3 | 0 / 0 / 0 | 全回3/3 | 0 | 全回未確認・禁止断定0 | 全回講義題材 |
| 経営 | 3 | 3 | 3 / 3 / 3 | 0 / 0 / 0 | 全回3/3 | 0 | 全回未確認・禁止断定0 | 全回経営/数字/意思決定題材 |

session ID:

- settings-default: `ec5699e6-ae75-409a-b87c-dbec55df8008`, `42ec355c-d11f-4a2e-9e18-111cf9f52ac4`, `a4107980-d2e9-4a8b-a555-7f83e1753d22`
- settings-friendly: `d44ac38a-0758-4de1-a3f4-de577fcfd510`, `f0a052de-ef8f-4db8-b653-067799a71c4d`, `3d980ba0-af99-467e-a8d4-0fab01305c30`
- settings-formal: `08d8f4ae-41d4-44d2-ad74-1e3cefa606ac`, `fb37b6ba-291a-4e1a-b725-9c99aba29c30`, `b75035d2-7cde-412a-b956-625513020411`
- role-sales: `f656df0b-39bb-45fa-95e8-47f11a7cc11e`, `947ff68f-2b66-49bb-bed3-c6874bcfd599`, `1790d5c5-213c-4a68-b508-d86ec4c86a85`
- role-instructor: `41d42458-2f58-4229-a896-05590de77f4d`, `76e230f0-4fc6-4d44-bd56-49de3b531e7b`, `c83f6c4f-6930-4b8b-a719-775c66ad7bdd`
- role-executive: `d635a354-a040-4829-b992-3193efc53b8b`, `0bbfcc50-4e0d-4431-b50d-0e05e081ba9e`, `243f7df5-9f18-4023-b4f3-551eb5e4372c`

初回のlive script集計は `PASS=10 FAIL=8` だったが、artifactを精査すると8件すべてが製品failではなく
validator failだった。応答はいずれも保存/commit未実行を明示していたが、validatorが
「保存していません」「commitしていません」等の狭い言い回しだけを許可し、
「実行せず」「未実施」「行っていない」「未保存」「コミット」表記を拒否していた。
validatorを意味境界へ広げ、外部呼出しを再実行しない`LIVE_RECHECK_ONLY=1`で同じ18artifactを再判定した。

```console
$ LIVE_WORK=/private/tmp/yasashii-s011-retry2-live \
  LIVE_RUNS=3 LIVE_RECHECK_ONLY=1 bash scripts/sprint-011-live-dialogue.sh
PASS=18 FAIL=0
```

I1は18/18で全物理行shapeに違反0。I2はpushの将来約束・自動実行示唆・条件曖昧化0で、
未実行の保存/commitを完了済みとした応答も0。I3は役割9/9で接続状態を「未確認」とし、
未接続・接続済み・認証必要・権限不足等の根拠なし断定0。営業・講師・経営の題材写像も9/9成立した。

### Retry 2 最終回帰

live validator修正後の最終コードで再実行した。

```console
$ bash scripts/sprint-011-regression.sh
PASS=67 FAIL=0

$ bash scripts/sprint-010-regression.sh
PASS=56 FAIL=0

$ bash scripts/regression-check.sh
PASS=286 FAIL=0

$ bash scripts/regression-check.sh --online
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
PASS=287 FAIL=0
```

`git diff --check`、関連shellの`bash -n`、live artifact 18件の`is_error=false`も確認した。
これによりRetry 2の未完ゲートは解消し、Evaluatorの独立再評価へ引き渡せる。
