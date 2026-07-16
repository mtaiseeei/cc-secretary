# Sprint 012 Patch 001 Progress — 最終監査

## ステータス

**実装・静的回帰・実Claude 6独立session検証完了。Evaluator引き渡し可能。**

## 実装した内容

### 1. root境界規約

- root `CLAUDE.md`を、ローカル`agentic-harness`の「読み取り専用」から**読み取りを含む全面接触禁止**へ改訂した。
- 編集だけでなく、存在確認、一覧、status / HEAD / branch / remote確認、checkout / switch、commit、生成物、複製元、symlink経由、当該checkoutを対象にしたコマンドを禁止した。
- 上流情報はGitHub上の`mtaiseeei/agentic-harness`のremote / APIだけを参照可能とした。本Patch作業では禁止checkoutをコマンド対象にしていない。

### 2. serializer唯一正本化

- `daily`、`connections`、`onboarding`、`setup-google`、`setup-microsoft`、`setup-notion`から、独自の完了報告見出し、行数指定、blockquote完成例、固定3 fieldの再定義を除去した。
- 各skillは、その面で返す内容と安全条件だけを列挙し、行数、prefix、空行、前後の包装を`rules/plain-language.md`の「最終応答serializer」へ委譲する形にした。
- `settings`も「報告の詳しさ」をserializerへ渡すだけにし、skill側の3行／4行規約と物理行数指定を除去した。
- onboardingの「みじかく／くわしく」の選択肢説明は、契約で許可された設定値の説明として維持した。
- 決定、案件メモ、settings確認、onboarding質問の厳密プロトコルは変更していない。

### 3. 競合schema validator

- `scripts/check-report-schema.py`を追加した。通常報告を出し得る16面（全11 SKILL、`templates/AGENTS.md`、`templates/CLAUDE.md`、tone 3種）を同じ規則で検査する。
- 正本以外の次を拒否する。
  1. 裸の固定prefix。
  2. blockquote内の固定prefix。
  3. 箇条書き内の固定prefix。
  4. fenced code block内の固定prefix。
  5. indent・Markdown装飾つき固定prefix。
  6. 独自の行数見出し／指示。
  7. 同義語へ置き換えた3 field schema。
  8. 3行以上の完成blockquote報告例。
  9. serializer参照欠落。
  10. serializer適用前の途中メッセージ指示。
- `scripts/sprint-012-patch-001-regression.sh`は実配布面と上記10種の意図的失敗fixtureへ**同じvalidator**を適用する。専用回帰は19 assert。
- 全体回帰section 18へPatch専用回帰を接続し、旧Sprint 003 / 004の「下位skillが3行schemaを所有する」assertも、内容だけをserializerへ渡す現在の契約へ更新した。

### 4. 構成正本

- Plannerが更新済みのproposal / DESIGNを保持した。
- proposalは`morning` / `evening`を独立SKILLとして新設せず、`skills/daily/SKILL.md`内の朝・日中・夕方モードに統合すると明記している。
- DESIGNの配布treeも`daily/` 1件に3モードを統合しており、実ファイルtreeに独立`skills/morning/` / `skills/evening/`は無い。

### 5. 実Claude 6独立session用の再現script

- `scripts/sprint-012-patch-001-live-dialogue.sh`を追加した。
- daily / onboarding / connectionsの各`みじかく`・`くわしく`、計6 fixtureを毎回テンプレートから新規作成する。
- fixtureは架空ユーザー、架空TODO、`example.invalid`のgit identityだけを含む。実ユーザーの記憶、credentials、業務データを読まない。
- Claude CLIは`--no-session-persistence`、Read only、Bash / Write / Edit禁止で起動し、全物理行、空行、prefix、session ID一意性、connectionsの「接続状態は未確認」を機械判定する。

## 検証結果

| 検証 | 結果 |
|---|---|
| `python3 scripts/check-report-schema.py --plugin-root plugins/yasashii-secretary` | `SCHEMA_OK owner=rules/plain-language.md surfaces=16 conflicts=0` |
| `bash scripts/sprint-012-patch-001-regression.sh` | `PASS=19 FAIL=0` |
| `bash scripts/sprint-010-regression.sh` | `PASS=56 FAIL=0` |
| `bash scripts/sprint-011-regression.sh` | `PASS=67 FAIL=0` |
| `bash scripts/sprint-012-regression.sh` | `PASS=38 FAIL=0` |
| `bash scripts/regression-check.sh --offline` | `PASS=292 FAIL=0` |
| `bash scripts/regression-check.sh --online` | `ONLINE=PASS repo=mtaiseeei/yasashii-harness`、`PASS=293 FAIL=0` |
| `LIVE_WORK=/private/tmp/yasashii-s012-patch001-live LIVE_RECHECK_ONLY=1 bash scripts/sprint-012-patch-001-live-dialogue.sh` | `UNIQUE_SESSIONS=6`、`PASS=6 FAIL=0` |
| `bash -n`（関連shell） | 成功 |
| `python3 -m py_compile scripts/check-report-schema.py` | 成功。生成した`__pycache__`はcommit前に除去 |
| `git diff --check` | 成功 |

onlineはsandbox内では`ONLINE=UNVERIFIED`となったため合格証跡に数えず、公開GitHub APIへの読取許可付きで同じ最終コードを再実行し、293 / 293を得た。

## 実Claude 6独立sessionの証跡

ユーザーは、未push plugin指示と架空fixtureだけをAnthropic Claude CLIへ送ることを明示承認した。
rootが取得した6 artifactを、Generatorが外部送信を伴わない`LIVE_RECHECK_ONLY=1`で再検査した。
実ユーザーの記憶、credentials、業務データは送信していない。

| scenario | 物理行 | 空行 | session ID | 結果 |
|---|---:|---:|---|---|
| daily-short | 3 | 0 | `413f746b-4ff8-4092-9af7-2f47a326355b` | PASS |
| daily-detail | 4 | 0 | `19cb7bc3-1f28-4b75-88c2-0b3574043d44` | PASS |
| onboarding-short | 3 | 0 | `7a7a08d4-325b-4b9e-b3c8-a64a44aa77cd` | PASS |
| onboarding-detail | 4 | 0 | `55d47350-65da-4fe7-b67b-4f4459615752` | PASS |
| connections-short | 3 | 0 | `1da4dfca-4daf-4811-abdc-8e7511bfd476` | PASS |
| connections-detail | 4 | 0 | `7e92a13a-18ad-42fc-be9b-2437fb8c3412` | PASS |

集計は`UNIQUE_SESSIONS=6`、`PASS=6 FAIL=0`。全sessionで固定prefix、空行0、前置き・後書き・途中メッセージ0を満たした。
connections 2件は「接続状態は未確認」を含み、未接続・接続済み・認証済み等を断定していない。

## commit前のリポジトリ証跡

- branch: `main`
- commit前HEAD: `1b361c47be25062b3970a4b7ad377d2b25ba3782`
- origin/main: `4d2b782e7b8f39329bc6b3cb8d9f2f6a2ea91e7d`
- origin: `https://github.com/mtaiseeei/yasashii-secretary.git`（fetch / pushとも不変）
- sprint-008〜012のPlanner正本、state、feedback、progress、本体実装、回帰資産はcommit前時点でtracked変更またはuntrackedとして存在する。
- 秘密情報候補を正規表現で監査し、回帰script内の説明コメント以外に実値候補は検出しなかった。
- `yasashii-harness`は変更していない。push、tag、release、remote変更は行っていない。
- 暫定local commit: 本progressとsprint-008〜012・本Patchの全差分を、`[sprint-012-patch-001]` prefixの日本語local commit 1件へ収録済み。SHAはGenerator引き渡しで示す。

## Evaluator向けシナリオ

1. root `CLAUDE.md`とproposal / DESIGN / constraintsを照合し、読み取り・存在確認・status / HEAD・symlink経由を含む禁止とGitHub参照限定が一致すること。
2. `python3 scripts/check-report-schema.py --plugin-root plugins/yasashii-secretary`とPatch専用19 assertを実行し、正本外schema 0件と10種のnegative fixture拒否を確認すること。
3. 上記6独立Claude session artifactを`LIVE_RECHECK_ONLY=1`で再検査し、3 / 4行、空行0、prefix、途中メッセージ0、connectionsの未確認表示、session ID一意性を確認すること。
4. Sprint 010 / 011 / 012、offline / online全回帰を再実行し、0 FAILを確認すること。
5. local commitを作る場合は、全差分と本progressだけをstageし、秘密情報・不意のユーザー差分が無いこと、parentが上記commit前HEADであること、push / remote変更が無いことを確認すること。

## 境界

- `/Users/taisei/workspace/agentic-harness`と`~/workspace/agentic-harness`は読み取りを含め接触していない。
- `yasashii-harness`は変更していない。
- 旧path symlinkはEvaluator合格後にオーケストレーターが除去する契約のため触っていない。
- 実ユーザーの記憶、credentials、業務データを外部送信していない。
- `yasashii-secretary`をpushしていない。
