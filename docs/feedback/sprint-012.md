# Sprint 012 Feedback — G1仕上げ: weeklyと索引退避運用

## 最終評価（2026-07-16）

### 判定

- **合格**
- 差し戻し分類: なし
- 理由: weeklyは対象週の日次journal原本だけを直接読み、月曜〜日曜の固定境界、0件、did / decided / next分類、変更履歴の非統合、外部根拠を独立fixtureで確認できた。閲覧は副作用0、明示保存時だけ成果物・journal・日本語local commitが各1件増える。199 / 200 / 201行、退避plan、未確認・キャンセル、`--confirm`、同月archive拒否、退避後timeline / weeklyも全て成立した。実Claudeの週次対話は既定3行、明示「くわしく」4行で、無断整理・保存・pushを行わなかった。専用・互換・offline・onlineの全回帰も0 FAILである。

### 採点

| ID | 得点 | 判定根拠 |
|---|---:|---|
| C1 完成度 | 5/5 | 受入基準1〜11を実コマンド、独立fixture、実Claude対話で確認した。dashboardはtimelineの実利用反応が無く、migrationは既存ユーザーの証拠が無いため見送りと記録され、条件付き項目を無断追加していない。 |
| C2 構文・整合 | 5/5 | `git diff --check`、関連shellの`bash -n`、配布JSONの`python3 -m json.tool`、全online回帰が成功した。weeklyのSKILL frontmatter、router参照、共有serializer参照、実行権限も整合する。 |
| C3 機能の実証 | 5/5 | 固定週、月跨ぎ、0件、原本一覧、分類、非統合、退避、保存を実動作で確認した。過去週次成果物へ毒文字列を置いた独立fixtureでも本文を入力にせず、実Claude 2 sessionも期待shapeと内容を満たした。 |
| C4 非エンジニア体験 | 5/5 | 実Claudeの既定fixtureは物理3行、くわしくfixtureは物理4行で、空行0、固定prefix完全一致。一般技術用語を維持し、次の一手は選択権を残す1提案だけだった。 |
| C5 安全・規律 | 5/5 | 閲覧副作用0、保存は明示時だけ、退避はplan→別操作の`--confirm`、未確認はexit 3かつ副作用0、同月archiveと境界外symlinkを拒否した。実ユーザーデータ・credentials・外部本文の送信／保存、push、ローカルagentic-harness接触、yasashii-harness変更はいずれも0件。 |
| C6 無回帰 | 5/5 | Sprint 012専用38/38、Sprint 011互換67/67、Sprint 010互換56/56、offline 290/290、network許可付きonline 291/291。既知失敗なし。 |
| C7 やさしさ | 5/5 | 退避前に対象・残る参照・影響を示し、キャンセル可能で、退避後も見失わない案内を返した。実Claude対話も提案1つ以下・無断着手なしで、安全規律を緩めていない。 |

全軸が閾値以上で、C2・C5・C6のゼロ許容基準も5/5を満たす。

## 条件付き判断の確認

### dashboard

- **見送りは正本条件に適合する。** G1の必須可視化はSprint 010で合格済みのtimelineであり、dashboardは必須ではない。
- Sprint 012開始時点でtimelineへの実利用者反応を示す証拠は、正本・progress・feedbackに無い。
- `templates/dashboard.html`は存在せず、weekly SKILLも証拠なしにdashboardを追加しないと明記する。実利用反応が得られた後の別判断へ残すため、今回の見送りを欠落とは扱わない。

### migration

- **見送りは正本条件に適合する。** 第2期配布は新規セットアップ想定であり、既存ユーザーがいると確認できる証拠が無い。
- journal / topicsとpreferences v2を既存記憶へ自動適用するmigrationは追加されていない。
- 既存ユーザーが確認された場合は、Plannerがバックアップ、dry-run、空上書き禁止、手書き行保持、rollbackを契約へ追加してから扱う条件が保たれている。

## weeklyの独立fixture

配布templateから`/private/tmp/yasashii-s012-eval-20260716/`へ、実ユーザー情報を含まない架空fixtureを作った。対象週は2026-07-27（月）〜2026-08-02（日）。次をjournal原本へ入れた。

- did: 架空の講義資料作成
- decided: 架空説明会をオンライン開催
- decided: 上記を対面開催へ変更した履歴
- did: `Google Calendar / synthetic-event-30 / 2026-07-30`を出典に持つ架空活動
- next: 翌週に架空の請求書を確認

```console
$ CC_SECRETARY_NOW=2026-08-02T20:00:00+09:00 \
  memory-tools.sh weekly <synthetic-secretary> --week 2026-08-02
# 期間: 2026-07-27 〜 2026-08-02（月曜〜日曜）
# 入力: 対象期間の日次journal原本 5件（過去の週次要約は不使用）
# did / decided / nextは別セクション
# 変更履歴は原文のまま、新しい決定が先
# 外部根拠は Google Calendar / synthetic-event-30 / 2026-07-30 を保持
```

同じfixtureへ、成果物本文だけに`SHOULD_NOT_APPEAR_FROM_WEEKLY_SUMMARY_BODY`を含む過去週次要約を保存した。その後のweekly出力にこの文字列は現れなかった。一方、成果物保存という実活動はjournal原本の`did`として現れた。したがって、weeklyは過去週次成果物の本文を入力にせず、シームで記録された原本事実だけを読む。

閲覧後のfixtureは両設定とも次のままだった。

```console
default  docs=0 journals=5 entries=5 remotes=none
detailed docs=0 journals=5 entries=5 remotes=none
```

保存、journal追記、commit、remote追加、pushの副作用は無い。

## 保存シーム

専用回帰をEvaluatorが再実行し、週次生成だけでは増分0、明示保存時だけ各1件を確認した。

```console
$ bash scripts/sprint-012-regression.sh
PASS 保存前の週次生成は成果物・journal・commitを増やさない
PASS 明示保存だけが成果物を1件作る
PASS 明示保存のjournal副作用は1件だけ
PASS 一時fixtureの日本語local commitは1件だけ増える
PASS=38 FAIL=0
```

一時fixtureにはremoteが無く、commitは日本語1行である。保存していない実Claude fixtureでは成果物・journal・commitは増えていない。

## 199 / 200 / 201行と退避運用

### 索引上限

```console
$ bash scripts/sprint-012-regression.sh
PASS 199行はexit 0・警告なし
PASS 200行はexit 0・警告なし
PASS 201行相当はexit 0で索引を200行に保つ
PASS 201行警告は候補・残る参照・timeline影響を示す
```

201行相当でも終了コードは0。stderrは、古い月の退避候補、MEMORY.md月索引と退避先原本という残る参照、timeline / weeklyが退避領域を検索し続ける影響を示した。自動削除・自動退避はしない。

### 独立したplan / confirm確認

Generatorの集計値とは別に、2026-06の原本を持つfixtureで直接実行した。

```console
$ CC_SECRETARY_NOW=2026-08-10T10:00:00+09:00 \
  memory-tools.sh archive-plan <synthetic-secretary> 2026-06
- 対象: 2026-06 のjournal 1件
  退避先: memory/archive/journal/2026-06/
  残る参照: MEMORY.mdの月索引と各原本（退避先へ移動。削除しない）
  timeline/weeklyへの影響: 退避領域も検索するため表示は継続。原本パスだけが変わる

$ memory-tools.sh archive-month <synthetic-secretary> 2026-06
NO_CONFIRM rc=3 unchanged=yes

$ memory-tools.sh archive-month <synthetic-secretary> 2026-06 --confirm
journalを退避し、索引を更新しました: 2026-06（1件）
```

確認後はactive側からarchive側へ原本を移したが削除せず、MEMORY.mdは退避済み月を参照する。続けて同じ期間のtimelineとweeklyを実行し、両方が`独立fixtureの6月活動`を返し、weeklyの原本パスが`memory/archive/journal/2026-06/2026-06-10.md`になった。

専用回帰ではさらに次を確認した。

- planだけ、未確認、キャンセル相当は副作用0。
- 現在月はexit 2で拒否。
- 同じ月にarchive原本がすでにある場合はexit 3で無断mergeを拒否し、active / archiveとも不変。
- archive基点が境界外symlinkならexit 3で拒否し、外部副作用0。

## 実Claude週次対話

ユーザーの明示承認に基づき、未pushのplugin指示と架空fixtureだけをAnthropic Claude CLIへ送った。実ユーザーの記憶、credentials、業務データは送っていない。2件は`--no-session-persistence`の独立sessionで、実装変更を許さず、保存・退避・decision統合・pushを禁止した閲覧シナリオである。

```console
$ claude --plugin-dir <yasashii-secretary-plugin> --add-dir <same-plugin> \
  -p --no-session-persistence --permission-mode dontAsk \
  --allowedTools Read,Bash --disallowedTools Write,Edit --output-format json \
  '/yasashii-secretary:secretary 2026-07-27から2026-08-02の週を振り返ってください。閲覧だけで、保存・退避・decision統合・pushはしないでください。架空fixtureだけを使ってください。'
```

| 設定 | shape | 空行 | prefix | 原本 | 分類・変更履歴 | 無断操作 | session |
|---|---|---:|---|---|---|---|---|
| 丁寧＋ふつう＋みじかく | 物理3行 | 0 | 3/3 | journal 5件を直接読取 | did / decided / next分離、非統合 | 保存・退避・統合・push 0 | `c8c75836-b7af-4ed4-a4c0-ae9956814c0e` |
| 丁寧＋ふつう＋くわしく | 物理4行（補足1） | 0 | 3/3＋補足 | journal 5件を直接読取 | did / decided / next分離、非統合 | 保存・退避・統合・push 0 | `07c94803-3d83-47c7-a167-891951e92a55` |

既定出力は`やったこと:` / `結果:` / `次に何が起きるか:`の3行だけ。くわしく出力は同じ3行に`補足:`を1行だけ加えた。両方とも、次の一手は「保存したい場合は保存してと言う」という1提案で、実行はユーザーへ委ねた。詳細fixtureは実コネクタを呼んでいないため「接続状態は未確認」と明記した。

## 全回帰

```console
$ bash scripts/sprint-012-regression.sh
PASS=38 FAIL=0

$ bash scripts/sprint-011-regression.sh
PASS=67 FAIL=0

$ bash scripts/sprint-010-regression.sh
PASS=56 FAIL=0

$ bash scripts/regression-check.sh --offline
PASS=290 FAIL=0

$ bash scripts/regression-check.sh --online
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
PASS=291 FAIL=0
```

sandbox内の最初のonline実行はGitHub通信不可により`ONLINE=UNVERIFIED`、290 PASS / 1 FAILだった。この結果を合格証跡には数えず、network許可付きで同じ最終コードを再実行して291 PASS / 0 FAILを確認した。

追加整合検査も成功した。

```console
$ git diff --check
# exit 0

$ bash -n <weekly / archive / index / timeline / memory-tools / workspace-tools / regression群>
# exit 0

$ find plugins/yasashii-secretary -type f -name '*.json' -print0 \
  | xargs -0 -n1 python3 -m json.tool >/dev/null
# exit 0
```

## 評価境界

- GUIのないClaude Code pluginのため、URL・DOM・responsive・スクリーンショットは対象外。実評価面はshellシーム、Markdown規律、実Claude CLI、GitHub APIである。
- `/Users/taisei/workspace/agentic-harness`は読み取りを含めコマンド対象にしていない。
- `yasashii-harness`はonline参照だけで、変更していない。
- 本体repoの実装、spec、state、progressは編集していない。本feedbackだけを作成した。
