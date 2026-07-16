# Sprint 008 Progress — 配布物の再編と yasashii-harness 分離

## 実装内容

- 配布ディレクトリを `plugins/cc-secretary/` から `plugins/yasashii-secretary/` へ改名した。
- marketplace / plugin manifest / `.mcp.json` / README / 公開ガイド / LICENSE / skills / scripts の現行配布面を `yasashii-secretary` へ揃えた。
- README冒頭を「非エンジニア向けAI秘書」と明示し、3コマンド導入を改名後の識別子へ更新した。Shin-sibainu/cc-company の単段クレジットとMITは維持した。
- 本体から `plugins/*/harness/`、`plugins/*/agents/`、`scripts/harness-source-baseline.sha256` を撤去した。
- buildを別repo `mtaiseeei/yasashii-harness` の導入確認・未導入時3コマンド・導入後の Planner / Generator / Evaluator 接続導線へ変更した。配布されないdocs、ローカル上流checkout、存在しない同梱パスは参照しない。
- regression section 12を参照導線の健全性検査へ再設計した。案内・識別子・plugin root参照・同梱物不在を検査し、installコマンド欠落とharnessコピー復活を意図的に作って検出できることも確認する。
- GitHub remote repoを `mtaiseeei/yasashii-secretary` へ改名し、originを `https://github.com/mtaiseeei/yasashii-secretary.git` へ更新した。本体コードはpushしていない。
- local canonical pathを `/Users/taisei/workspace/yasashii-secretary` へ変更した。進行中Harnessセッションの互換性のため、旧path `/Users/taisei/workspace/cc-secretary` は新pathへの一時symlinkとして残した。`pwd -P` と `git rev-parse --show-toplevel` はどちらも新pathを返す。全Sprint終了後に旧symlinkだけを除去できる。

## 回帰結果

- コマンド: `bash scripts/regression-check.sh`
- 結果: `PASS=268  FAIL=0`、exit 0。
- section 12単体の主な観測: build/READMEの3コマンド、正式な3 role、同梱harness/agents/baseline不在、plugin root参照、意図的破損2ケースをすべてPASS。
- 構文: `bash -n scripts/regression-check.sh` 成功。
- 差分: `git diff --check` 成功。

## yasashii-harness 作成結果と既知問題

- 実行: `gh repo fork mtaiseeei/agentic-harness --clone=false --fork-name yasashii-harness`
- GitHubの結果: `failed to fork: mtaiseeei/agentic-harness cannot be forked. A single user account cannot own both a parent and fork.`
- `mtaiseeei/agentic-harness` と要求されたfork先が同じuser ownerのため、GitHub仕様上、親repoとforkを同一アカウントで同時所有できない。
- 契約どおり独立repoへ黙って置き換えていない。したがって `yasashii-harness` のfork、`gentle-overlay/`、agents 3種、sync検証、`run-runtime-config.sh`、独自回帰は未実装であり、Sprint 008全体はこのままでは合格条件を満たさない。
- 参照導線のURLは仕様どおり記載したが、現時点ではGitHub上に対象forkが存在しない。ユーザー判断が必要なブロッカーである。

## 保護対象repoの前後状態

- 開始前: `/Users/taisei/workspace/agentic-harness` HEAD `fb9c30375dac5d4458ed0f522b3469cff2f6b949`、status `## main...origin/main`。
- 実装後: HEAD `fb9c30375dac5d4458ed0f522b3469cff2f6b949`、status `## main...origin/main`。
- 当該repoへの書き込み、checkout、clone元としての利用は行っていない。

## 起動・評価引き渡し

- 製品形態: Claude Code plugin。Web UIは無いためテストURLは該当なし。
- 起動: Claude Codeで `/plugin marketplace add mtaiseeei/yasashii-secretary` → `/plugin install yasashii-secretary@yasashii-secretary` → `/secretary`。
- 回帰: `bash scripts/regression-check.sh`。
- 評価シナリオ1: marketplaceとplugin manifestのname/source、READMEの3コマンド、実ディレクトリ名が `yasashii-secretary` で一致することを確認する。
- 評価シナリオ2: README冒頭だけで非エンジニア向け、できること、導入の最初の一歩が分かることを確認する。
- 評価シナリオ3: buildを読み、未導入時の3コマンドと導入済み時の Planner / Generator / Evaluator 接続、ローカル上流checkout非参照を確認する。
- 評価シナリオ4: `plugins/yasashii-secretary/{harness,agents}` と `scripts/harness-source-baseline.sha256` が無く、section 12の意図的破損ケースがPASSすることを確認する。
- 評価シナリオ5: `gh repo view mtaiseeei/yasashii-secretary` と `git remote -v` でremote改名を確認する。
- 評価シナリオ6: fork作成失敗を再現またはGitHub仕様で確認し、代替方式を勝手に採らずブロッカーとして判定する。

## 自己評価

- 本体側の改名、参照導線、同梱撤去、section 12、全回帰は完了した。
- remote/local改名は完了し、旧path symlinkはHarness継続用の一時互換層として明示した。
- `yasashii-harness` は同一ownerのGitHub fork制約により未達。C1/C5のfork基点要件を満たさないため、Sprint 008全体を完了とは判定しない。

---

## 2026-07-16 retry — 独立downstream方針への改訂後

前回評価後、PlannerがGitHub fork必須を廃止し、`mtaiseeei/yasashii-harness` を
public・`fork=false`の独立downstreamとするよう正本を改訂した。本節は、その改訂後のretry実装記録である。

### 実装した内容

- GitHubの上流URL `https://github.com/mtaiseeei/agentic-harness.git` だけを取得元にし、
  `fb9c30375dac5d4458ed0f522b3469cff2f6b949` を初期基点とするdownstreamを
  `/Users/taisei/workspace/yasashii-harness` に作成した。
- local remoteを次の境界にした。
  - `origin`: `https://github.com/mtaiseeei/yasashii-harness.git`
  - `upstream` fetch: `https://github.com/mtaiseeei/agentic-harness.git`
  - `upstream` push: `DISABLED`
  - `main` はupstream追跡を解除し、意図しないpull/push先を持たない。
- `gentle-overlay/` にREADME、harness-loop、Planner / Generator / Evaluatorの5断片と
  `anchors.tsv` を置いた。各断片の最初の見出しに `yasashii` を含め、上流本文は書き換えず末尾追加で合成する。
- `gentle-overlay/metadata-overrides.json` にClaude/Codex marketplaceとplugin manifestの
  許可field・期待値を列挙した。plugin本体名は `harness`、marketplace名は `yasashii-harness` を維持する。
- `scripts/sync-harness.sh` / `scripts/sync-harness.py` を追加し、基点treeとの完全比較、
  overlay合成、metadata allowlist、file mode、未分類新規・削除、アンカー不在、合成不一致を検査する。
  `upstream/main` の前進だけは警告にし、失敗にしない。
- `docs/upstream-mapping.md` に上流全30ファイルの扱い、意図してCodexへ配布しないcommands/hooks、
  同期後の目視確認を記録した。LICENSE、templates、runtime resolver、vendorを保持した。
- `plugins/harness/scripts/run-runtime-config.sh` を追加した。nodeがあれば上流resolverへ委譲し、
  nodeが無ければ `{"status":"inherit","reason":"node-unavailable"}` を決定的に返してexit 0とする。
- downstream独自回帰を追加し、冪等性、未分類新規、上流file削除、アンカー不在、合成不一致、
  allowlist外metadata変更、上流前進警告、node無し継続をfixtureで実証した。
- downstream local commitを日本語prefixつきで作成した。
  - `a76c4aa8b4a606cb08d0633d3273f81b0e5b8734 [sprint-008] やさしい差分と上流追随検査を追加`
- 本体のsection 12をoffline / onlineに分離した。
  - offline: build/README/3コマンド/同梱不在に加え、GitHub 404 fixtureとremote manifest不一致fixtureを検出する。
  - online: GitHub APIからrepo情報、Claude/Codex manifests、remoteのmetadata allowlistを取得し、
    public、`fork=false`、owner/name、name/source/repository/homepageの完全一致を検査する。
  - API障害・404は `ONLINE=UNVERIFIED` でexit 1とし、remote健全性のPASSへ数えない。

### 検証結果

#### yasashii-harness local

- `bash scripts/sync-harness.sh --check --offline`
  - `SYNC_OK base=fb9c30375dac5d4458ed0f522b3469cff2f6b949`
- `bash scripts/regression-check.sh`
  - `PASS=22 FAIL=0`
- `node scripts/check-positioning.mjs`
  - `9 checks passed`
- `node plugins/harness/scripts/check-runtime-config.mjs`
  - `23 checks passed`
- onlineのupstream確認では、`upstream/main=d35c6c0...` が初期基点より前進していることを
  `WARNING: upstream/main advanced` として通知し、仕様どおりexit 0を維持した。
- `git status --short --branch` は `## main`、worktreeはclean。
- `git merge-base --is-ancestor fb9c303... HEAD` はexit 0。

#### yasashii-secretary

- `bash -n scripts/regression-check.sh scripts/check-yasashii-harness-online.sh`
  - exit 0
- `python3 -m py_compile scripts/check-yasashii-harness-reference.py`
  - exit 0
- `bash scripts/regression-check.sh --offline`
  - `PASS=272 FAIL=0`
  - `ONLINE=SKIPPED` を明示。offline成功をonline成功として扱っていない。
- `bash scripts/check-yasashii-harness-online.sh`
  - `ONLINE=UNVERIFIED GitHub API request failed or a required file returned 404`
  - exit 1。remote未公開を正しく非PASSにした。

### 公開操作の状態

- 新規public repo作成と初期pushは実行環境の承認レビューで拒否された。
- 拒否後は回避・再試行していない。`mtaiseeei/yasashii-harness` は引き続き未作成で、
  local commit `a76c4aa` も外部へpushしていない。
- 公開操作は、ユーザーが「`mtaiseeei/yasashii-harness` をpublic作成し、現在のSprint 008 commitを
  mainへpushしてよい」と改めて明示承認した後にだけ再開する。
- retry中、全面操作禁止のローカル上流checkoutをコマンド対象・参照元・複製元・検査対象にしていない。
  上流取得と前進確認はGitHub URL / downstreamの`upstream` remoteだけで行った。

### retry自己評価

| 基準 | スコア | コメント |
|---|---:|---|
| C1 完成度 | 3/5 | local実装は完了。必須のremote実在と初期公開が承認待ち |
| C2 構文・整合 | 4/5 | local manifest/allowlistは完全一致。remoteが404のため必須5/5には未到達 |
| C3 機能の実証 | 5/5 | sync 6破損系、node無し、既存runtime/positioningを実行済み |
| C4 非エンジニア体験 | 5/5 | README/buildとyasashii 3 Agent節で正式名称＋短い補足＋3行報告を維持 |
| C5 安全・規律 | 5/5 | 上流local非接触、upstream push無効、上流行変更はoverlay/metadata allowlistだけ |
| C6 無回帰 | 4/5 | offlineは全緑。Sprint必須のonline検査がremote未公開で未達 |
| C7 やさしさ | 5/5 | 言葉遣い・報告・先回りだけを追加し、閾値・3 Agent分離・証跡を緩めていない |

Sprint 008全体は、remote作成・初期push・online検査成功の証跡が揃うまで評価待ちへ進めない。

---

## 2026-07-16 retry再開 — 明示承認後の初期公開

**ステータス: 実装完了 — Evaluator評価待ち**

ユーザーから `mtaiseeei/yasashii-harness` の独立public repo新設と、Sprint 008 commit
`a76c4aa` の `main` 初回pushについて明示承認を受け、公開操作とonline検証を完了した。

### 公開結果

- 公開URL: `https://github.com/mtaiseeei/yasashii-harness`
- GitHub API:
  - `full_name=mtaiseeei/yasashii-harness`
  - `owner=mtaiseeei`
  - `private=false`
  - `fork=false`
  - `default_branch=main`
- remote `main`: `a76c4aa8b4a606cb08d0633d3273f81b0e5b8734`
- remote履歴から初期基点 `fb9c30375dac5d4458ed0f522b3469cff2f6b949` へ到達可能。
- local remote:
  - `origin=https://github.com/mtaiseeei/yasashii-harness.git`（fetch/push）
  - `upstream=https://github.com/mtaiseeei/agentic-harness.git`（fetch）
  - `upstream=DISABLED`（push）
- local `main` と `origin/main` はともに `a76c4aa`。worktreeはclean。
- `yasashii-secretary` 本体はpushしていない。

### 公開後のonline証跡

`bash scripts/check-yasashii-harness-online.sh`:

```text
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
```

online validatorはGitHub APIからrepo情報と次のremoteファイルを取得して検証した。

- `.claude-plugin/marketplace.json`
- `.agents/plugins/marketplace.json`
- `plugins/harness/.claude-plugin/plugin.json`
- `plugins/harness/.codex-plugin/plugin.json`
- `gentle-overlay/metadata-overrides.json`

marketplace `name=yasashii-harness`、plugin `name=harness`、Claude source `./plugins/harness`、
Codex local source、repository / homepage、metadata allowlistの対象fieldと期待値がremoteで完全一致した。

### 公開後の全回帰

#### yasashii-secretary

- コマンド: `bash scripts/regression-check.sh --online`
- 結果:

```text
ONLINE=PASS repo=mtaiseeei/yasashii-harness
PASS=273  FAIL=0
回帰チェック合格
```

offline構造検査、404 fixture、manifest mismatch fixture、GitHub API online実在検査を同じrunで通した。

#### yasashii-harness

- `bash scripts/sync-harness.sh --check`
  - `SYNC_OK base=fb9c303...`
  - `upstream/main=d35c6c0...` の前進は `WARNING` のみでexit 0。
- `bash scripts/regression-check.sh`
  - `PASS=22 FAIL=0`
- `node scripts/check-positioning.mjs`
  - `9 checks passed`
- `node plugins/harness/scripts/check-runtime-config.mjs`
  - `23 checks passed`
- `gh api repos/mtaiseeei/yasashii-harness/commits/fb9c303...`
  - remoteで基点commitの到達を確認。

### 最終自己評価

| 基準 | スコア | コメント |
|---|---:|---|
| C1 完成度 | 5/5 | 改名、独立downstream、同梱撤去、参照導線、公開まで全成果が成立 |
| C2 構文・整合 | 5/5 | remote manifestsとmetadata allowlistをonlineで完全一致確認 |
| C3 機能の実証 | 5/5 | sync破損系、node無し、online API、既存runtimeを実行済み |
| C4 非エンジニア体験 | 5/5 | README/build/3 Agentの正式名称、短い補足、3行報告が一貫 |
| C5 安全・規律 | 5/5 | 明示承認範囲だけpush、上流local非接触、upstream push無効、差分境界違反0 |
| C6 無回帰 | 5/5 | 本体273/0、downstream22/0、positioning9/9、runtime23/23 |
| C7 やさしさ | 5/5 | やさしさ差分を追加節に限定し、3 Agent分離・閾値・証跡を維持 |

### Evaluatorへの引き渡し

- 公開URL: `https://github.com/mtaiseeei/yasashii-harness`
- 本体回帰: `bash scripts/regression-check.sh --online`
- downstream回帰: `bash scripts/regression-check.sh`
- sync境界: `bash scripts/sync-harness.sh --check`
- 確認事項:
  1. GitHub APIのpublic・`fork=false`・owner/name・remote SHA。
  2. remote manifestsと`metadata-overrides.json`の完全一致。
  3. `fb9c303`からの差分がyasashii見出し追加とmetadata allowlistだけであること。
  4. `origin` / `upstream` / upstream push無効と、本体に同梱harnessが無いこと。
  5. 本体online回帰273件とdownstream独自回帰22件が0 FAILであること。
