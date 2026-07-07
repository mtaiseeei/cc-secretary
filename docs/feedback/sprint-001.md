# Feedback — sprint-001（動く初回体験）

> **最新判定（再評価 2026-07-08 / 2回目）: 合格。** 詳細は本ファイル末尾「## 再評価（2回目・2026-07-08）」を参照。
> 以下は 1回目（不合格）の記録。差し戻し経緯として残す。

---

## 初回評価（1回目・2026-07-08）

- 判定: **不合格（差し戻し）**
- 評価者: Evaluator
- 評価日: 2026-07-08
- 分類: **implementation-issue（主）＋ spec-issue（要オーケストレーター判断）**

## 総評（3行）

- 骨組み・オンボーディング生成物・6規律・git初期化・非エンジニア文言は実体を伴い、質が高い。
- ただし**二段クレジット（中間フォーク inoshinichi/bootcamp-company）が成果物のどこにも無く**、`docs/spec/constraints.md` L40 の不変条件と sprint-001 スコープ L18 に違反する。
- さらに回帰スクリプトの assert が**この点を検査しないよう弱められており（骨抜き）**、`PASS=50` は受入基準1を実質的に保証していない。1基準でも閾値を下回るため不合格。

## 各基準のスコア（rubric.md 準拠）

| # | 基準 | 閾値 | スコア | 判定 |
|---|---|---|---|---|
| C1 | 完成度（受入基準を全て満たす） | ≥4 | **3** | ✗ 受入基準1（二段クレジット）未達 |
| C2 | 構文・整合（JSON有効・参照実在・name一意） | 5 | 5 | ✓ |
| C3 | 機能の実証（ドライラン生成物・規律） | ≥4 | 5 | ✓ |
| C4 | 非エンジニア体験 | ≥4 | 5 | ✓ |
| C5 | 安全・規律（不変条件に違反しない） | 5 | **4** | ✗ constraints.md L40 の二段継承違反 |
| C6 | 無回帰（回帰チェックが受入を保護） | 5 | **4** | ✗ クレジット assert が骨抜き |

→ C1・C5・C6 が閾値未満のため **不合格**。

## 証跡

### 1. 回帰スクリプト再実行（Generator の PASS=50 を再現・ただし骨抜きあり）

`bash scripts/regression-check.sh` を Evaluator が実行 → **PASS=50 / FAIL=0**（全50 assert が緑）を再現した。
出力全文は末尾「付録A」に記載。数値そのものは Generator の申告どおりだが、下記のとおり受入基準1を検査していない。

### 2. 【重大】二段クレジット違反（受入基準1 / constraints.md L40 / sprint-001 L18）

正本の要求（**両方**を明記）:
- `docs/spec/constraints.md` L40:「クレジットは**二段継承**する: 元作者 **Shin-sibainu/cc-company（MIT）** と中間フォーク **inoshinichi/bootcamp-company** の両方。」
- `docs/sprints/sprint-001.md` L18:「forkedFrom フィールドでクレジットを明記（**Shin-sibainu/cc-company・inoshinichi/bootcamp-company の二段継承**）。」
- Evaluator への指示（team-lead）:「二段クレジット（Shin-sibainu/cc-company と inoshinichi/bootcamp-company）を個別に確認」。

実測（`grep -rn 'inoshinichi\|bootcamp-company' . | grep -v .git/`）:
- `inoshinichi/bootcamp-company` は **成果物（marketplace.json / LICENSE / plugin.json / README 等）に一切存在しない**。ヒットするのは `docs/`・`CLAUDE.md` の仕様側記述のみ。
- `marketplace.json` L21 は `"forkedFrom": "https://github.com/Shin-sibainu/cc-company"` の**単段のみ**。
- `LICENSE` L5-7 も Shin-sibainu/cc-company のみ。

Generator は `docs/progress/sprint-001.md` L69 で「**ユーザーの明示指示により単段化した**、回帰チェックも cc-company クレジットのみを要求するよう更新済み、spec 本文は未編集」と自己申告している。

**Evaluator の判断**: 判定は正本（constraints.md / sprint 契約）に照らして行う。正本は依然として二段継承を要求しており、成果物はそれを満たさない。progress.md はエージェントの記述であり、それ単体を「正本を上書きする承認」として扱うことはできない（ハーネス規律上、仕様変更は Planner が spec に反映して初めて有効）。よって現状は「仕様＝二段／実装＝単段」の未解消の食い違いであり、このスプリントは正本基準で不合格とする。

### 3. 【重大】回帰スクリプトの骨抜き assert（C6）

`scripts/regression-check.sh` L62-73 のクレジット検査は:
```python
if "Shin-sibainu/cc-company" not in blob: errs.append("...のクレジットが無い")
if "forkedFrom" not in p: errs.append("forkedFrom フィールドが無い")
```
**中間フォーク `inoshinichi/bootcamp-company` の存在を一切 assert していない。** 受入基準1（二段クレジット）の後段を検査しないため、単段クレジットでも緑になる。これはまさに検証を無効化する骨抜き assert であり、`PASS=50` は受入基準1の合格根拠にならない。

### 4. 安全・規律の実地確認（違反なし）

- `~/workspace/agentic-harness`: 最終更新 **Jul 2 16:08**（本作業より前）→ 非書込を確認。
- `~/workspace/inbox/company`: 最終更新 **Jun 23 11:11** → 非書込を確認。
- 資格情報の実値: `grep -rnEi '(password|api[_-]?key|secret|token)\s*[:=]\s*[A-Za-z0-9]{6,}'` → 該当なし。
- 外部データ同期層（`10_sources` 型）: リポジトリ・生成物ともに無し（回帰 section 6 で確認）。
- `.mcp.json` は `mcpServers: {}` の最小構成（同期層を持ち込まない）を確認。
- （※クレジット違反は「安全」ではなく「構成上の不変条件（constraints.md L40）」の違反として C5 に計上。）

### 5. 合格している部分（独立に確認済み・回帰の数値ではなく実物で確認）

- **マニフェスト（C2）**: marketplace.json / plugin.json ともに有効JSON、`source ./plugins/cc-secretary` 実在、name 一意（secretary / onboarding）、段階ロード参照先（plain-language.md / onboarding SKILL）実在＝デッドリンクなし。
- **生成物（C3）**: scratchpad 相当の一時ディレクトリで実体化を再現し、`secretary/` が domain.md 構造どおり（AGENTS.md / CLAUDE.md / inbox / docs / projects / memory/{MEMORY.md, decisions/YYYY-MM-DD-decisions.md, preferences.md}）に決定的生成。`templates/AGENTS.md` に6規律すべてが**実質的な内容つき**で存在（規律1スコープ＋資格情報禁止／規律2根拠＋サービス名リンク日付／規律3出力規約＋frontmatter／規律4記憶保護＋空上書き禁止・削除前警告・MEMORY索引／規律5自動コミット＋push明示時のみ／規律6報告の型3行）。`CLAUDE.md` はポインタのみ（規律本文なし）。`MEMORY.md` は1行索引の初期形。
- **git（受入基準4）**: 生成物で `git init`＋日本語初回コミット1件、リモート未設定・upstream なし（push なし）を回帰で確認。
- **非エンジニア体験（C4）**: onboarding/SKILL.md の質問文は2〜3択＋具体例＋日常語（Q1呼び方・Q2サービス・Q3任せたいこと）、完了報告は3行型で「次は『今日やること』や『〇〇を調べて』と話しかけてください」と次の一手を明示。secretary/SKILL.md も準備中機能を正直に案内。plain-language.md は3行型・進行語彙（計画→道具→確認→結果）・英語エラー翻訳の骨子を持ち、両 SKILL から参照。生の英語エラー露出なし。**このカテゴリは満点相当。**

## 修正指示（Generator / オーケストレーター向け）

このスプリントは**クレジット方針の食い違いを解消するまで合格にできない**。次のどちらかで解消すること:

**経路A（実装を正本に合わせる＝implementation-issue / 既定）**
1. `.claude-plugin/marketplace.json` に中間フォーク inoshinichi/bootcamp-company のクレジットを追加する（例: `forkedFrom` を配列化するか、`credits` フィールドに両者を列挙。正本 L18 が要求するのは「二段継承の明記」）。
2. `LICENSE` にも inoshinichi/bootcamp-company（cc-company の中間フォーク）を追記する。
3. `scripts/regression-check.sh` L62-73 を修正し、**`inoshinichi/bootcamp-company` と `Shin-sibainu/cc-company` の両方**が marketplace.json（および必要なら LICENSE）に存在することを assert する。骨抜きを解消する。
4. 回帰を再実行し、二段クレジットを検査した上で緑になることを確認して progress を更新。

**経路B（正本を実装に合わせる＝spec-issue / ユーザー指示が事実の場合のみ）**
- progress.md L69 の「ユーザーが単段化を指示した」が事実であれば、**Planner が `docs/spec/constraints.md` L40 と `docs/sprints/sprint-001.md` L18 を単段（Shin-sibainu/cc-company のみ）に正式変更**し、`docs/DESIGN.md`・sprint-006 L10・features.md L10・product.md L48 の記述も整合させること。その後、回帰スクリプトの assert も単段前提で明示的に検査する形へ直す（現状の「片方だけ暗黙的に」ではなく、方針を明文で検査）。
- **Evaluator はユーザー指示の真偽を確認できない**ため、この選択はオーケストレーター/ユーザーが確定する必要がある。確定するまでは正本（二段）を基準に不合格とする。

いずれの経路でも、**回帰スクリプトがクレジット方針を実際に検査する（骨抜きでない）状態**にすることを合格の必須条件とする。

## 付随事項（ブロッカーではない・記録のみ）

- **templates/ のインストール後パス解決（spec-issue 候補）**: Generator が progress L68 で指摘済み。`templates/` はリポジトリ直下だが配布実体は `plugins/cc-secretary/`。オンボーディングが実インストール時に `templates/` を確実に参照できるか（`${CLAUDE_PLUGIN_ROOT}` 相対か）は未確定。sprint-001 のドライラン受入はリポジトリ構造で満たすため本スプリントはブロックしないが、実運用前に Planner の明確化を推奨。
- **回帰のデッドリンク検査範囲（軽微）**: L99-104 は `plugins/cc-secretary/...` パスのみ検査。SKILL 内の `templates/`・`docs/spec/...` 相対参照は検査対象外（現状は実在するので実害なし）。
- **手動ライブ確認は未実施**: サインイン環境での marketplace add→install→`/secretary` は本環境で不可。rubric 6 の「未実施の手動確認」として明記（Web アプリ用スクショ要件は本種別に非適用）。スクリプト検証＋実物目視をゲートとした。

## 付録A: 回帰チェック実行の全出力

```
== 1. マニフェスト有効性 ==
  PASS marketplace.json が有効な JSON
  PASS plugin.json が有効な JSON
  PASS 必須フィールド・クレジット（cc-company）・source 実在
  PASS .mcp.json が有効な JSON
  PASS .mcp.json が最小（mcpServers 空 = 同期層なし）

== 2. スキル構文・段階ロードの参照整合 ==
  PASS secretary/SKILL.md が存在
  PASS onboarding/SKILL.md が存在
  PASS rules/plain-language.md が存在
  PASS secretary の name が 'secretary'
  PASS onboarding の name が 'onboarding'
  PASS name が一意（重複なし）
  PASS SKILL の段階ロード参照先が全て実在

== 3. オンボーディング生成物（テンプレ実体化ドライラン） ==
  PASS secretary/AGENTS.md がある
  PASS secretary/CLAUDE.md がある
  PASS secretary/inbox/ がある
  PASS secretary/docs/ がある
  PASS secretary/projects/ がある
  PASS secretary/memory/MEMORY.md がある
  PASS secretary/memory/decisions/ がある
  PASS 初回決定ログが日付名で1件ある
  PASS secretary/memory/preferences.md がある
  PASS テンプレ変数の置換漏れがない
  PASS 規律1 スコープ / 規律2 根拠 / 規律3 出力規約 / 規律4 記憶保護 / 規律5 自動コミット / 規律6 報告の型
  PASS 資格情報を書かない旨の明記 / push しない旨の明記
  PASS CLAUDE.md が AGENTS.md を案内 / CLAUDE.md に規律本文が無い（ポインタのみ）
  PASS MEMORY.md が目次であると明記 / 初回セットアップの索引行 / 呼び方が反映

== 4. git 初期化 ==
  PASS secretary/ が git 初期化済み / コミットが1件だけ / 初回コミットが日本語メッセージ
  PASS リモートが未設定（push されていない） / upstream 追跡ブランチが無い（未 push）

== 5. 非エンジニア体験 ==
  PASS secretary/SKILL が plain-language を参照 / onboarding/SKILL が plain-language を参照
  PASS plain-language に報告3行型 / 進行語彙 / 英語エラー翻訳 / onboarding 完了報告に『次』

== 6. 安全・規律 ==
  PASS 生成物が一時ディレクトリ配下（harness 非書込）
  PASS 同期層 10_sources を作らない / 生成物に 10_sources 型フォルダが無い
  PASS 生成物に資格情報の実値が無い

== 結果 ==
PASS=50  FAIL=0
```

（注: 上記は全 assert が緑だが、§3 のとおりクレジット assert が二段継承を検査していないため、`PASS=50` は受入基準1の合格根拠にならない。）

---

## 再評価（2回目・2026-07-08）

- 判定: **合格**
- 評価者: Evaluator
- 評価日: 2026-07-08
- 基準: **改訂後の** `docs/spec/constraints.md`（L40-43 単段方針＋回帰での明示検査要件）と `docs/sprints/sprint-001.md` 受入基準1（クレジット方針 C5・ゼロ許容）

### 総評（3行）

- 前回のブロッカー（二段クレジット違反＋クレジット assert の骨抜き）は完全に解消された。
- クレジット方針はユーザー確認により**単段（Shin-sibainu/cc-company・MIT のみ）**が正式確定し、Planner が正本を改訂、実装・配布物・回帰スクリプトすべてが改訂後の正本に合致する。
- 回帰スクリプトのクレジット検査は正負両方向を持ち、Evaluator 自身の負テストで骨抜きでないことを確認。全6基準が閾値を満たすため合格。

### 各基準のスコア（改訂後 rubric.md 準拠）

| # | 基準 | 閾値 | 前回 | 今回 | 判定 |
|---|---|---|---|---|---|
| C1 | 完成度 | ≥4 | 3 | **5** | ✓ 受入基準1〜7 すべて達成 |
| C2 | 構文・整合 | 5 | 5 | **5** | ✓ 据え置き（JSON有効・参照実在・name一意） |
| C3 | 機能の実証 | ≥4 | 5 | **5** | ✓ ドライラン生成物・6規律・git 状態 再現 |
| C4 | 非エンジニア体験 | ≥4 | 5 | **5** | ✓ 据え置き |
| C5 | 安全・規律 | 5 | 4 | **5** | ✓ 単段方針が不変条件化・実装が合致・安全違反ゼロ |
| C6 | 無回帰 | 5 | 4 | **5** | ✓ 53 assert パス・クレジット assert に歯あり（負テスト確認） |

→ 全基準が閾値以上のため **合格**。

### 証跡

#### 1. 回帰スクリプト再実行（Evaluator 実行）

`bash scripts/regression-check.sh` → **PASS=53 / FAIL=0**（前回の 50 から、クレジット方針の明示検査3件が追加されて 53）。全出力は末尾「付録B」。

追加された検査（`scripts/regression-check.sh` L46-101）:
- L66-70: `forkedFrom` が存在し、その**値が** `Shin-sibainu/cc-company` を指すこと（値まで検査）。
- L73-74: marketplace.json 全体に元作者クレジットが存在。
- L76-77: marketplace.json に `bootcamp-company` / `inoshinichi` を**含まない**（単段方針の負方向検査）。
- L89-90: `LICENSE` に `MIT` と `Shin-sibainu/cc-company` の明記。
- L92-101: 配布物（marketplace.json / plugin.json / LICENSE / `plugins/` 配下）に中間フォークを**必須クレジットとして掲げていない**こと。

#### 2. 【重点】クレジット assert が骨抜きでないことを Evaluator の負テストで確認

改竄コピー（原本は無変更・scratchpad 上）に対し検査ロジックを走らせ、いずれも正しく FAIL 判定になることを確認:
- 負テスト1: LICENSE から `Shin-sibainu/cc-company` を除去 → `grep -q 'Shin-sibainu/cc-company'` が **FAIL（検知）**。
- 負テスト2: marketplace.json に `inoshinichi/bootcamp-company` を混入 → 負方向 grep が **混入を検知**。
- 負テスト3: `forkedFrom` を無関係リポジトリに変更 → Python 検査が **`forkedFrom不正を検知`** を返す。

→ 前回指摘の「片方だけ暗黙的に見て単段でも緑になる」状態は解消。検査に実効性がある。

#### 3. 正本と実装・配布物の整合（食い違いの解消を確認）

- `docs/spec/constraints.md` L40-43: 必須クレジットは**単段**（Shin-sibainu/cc-company・MIT のみ）、中間フォークは必須クレジットから除外、**回帰でこの方針を明示検査**、と改訂済み。
- `docs/sprints/sprint-001.md` 受入基準1 に「クレジット方針（C5, ゼロ許容）」を追記。改訂後の受入基準1〜7を実装が満たすことを確認。
- 整合ドキュメントも単段化済み: `product.md` L48 / `features.md` L10 / `sprint-006.md` L10（いずれも「元作者 Shin-sibainu/cc-company のみ・中間フォークは必須クレジットに含めない」）。
- 配布物の実確認（`grep -rniE 'bootcamp-company|inoshinichi' .claude-plugin plugins LICENSE`）→ **該当なし**。`marketplace.json` の `forkedFrom` は `https://github.com/Shin-sibainu/cc-company`、`LICENSE` は MIT＋cc-company の単段。
- `docs/progress/sprint-001.md` L38/L70 に食い違い解消の経緯（ユーザー確認→単段確定→正本改訂→assert 強化・負テスト確認）が記録済み。

#### 4. 安全・規律の再確認（違反なし）

- `~/workspace/agentic-harness`: 最終更新 **Jul 2 16:08**（本作業で不変）→ 非書込。
- `~/workspace/inbox/company`: 最終更新 **Jun 23 11:11**（不変）→ 非書込。
- 資格情報の実値: `grep -rnEi '(password|api[_-]?key|secret|token)\s*[:=]\s*[A-Za-z0-9]{6,}'` → 該当なし。
- 外部データ同期層（`10_sources` 型）なし、`.mcp.json` は `mcpServers: {}` の最小構成（回帰 section 6 で確認）。

#### 5. C2/C3/C4 の据え置き確認

回帰再実行で section 2〜5 が全て緑（マニフェスト有効・name 一意・参照デッドリンクなし・6規律実体・CLAUDE.md ポインタ・MEMORY.md 索引・git init＋日本語コミット＋push なし・plain-language 参照・完了報告の「次」）。前回の実物目視結果から変化なし。

### 残課題（ブロッカーではない・後続スプリントへ）

- **templates/ のインストール後パス解決**（spec-issue 候補・progress L69）: 配布実体は `plugins/cc-secretary/` だが `templates/` はリポジトリ直下。実インストール時に onboarding が確実に参照できるか（`${CLAUDE_PLUGIN_ROOT}` 相対 or リポジトリ全体キャッシュ前提）は未確定。sprint-001 の受入はリポジトリ構造で満たすため本スプリントはブロックしないが、実運用前に Planner の明確化を推奨。
- **手動ライブ確認は未実施**: サインイン環境での marketplace add→install→`/secretary` は本環境で不可（rubric 6 の「未実施の手動確認」として明記）。スクリプト検証＋実物目視＋負テストをゲートとした。

### 付録B: 再評価時の回帰チェック全出力

```
== 1. マニフェスト有効性 ==
  PASS marketplace.json が有効な JSON
  PASS plugin.json が有効な JSON
  PASS 必須フィールド・forkedFrom=cc-company・source 実在
  PASS LICENSE に MIT の明記
  PASS LICENSE に Shin-sibainu/cc-company のクレジット
  PASS 配布物に中間フォークの必須クレジットが無い（単段方針）
  PASS .mcp.json が有効な JSON
  PASS .mcp.json が最小（mcpServers 空 = 同期層なし）

== 2. スキル構文・段階ロードの参照整合 ==
  PASS secretary/SKILL.md 存在 / onboarding/SKILL.md 存在 / rules/plain-language.md 存在
  PASS secretary の name='secretary' / onboarding の name='onboarding' / name 一意
  PASS SKILL の参照先（skills/rules/templates/spec）が全て実在

== 3. オンボーディング生成物 ==
  PASS 構造9点（AGENTS/CLAUDE/inbox/docs/projects/MEMORY/decisions/日付ログ/preferences）
  PASS テンプレ変数の置換漏れがない
  PASS 規律1〜6（スコープ/根拠/出力規約/記憶保護/自動コミット/報告の型）
  PASS 資格情報を書かない / push しない の明記
  PASS CLAUDE.md が AGENTS.md を案内 / 規律本文なし（ポインタのみ）
  PASS MEMORY.md 目次明記 / 初回索引行 / 呼び方反映

== 4. git 初期化 ==
  PASS init 済み / コミット1件 / 日本語メッセージ / リモート未設定 / upstream なし（未 push）

== 5. 非エンジニア体験 ==
  PASS plain-language 参照（両 SKILL）/ 3行型 / 進行語彙 / 英語エラー翻訳 / 完了報告に「次」

== 6. 安全・規律 ==
  PASS harness 非書込 / 10_sources なし（repo・生成物）/ 資格情報の実値なし

== 結果 ==
PASS=53  FAIL=0
```
