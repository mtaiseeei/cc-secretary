# Sprint 035 独立評価

## 総合判定

**FAIL — `implementation-issue`**

2 editionの配布manifest、15 skillの共通root解決、overlay、Harness 0.5.0の公式GitHub照合、既存回帰は、専用検査123件を含む独立再実行で合格した。

一方で、正式なCodex配布面を追加したにもかかわらず、実際の更新処理は常にClaude CLIを実行する。また、Google／Microsoft／Notionの接続設定もCodexで開始した後にClaude専用画面の案内へ進む。テストが存在するだけでは、この実利用経路の不足を補えないため、Sprint 035は完了にできない。

- Sprint判定: **FAIL**
- Failure Classification: **`implementation-issue`**
- `spec-issue`: なし
- `verification-scope-issue`: なし
- 実装finding: High 1件、Medium 1件
- 検証基盤finding: Low 1件
- 外部gate: `external-live-gate-unavailable`
- Retry Recommendation: Generatorへ差し戻し
- Model Escalation Recommendation: なし。現在の `strong` tierを維持

## 評価対象

### agentic-secretary

- path: `/Users/taisei/workspace/agentic-secretary`
- branch: `codex/sprint-035`
- evaluated HEAD: `f1fddea77db823c2b1826ac11c1d3eedf6770cf9`
- working tree: clean

### yasashii-secretary

- path: `/Users/taisei/workspace/yasashii-secretary`
- branch: `codex/sprint-035`
- evaluated HEAD: `0e8c8f8c34992771d2305bc9d08966497c4fb6a7`
- implementation commit: `f0108127a5a3c9bd0e551afd61f72820dfeccd59`
- progress commit: `8b0811b`
- working tree: 評価開始時clean

`/Users/taisei/workspace/agentic-harness` は、読取り、list、status、比較、生成物作成を含めて評価対象にしていない。Harnessの確認はGitHub上の公式remoteだけをread-onlyで行った。

## Findings

### High — Codexから更新してもClaude CLIが実行される

分類: `product` / `implementation-issue`

両editionの `plugins/secretary/skills/update/SKILL.md` は、冒頭でClaudeとCodexの更新方法を混ぜないと説明している。しかし実行手順はhostを受け取らず、全利用者を `update-apply.mjs start` へ案内している。その後の実処理は次のとおりClaude固定である。

- `plugins/secretary/skills/update/SKILL.md:11-12`: Claude／Codexを混ぜない方針を宣言
- `plugins/secretary/skills/update/SKILL.md:72`: hostを区別せず `update-apply.mjs start` を実行
- `plugins/secretary/skills/update/SKILL.md:75-78`: Claude marketplace更新と `/reload-plugins` だけを案内
- `plugins/secretary/skills/update/SKILL.md:119-125`: 自動更新もClaude向けだけを記載
- `plugins/secretary/scripts/update-apply.mjs:493-501`: 実行binaryを `claude` に固定
- `plugins/secretary/scripts/update-apply.mjs:504-514`: `claude plugin marketplace update` と `claude plugin update` を実行
- `plugins/secretary/scripts/update-apply.mjs:586-606`: 保護commit、backup、session作成後にClaude更新を開始
- `plugins/secretary/scripts/update-apply.mjs:615-623`: 結果にも `/reload-plugins` とClaude commandだけを保存

`--host` やCodex用分岐は存在しない。したがってCodex利用者が更新を承認すると、Codexの正式な更新経路へ進まず、ローカルの保護commit等を作成した後にClaude CLIを呼び出す。Codex用更新を実装するか、少なくとも未対応hostではローカル変更前に安全に停止する必要がある。

これは表現上の問題ではない。正式配布されたCodex版の主要操作が正しいhost adapterへ到達しないため、AC11、C1、C3、C15を満たさない。

### Medium — 3つの接続設定がCodex判定後もClaude専用画面へ流れる

分類: `product` / `implementation-issue`

次の共通skillは、CodexではApp／connectorの利用可否を確認し、別hostの設定画面を流用しないと説明している。

- `plugins/secretary/skills/setup-google/SKILL.md:27-29`
- `plugins/secretary/skills/setup-microsoft/SKILL.md:27-29`
- `plugins/secretary/skills/setup-notion/SKILL.md:27-29`

しかし、利用可能と判断した後の実手順は、Google／Microsoftでは各fileの37、44、56行付近、Notionでは43、52行付近から「Claudeを再起動」「Claudeの設定 → Connectors」だけを案内する。Codex側で使う画面や操作へのadapterがなく、Codexで利用可能だった場合にもClaude専用手順へ進む。

「Codexで利用不可なら停止する」分岐だけでは、利用可能なCodex connector/Appを正しく設定できない。3つのskillそれぞれにCodex用の後続手順を用意するか、未対応ならhost判定直後に明示的に停止する必要がある。AC11とC15を満たさない。

### Low — Sprint 035専用検査がhost名の記載だけで通過する

分類: `verification-infra`

`scripts/sprint-035-test.mjs` は15 skill、manifest、root resolver、host inventory、禁止語等を確認しているが、次は確認していない。

- `update-apply.mjs` がCodex用の更新経路を持つこと
- host判定後の接続設定手順が、そのhostの画面・操作へ進むこと
- Claude専用commandがCodex経路から実行されないこと

このため、専用testは両repoで12/12 PASSでも上記2件を検出できない。これはテストの追加課題だが、製品findingを検証基盤だけの問題へ読み替えない。

## 受入基準

| AC | 判定 | 独立確認 |
|---:|---|---|
| 1 | FAIL | 専用・重点回帰は0 FAILだが、Codexの更新・接続設定という内部必須経路に実装不足が残る |
| 2 | PASS | agentic／yasashiiのidentity、root、配布surfaceが分離され、共通skillのbyte一致をoverlay検査で確認 |
| 3 | PASS | downstreamのoriginはyasashii、upstreamはagentic fetch／push disabled。overlay checkも宣言baseと候補を照合 |
| 4 | PASS | 共通skillをedition別に複製せず、host-neutral rootから15 skillを解決 |
| 5 | PASS | `.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`、root marketplace manifestが両editionに存在 |
| 6 | PASS | Codex manifestは `skills: ./skills/` を持ち、edition identityとversion 0.8.0が整合 |
| 7 | PASS | 不正root、相対path、未解決placeholder、skill外path、必須directory欠落をexit 2で拒否 |
| 8 | PASS | 任意の絶対path、空白を含むfixture、`/` cwdからも15 skillを解決。失敗時sentinelは不変 |
| 9 | PASS | Harness実装をpluginへ同梱せず、追加は参照guidanceと設定差分に限定 |
| 10 | PASS | GitHub公式remote上のHarness 0.5.0、commit、Claude／Codex配布IDをread-only照合 |
| 11 | FAIL | 共通skill内にCodexで実行できないClaude専用更新・接続設定が残る |
| 12 | PASS | 両hostの正式manifestとdiscoverable skill rootは存在。既存install evidenceと現在の静的構造を照合 |
| 13 | PASS | Harness guidanceはsafe harbor、incremental評価、分類、counter、`done-by-user-decision` を保持 |
| 14 | PASS | push、install、公開、release、OAuth、Secret、workflow dispatchは0件 |
| 15 | FAIL | High／Medium findingが残り、Codex adapter completenessのゼロ許容条件を満たさない。外部live gateも未実施 |

## 独立実行結果

### Sprint 035専用・重点回帰

| repo | command | 結果 |
|---|---|---:|
| agentic | `node scripts/sprint-035-test.mjs` | 12 PASS / 0 FAIL |
| yasashii | `node scripts/sprint-035-test.mjs` | 12 PASS / 0 FAIL |
| agentic | `node scripts/sprint-033-test.mjs` | 20 PASS / 0 FAIL |
| yasashii | `node scripts/sprint-034-test.mjs /Users/taisei/workspace/agentic-secretary` | 11 PASS / 0 FAIL |
| yasashii | `TMPDIR=/private/tmp bash scripts/sprint-015-regression.sh` | 68 PASS / 0 FAIL |

合計は **123 PASS / 0 FAIL**。

### overlay

```text
node scripts/sync-secretary-overlay.mjs --check --candidate /Users/taisei/workspace/agentic-secretary
OVERLAY_CHECK_PASS
base=f1fddea77db823c2b1826ac11c1d3eedf6770cf9
managed=225
repoOwnedDigest=2e52c929e022fff00c796f36ddc22c1f8d32095ab640e27b63e03b54ef1edfbf
```

remote gateのlocal設定は次を返した。

```text
external-live-gate-unavailable
origin=yasashii-secretary
upstream=agentic-secretary
upstream-push=disabled
```

15 skillはそれぞれ1件だけ存在し、すべて共通root boilerplateを使用していた。`CLAUDE_PLUGIN_ROOT` は残っていない。任意path fixtureと不正入力fixtureは専用testの中で独立再実行した。

### Harness 0.5.0 公式remoteのオンライン照合

最初のsandbox内照合はDNS拒否で `UNVERIFIED` となり、PASSへ読み替えなかった。その後、read-onlyのオンライン照合を許可面で再実行し、次を確認した。

| edition | GitHub repository | commit | version | 配布ID |
|---|---|---|---:|---|
| agentic | `mtaiseeei/agentic-harness` | `aafdf97d1f673a856c5a2a2fe72f87f1a4b57e89` | 0.5.0 | Claude: `agentic-harness/harness@agentic-harness` / Codex: `agentic-harness-local/harness@agentic-harness-local` |
| yasashii | `mtaiseeei/yasashii-harness` | `8f9eb4c1d9e14414a7e94051ca6f4c34da282784` | 0.5.0 | Claude／Codex: `yasashii-harness/harness@yasashii-harness` |

ローカルHarness checkoutは使用していない。

### 追加の静的確認

- `git diff --check`: 両repoの対象差分でPASS
- Codex manifest: 両editionともversion 0.8.0、`skills: ./skills/`、正しいrepository identity
- 共通root: missing、relative、placeholder、tree外、必須file／directory欠落を拒否
- plugin内bundled Harness: なし。`.git/hooks` はGit内部管理であり製品同梱に数えていない
- `.harness/config.toml`: `max_lineage_dispatches=10`、`max_spec_issue_returns=2` を追加し、既存model／effort／lifecycleを保持
- wizard asset差分: なし

## master regressionの扱い

旧 `scripts/regression-check.sh --offline` は両repoで開始したが、全体完走前に中止したため、master PASSの根拠にはしていない。

観測した失敗は、agentic側に残る旧yasashii固定identity／README期待と、sandboxでの `listen EPERM: operation not permitted 127.0.0.1` が中心だった。これらは既知の古い検証前提または実行環境制約であり、今回の製品FAILへ加算していない。逆に、未完走のmasterをPASSとも記録しない。

Sprint契約がsafe harborとして挙げる専用検査、overlay、公式remote snapshot、15 skill inventory、任意path fixture、既存の正式配布証跡は個別に確認済みである。Sprint 035の差し戻し根拠はmaster中断ではなく、実ファイルから確認したHigh／Mediumの製品findingである。

`TMPDIR=/private/tmp node scripts/sprint-030-update-config-test.mjs` はyasashiiで10/10 PASSだった一方、現在もClaude commandだけを正解としている。agentic側は旧yasashii固定fixtureで失敗した。これもSprint 035のCodex更新経路を保証する検査には使えない。

## UI・Browser証跡の扱い

Sprint 035ではwizard assetに差分がない。対象candidateはcleanで、専用・重点回帰もgreenだったため、Sprint 034で記録済みのdesktop／mobile Browser証跡を同一候補の未変更surfaceとして再利用した。新しいscreenshotや外部OAuth操作は行っていない。

今回のfindingはskill手順とupdate runnerのhost分岐不足であり、画面のvisual品質とは独立している。

## Rubric採点

| 基準 | スコア | 閾値 | 判定 | 根拠 |
|---|---:|---:|---|---|
| C1 完成度 | 3/5 | 4 | FAIL | 配布構造は完成したが、Codexの更新・3接続設定が完結しない |
| C2 構文・整合 | 5/5 | 5 | PASS | manifest、ID、version、root、remote snapshotが整合 |
| C3 機能の実証 | 3/5 | 4 | FAIL | 123件はgreenだが、実コード上のCodex経路がClaude固定 |
| C4 非エンジニア体験 | 4/5 | 4 | PASS | やさしい説明は維持。ただしCodex利用者には次の画面案内が誤る |
| C5 安全・規律 | 5/5 | 5 | PASS | 外部書込み、Secret、install、release、pushは0件 |
| C6 無回帰 | 5/5 | 5 | PASS | 専用・重点123件が0 FAIL。旧master中断は別記し、合格へ読み替えていない |
| C7 やさしさ | 4/5 | 4 | PASS | 文体は維持したが、host不一致の案内は利用時に迷いを生む |
| C8 wizard体験・デザイン | 5/5 | 4 | PASS | asset差分なし。同一候補の記録済み証跡を再利用 |
| C9 配布チャネル非依存 | 5/5 | 5 | PASS | 2 editionとClaude／Codex正式配布面を分離 |
| C10 同意・安全停止 | 5/5 | 5 | PASS | 外部操作の承認gate自体は維持。host誤分岐はC15で評価 |
| C11 Secret・OAuth | 5/5 | 5 | PASS | Secret値の露出・外部OAuth実行なし。既存安全回帰68/68 |
| C12 リリース品質 | 4/5 | 5 | FAIL | High／Medium findingが残るため5点条件を満たさない |
| C13 変更影響管理 | 5/5 | 5 | PASS | overlay、repo-owned digest、edition差分、任意pathを確認 |
| C14 Harness 0.5.0整合 | 5/5 | 5 | PASS | 公式GitHub remoteとguidance／configを照合 |
| C15 host adapter完全性 | 3/5 | 5 | FAIL | Codex更新・Google／Microsoft／Notion設定にCodex用adapterがない |

**合計: 66 / 75**

C1、C3、C12、C15が閾値未達のためFAIL。

## Generatorへの修正要求

1. update skillとrunnerにhostを明示的に渡し、CodexではCodexの正式更新経路を使用する。未対応なら、保護commitやbackupを作る前に安全停止する。
2. Google、Microsoft、Notionの各setup skillで、host判定後の手順をClaude／Codexに分ける。Codexで利用可能な場合にClaudeのConnectors画面へ案内しない。
3. 専用検査へ、Codex経路からClaude commandが実行されないこと、3 setup skillの後続手順がhost別であることを追加する。
4. 修正後は変更surfaceと専用回帰を再実行し、旧masterの既知identity fixture／localhost制約は製品回帰と分けて報告する。

## 外部gate

外部操作は0件。push、install、公開、release、OAuth、Secret、workflow dispatchは実施していない。

実Codex App／CLIへのinstall、更新、connector接続は外部live gateとして残る。今回のFAILは外部許可不足によるものではないため、`external-live-gate-unavailable` だけで保留にはしない。内部実装を修正した後、ユーザーが操作別に承認した範囲だけで再評価する。

## Evaluator self-review

- 実装、spec、progress、stateは編集していない。
- 編集対象はこの `docs/feedback/sprint-035.md` だけである。
- Generatorの自己評価をSprint verdictへ流用せず、実ファイル、実行結果、remote snapshotを独立確認した。
- verification-infra findingを製品findingへ混ぜず、製品findingを検証基盤だけの問題へも読み替えていない。
- master未完走をPASS／FAILのどちらにも偽装していない。
- 禁止されたローカルHarness checkoutには接触していない。
