# Yasashii Sprint 037 — 呼び方候補と利用者中立化の下流同期

- Type: main sprint
- Replaces: `sprint-036`
- Risk: standard（合格済み共通機能のlocal downstream同期、read-only候補探索、オンボーディング、
  ローカル設定transaction、配布文面・回帰fixtureを変更する。external service、資格情報、
  利用者workspace、installed cache、remote writeは扱わない）
- 主眼: Agenticの合格済み固定candidate
  `d9a62755ff78db12c435f225cdd40e95f86a8055` をreview済みbaseとしてYasashiiへ同期し、
  Claude Code／Codex共通の呼び方4経路、安全なaccount-name候補探索、既存呼び方の現役表示同期、
  利用者中立の配布物を、Yasashii固有の言葉遣い・identity・overlay境界を保ったまま成立させる。
- 依存: Yasashii `sprint-035-patch-003` done。Agentic `sprint-037` と
  `sprint-037-patch-001` が、完全SHA
  `d9a62755ff78db12c435f225cdd40e95f86a8055` で独立評価PASS済みであること。

## ユーザー決定

1. 初回の呼び方は「あなた」「アカウント名」「指定の名前」「その他」の4経路とし、
   Claude CodeとCodexの両方で採用する。
2. 「アカウント名」を選んだ場合だけ、現在タスクへhostが提供済みの文脈、`git config user.name`、
   OSユーザー名の順で候補を探す。
3. OSユーザー名は名前らしい値だけを候補にし、任意の過去会話、生session log、
   別taskのmemory storeを直接探索しない。
4. 候補は出典つきで示し、最良1件をおすすめにする。探索結果は保存せず、
   ユーザーが選択して別turnの確認を通過した呼び方だけを保存する。
5. 既存workspaceの呼び方変更では、`preferences.md` を現在値の正本とし、
   `AGENTS.md` と `MEMORY.md` の現役表示を同期する。初回決定ログは履歴として改変しない。
6. YasashiiはAgenticの共通実装を別実装へ複製せず、宣言済みoverlayで同期する。
   Yasashii固有copy、identity、manifest、README、repo-owned docsは維持する。

## 開始時の保全条件

- Yasashii開始HEADは、ユーザー既存のSprint 045 open／closed project commitを含む。
  `plugins/secretary/templates/AGENTS.md` のopen／closed構成と関連するproject処理・回帰を
  revert、置換、再設計しない。
- `secretary-overlay/upstream-base.json` の現在baseとtreeは過去のreview記録であり、
  candidateを先に適用してから記録を書き換えない。固定Agentic candidateのcommit、
  tree、開始baseからの差分、分類を先にreviewする。
- `origin` はYasashii、`upstream` はAgenticのfetch専用・push disabledを維持する。
  本Sprintは既にlocalに存在するcandidate checkoutだけを読み、remote追加・変更・fetch・pushを行わない。
- upstreamの `docs/**`、`CLAUDE.md`、progress、feedback、state等をYasashiiのrepo-owned正本へ
  そのまま上書きしない。必要な製品仕様・利用者中立化はYasashii正本へedition文脈で反映する。

## 外から見える成果

Yasashiiの初回セットアップでも「アカウント名」を選ぶと、利用できる情報だけから安全に整えた候補が
出典つきで表示される。候補が複数ならおすすめが1件分かり、候補が無ければ他の3経路へ戻れる。
どの経路でも、実際に保存する呼び方を確認してから作成を開始する。

既存workspaceで呼び方を変更すると、3つの現役表示が同じ値になり、初回決定ログは当時の値を保つ。
配布物と現行製品正本は、正式な製品所有情報を除き、特定利用者の名前、特定端末の絶対path、
私用workspaceを前提にしない。会話はYasashiiの簡潔でやさしい順序を維持する。

## Scope

### A. review済みupstream baseの前進

- 同期元をAgentic commit
  `d9a62755ff78db12c435f225cdd40e95f86a8055` に固定し、短縮SHAだけで別commitを受け入れない。
- 現在の記録baseから固定candidateまでのcommit ancestry、tree差分、追加・削除・変更pathをinventoryする。
- 各pathをcommon、metadata overlay、anchor overlay、upstream-only、downstream-owned、
  downstream-fileへ分類し、未分類0件を確認する。
- upstreamのSprint 036／037とSprint 037 Patch 001の契約、progress、feedback、
  実commit diffをreviewし、独立評価PASSの共通実装だけを同期対象とする。
  Agentic固有docs、identity、adapter説明をYasashiiへ複製しない。
- review後に限り `secretary-overlay/upstream-base.json` の `baseCommit` を固定candidateへ進め、
  同じcandidateから `secretary-overlay/upstream-tree.json` を `--record` で再生成する。
  repository URL、fetch remote名、neutralization commit、release candidate、external gate、
  origin／upstream／push-disabled契約は維持する。
- `--check`、`--apply`、`--reapply` を同じlocal candidateへ実行し、
  再適用の追加差分0件、repo-owned digest不変を確認する。

### B. 共通の呼び方候補と4経路

- `plugins/secretary/scripts/name-candidates.mjs` と
  `plugins/secretary/scripts/owner-name-transaction.mjs` を共通coreとして同期する。
- `plugins/secretary/skills/onboarding/SKILL.md` は3つの明示候補とhost標準の「その他」を
  合わせて4経路にし、host UIが「その他」を自動付与する場合は重複表示しない。
- `plugins/secretary/skills/settings/SKILL.md` はYasashiiの既存anchor差分を保ちながら、
  初回説明と既存呼び方変更を同じ共通契約へ接続する。anchor不在・複数一致は安全停止する。
- account-name探索は選択後だけ行う。他の3経路ではGit／OS providerを呼ばない。
- source priorityは、現在会話の明示名、Personalization、Project、現在タスクへhostが渡した記憶、
  Git表示名、OSユーザー名の順とする。
- 任意の過去会話、別task、raw transcript、生session log、memory storeを直接検索しない。
- Unicode NFKC、空白整理、40文字上限、Unicode case-fold重複排除を行う。
  email、空、汎用名、bot／CI／root／admin、数字中心、path、UUID、long hex、token風、
  machine-like値、DNS hostnameを除外し、OS値はUnicode letterを含む場合だけ候補にする。
- 候補には短い出典を添え、最上位1件だけをおすすめにする。
  候補0件では架空値を作らずaccount-nameを利用不能とする。
- 全経路で最初のdirectory／file作成より前に解決値を別turnで確認する。
  未回答・空回答は確認候補を「あなた」とするが、訂正、キャンセル、未確認では副作用0件とする。
- 探索値、除外値、出典、順位をfile、journal、log、preferences、decisionへ保存しない。

### C. 既存workspaceの呼び方変更

- 確認済み値だけを `preferences.md`、`AGENTS.md`、`MEMORY.md` の3正本へ1 transactionで反映する。
- symlink、path境界、空値、各file書込み、journal、commitのどこで失敗しても、
  3正本、journal、Git状態を開始時へrollbackする。
- 成功時だけjournalと所有path限定local commitを各1件作り、pushしない。
  journalはtype `did` の1 eventで、本文を `設定を変更: 呼び方` に完全一致させる。
  local commitはsubjectを `設定を変更（呼び方）` に完全一致させ、bodyを空にする。
- 実際の呼び方、その入力固有断片、escape表現、hash・伏字・文字数・頭文字等の
  値由来transformをjournal本文、commit subject、commit bodyへ残さない。
  確認済みの呼び方そのものは3正本の現役表示へだけ一致して反映する。
- 他設定、手書き行、MEMORY索引、Sprint 045のopen／closed project構成を維持する。
- 初回decision fileはtransaction対象に含めずbyte不変にする。
- Yasashii固有settingsの「値を会話・journal・commit messageへ再掲しない」
  anchor契約を維持する。

### D. 利用者中立のactive surface

次をactive surfaceとして機械scanする。

- 配布面: `README.md`、`.claude-plugin/**`、`.agents/plugins/**`、`adapters/**`、
  `plugins/secretary/**`
- 現行製品正本: `CLAUDE.md`、`docs/spec.md`、`docs/spec/**`、`docs/DESIGN.md`、
  `docs/agentic-upstream-mapping.md`、`docs/guide/**`
- 現役の配布・回帰処理: `scripts/**`

個人名、具体的な利用者home絶対path、私用workspace名を修正対象、正式allowlist、
履歴対象外に分類する。人物が必要なfixtureは合成人物、端末pathはruntime root、相対path、
placeholder、合成pathにする。検出語自体を隠してscanを偽合格にしない。

固定allowlist:

1. `LICENSE` の著作権表示。
2. GitHub owner `mtaiseeei` と公式repository／release URL、`forkedFrom`、MIT、
   製品名、公開version等の正式な配布識別情報。
3. path境界testの合成pathと汎用guard pattern。許可pathと件数を固定する。
4. `docs/sprints/**`、`docs/progress/**`、`docs/feedback/**`、`docs/evidence/**`、
   `docs/proposal-*.md`、Git履歴にある監査・判断履歴。遡及改変せず、現行挙動の根拠にも使わない。

Yasashiiのrepo-owned現行spec／設計文書に残る私用workspace基準や実利用者pathは、
製品動作・repository topology・禁止境界を保つ一般表現へ直す。

### E. downstream境界と回帰

- 固定candidate由来の共通実装pathがAgenticとbyte一致し、宣言済みanchor／metadata差分だけが
  Yasashii差分として残ることを確認する。
- Yasashii固有のrules、copy、identity、manifest、marketplace、edition設定、README、
  repo-owned docsの開始前後digestを取り、宣言外変更0件を確認する。
- 新しい `scripts/sprint-037-test.mjs` と関連fixtureを同期し、
  Yasashii candidateでsource priority、正規化、全除外値、Unicode case-fold、
  hostname拒否、探索限定、候補非保存、保存前確認、3正本transaction、完全rollback、
  active surface scanを実行する。
- Sprint 045保護対象6 filesを開始HEADと比較し、無関係な差分0件とopen／closed回帰を確認する。
- 既存のYasashii overlay／edition／settings／onboarding／安全回帰を実行する。
- 着手時HEADで既に赤い全体baselineは原因を切り分け、本Sprintに因果がない失敗を
  新しい製品blockerへ読み替えない。因果のある新規FAILは0件とする。

## Non-scope

- Agentic共通coreのYasashii専用再実装、host別skill本文コピー。
- 任意の過去会話、別task、raw transcript、生session log、memory storeの直接探索。
- Git email、remote、credential、commit history、home directory列挙を名前sourceにすること。
- AIによる本名推測、外部人物検索、connector、SNS、連絡先、メール本文からの名前抽出。
- 探索値、除外値、出典、推奨順位の永続化。
- 初回決定ログ、過去Sprint、progress、feedback、evidence、Git履歴の遡及編集。
- Yasashiiのedition language、copy、identity、manifest、marketplace、README、
  `key=value`可読性overlayをAgentic値へ戻すこと。
- Sprint 045 open／closed project構成の再設計。
- remote追加・変更・fetch・push、PR、release、public設定、marketplace更新、
  plugin install／update、installed cache、利用者workspaceへの反映。
- 実connector、OAuth、Repository Secret、GitHub Actions、外部API。

## Acceptance Criteria

1. 同期元が完全SHA
   `d9a62755ff78db12c435f225cdd40e95f86a8055` に固定され、AgenticのSprint 037と
   Sprint 037 Patch 001のPASS、commit tree、現在baseからの差分、全path分類をreviewした記録がある。
2. `upstream-base.json` と `upstream-tree.json` が同じ固定candidateを表し、
   repository／neutralization／release／remote契約を保持する。
   `--check`、`--apply`、`--reapply` が成功し、再適用追加差分0件、未分類0件である。
3. 新しい共通2 scriptsとonboarding／settings契約がYasashii candidateへ存在し、
   Claude Code／Codexで「あなた」「アカウント名」「指定の名前」「その他」の4経路を同じ意味で扱う。
4. account-name探索は選択後だけで、source priorityが
   host-task-context→Git→OSとなる。任意会話／session log直接探索0件、
   他の3経路でGit／OS provider call 0件である。
5. 正fixtureで候補の正規化、出典、重複排除、最良1件のおすすめが期待どおりになる。
   `Straße`／`STRASSE`等のUnicode case-fold同値は1候補へ統合し、異なる文字を誤統合しない。
6. email、空、汎用名、bot／CI／root／admin、数字中心、40文字超、path、UUID、long hex、
   token風、machine-like値、`device.jp`／`server.jp`／`pc.localhost`／`localhost`等の
   hostnameを拒否し、名前らしいOS値と `J. Smith` のような人名表記は維持する。
7. 候補0件では架空値を作らず他経路へ戻れる。全経路で保存前確認を行い、
   訂正、キャンセル、未確認ではdirectory、file、marker、journal、commitの副作用0件である。
8. 探索値、除外値、出典、順位の永続化0件。選択・確認済みの呼び方だけが保存される。
9. 既存変更後に3正本の現役表示が一致し、他設定、手書き行、MEMORY索引、
   open／closed project構成、初回decisionを維持する。
   journalはtype `did` の1 event、本文は `設定を変更: 呼び方` に完全一致する。
   local commitは1件、subjectは `設定を変更（呼び方）` に完全一致し、bodyは空、pushは0件である。
   実際の呼び方、入力固有断片、escape表現、hash・伏字・文字数・頭文字等の
   値由来transformはjournal本文、commit subject、commit bodyに0件である。
   確認済みの呼び方そのものは3正本の現役表示へだけ一致して反映される。
   file書込み、journal、commitを含む各失敗点で部分副作用0件である。
10. active surfaceのunexpectedな個人名、利用者端末固有path、私用workspace依存が0件。
    allowlistの値／path／件数が一致し、負fixtureを拒否する。
    正式所有情報とYasashiiの製品identityは維持する。
11. 共通実装pathは固定Agentic candidateと一致し、Yasashii差分は宣言済みoverlayだけである。
    Yasashii固有copy／identity／manifest／README／repo-owned docsをAgentic値で上書きしていない。
12. Sprint 045保護対象の無関係差分0件で、open／closed project回帰が合格する。
13. 次の必須回帰が0 FAILである。
    - `node scripts/sprint-037-test.mjs`
    - `node scripts/sprint-034-test.mjs /Users/taisei/workspace/agentic-secretary`
    - `node scripts/sync-secretary-overlay.mjs --check --candidate /Users/taisei/workspace/agentic-secretary`
    - `node scripts/sync-secretary-overlay.mjs --reapply --candidate /Users/taisei/workspace/agentic-secretary`
    - `bash scripts/sprint-011-regression.sh`
    - `bash scripts/sprint-012-regression.sh`
    - `bash scripts/sprint-022-regression.sh`
    - `bash scripts/sprint-035-patch-001-regression.sh`
    - Yasashii edition／会話可読性／archiveの開始時greenな関連回帰
    - `git diff --check`
14. 同期で書き換えたpath、overlay記録、repo-owned／edition固有digest、
    実行command、exit、assert数、開始時baseline、not-runをprogressへ記録する。
    本Sprintに因果のある新規FAILは0件である。
15. origin／upstream remote設定、remote refs、installed cache、利用者workspace、
    external service、releaseへのwrite 0件である。upstream pushは常に0件である。

## 検証スコープとsafe harbor

- candidate: Agentic完全SHA、tree、開始base、review済み差分、同期後Yasashii candidate。
- overlay: `upstream-base.json`／`upstream-tree.json`、全分類、check／apply／reapply、
  二回目changed 0、repo-owned digest。
- 製品: 4経路、全source、全除外値、Unicode case-fold、hostname、候補なし、
  provider spy、探索前後snapshot、保存前確認、3正本だけへの値反映、
  journal／commit subjectの固定文完全一致、空のcommit body、値・固有断片・escape・
  値由来transformの履歴メタデータ0件、transaction、失敗注入。
- downstream: 共通path byte一致、宣言済みanchor／metadata差分、Yasashii固有surface digest、
  Sprint 045保護差分。
- scan: 母集団、除外path、allowlist値／path／件数、unexpected match、負fixture。
- 回帰: 実行command、exit code、PASS／FAIL件数。開始時に赤いbaselineは開始HEADとtargetで同じ
  非因果FAILであることを分けて記録する。
- external: remote／cache／利用者workspace／service／releaseのnot-run一覧。

上記で十分とし、新しいcollector、統一attestation、外部署名、実アカウント情報、
実plugin再導入を追加の合格条件にしない。常駐UI変更はないためbrowser screenshotを必須にしない。

## 完了条件

- Generatorは本Sprintだけを実装し、`docs/progress/sprint-037.md` に変更path、overlay review／record、
  回帰、scan、既知baseline、external write 0件を記録する。
- Evaluatorは別作業単位でlocal candidate、overlay、共通動作、Yasashii固有面、回帰を独立確認し、
  `docs/feedback/sprint-037.md` に合否、証跡、finding分類を書く。
- Evaluator PASSとオーケストレーターによる `docs/sprints/state.md` 更新前に完了扱いにしない。
- Generator／Evaluatorはcommit、push、remote変更、cache更新、利用者workspace反映を行わない。
