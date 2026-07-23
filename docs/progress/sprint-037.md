# Sprint 037 — Agenticの呼び方候補をYasashiiへ同期

**ステータス:** spec-issue解消後のGenerator再同期・増分自己検証完了。fresh独立Evaluator待ち

## 実装結果

Agenticの独立評価PASS済みcommit
`0fa7af24551c149c3aabf9671d4cd87d6c276192` を、Git archiveから作ったcleanな一時candidateとして
reviewし、Yasashiiの宣言済みoverlayへ同期した。作業中のAgentic checkoutにある未commitの
Planner／Orchestrator文書はcandidateへ含めていない。

### 1. upstream baseのreviewと前進

- 開始記録base `1cf2ae690a39ef822d204624d53ee183b386f715` は固定candidateの祖先だった。
- 開始baseから固定candidateまでは11 commits、59 paths（追加22、変更37、削除0）。
- 固定candidateのtracked treeは650 files。
- AgenticのSprint 037 progress／feedback、実commit diffを読み、最終評価がPASS、
  product／verification-infra finding 0件であることを確認した。
- `secretary-overlay/upstream-base.json` を完全SHAへ前進し、
  `secretary-overlay/upstream-tree.json` を同じclean candidateから再記録した。
- 新treeの分類は次のとおり。
  - common: 219
  - metadata-overlay: 6
  - anchor-overlay: 13
  - repo-owned: 389
  - upstream-only: 23
  - 未分類: 0
- repository、neutralization commit、release candidate `0.8.0`、
  `external-live-gate-unavailable`、origin／upstream／push disabled契約は変更していない。

### 2. 共通の呼び方機能

次の共通実装を同期した。

- `plugins/secretary/scripts/name-candidates.mjs`
- `plugins/secretary/scripts/owner-name-transaction.mjs`
- `plugins/secretary/skills/onboarding/SKILL.md`
- `plugins/secretary/skills/settings/SKILL.md`
- `scripts/sprint-037-test.mjs`

Claude Code／Codexの両方で、呼び方は「あなた」「アカウント名」「指定の名前」と
host標準の「その他」を同じ意味で扱う。「アカウント名」を選んだ後だけ
host-task-context→Git→OSの順で候補を探し、正規化、Unicode case-fold重複排除、
hostname等の不適格値除外、出典、おすすめ1件、候補なしを共通moduleで処理する。

保存前の別turn確認、探索値の非保存、既存workspaceの3正本transaction、
journal／local commit各1件、push 0件、途中失敗時rollbackも共通実装のまま保持した。

### 3. Yasashii overlayの追随

上流変更でexact anchorが変わった箇所だけを更新した。

- settingsのYasashii固有Markdown表示と、呼び方transactionの分岐を両立させた。
- 設定値をassistant本文、journal、commit messageへ再掲しない。
- Sprint 011のYasashii style／evidence／settings検査を現行共通契約へ合わせた。
- Sprint 037のactive surfaceを `docs/yasashii-upstream-mapping.md` と
  Yasashiiの正式owner allowlistへ合わせ、検査自体をanchor-overlayとして宣言した。
- `scripts/sprint-034-test.mjs` は個人端末の固定pathを廃止し、引数または
  `AGENTIC_SECRETARY_CANDIDATE` を必須入力にした。
- Sprint 035 Patch 001のoverlay検査は、環境変数が無い場合だけrepoの兄弟directoryを
  runtimeで解決する。個人homeの絶対pathは保持しない。

overlayの初回applyは `changed=13`。Yasashii検査anchor追加後の再applyは `changed=1`。
最終check／reapplyはmanaged 238、`secondChanged=0`、managed digest
`7ddc00f42fad8184fcf7e50e3488b28daf9ba6b11aef78deebe7731cef97a523` だった。
repo-owned digestは本progress自身を含むため固定値を本文へ埋め込まず、
各check／reapplyの同一実行内でapply前後が不変であることを確認した。

### 4. 利用者中立化

active surfaceの実scanで見つかったYasashii固有の5件を修正した。

- `CLAUDE.md`: 個人home絶対pathを `<workspace-root>/agentic-harness` へ変更。
- `docs/DESIGN.md`: 個人workspace名を一般表現へ変更。
- `docs/DESIGN.md`: Agentic checkoutの個人home絶対pathを
  `<workspace-root>/agentic-secretary` へ変更。
- `scripts/sprint-034-test.mjs`: 固定candidate pathを廃止。
- `scripts/sprint-035-patch-001-regression.sh`: 固定candidate pathをruntime解決へ変更。

最終scanは257 files、正式owner allowlist 35 files＋合成path 2 files、
unexpected 0件、負fixture 3/3だった。検出器自身の個人名／path文字列は
`scripts/sprint-037-test.mjs` だけにあり、active scanから除外したうえで負fixtureとして必ず検出する。

### 5. Yasashii固有面とSprint 045の保護

- metadata overlayによりYasashiiのmanifest、marketplace、edition、
  `yasashii-harness`、copy、rule identityを維持した。
- `README.md`、`CLAUDE.md`、`docs/**`、release validator等はrepo-ownedのまま。
- Agentic固有adapter、copy、style、Agentic専用回帰はupstream-onlyで下流へ混入していない。
- Sprint 045保護対象6 filesは開始HEADとの差分0件。
  - `plugins/secretary/templates/AGENTS.md`
  - `plugins/secretary/scripts/project-tools.mjs`
  - `plugins/secretary/skills/daily/SKILL.md`
  - `plugins/secretary/skills/projects/SKILL.md`
  - `plugins/secretary/skills/weekly/SKILL.md`
  - `scripts/sprint-015-regression.sh`
- 呼び方transaction fixtureでもopen／closed project行を保持した。

## 主な変更file

### 共通同期

- `plugins/secretary/scripts/{name-candidates,owner-name-transaction}.mjs`
- `plugins/secretary/skills/{onboarding,secretary,settings,update}/SKILL.md`
- `scripts/{generic-skill-validate,sprint-035-patch-004-test,sprint-037-test}.mjs`
- `scripts/{regression-check,sprint-011-live-dialogue,sprint-011-regression,sprint-012-regression}.sh`

### Yasashii overlay／repo-owned

- `secretary-overlay/{upstream-base,upstream-tree,mapping,anchors}.json`
- `scripts/sprint-034-test.mjs`
- `scripts/sprint-035-patch-001-regression.sh`
- `CLAUDE.md`
- `docs/DESIGN.md`

Planner所有の `docs/spec.md`、`docs/spec/*.md`、Sprint契約と、
Orchestrator所有の `docs/sprints/state.md` は編集していない。

## 自動検証

| command | 結果 |
|---|---:|
| `node scripts/sync-secretary-overlay.mjs --check --candidate <clean-agentic-candidate>` | PASS、base完全SHA、managed 238、未分類0 |
| `node scripts/sync-secretary-overlay.mjs --reapply --candidate <clean-agentic-candidate>` | PASS、`secondChanged=0` |
| `node scripts/sprint-034-test.mjs <clean-agentic-candidate>` | 11 PASS / 0 FAIL |
| `node scripts/sprint-037-test.mjs` | 14 PASS / 0 FAIL |
| `bash scripts/sprint-011-regression.sh` | 69 PASS / 0 FAIL |
| `bash scripts/sprint-012-regression.sh` | 38 PASS / 0 FAIL |
| `bash scripts/sprint-022-regression.sh` | 69 PASS / 0 FAIL、wrapper 8 / 0 |
| `node scripts/sprint-035-test.mjs` | 15 PASS / 0 FAIL |
| `bash scripts/sprint-032-patch-001-regression.sh`（Patch 001 wrapper内） | 28＋wrapper 7 PASS / 0 FAIL |
| `bash scripts/sprint-032-patch-002-regression.sh`（Patch 001 wrapper内） | 32＋wrapper 8 PASS / 0 FAIL |
| `bash scripts/sprint-013-regression.sh`（local loopback許可面） | 33 PASS / 0 FAIL |
| `bash scripts/sprint-019-regression.sh`（local loopback許可面） | 51 PASS / 0 FAIL、wrapper 12 / 0 |
| Gitなし一時archiveの `archive-release-gate.mjs` | 11 PASS / 0 FAIL |
| Sprint 045保護6 filesの `git diff HEAD -- ...` | 0 files |
| `git diff --check` | PASS |

常駐UI変更はなく、manual test URL／browser screenshotは対象外。

## 開始HEADから赤い非因果baseline

既知redの全体baselineは実行していない。増分suiteで観測した次の旧digest不一致だけを、
本Sprintの製品FAILと分けて記録する。

1. `scripts/sprint-035-patch-001-ime-test.mjs`
   - 期待digest `c8d71dac...` に対して現行Google Chat wizard assetは `fcea246d...`。
   - 対象assetは `git diff HEAD -- plugins/secretary/skills/google-chat/assets/wizard/app.js`
     が0で、本Sprint差分ではない。
2. `bash scripts/sprint-030-regression.sh`
   - edition guard 54/54、update config 10/10、copy inventory 69/69等は合格したが、
     Sprint 029の同じ旧wizard digest 1件だけでwrapper 6 PASS / 1 FAIL。
3. `bash scripts/sprint-035-patch-001-regression.sh`
   - restricted sandboxでは上記旧digest 1件とloopback EPERM 2件で8 PASS / 3 FAIL。
   - loopback 2件は許可面で個別再実行し、Chatwork 33/33、
     Google Chat 51/51＋wrapper 12/12が0 FAIL。

Agentic Sprint 037で開始HEAD-redとして分離済みのfull master、
Sprint 033旧digest、Agentic archive、Agentic full regressionもnot-run。
本Sprintに因果のある新規FAILは0件。

## 外部操作と禁止面

- remote追加／変更／fetch／push: 0件
- remote refs変更: 0件
- `origin`／`upstream`／push disabled設定変更: 0件
- installed cache／利用者workspace／release／public設定: 0件
- plugin install／update、OAuth、Repository Secret、Actions、外部API: 0件
- Agentic candidateへの書込み: 0件
- 禁止対象のlocal Agentic Harness checkoutへの接触: 0件

## Evaluatorへの確認シナリオ

1. 完全SHAのclean candidateでoverlay check／reapplyを実行し、
   base、650 files、全分類、managed 238、`secondChanged=0`を確認する。
2. Sprint 037 14件で4経路、provider spy、Unicode case-fold、hostname、
   候補なし、候補非保存、保存前確認、3正本transaction、rollback、scanを確認する。
3. settingsのYasashii固有Markdown表示と値非再掲を確認する。
4. Sprint 011／012／022、Sprint 034、Sprint 035、会話可読性、Gitなしarchiveを増分確認する。
5. Sprint 045保護6 filesの差分0、open／closed行の保持を確認する。
6. 旧wizard digestは開始HEADでも同じであることを確認し、本Sprintの新規FAILと混同しない。

## Generator自己評価

固定Agentic candidateのreview、base／tree記録、overlay apply／reapply、
共通呼び方機能、Yasashii固有差分、利用者中立化、Sprint 045保護を実装した。
増分契約の新規FAILは0件。完了判定はfresh独立EvaluatorとOrchestratorへ委ねる。

## Retry 1 — spec-issue解消後の固定candidate再同期

初回Evaluatorのfindingは、旧固定candidate `0fa7af24551c149c3aabf9671d4cd87d6c276192`
の共通transactionが、確認済みの呼び方をjournalとcommit subjectへ再掲していたことだった。
Plannerが契約を改訂し、Agentic側で値非再掲Patchが独立評価PASSとなったため、同期元を完全SHA
`d9a62755ff78db12c435f225cdd40e95f86a8055` へ前進した。

### upstream reviewとoverlay record

- Agentic candidateはclean checkoutのHEADで、commit treeは
  `9473f36c2d8d19478fd7b01fb3222a435ddd0fa0`。
- 旧baseから新baseまでは1 commit、12 paths。
  - Yasashii repo-owned: 9
  - common: 2
  - anchor-overlay: 1
  - 未分類: 0
- Agenticの `docs/progress/sprint-037-patch-001.md` と
  `docs/feedback/sprint-037-patch-001.md` をreviewし、Patchの独立評価PASS、
  product finding 0件、verification-infra finding 0件を確認した。
- `secretary-overlay/upstream-base.json` と `upstream-tree.json` を同じ完全SHAへ更新した。
  新treeは654 filesで、分類はmetadata-overlay 6、repo-owned 392、
  upstream-only 23、common 220、anchor-overlay 13、未分類0。
- 初回applyは3 pathsだけを変更した。
  - `plugins/secretary/scripts/owner-name-transaction.mjs`
  - `scripts/sprint-037-patch-001-test.mjs`
  - `scripts/sprint-037-test.mjs`（既存のYasashii anchorを適用）
- overlay mappingとanchorの追加変更は不要だった。既存宣言で新candidateを一意に適用できた。
- `--check` はmanaged 239でPASS。`--reapply` はmanaged digest
  `d95a36040d265361809259803a5914aaff126ce006c9e3f41d30f4eacbd6f7bb`、
  `secondChanged=0`。同一実行内のrepo-owned digestは
  `e63a94061f157eb2629bd1cb866a49f4e2861127ca99f8e8c201bed78ddc111b`
  のまま不変だった。
- 本progressへ主要なRetry証跡を追記した後のcheck／reapplyでも
  `secondChanged=0`。progress自身を含むその実行時のrepo-owned digestは
  `857357df3bea50663a0d0fa8350025fdf3e37397af30449a892846f2c19a4637`
  で、同一実行のapply前後で不変だった。

repository URL、neutralization commit、release candidate `0.8.0`、
external gate、origin／upstream／push disabled契約は変更していない。

### 初回findingの直接解消

共通 `owner-name-transaction.mjs` はAgenticと6,626 bytes、
SHA-256 `f79242124e4cc13152774f0434b504fc5e97f316304e088884b8bbc7b65d8d24`
でbyte一致する。

合成値による実transactionで次を確認した。

- 確認済みの呼び方は `preferences.md`、`AGENTS.md`、`MEMORY.md` の現役表示へだけ一致して保存する。
- journalはtype `did` の1 eventで、本文は `設定を変更: 呼び方` に完全一致する。
- local commitは1件、subjectは `設定を変更（呼び方）` に完全一致し、bodyは空。
- 完全値、入力固有断片、JSON／URL escape、Base64、SHA-256等の値由来transformは
  journal本文、commit subject、commit bodyへ0件。
- 5 failure injectionで3正本、journal、HEAD、index、working treeを開始状態へ戻す。
- 初回decisionとSprint 045のopen／closed project行を変更しない。

`node scripts/sprint-037-patch-001-test.mjs` は5 PASS / 0 FAIL、
`node scripts/sprint-037-test.mjs` は14 PASS / 0 FAILだった。
active surface scanは258 files、正式allowlist 37 files、unexpected 0、
負fixture 3/3。

### Retry 1の増分回帰

| command | 結果 |
|---|---:|
| `node scripts/sync-secretary-overlay.mjs --check --candidate /Users/taisei/workspace/agentic-secretary` | PASS、base完全SHA、managed 239、未分類0 |
| `node scripts/sync-secretary-overlay.mjs --reapply --candidate /Users/taisei/workspace/agentic-secretary` | PASS、`secondChanged=0` |
| `node scripts/sprint-037-patch-001-test.mjs` | 5 PASS / 0 FAIL |
| `node scripts/sprint-037-test.mjs` | 14 PASS / 0 FAIL |
| `node scripts/sprint-034-test.mjs /Users/taisei/workspace/agentic-secretary` | 11 PASS / 0 FAIL |
| `bash scripts/sprint-011-regression.sh` | 69 PASS / 0 FAIL |
| `bash scripts/sprint-012-regression.sh` | 38 PASS / 0 FAIL |
| `bash scripts/sprint-022-regression.sh` | 69 PASS / 0 FAIL、wrapper 8 / 0 |
| `bash scripts/sprint-013-regression.sh`（local loopback許可面） | exit 0、33 PASS / 0 FAIL |
| `bash scripts/sprint-019-regression.sh`（local loopback許可面） | exit 0 |
| Gitなし一時archiveの `archive-release-gate.mjs` | 11 PASS / 0 FAIL |
| Sprint 045保護6 filesの `git diff HEAD -- ...` | 0 files |
| `git diff --check` | PASS |

restricted環境の `sprint-035-patch-001-regression.sh` は8 PASS / 3 FAIL。
内訳は開始時から同じ旧Google Chat wizard digest 1件と、loopback EPERM 2件である。
loopback 2件は上記の許可面で個別にexit 0を確認した。旧digest対象assetは開始HEADと現候補が
ともにSHA-256 `fcea246dc0b462f79647849bfffef9285d9fe9a1236d9afc264bf84ddc4ba1df`
で、`git diff HEAD` も0。旧fixtureの期待値 `c8d71dac...` だけが不一致であり、
本Retryに因果のある新規FAILではない。既知redのbroad master／online release gateは実行していない。

Sprint 045保護6 filesのSHA-256はRetry開始時と終了時で一致した。
remote追加／変更／fetch／push、remote refs、installed cache、利用者workspace、
release、external service、plugin install／updateへのwriteは0件。

### Retry 1 Generator自己評価

初回spec-issueは、Agentic／Yasashiiでbyte一致する共通実装のまま解消した。
固定candidate、overlay record、冪等性、履歴メタデータ非再掲、3正本の現在値、
Yasashii固有surface、Sprint 045保護を増分確認し、本Retryに因果のある新規FAILは0件。
完了判定はfresh独立EvaluatorとOrchestratorへ委ねる。
