# Feedback — sprint-002（記憶ケアと自動コミット）

> **最新判定（再評価 2026-07-08 / 2回目）: 合格。** 詳細は本ファイル末尾「## 再評価（2回目・2026-07-08）」を参照。
> 前回のブロッキング（破壊的シームのスコープ逸脱）は修正・検証済み。残存は低リスクのハードニング推奨2点（symlink 書き込み・delete "." の偽装成功）で、ブロッキングではない。
> 以下は 1回目（不合格）の記録。差し戻し経緯として残す。

---

## 初回評価（1回目・2026-07-08）

- 判定: **不合格（差し戻し）**
- 評価者: Evaluator
- 評価日: 2026-07-08
- 分類: **implementation-issue（ブロッキング）**

## 総評（3行）

- 記憶保護の中核（空上書き拒否・削除前確認・索引追従・しおり往復・節目コミットの push 禁止）は決定的シームとして正しく実装され、回帰 89 assert も全緑・非エンジニア文言も良好。
- ただし決定的シーム `memory-tools.sh` が **`secretary/` 配下への封じ込めを一切検証しておらず**、パストラバーサル引数で `secretary/` の外を `rm -rf` 削除・書き込みできる（規律1スコープ・ヘルパー自身の「外は触らない」宣言に違反）。
- 破壊的操作のスコープ逸脱は C5（安全・規律・ゼロ許容）違反にあたるため不合格。中核機能は完成しているので、封じ込めガード追加の限定修正で再提出可能。

## 各基準のスコア（rubric.md 準拠）

| # | 基準 | 閾値 | スコア | 判定 |
|---|---|---|---|---|
| C1 | 完成度 | ≥4 | 4 | ✓ 中核機能（索引/保護/しおり/コミット）は動作 |
| C2 | 構文・整合 | 5 | 5 | ✓ memory-care frontmatter 有効・name 一意・`${CLAUDE_PLUGIN_ROOT}` 参照実在 |
| C3 | 機能の実証 | ≥4 | 4 | ✓ ドライランは通るが封じ込めの assert が欠落（下記） |
| C4 | 非エンジニア体験 | ≥4 | 5 | ✓ 削除警告・しおり提案・3行型・言い換え併記 |
| C5 | 安全・規律 | 5 | **3** | ✗ 破壊的シームが `secretary/` 外へ逸脱（規律1違反・ゼロ許容） |
| C6 | 無回帰 | 5 | 5 | ✓ 既存 57 assert 全パス |

→ C5 が閾値（5・ゼロ許容）を下回るため **不合格**。

## 証跡

### 1. 回帰スクリプト再実行（Evaluator 実行）

`bash scripts/regression-check.sh` → **PASS=89 / FAIL=0**（既定）。`env -u CLAUDE_PLUGIN_ROOT`（フォールバック）でも全緑。
section 7（記憶ケア）は実測 **27 check**。progress の「section 7 が32件」はラベルのズレで、新規32件の内訳は section 7=27＋section 2（memory-care 存在・`.sh` デッドリンク検査）＋section 5（memory-care 体験3件）。実害はないが記録として指摘。

section 7 の assert 自体は骨抜きではない（終了コード・cksum 内容不変・索引件数・git ログ・push 抑止を実挙動で検査）。ただし**スコープ封じ込めを検査していない**（下記 §3 の欠落）。

### 2. 中核機能は正しく動作（Evaluator の手動実行で確認）

一時 `secretary/` を作り `memory-tools.sh` を直接操作:
- **空上書き拒否**: `printf '  \n\t' | memory-tools.sh guarded-write preferences.md` → **exit 3**・既存内容（`呼び方: 村山さん`）保持。非空は成功。
- **削除前確認**: `delete <sec> preferences.md`（--confirm なし）→ **exit 3**・「消そうとしている」警告・ファイル残存。`--confirm` 時のみ削除＋索引 −1。
- **索引追従**: `remember-decision` で目次 +1、`delete --confirm` で元に戻る。相対日付でなく絶対日付で記録。
- **しおり往復**: 無（check exit1）→ `resume-write` →有（exit0）→ `resume-read` で進行中/次アクション/未確定を復元 → `resume-clear` →無。ルーター（secretary/SKILL）に起動時 `resume-check`＋`_resume.md` 記述あり。
- **節目コミット・push 禁止**: 日本語メッセージで履歴 +1、`git remote` 空・upstream なし。ヘルパーに `git push`/`git remote add` が静的に無い。
- **異常系（契約外の壊れ方をしないか）**: 存在しないファイル削除・不明コマンド・引数不足・commit メッセージ空・git 管理外 commit・引数なし起動 → いずれも **exit 2（使い方エラー）** で日常語メッセージ・クラッシュや誤動作なし。commit で変更なしは exit 0「変更がないため…」。良好。

### 3. 【ブロッキング】決定的シームが `secretary/` 配下に封じ込められていない（C5 / 規律1 違反）

`memory-tools.sh` 冒頭コメント（L7）は「**対象は常にユーザーの秘書ワークスペース（`secretary/`）配下のみ。外は触らない。**」と宣言しているが、実際は相対パス／親参照を検証していないため外へ逸脱する。Evaluator が再現（原本無変更・scratchpad 上）:

**(a) delete のパストラバーサルで外部ファイルを `rm -rf` 削除**
```
$ bash memory-tools.sh delete <sec> "../../DO_NOT_DELETE.txt" --confirm
削除し、目次を更新しました: ../../DO_NOT_DELETE.txt        # rc=0
→ secretary/ の2階層上の DO_NOT_DELETE.txt が実際に削除された
```
原因: `tgt="$sec/memory/$rel"; rm -rf "$tgt"`（L103,117）。`$rel` に `../` を検証せず `rm -rf` するため、`$sec/memory/../../X` = `secretary/` の外へ到達。`rm -rf` のためファイルだけでなくディレクトリも巻き込みうる。破壊的操作がスコープ外に及ぶ＝規律1（秘書は `secretary/` 配下だけ）と constraints「プライバシー・安全（破壊的操作）」への違反。

**(b) remember-decision の date 引数で外部へ書き込み**
```
$ bash memory-tools.sh remember-decision <sec> "../../../ESCAPE" "外に書き込む"
決定を記録し、目次を更新しました（../../../ESCAPE）。      # rc=0
→ secretary/ の外に ESCAPE-decisions.md が作られた
```
原因: `dec="$sec/memory/decisions/${date}-decisions.md"`（L78）で `$date` 未検証。

**(c) guarded-write は target が無制限**
```
$ printf '外部書き込み\n' | bash memory-tools.sh guarded-write <secretary の外の絶対/相対パス>
書き込みました: .../OUTSIDE_WRITE.txt                       # rc=0
→ secretary/ の外へ書けた
```
原因: `guarded-write` は `target` をそのまま `> "$target"`（L98）。`secretary/` 配下かの検査がない。

いずれも「決定的シームだから破壊的操作を安全に代行する」という本スプリントの設計前提を崩す。`--confirm` ゲート後（ユーザーが「はい消して」と言った後）に、LLM が誤ってトラバーサル付きパスを渡すと外部ファイルが消える。C5 はゼロ許容のため、この1点で不合格。

**回帰の欠落**: section 7 は封じ込めを検査していない（トラバーサル rel を渡して「外が消えない/書かれない」ことの assert がない）。骨抜きではないが**安全 assert のカバレッジ欠落**。修正時に追加すべき。

### 4. 【要修正・非ブロッキング】guarded-write が書き込み失敗でも成功報告

```
$ printf '中身\n' | bash memory-tools.sh guarded-write "<親ディレクトリが無いパス>"
（stderr）No such file or directory
（stdout）書き込みました: .../missing_dir/x.md                # rc=0 だがファイルは作られていない
```
原因: `printf ... > "$target"`（L98）の失敗を検査せず `echo "書き込みました"` に進み exit 0。親ディレクトリを作らない・書き込み結果を検証しないため、**失敗を成功と偽って報告**する。新しい記憶ファイルへ書くフローで沈黙のデータ喪失になりうる（既存 `preferences.md` 上書きなど親が在る場合は問題なし）。動作安定性（C3）の欠陥として要修正。

### 5. 安全・その他の不変条件（違反なしを確認）

- `~/workspace/agentic-harness`（Jul 2 16:08）・`~/workspace/inbox/company`（Jun 23 11:11）とも不変 → 非書込。Evaluator の検証は scratchpad のみ。
- 単段クレジット方針（forkedFrom=Shin-sibainu/cc-company・LICENSE MIT/cc-company・中間フォーク非掲載）: 回帰 section 1 全パス・本スプリントで不変。
- 部署制の名残（`.company/`・`case-NNN`・`patterns/`・部署間 inbox）: memory-care は `secretary/memory/` フラット構造のみ。持ち込みなし。
- push 禁止: ヘルパーに push/remote add なし（静的・動的とも確認）。
- 資格情報の実値: 記憶ワークスペースになし（section 6/7 で確認）。
- `${CLAUDE_PLUGIN_ROOT}` 参照: memory-care SKILL・ルーターとも相対参照でデッドリンクなし（section 2 全パス）。
- 非エンジニア文言（C4）: memory-care SKILL の削除警告（「消すと元に戻せません／本当に消してよいですか」）、しおり提案（「おかえりなさい。前回は…次は…」）、3行型・言い換え併記・plain-language 参照を実読で確認。良好。

## 修正指示（Generator 向け・implementation-issue）

**必須（ブロッキング）— スコープ封じ込めガードを `memory-tools.sh` に追加**

1. `delete` / `remember-decision` / `guarded-write`（および全サブコマンドの対象パス）で、**解決後の絶対パスが `secretary/` 配下に収まること**を実行前に検証し、外なら `refuse`（exit 3 相当）で中断する。
   - 例: `$rel`・`$date`・`$target` に `..` セグメントを含む場合を拒否する、または `realpath` で正規化して `$sec/`（できれば `$sec/memory/`）を接頭辞に持つことを assert する（macOS には `realpath` が無い環境もあるため、`cd + pwd -P` かパス正規化関数で可搬に）。
   - `rm -rf` は封じ込め確認が通った後にのみ実行する。
2. ヘルパー冒頭の「外は触らない」宣言と実装を一致させる。

**推奨（同時に直すのが自然）**

3. `guarded-write` は書き込み前に親ディレクトリの存在（または作成方針）を確認し、`> "$target"` の**失敗時は exit 非ゼロで正直に報告**する（成功報告の前に書き込み結果を検査）。
4. 回帰 section 7 に**封じ込めの負テスト**を追加: トラバーサル rel を渡したとき「`secretary/` 外のファイルが削除/作成されない」かつ「ヘルパーが拒否（exit≠0）」を assert。§4 の false-success も assert 化する。

## 再提出時の確認観点（Evaluator）

- 上記トラバーサル3系統（delete / remember-decision / guarded-write）が `secretary/` 外を触れないこと（Evaluator 側でも再現テストを実施）。
- guarded-write が失敗時に成功報告しないこと。
- 中核機能・push 禁止・89 assert の無回帰が維持されること（封じ込め assert が追加され件数が増える想定）。

## 付録: 既定モードの回帰チェック要点

```
== 1〜6 ==  全PASS（マニフェスト/単段クレジット・memory-care構文・生成物6規律・git・体験・安全）
== 7. 記憶ケア ==  全PASS（索引追従・空上書き拒否 exit3・削除前警告 exit3・しおり往復・節目コミット日本語/push なし・push/remote add 不在）
== 結果 ==  PASS=89  FAIL=0
```
（注: PASS=89 は緑だが、§3 のとおり回帰は破壊的シームのスコープ封じ込めを検査していないため、この数値だけでは受入基準8/C5 を保証しない。）

---

## 再評価（2回目・2026-07-08）

- 判定: **合格**
- 評価者: Evaluator
- 評価日: 2026-07-08

### 総評（3行）

- 前回のブロッキング3点（delete トラバーサル／remember-decision date／guarded-write 無制限）と偽装成功1点は、`_safe_path` 封じ込め関数・厳密 date 検査・書き込み結果検証で**すべて塞がれ、Evaluator の再攻撃でも突破できなかった**。
- 回帰は 89→98 に増加し全緑。追加された封じ込め negative assert は終了コードと実ファイル状態の両方を検査しており骨抜きでない。中核機能・push 禁止・非エンジニア文言も維持。
- 残る2点（pre-planted symlink 越しの guarded-write 書き込み／`delete "."` の偽装成功）は**通常の引数経路では発火しない低リスクのハードニング項目**でブロッキングとしない。追随パッチ（または後続スプリントでの対応）を推奨。

### 各基準スコア（再採点）

| # | 基準 | 閾値 | 前回 | 今回 | 判定 |
|---|---|---|---|---|---|
| C1 | 完成度 | ≥4 | 4 | **5** | ✓ |
| C2 | 構文・整合 | 5 | 5 | **5** | ✓ |
| C3 | 機能の実証 | ≥4 | 4 | **5** | ✓ 封じ込め negative assert 追加 |
| C4 | 非エンジニア体験 | ≥4 | 5 | **5** | ✓ 据え置き |
| C5 | 安全・規律 | 5 | 3 | **5** | ✓ トラバーサル封じ込め・push 禁止（残存はハードニング推奨） |
| C6 | 無回帰 | 5 | 5 | **5** | ✓ 既存 assert 全パス |

→ 全基準が閾値以上のため **合格**。

### 証跡

#### 1. 回帰再実行（Evaluator 実行）

`bash scripts/regression-check.sh` → **PASS=98 / FAIL=0**（既定）。`env -u CLAUDE_PLUGIN_ROOT`（フォールバック）でも全緑。前回 89 からの +9 は section 7 のスコープ封じ込め negative assert・失敗系 assert。

新規 assert（`scripts/regression-check.sh` L300-332）は骨抜きでない:
- 親フォルダ無しの書き込みが exit≠0 かつファイル未作成（偽装成功の再発防止）。
- delete トラバーサルが exit≠0 かつ**外部センチネルが残る**（`[ -f "$SENTINEL" ]`）。
- remember-decision 不正日付が exit≠0 かつ外部に書かれない。
- guarded-write トラバーサルが exit≠0 かつ外部に書かれない・センチネル内容不変。
終了コードだけでなく実ファイル状態を assert しているため、封じ込めの実効を検査している。

#### 2. 前回ブロッキング3点＋偽装成功の再攻撃（Evaluator 実施・原本無変更・scratchpad 上）

| 攻撃 | 結果 | 判定 |
|---|---|---|
| `delete <sec> "../../DO_NOT_DELETE.txt" --confirm` | exit 3「外は削除できません」・外部ファイル健在 | ✓ 封じた |
| `remember-decision <sec> "../../../ESCAPE" ...` | exit 2「日付は YYYY-MM-DD 形式で」・外部書き込みなし | ✓ 封じた |
| `guarded-write <sec> "../../OUTSIDE_WRITE.txt"` | exit 3「外には書き込めません」・外部書き込みなし | ✓ 封じた |
| `guarded-write <sec> "missing_dir/x.md"`（親なし） | exit 3「保存先のフォルダがありません」・偽装成功しない | ✓ 修正確認 |

封じ込めロジック（`_safe_path`, L30-49）は「`..` セグメント即拒否」＋「`cd + pwd -P` で親を実体パス正規化し base 接頭辞を検査」の二段で、可搬（realpath 非依存）。

#### 3. 追加で試した抜け道（team-lead 指定分を含む）

| 抜け道 | 結果 | 評価 |
|---|---|---|
| 絶対パス直指定 `guarded-write <sec> /tmp/x` / `delete <sec> /tmp/x` | `$base/$rel` として扱われ親不在で拒否（exit 3/2）・/tmp に書かれない | ✓ 安全 |
| 空 rel `delete <sec> "" --confirm` | exit 2（使い方エラー） | ✓ 安全 |
| `delete <sec> "./../preferences.md"` | `..` を含むため exit 3 拒否 | ✓ 安全 |
| 親フォルダが symlink `dirlink/THRU.txt`（memory 内リンクが外部ディレクトリを指す） | `pwd -P` が親の実体を解決し base 外と判定 → exit 3 拒否 | ✓ 安全 |
| **対象ファイル自体が symlink** `guarded-write <sec> link_out.md`（memory 内リンクが外部ファイルを指す） | **rc=0 で書き込み成功＝外部ファイルが書き換わった** | △ 残存（下記） |
| `delete <sec> "." --confirm` | `rm` が "." を拒否するが、ヘルパーは「削除しました」と表示 rc=0（memory/ は無事） | △ 残存（軽微） |

#### 4. 残存する低リスク項目（ハードニング推奨・ブロッキングではない）

- **(残存1) 対象ファイルが symlink の場合、guarded-write が symlink を辿って外部へ書き込む**: `memory/link_out.md` が `secretary/` 外を指す symlink のとき、`printf > "$tgt"`（L138）がリンクを辿り外部ファイルを書き換える（rc=0）。
  - `_safe_path` は**親ディレクトリ**の実体パスは検証するが、**最終ターゲット自体が symlink か**は検査しないため。
  - 発火前提: `secretary/memory/` 内に外部を指す symlink が**あらかじめ存在**すること。ヘルパー自身は symlink を作らないため、通常の引数経路・ツール操作では到達しない。単一ユーザーの非エンジニア向けローカルツールという脅威モデルでは、symlink を設置できる者はその対象へ直接書けるため追加リスクは実質軽微。
  - 推奨修正: 書き込み・削除の最終ターゲットが symlink のとき拒否する（`[ -L "$tgt" ] && refuse ...`）、または既存ターゲットは `pwd -P` で実体解決して base 配下を再確認する。
- **(残存2) `delete "." --confirm` が偽装成功を報告**: `rm` が "." を拒否して実際には何も消えないのに「削除しました」rc=0 と表示する（memory/ は無事なのでデータ損失なし）。残存1と同系統の「成功可否の検証漏れ」。`rm` の終了コードを見て正直に返すのが望ましい。

いずれも破壊的な誤削除やトラバーサル書き込みではなく、通常運用では発火しない。前回のブロッキング（`../` 文字列で誰でも外部を rm できる）とは質・重大度が異なるため、合格を妨げないと判断。追随パッチ（micro）での解消を推奨する。

#### 5. 中核機能・不変条件の維持（確認）

- 正常系の過剰拒否なし: 範囲内の `remember-decision` / `guarded-write preferences.md` / `delete decisions/... --confirm` はいずれも rc=0。
- 空上書き拒否（exit 3・内容不変）・削除前確認（exit 3・残存）・索引追従・しおり往復・節目コミット（日本語・push なし）は再実行で全て正常。
- push 禁止: ヘルパーに `git push`/`git remote add` なし（回帰 L276-277 全パス）。
- 単段クレジット・6規律・部署制の名残なし・`${CLAUDE_PLUGIN_ROOT}` 参照は据え置き（section 1/2/6 全パス）。
- 安全: `~/workspace/agentic-harness`（Jul 2 16:08）・`~/workspace/inbox/company`（Jun 23 11:11）とも不変。Evaluator の検証は scratchpad のみ（/tmp への書き込みは拒否され残存なし）。

### 引き継ぎ（オーケストレーター向け）

- sprint-002 は受理可能。
- 残存2点（symlink 書き込み・delete "." 偽装成功）は **micro パッチ候補**として記録することを推奨（安全のハードニング。ブロッキングではないが、決定的シームの「外は触らない」宣言を完全に満たすため）。次スプリント（sprint-003）着手前に patch を挟むか、後続で回収するかは Planner/オーケストレーターの判断。
