# Sprint 008 Evaluation — 最新再評価

## 最新判定（2026-07-16 retry後）

- **合格**
- **分類: なし**
- 本判定が現在のSprint 008に対する正式な評価結果。後半の「旧不合格履歴」は、GitHub fork必須だった旧契約に対する過去の評価であり、最新判定には使わない。
- UIのないClaude Code pluginのため、`docs/spec/rubric.md` に従いスクリーンショットは対象外。

独立再評価ではGeneratorの自己評価を判定根拠にせず、本体・公開GitHub repo・local downstreamをEvaluatorが直接検証した。
ユーザーの絶対ルールに従い、操作禁止のローカル上流checkoutは読み取りもコマンド対象化もしていない。
上流に関する証跡はGitHub APIと`/Users/taisei/workspace/yasashii-harness`の`upstream` remoteだけから取得した。

## Rubric採点

| ID | 得点 | 閾値 | 判定 | 独立評価の根拠 |
|---|---:|---:|---|---|
| C1 完成度 | 5/5 | 4 | 合格 | 改名、独立public downstream、参照導線、同梱撤去、初期公開を受入基準どおり確認 |
| C2 構文・整合 | 5/5 | 5 | 合格 | JSON、SKILL、識別子、remote manifests、`metadata-overrides.json`が完全一致。GitHub API online検査もPASS |
| C3 機能の実証 | 5/5 | 4 | 合格 | sync check、冪等性、6種の破損fixture、上流前進warning、node無しfallback、positioning/runtimeを実行 |
| C4 非エンジニア体験 | 5/5 | 4 | 合格 | README冒頭、build、3 Agent追加節で正式名称と短い説明、3コマンド、3行報告が一貫 |
| C5 安全・規律 | 5/5 | 5 | 合格 | 本体同梱なし、upstream push=`DISABLED`、差分はyasashii見出し追加と宣言済みmetadataだけ、評価中の禁止checkout接触なし |
| C6 無回帰 | 5/5 | 5 | 合格 | 本体offline 272/0、online 273/0、downstream 22/0、positioning 9/9、runtime 23/23 |
| C7 やさしさ | 5/5 | 4 | 合格 | やさしさを言葉遣い・報告・先回り提案に限定し、3 Agent分離、閾値、証跡、回帰ゼロ許容を維持 |

全軸が閾値以上で、C2・C5・C6は必須の5/5。Sprint 008を合格と判定する。

## 受入基準ごとの結果

| # | 結果 | 証跡 |
|---|---|---|
| 1. 改名整合 | 合格 | canonical pathは`/Users/taisei/workspace/yasashii-secretary`。origin、plugin directory、marketplace、plugin manifest、READMEの3コマンドが`yasashii-secretary`で一致 |
| 2. 非エンジニア向けREADME | 合格 | 冒頭だけで対象者、できること、導入3コマンド、初回の一歩が分かる。過度な平易化なし |
| 3. 独立downstream基点 | 合格 | GitHub API: `full_name=mtaiseeei/yasashii-harness`、`private=false`、`fork=false`、`main=a76c4aa...`。fb9c303はremote/localの両方で到達可 |
| 4. overlay規約 | 合格 | prose変更は追加行だけ。見出しは全て`yasashii`を含む。metadata変更は宣言済み4ファイル・fieldだけ |
| 5. sync健全性 | 合格 | downstream回帰22/0。冪等、未分類新規、上流file削除、アンカー不在、合成不一致、allowlist外metadataをfixtureで検出。上流前進はwarning＋exit 0 |
| 6. node無し | 合格 | `PATH=/node-is-not-available .../run-runtime-config.sh` → `{"status":"inherit","reason":"node-unavailable"}`、exit 0 |
| 7. 同梱撤去 | 合格 | 本体にharness、agents、旧baseline、関連symlinkなし。buildは別repo導線だけ |
| 8. section 12 | 合格 | offlineで案内・3コマンド・同梱不在・404/mismatch fixtureを検査。onlineでpublic/fork/manifest/metadataを実確認 |
| 9. 全回帰 | 合格 | 本体offline 272/0、online 273/0、downstream 22/0、positioning 9/9、runtime 23/23 |
| 10. 上流local全面非接触 | 合格 | 今回のEvaluatorは操作禁止checkoutへ一切接触せず、実装scriptにも当該local path参照なし。GitHub/upstream remoteだけを使用 |
| 11. リモート境界 | 合格 | originはdownstream、upstream fetchはGitHub親repo、upstream pushは`DISABLED`。local mainはorigin/mainを追跡しclean |
| 12. metadata境界 | 合格 | remote mainとlocalが同一commit `a76c4aa...`。allowlistの期待値と4 manifestsが一致し、sync validatorがallowlist外差分0を確認 |

## 独立実行の証跡

### 1. yasashii-secretary offline / online

```text
$ bash scripts/regression-check.sh --offline
ONLINE=SKIPPED（offline回帰。Sprint合格には別途 --online が必須）
PASS=272 FAIL=0
exit 0

$ bash scripts/regression-check.sh --online
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
PASS=273 FAIL=0
exit 0

$ bash scripts/check-yasashii-harness-online.sh
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
exit 0
```

offline section 12はEvaluatorがコードも確認した。`repo-404.json`とmanifest mismatch fixtureを同じvalidatorへ渡し、どちらも非0になることを回帰内でassertしている。online checkerはGitHub APIからrepo情報と次の5ファイルを毎回取得する。

- `.claude-plugin/marketplace.json`
- `.agents/plugins/marketplace.json`
- `plugins/harness/.claude-plugin/plugin.json`
- `plugins/harness/.codex-plugin/plugin.json`
- `gentle-overlay/metadata-overrides.json`

### 2. GitHub public repo・main・基点

```text
$ gh api repos/mtaiseeei/yasashii-harness
{"default_branch":"main","fork":false,"full_name":"mtaiseeei/yasashii-harness","owner":"mtaiseeei","private":false}

$ gh api repos/mtaiseeei/yasashii-harness/branches/main
{"name":"main","sha":"a76c4aa8b4a606cb08d0633d3273f81b0e5b8734"}

$ gh api repos/mtaiseeei/yasashii-harness/commits/fb9c30375dac5d4458ed0f522b3469cff2f6b949
{"sha":"fb9c30375dac5d4458ed0f522b3469cff2f6b949"}
```

### 3. downstream remote境界

```text
$ git status --short --branch
## main...origin/main

$ git rev-parse HEAD
a76c4aa8b4a606cb08d0633d3273f81b0e5b8734

$ git remote -v
origin   https://github.com/mtaiseeei/yasashii-harness.git (fetch)
origin   https://github.com/mtaiseeei/yasashii-harness.git (push)
upstream https://github.com/mtaiseeei/agentic-harness.git (fetch)
upstream DISABLED (push)

$ git branch -vv
* main a76c4aa [origin/main] [sprint-008] やさしい差分と上流追随検査を追加

$ git merge-base --is-ancestor fb9c30375dac5d4458ed0f522b3469cff2f6b949 HEAD
exit 0
```

### 4. sync境界・allowlist外差分0

```text
$ bash scripts/sync-harness.sh --check --offline
UPSTREAM_HEAD=SKIPPED (offline)
SYNC_OK base=fb9c30375dac5d4458ed0f522b3469cff2f6b949
exit 0

$ bash scripts/sync-harness.sh --check
WARNING: upstream/main advanced: base=fb9c30375dac5d4458ed0f522b3469cff2f6b949 head=d35c6c0b3d5ab9a19ca98d6b5ab768cf0ac8946a
SYNC_OK base=fb9c30375dac5d4458ed0f522b3469cff2f6b949
exit 0
```

`git diff --numstat fb9c303..HEAD`では、README・agents 3種・harness-loopは削除0の追加だけ。metadata 4ファイルは、`metadata-overrides.json`に宣言したfieldの置換だけだった。sync validatorは基点treeとの完全比較を行い、allowlist外変更を0件として成功した。

remote manifestsの確認値:

```text
Claude marketplace name = yasashii-harness
Claude plugin entry      = name:harness, source:./plugins/harness
Codex marketplace name   = yasashii-harness
Codex plugin entry       = name:harness, source:{source:local,path:./plugins/harness}
plugin repository/homepage = https://github.com/mtaiseeei/yasashii-harness
install command          = /plugin install harness@yasashii-harness
```

### 5. downstream独自回帰・negative fixtures

```text
$ bash scripts/regression-check.sh
PASS overlay composition and classified tree
PASS sync apply is idempotent
PASS missing anchor is rejected
PASS composition mismatch is rejected
PASS unclassified new file is rejected
PASS deleted upstream file is rejected
PASS allowlist-external metadata change is rejected
PASS upstream advance is warning only
PASS node absence continues with inherit
PASS=22 FAIL=0
exit 0
```

Evaluatorは回帰scriptを読んだ。各negative fixtureは一時copyを壊した後、`sync-harness.sh --check --offline`が非0になることを`expect_fail`で確認する実質的な検査である。単なる文字列存在検査ではない。

### 6. runtime / positioning / node無し

```text
$ node scripts/check-positioning.mjs
positioning regression: 9 checks passed
exit 0

$ node plugins/harness/scripts/check-runtime-config.mjs
runtime config regression: 23 checks passed
exit 0

$ PATH=/node-is-not-available /bin/bash plugins/harness/scripts/run-runtime-config.sh
{"status":"inherit","reason":"node-unavailable"}
exit 0
```

構文確認は`bash -n`、`git diff --check`、書込を伴わないPythonの`ast.parse`で成功した。Evaluator sandboxではdownstreamへの`__pycache__`作成が許可されないため、`py_compile`は判定根拠に使っていない。

### 7. 非エンジニア体験とやさしさ

- README冒頭は「非エンジニア向けAI秘書」から始まり、できること、導入3コマンド、初回の流れが前半だけで分かる。
- buildはPlanner / Generator / Evaluatorの正式名称を保ち、各役割を1文で補足する。未導入と導入済みの両導線がある。
- downstream差分は`yasashii Planner`、`yasashii Generator`、`yasashii Evaluator`、`yasashiiオーケストレーション`の追加節。評価閾値、独立評価、証跡、回帰ゼロ許容を緩める変更はない。

## Evaluator確認範囲

- 実行した面: 本体offline/online回帰、online checker単体、downstream回帰、sync offline/online、positioning、runtime、node無し、GitHub API、remote/branch/diff/metadata確認。
- 実行しなかった面: Claude Codeへの実インストール。rubricの手動ライブ確認は「利用可能なら」であり、今回は自動検査とremote manifestのonline証跡で必須受入基準を満たした。
- 禁止面: 操作禁止のローカル上流checkoutには接触していない。

---

## 旧不合格履歴（2026-07-16・fork必須だった旧契約）

以下は、同一owner内のGitHub forkを要求していた**旧契約**に対する評価履歴。Plannerによる独立downstream方針への正本改訂とretry実装より前の結果であり、最新判定を上書きしない。

## 判定

- **不合格**
- **分類: `spec-issue`（主因）**
- 理由: 契約が同一 owner `mtaiseeei` の中で、親repo `mtaiseeei/agentic-harness` とそのfork `mtaiseeei/yasashii-harness` の同時所有を要求している。GitHubの実エラーで、この組み合わせは作成不能と確認した。Generatorだけでは解消できないため、Plannerで所有者またはfork要件を改訂する必要がある。
- 併存する `implementation-issue`: regression section 12 は、存在しないGitHub URLを文字列として含むだけでPASSする。参照導線の実在確認としては不十分である。

UIのないClaude Code pluginであるため、`docs/spec/rubric.md` の規定に従いスクリーンショットは対象外とした。

## Rubric採点

| ID | 得点 | 閾値 | 判定 | 根拠 |
|---|---:|---:|---|---|
| C1 完成度 | 3/5 | 4 | 不合格 | 本体側の改名・同梱撤去・README・build導線は成立したが、fork側成果物が全て未作成 |
| C2 構文・整合 | 3/5 | 5 | 不合格 | JSON・name・local pathは整合。一方、README/buildの参照先 `mtaiseeei/yasashii-harness` はHTTP 404で、ゼロ許容のデッドリンクがある |
| C3 機能の実証 | 2/5 | 4 | 不合格 | 本体回帰とsection 12の2破損ケースは実証したが、sync冪等性・未分類ファイル・アンカー不在・合成不一致・上流前進警告・node無し継続は実装自体が無く未実証 |
| C4 非エンジニア体験 | 5/5 | 4 | 合格 | README冒頭で対象者、できること、3コマンド、初回の流れが分かる。一般技術用語を保ち、必要な補足だけを付けている |
| C5 安全・規律 | 4/5 | 5 | 不合格 | `~/workspace/agentic-harness` 不変、同梱撤去、push境界は守られた。ただし必須のfork関係・overlay規約・sync健全性が成立していないため5/5にはできない |
| C6 無回帰 | 4/5 | 5 | 不合格 | 回帰コマンド自体は268 PASS / 0 FAIL。ただしsection 12が実在しない参照先をPASSさせるため、参照導線の既知不成立を検出できていない |
| C7 やさしさ | 4/5 | 4 | 合格 | 3 Agentの正式名称と役割、計画→実装→検証の現在地、3コマンドを自然に案内している。参照先不在により実利用の次の一手が完結しない点は減点 |

**1軸でも閾値未満なら不合格**のため、Sprint 008は不合格。

## 受入基準ごとの結果

| # | 結果 | 証跡 |
|---|---|---|
| 1. 改名整合 | 合格 | canonical pathは `/Users/taisei/workspace/yasashii-secretary`。旧pathは新pathへの一方向symlink。originとGitHub repoは `mtaiseeei/yasashii-secretary`。manifest / marketplace / plugin directory / READMEの3コマンドも同名 |
| 2. 非エンジニア向けREADME | 合格 | 冒頭で「非エンジニア向けAI秘書」、できること、導入3コマンド、初回の一歩を確認 |
| 3. fork基点 | **不合格** | `mtaiseeei/yasashii-harness` はGitHub APIで404。fork作成は同一owner制約で失敗。親repoの `fb9c30375dac5d4458ed0f522b3469cff2f6b949` 自体は到達可能 |
| 4. overlay規約 | **不合格** | 対象repoが存在せず、`gentle-overlay/`、agents 3種、規約検査がない |
| 5. sync健全性 | **不合格** | `scripts/sync-harness.sh` と独自回帰が存在せず、要求された5ケースを実行できない |
| 6. node無し | **不合格** | fork側の `run-runtime-config.sh` が存在せず、node無しの `inherit` 継続とexit 0を実行できない |
| 7. 同梱撤去 | 合格 | 本体に `harness/`、`agents/`、旧baseline、関連symlinkなし。buildは別repo導線のみ |
| 8. section 12 | **不合格** | install行欠落とharness directory復活は検出する。一方、実在しないGitHub URLでも通常回帰がPASSするため、リンク健全性検査として不足 |
| 9. 全回帰 | 合格（コマンド結果） | `bash scripts/regression-check.sh` → `PASS=268 FAIL=0`, exit 0。ただし#8の検査不足によりC6は4/5 |
| 10. 上流local非改変 | 合格 | 前後ともHEAD `fb9c30375dac5d4458ed0f522b3469cff2f6b949`、status `## main...origin/main` |
| 11. リモート境界 | 合格 | GitHub mainは `4d2b782e7b8f39329bc6b3cb8d9f2f6a2ea91e7d`、localは `origin/main` より6 commit aheadかつSprint 008変更は未commit。改名以外のコードpushは観測されない |

## 実行証跡

### 1. 本体の構文・回帰

```text
$ bash scripts/regression-check.sh
PASS=268  FAIL=0
回帰チェック合格
exit 0

$ bash -n scripts/regression-check.sh
exit 0

$ git diff --check
exit 0
```

### 2. local path・remote・旧path

```text
$ pwd -P
/Users/taisei/workspace/yasashii-secretary

$ git rev-parse --show-toplevel
/Users/taisei/workspace/yasashii-secretary

$ readlink /Users/taisei/workspace/cc-secretary
/Users/taisei/workspace/yasashii-secretary

$ git remote -v
origin  https://github.com/mtaiseeei/yasashii-secretary.git (fetch)
origin  https://github.com/mtaiseeei/yasashii-secretary.git (push)
```

GitHub APIでも `mtaiseeei/yasashii-secretary`、`fork=false`、default branch `main` を確認した。

### 3. GitHub fork制約と基点

```text
$ gh api repos/mtaiseeei/yasashii-harness
gh: Not Found (HTTP 404)

$ gh repo fork mtaiseeei/agentic-harness --clone=false --fork-name yasashii-harness
failed to fork: mtaiseeei/agentic-harness cannot be forked. A single user account cannot own both a parent and fork.
exit 1

$ gh api repos/mtaiseeei/agentic-harness/commits/fb9c303
sha: fb9c30375dac5d4458ed0f522b3469cff2f6b949
```

fork失敗後にも `gh api repos/mtaiseeei/yasashii-harness` はHTTP 404であり、repo作成や変更は発生していない。

### 4. section 12の意図的破損

本体を一時directoryへ複製し、本体作業treeを変更せずに実行した。

```text
# buildから `/plugin install harness@yasashii-harness` を除去
$ bash scripts/regression-check.sh
FAIL A1: build に yasashii-harness の正規URLと3コマンド
PASS=267 FAIL=1
exit 1

# install行を戻し、plugins/yasashii-secretary/harness/ を追加
$ bash scripts/regression-check.sh
FAIL B1: 同梱harness・agents・旧source baselineが無い
PASS=267 FAIL=1
exit 1
```

2つの破損検出は実質的に動く。ただし通常状態では、GitHub APIが404を返すURLを文字列一致だけでPASSさせた。section 12は `reference_guide_ok` でURLとコマンドのgrepを行うが、参照先repoの存在・fork関係・plugin manifestの実在を確認していない。

### 5. 保護対象repoとpush境界

```text
$ git -C /Users/taisei/workspace/agentic-harness rev-parse HEAD
fb9c30375dac5d4458ed0f522b3469cff2f6b949

$ git -C /Users/taisei/workspace/agentic-harness status --short --branch
## main...origin/main

$ git rev-parse HEAD
1b361c47be25062b3970a4b7ad377d2b25ba3782

$ git rev-parse origin/main
4d2b782e7b8f39329bc6b3cb8d9f2f6a2ea91e7d

$ gh api repos/mtaiseeei/yasashii-secretary/branches/main
sha: 4d2b782e7b8f39329bc6b3cb8d9f2f6a2ea91e7d
```

## 再現手順

1. `gh api repos/mtaiseeei/agentic-harness --jq '{full_name,fork,parent:(.parent.full_name // null)}'` で親repoが同じownerにあることを確認する。
2. `gh api repos/mtaiseeei/yasashii-harness` がHTTP 404であることを確認する。
3. `gh repo fork mtaiseeei/agentic-harness --clone=false --fork-name yasashii-harness` を実行する。
4. `A single user account cannot own both a parent and fork.` でexit 1になることを確認する。
5. `bash scripts/regression-check.sh` は268 PASS / 0 FAILになることを確認する。これにより、現在のsection 12が外部参照先の不在を検出しないことも再現できる。

## Plannerへ戻す選択肢

1. **推奨: 別ownerのOrganization配下へforkする。** 例: `<org>/yasashii-harness`。GitHubのfork関係を維持できる。Plannerがproduct / constraints / features / domain / ui / sprint-008のownerと導入コマンドを一括改訂する。
2. 親 `agentic-harness` を別Organizationへ移し、`mtaiseeei/yasashii-harness` をforkとして作る。親repoの公開URL変更と既存利用者への影響評価が必要。
3. `mtaiseeei/yasashii-harness` を独立repoにして `upstream` remoteで追随する。現行の「GitHub fork関係必須」を変更する製品判断なので、ユーザー承認とPlannerによる正本改訂が必要。

どの選択でも、実在する参照先が決まった後にsection 12へ少なくとも「repo存在」「想定owner/name」「plugin manifestの存在」を検査する回帰を追加する。fork関係とfb9c303到達性は、yasashii-harness側の独自回帰またはEvaluatorのGitHub API証跡で確認する。
