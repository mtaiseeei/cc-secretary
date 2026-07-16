# Sprint 008 — 配布物の再編と yasashii-harness 分離

- Type: main
- 主眼: 製品を `yasashii-secretary` へ改名し、やさしいハーネスを別repo `yasashii-harness` の正本へ分離する。壊れている regression section 12 を参照導線の健全性検査として再設計し、全回帰を緑に戻す。
- 依存: sprint-001〜006 と各patchがdone。sprint-007は製品方針転換によりsupersededとしてstateへ記録してから開始する。
- リモート権限: local/remote改名と、独立public repo `mtaiseeei/yasashii-harness` の新設・初期公開・remote設定に必要なリモート操作は承認済み。それ以外のpush・公開操作は行わない。

## 外から見える成果

1. local repo が `~/workspace/yasashii-secretary`、remote repo が `yasashii-secretary` になり、配布名、pluginディレクトリ、manifest、marketplace、README、3コマンド導入が同じ名前で揃う。
2. README冒頭で、非エンジニア向けAI秘書であることと最初の導入手順が明確に分かる。
3. 別repo `mtaiseeei/yasashii-harness` がpublic・`fork=false`の独立downstreamとして存在し、fb9c303を初期基点、`mtaiseeei/agentic-harness` を `upstream` remoteとする、やさしさ差分と上流追随の正本になる。
4. `yasashii-secretary` の build は、`yasashii-harness` の有無を確認し、無ければ `/plugin install harness@yasashii-harness` を含む非エンジニア向けの3コマンドを案内し、あれば3 Agentループへ接続する。
5. `yasashii-secretary` にハーネスコピー、やさしい版agents、旧source baselineが残らず、regression section 12を含む全回帰が成功する。

## スコープ

### A. yasashii-secretary の改名

- local path、GitHub remote repo、pluginディレクトリ、`plugin.json`、`marketplace.json`、README、インストール例、現行配布物の `cc-secretary` 表記を `yasashii-secretary` へ揃える。
- ユーザー向け・実行時参照・配布識別子を文言スイープする。旧Sprint履歴、方針転換の説明、Git branch名等、過去を説明するための `cc-secretary` は旧名として残してよい。
- Shin-sibainu/cc-company、MIT、単段クレジットを維持する。
- 改名前後でインストール3コマンドがmanifestの実値と一致する。

### B. yasashii-harness の新設

- `mtaiseeei/yasashii-harness` をGitHub上の独立public downstream repoとして作る。GitHub APIの期待値は `full_name=mtaiseeei/yasashii-harness`、`private=false`、`fork=false`。
- downstreamのlocal checkoutは、`origin=https://github.com/mtaiseeei/yasashii-harness.git`、読取専用の `upstream=https://github.com/mtaiseeei/agentic-harness.git` をremote名どおりに登録する。fb9c303を初期基点とし、downstream HEADの履歴から到達可能にする。
- 親repo `mtaiseeei/agentic-harness` は移管・改名・変更しない。GitHubのfork badge／parent relation／同じforkから上流へPRする導線は作らない。上流変更は本Sprintのスコープ外であり、将来あらためて明示承認された場合だけ別の `agentic-harness` 側branch / PR手順に分離する。
- ローカル `~/workspace/agentic-harness` は全面操作禁止。編集、checkout / switch、commit、branch、remote変更、生成物作成、複製元利用、当該checkoutを対象にしたコマンド実行を禁止する。初期取得・差分比較・同期・検査はGitHubの `upstream` remote / APIだけを使う。
- downstream内に次を正本化する。
  - `gentle-overlay/`: 見出しに `yasashii` を含む追加セクション断片とアンカー定義。
  - `gentle-overlay/metadata-overrides.json`: 配布識別metadataの対象ファイル・JSON field・期待値を列挙する宣言的overlay兼allowlist。
  - Planner / Generator / Evaluator のやさしい版agents 3種。
  - 上流merge後に実行できる `scripts/sync-harness.sh`。
  - overlay、上流一致、未分類ファイル、実行フォールバックを守る独自回帰。
  - 上流由来のLICENSEとvendorクレジット。
- upstreamの `plugins/harness/` にある init guidance、templates、harness-loop、runtime configのresolve/check、`.harness`設定雛形、`vendor/smol-toml` とLICENSEがdownstream内で失われていないことを確認する。upstreamのusing-harness、commands、hooks、plugin manifestも上流資産として保持し、`yasashii-secretary` 側へ同梱・二重登録はしない。
- 本文・スキル・agents・runtimeロジックのやさしさ差分は、見出しに `yasashii` を含む追加セクションだけ。上流由来の実装行を書換・削除しない。
- 機械的例外として、配布識別metadataだけをdownstream向けに変更できる。`.claude-plugin/marketplace.json` は marketplace `name=yasashii-harness`、`repository=mtaiseeei/yasashii-harness`、plugin `name=harness`、`source=./plugins/harness` に揃える。plugin manifestは `name=harness` を維持し、`repository` / `homepage` は `https://github.com/mtaiseeei/yasashii-harness` を指す。必要なCodex marketplace識別子も同じ配布元に揃える。
- metadata例外は `gentle-overlay/metadata-overrides.json` だけを正本とし、sync後に期待値の完全一致とallowlist外のmetadata・上流由来行変更0件を検査する。
- upstreamツリーとの対応表を置き、対象ファイル、意図して機能として使わない面、その理由を確認できるようにする。downstreamに存在する上流ファイル自体を、差分規約に反して削除して帳尻を合わせない。
- sync健全性検査は次を満たす。
  - `upstream/main` の記録とmerge後の確認に使える。
  - 上流の全ファイル差分を列挙し、対応表にない新規・削除ファイルは失敗する。
  - アンカー不在、overlay合成結果との不一致、マッピング外差分は失敗する。
  - metadata overlayの期待値不一致、宣言されていないfield変更、allowlist外の上流由来行変更は失敗する。
  - 上流HEADの前進だけなら「巻き取り候補あり」の警告であり、回帰失敗にしない。
  - 同じ入力で再実行したときdiffが増えない（冪等性、つまり再実行しても同じ結果になる）。
  - 機械検査の後に、上流の新しい節がyasashii規約と矛盾しないか目視レビューする手順を持つ。
- runtime設定のnode呼び出しはdownstreamのharness scripts層に置く薄い `run-runtime-config.sh` を通し、nodeが利用可能なら上流処理、利用不可なら `inherit` で続行する旨を決定的に示して exit 0 とする。

### C. 本体から同梱物を撤去し、buildを参照導線へ変更

- `plugins/*/harness/`、`plugins/*/agents/`、`harness-source-baseline.sha256` を `yasashii-secretary` から撤去する。
- buildは別repoプラグインの導入状態を確認し、未導入時の3コマンド、導入後の起動、Planner / Generator / Evaluator の役割を正式名称＋短い補足で案内する。
- buildは配布されない `docs/spec/**`、ローカル `~/workspace/agentic-harness`、存在しない同梱パスを参照しない。
- `${CLAUDE_PLUGIN_ROOT}` と `$PLUGIN_ROOT` の両形式を含む参照を検査し、デッドリンクを残さない。

### D. regression section 12 の再設計

- 旧「同梱ハーネスと上流baselineの一致」から、次の参照導線健全性へ置き換える。
  1. buildに導入案内と接続導線がある。
  2. 案内するURL、repo名、marketplace名、plugin名、`harness@yasashii-harness` を含むコマンドに不整合・デッドリンクがない。
  3. 同梱harness、agents、旧baselineが復活していない。
  4. `~/workspace/agentic-harness` を参照元・書込先・複製元・検査対象・コマンド実行先として要求していない。
  5. GitHub APIで `mtaiseeei/yasashii-harness` が実在し、`full_name`、owner/name、`private=false`、`fork=false` が一致する。
  6. GitHub APIでremoteのmarketplace manifestとplugin manifestが実在し、marketplace `name=yasashii-harness` / `repository=mtaiseeei/yasashii-harness`、plugin `name=harness` / `source=./plugins/harness` / `repository` / `homepage=https://github.com/mtaiseeei/yasashii-harness`、必要なCodex marketplace識別子がbuildの3コマンドと一致する。
  7. remoteのmetadataが `gentle-overlay/metadata-overrides.json` と完全一致し、allowlist外の上流行変更が0件である。
- section 12はofflineとonlineを混同しない。
  - offline構造検査: ローカル案内・3コマンド・同梱不在・意図的破損fixtureの検出。ネットワークなしで決定的に実行できる。
  - online実在検査: GitHub APIによるrepo・manifest・識別子の確認。ネットワーク不可やAPI障害はremote健全性のPASSにせず、`UNVERIFIED` 等としてoffline結果と分離する。
  - Sprint合格にはEvaluatorによるonline実在検査の成功証跡が必須。offline構造検査だけの成功をsection 12全体の合格として扱わない。
- 現在の 282 PASS / 2 FAIL（上流前進によるbaseline不一致）を解消し、更新後の全回帰を0 FAILで完了する。

## スコープ外

- G1のjournal/timeline実装（sprint-009〜010）。
- G2のsettings実装（sprint-011）。
- `~/workspace/agentic-harness` への一切の操作。
- 承認済みの独立repo新設・初期公開・改名以外のpush、タグ、リリース公開。
- GitHubのfork badge／parent relation、同じforkから上流へPRする導線。
- 親repo `mtaiseeei/agentic-harness` の移管・改名・変更。

## 受入基準

1. **改名整合（C1/C2）**: 新local pathとGitHub remote名が `yasashii-secretary`。pluginディレクトリ、manifest、marketplace、README、3コマンドが同名で一致する。現行配布面に実害のある旧名参照が0件。
2. **非エンジニア向けREADME（C4/C7）**: README冒頭だけで対象者、できること、導入の最初の一歩が分かり、過度な平易化や幼稚な比喩がない。
3. **独立downstream基点（C1/C2/C5）**: GitHub APIで `mtaiseeei/yasashii-harness` が実在し、public、`fork=false`、owner/name一致。local checkoutでorigin/upstream URLが指定値と一致し、fb9c303がdownstream HEADから到達可能。
4. **overlay規約（C2/C5）**: 本文・スキル・agents・runtimeロジックのやさしさ差分が `yasashii` 見出しの追加だけで、上流由来の実装行の書換・削除が0件。配布識別metadataだけが宣言的allowlistの機械的例外である。agents 3種、`gentle-overlay/`、`metadata-overrides.json`、sync検査、独自回帰が存在する。
5. **sync健全性（C3/C5）**: 冪等実行、未分類ファイル、アンカー不在、合成不一致、上流前進警告の各ケースを独自回帰で実証する。
6. **node無し（C3）**: nodeをPATHから外した条件でbuildからハーネス起動案内を一周し、`inherit` 続行とexit 0を確認する。
7. **同梱撤去（C2/C5）**: `yasashii-secretary` にharnessコピー、agents、旧baselineが無い。buildは別repo導線だけを参照する。
8. **section 12（C2/C3/C6）**: offline構造検査が案内・`harness@yasashii-harness` を含む3コマンド・同梱不在・意図的破損を検出する。online検査がGitHub APIでrepo実在、public、`fork=false`、owner/name、marketplace/plugin manifest実在、そのname / source / repository / homepageと3コマンドの整合を確認する。ネットワーク不可をPASSにしない。
9. **全回帰（C6）**: 更新後のoffline回帰がexit 0、0 FAILで、282 PASS / 2 FAILを既知失敗として残さない。これとは別にonline section 12が成功し、Evaluator証跡を持つ。
10. **上流local全面非接触（C5）**: `~/workspace/agentic-harness` を対象にしたコマンド、参照、コピー、symlink、書込経路が0件。HEAD/status確認も当該checkoutを操作対象にするため行わず、GitHub APIとdownstreamの `upstream` remoteだけで基点・差分を検証する。
11. **リモート境界（C5）**: 承認済みの改名・独立repo新設・初期公開以外のpushや公開操作をしていない。`upstream` は同期時の読取専用で、yasashii-harnessの処理から上流へpushしない。
12. **metadata境界（C2/C5）**: remote manifestsが `gentle-overlay/metadata-overrides.json` の対象field・期待値と完全一致し、plugin本体名は `harness`。allowlist外のmetadata変更と、スキル本文・agents・runtimeロジック・その他上流由来の実装行の書換・削除が0件。

## 評価証跡

- 新旧local path、`git remote -v`、GitHub APIのrepo情報（public・`fork=false`）、origin/upstream URL、fb9c303の到達性。
- manifest/marketplace/READMEの識別子照合結果。特に `harness@yasashii-harness`、remote manifestのname / source / repository / homepageを記録する。
- `yasashii-harness` のoverlay差分、metadata allowlist完全一致・allowlist外変更0件、sync独自回帰、node無しテスト。
- `yasashii-secretary` のsection 12 offline構造検査、online GitHub API検査、全回帰のコマンド・PASS/FAIL/UNVERIFIED集計。
- 作業ログと実装参照の静的検査により、`~/workspace/agentic-harness` を一切対象にしていないこと。上流証跡はGitHub APIとdownstreamの `upstream` remoteから取得する。

## 参照

- `docs/spec/product.md` G3/G4
- `docs/spec/features.md` F01/F02/F14/F15/F16/F22
- `docs/spec/constraints.md` 1章・7章
- `docs/proposal-2026-07-15-realignment.md` 0-a章・4章・6章
