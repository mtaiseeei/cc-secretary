# Sprint 014 評価結果

**判定:** 合格
**評価対象:** Sprint 014 — G5 運用: 定期同期と確認付き再検索
**評価対象commit:** `bd831af39dddd755852fa97f220745761b1cd060`

Retry 1で設定変更後の古い初回結果表示が修正され、Retry 2では明示許可済みの専用private test workspaceで実Chatwork API live gateを完了した。選択した非機密test roomの取得、1回同期、GitHub Actions成功、100件保存、commit／push／pull、同じ条件でのローカル再検索まで、機密値を記録せずに確認した。全受入基準とC1〜C8の閾値を満たしたため合格とする。

## スコア

| ID | 基準 | スコア | 閾値 | 判定 |
|---|---|---:|---:|---|
| C1 | 完成度 | 5/5 | 4 | PASS |
| C2 | 構文・整合 | 5/5 | 5 | PASS |
| C3 | 機能の実証 | 5/5 | 4 | PASS |
| C4 | 非エンジニア体験 | 5/5 | 4 | PASS |
| C5 | 安全・規律 | 5/5 | 5 | PASS |
| C6 | 無回帰 | 5/5 | 5 | PASS |
| C7 | やさしさ | 4/5 | 4 | PASS |
| C8 | wizard体験・デザイン | 5/5 | 4 | PASS |

**合計:** 39/40。全基準が閾値を満たしたため合格。

## 初回評価の証跡（履歴）

### 実行コマンド

- `bash scripts/sprint-014-regression.sh`
  - 結果: `PASS=33 FAIL=0`
  - 内包する合成fixture: `PASS=44 FAIL=0`
- `bash scripts/regression-check.sh --offline`
  - 結果: `PASS=298 FAIL=0`
  - Sprint 013回帰 `PASS=33 FAIL=0`、Sprint 014回帰 `PASS=33 FAIL=0` を含む。
- `bash scripts/regression-check.sh --online`
  - 結果: `PASS=299 FAIL=0`
  - `REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact`
  - `ONLINE=PASS repo=mtaiseeei/yasashii-harness`

最初のsandbox内実行はloopback bindが `listen EPERM` で止まったため、本来のloopback許可条件で同じコマンドを再実行した。再実行では全assertが成功しており、このEPERMは実装不具合として数えていない。

### 合成fixture

- 6頻度のwizard値・保存値・実schedule一致を確認。30分／1h／3h／6h／12hは17分起点、手動のみはscheduleなし。
- 同意前0変更、room必須、設定とworkflowの同一commit、競合rollback、force pushなしを確認。
- 選択room限定、message ID冪等、重複0、部分失敗時の履歴・最終成功時刻・cursor保持を確認。
- 3択全分岐を確認。拒否・room見直しはdispatch／commit／push 0。
- 承認時は `pull-before-search, search-local, structured-choice, dispatch, wait, success-confirmed, pull-after-sync, retry-same-query` の順序。
- auth、rate limit、network、GitHub権限、workflow failure、timeout、git競合、部分room失敗を区別。
- runtime synthetic tokenはログ、状態、履歴、配布fixtureで0件。wizard DOMにtoken/password入力欄0件。
- clean distribution fixtureでREADME→`/chatwork`→Secret→wizard→初回／schedule→確認付きmanual syncが完結。

### 実ブラウザ操作

- URL: `http://127.0.0.1:8765/`
- desktop 1440×900:
  - 2 room→6時間→確認。
  - 同意前は確定disabled、同意後はenabled。
  - 確定後の再読込で選択room・頻度を保持。
  - 既存roomを解除し手動のみに変更。「今後の取得だけを止め、保存済み履歴は削除しません」「scheduleを作らず、検索時も確認後だけ同期」を確認。
- GitHub権限エラー用read-only loopback fixture:
  - `role=alert` に「GitHubの書込権限を確認できません。repoのActions権限を確認してください。」を表示。
  - 失敗後も確定ボタンはenabledで、選択内容と同意を保持して再試行可能。
- mobile 390×844:
  - room一覧1 column、CTA縦積み、button 48px、横overflowなし。
  - 全inputにlabelあり。Tabでcheckboxへ移動し`:focus-visible=true`、Spaceで選択変更可能。
  - GitHub権限エラー画面も横overflowなし、alert本文あり。
- browser consoleのerror/warn: 0件。

### Screenshot

- [desktop 同意前](../evidence/sprint-014/wizard-desktop-consent-before.jpg)
- [desktop 同意後](../evidence/sprint-014/wizard-desktop-consent-after.jpg)
- [desktop GitHub権限error](../evidence/sprint-014/wizard-desktop-github-permission-error.jpg)
- [mobile room選択](../evidence/sprint-014/wizard-mobile-room-selection.jpg)
- [mobile GitHub権限error](../evidence/sprint-014/wizard-mobile-github-permission-error.jpg)
- [独立評価の詳細](../evidence/sprint-014/evaluation-summary.md)

### 初回評価時のlive gate

read-only確認のみ実施し、Secret値取得、workflow dispatch、Chatwork API送信、remote pushは行っていない。

- `origin`: `https://github.com/mtaiseeei/yasashii-secretary.git`
- GitHub repo: `mtaiseeei/yasashii-secretary`、visibility=`PUBLIC`
- Repository Secret名一覧: 0件
- GitHub上のworkflow一覧: 0件
- 非機密test room: 安全に利用可能な対象をこのrepoで確認できず
- 実room一覧取得、実同期、workflow成功、commit、pull後検索: **UNVERIFIED**

`docs/spec/rubric.md` のChatwork API境界、Sprint 014重点、およびSprint契約の受入基準10は実API確認を必須としている。したがって、合成fixture `PASS=44` をこの項目のPASSには数えない。

## 初回評価で合格した項目（履歴）

- schedule全6選択: wizard表示・保存設定・workflowが一致。
- 自動push同意: 同意前は確定不可、同意後だけ有効。public／Secretなし／roomなしのgateも合成fixtureで成立。
- 冪等・競合: 重複0、force push 0、競合rollback成立。
- 設定変更: room追加・解除、全頻度、キャンセル、途中失敗を回帰で保護。実ブラウザでも解除＋手動のみを確認。
- manual sync 3択: 拒否、room見直し、承認の全分岐と副作用境界が成立。
- dispatch順序: waitとsuccess確認を飛ばさず、成功後だけpull→同条件retry。
- failure分類: 8分類と日本語の次行動を確認。
- token非漏洩: synthetic token 0件、wizardのcredential入力面0件。
- 配布導線: clean fixtureとremote online整合が成功。
- Sprint 013回帰: 0 FAIL。
- wizard: desktop/mobile、responsive、keyboard、focus、label、contrast、console error 0を確認。

## 初回評価で不合格だった項目（Retry 2までに解消）

### 1. 実API live gateを検証できない

- 重要度: Critical（受入基準・rubricの必須ゲート未達）
- 期待動作: Repository Secret経由で参加room一覧取得、非機密test roomの1回同期、workflow成功、commit、pull後検索を伏せ字証跡で確認できる。
- 実際の状態: 対象repoはpublic、Repository Secret 0件、GitHub上のworkflow 0件。安全な実API実行条件が無く、未検証。
- 判定: 実装不良を示す証拠ではなく、public配布repoを評価対象にしながらprivate workspaceのlive gateを同じrepoで必須化している検証配置の問題。`spec-issue` とする。

### 2. 設定変更後の結果画面が変更前の初回取得結果を表示する

- 重要度: Minor
- 再現手順:
  1. 2 room・6時間で確定。
  2. 再読込し、1 roomを解除して手動のみに変更・確定。
  3. 結果stepを見る。
- 期待動作: 今回変更した1 room・手動のみの結果、または「設定変更が完了した」ことが分かる表示。
- 実際の動作: 「初回設定の結果です」と変更前の2 roomの初回取得結果を再表示する。
- 補足: 再読込後の保存値は1 roomで正しく、設定transaction自体は成立している。表示だけが古く、反映失敗と誤解させる。

## 初回評価のバグ一覧（解消済み）

| # | 重要度 | 内容 | 再現 |
|---|---|---|---|
| 1 | Critical | 必須の実API live gateが対象repoでは安全に実行不能で未検証 | public repo／Secret 0／workflow 0をread-only確認 |
| 2 | Minor | 設定変更後に変更前の初回取得結果を再表示 | 2 room・6h確定→1 room・manualへ変更→結果step |

## 初回評価時の改善提案（対応済み）

- Plannerは実API live gateの評価場所を明確にする。public配布repoではなく、専用のprivate test workspace repoを評価fixtureとして指定し、非機密test room、Repository Secret、workflow、証跡の伏せ字規約、後始末を契約へ定義する。
- 専用private test repoを用意できない場合、実APIを必須受入基準のまま残すか、リリース前の別ゲートへ分離するかをユーザー判断に戻す。Evaluatorが合成fixtureで読み替えてはいけない。
- wizardは初回設定と設定変更で結果画面を分ける。変更時は現在の選択room・頻度・schedule有無を表示し、古い初回取得結果を再掲しない。

## Planner／Orchestratorへの指示

1. `spec-issue` として、実API live gateを安全に実行するprivate test workspaceの正本・権限・後始末を契約へ追加する。
2. 条件が整った後、room一覧取得→1回同期→workflow成功→commit→pull後検索を実行し、token・room名・本文を伏せた証跡で再評価する。
3. state遷移はオーケストレーターが行う。Evaluatorは `docs/sprints/state.md` を更新していない。

## Generatorへの指示

live gateの仕様整理後、設定変更時の結果stepを現在の変更内容に合わせるMinor修正を行い、専用browser回帰へ「初回結果を再表示しない」assertを追加する。

## Retry 1 再評価

### 判定

- Sprint全体: **不合格**
- 分類: **`external-live-gate-unavailable`**
- 設定変更結果の表示修正: **PASS**
- external live gate: **UNVERIFIED**
- `implementation-issue`: **該当なし**

### C1〜C8 再採点

| ID | 基準 | スコア | 閾値 | 判定 | Retry 1の根拠 |
|---|---|---:|---:|---|---|
| C1 | 完成度 | 3/5 | 4 | FAIL | 表示修正を含む実装受入は成立。必須external live gateのみ未実施。 |
| C2 | 構文・整合 | 5/5 | 5 | PASS | 専用回帰とonline回帰が0 FAIL。remote manifestとmetadataも一致。 |
| C3 | 機能の実証 | 3/5 | 4 | FAIL | 合成fixture・running wizardは成立したが、実API必須Sprintのlive gateが未実施。 |
| C4 | 非エンジニア体験 | 5/5 | 4 | PASS | 設定変更結果が現在値を明示し、古い初回結果による誤解を解消。日本語エラーも次の行動を示す。 |
| C5 | 安全・規律 | 5/5 | 5 | PASS | 明示許可の無いprivate workspace作成、Secret設定、dispatch、push、API送信を実行していない。 |
| C6 | 無回帰 | 5/5 | 5 | PASS | 専用34件、合成46件、offline 298件、online 299件がすべて0 FAIL。 |
| C7 | やさしさ | 4/5 | 4 | PASS | 現在状態と履歴保持を平易に説明。既存の軽微な改善余地のみ。 |
| C8 | wizard体験・デザイン | 5/5 | 4 | PASS | desktop／mobileの実操作、responsive、keyboard focus、label、error再試行が成立。 |

**合計:** 35/40。C1・C3が閾値未達のためSprint全体は不合格。

### Retry 1 回帰結果

- `bash scripts/sprint-014-regression.sh`: `PASS=34 FAIL=0`
  - 内包する合成fixture: `PASS=46 FAIL=0`
- `bash scripts/regression-check.sh --offline`: `PASS=298 FAIL=0`
  - Sprint 013: `PASS=33 FAIL=0`
  - Sprint 014: `PASS=34 FAIL=0`
- `bash scripts/regression-check.sh --online`: `PASS=299 FAIL=0`
  - `REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact`
  - `ONLINE=PASS repo=mtaiseeei/yasashii-harness`

### Retry 1 browser再現

desktop 1440×900で次を実操作した。

1. 営業チーム・商品開発の2 roomと6時間を選び、同意前disabled／同意後enabledを確認して初回設定を確定。
2. 再読込後に2 roomと6時間が保存されていることを確認。
3. 営業チームを解除し、商品開発1 room・手動のみに変更して確定。
4. 結果stepで「現在の対象room=商品開発」「現在の同期間隔=手動のみ」「schedule=無効（手動のみ）」を確認。
5. 「初回設定の結果です」「営業チーム」「成功・0件」「成功・1件」が結果stepに無いことを確認。
6. 確認stepと結果stepの両方で、room解除後も保存済み履歴を削除しない説明を確認。合成fixtureでも履歴ファイルの存続をassertした。

mobile 390×844では、1 column、CTAの縦積み、48px button、横overflowなし、全inputのlabel、Tab移動後の`:focus-visible=true`を確認した。Token／password入力欄と外部送信formは0件。

GitHub権限エラー用read-only loopback fixtureでは、`role=alert` が1件、日本語メッセージが表示され、失敗後も確定ボタンがenabledへ戻り、同意状態を保持して再試行できた。browser logのerror／warnは0件。

### external live gate

次の開始条件が揃っていない。

- 専用private test workspace: 未提供
- private test workspace作成、Secret設定、workflow dispatch、remote push、Chatwork API送信への明示許可: 未提供
- test用token: 未提供
- 非機密test room: 未提供

このため、private workspace作成、Repository Secret設定、workflow dispatch、remote push、Chatwork API送信は一切行っていない。合成fixtureを実APIの代替には数えず、`external-live-gate-unavailable` としてSprintを不合格にする。これは表示修正の失敗でも、Generatorへ戻す実装不具合でもない。

### Retry 1 Screenshot・詳細証跡

- [desktop 現在設定の結果](../evidence/sprint-014/retry1-wizard-desktop-current-settings.jpg)
- [mobile room選択](../evidence/sprint-014/retry1-wizard-mobile-room-selection.jpg)
- [Retry 1 独立評価の詳細](../evidence/sprint-014/retry-1-summary.md)

### 次のEvaluator gate

ユーザーが専用private test workspaceと各外部操作を明示許可し、test用token・非機密test roomを準備した後に、実room一覧取得→1回同期→workflow成功→commit→push／pull→検索を伏せ字証跡で再評価する。state遷移はオーケストレーターが行い、Evaluatorは `docs/sprints/state.md` を更新していない。

## Retry 2 最終再評価

### 判定

- Sprint全体: **合格**
- external live gate: **PASS**
- `implementation-issue`: **該当なし**
- `spec-issue`: **解消済み**

Retry 2では、ユーザーの明示許可と必要なテスト条件が揃った専用private test workspaceを使用した。実roomの識別情報、account情報、message情報、本文、検索語、Token値は記録せず、実roomを `selected-test-room` として評価した。

### C1〜C8 最終採点

| ID | 基準 | スコア | 閾値 | 判定 | Retry 2の根拠 |
|---|---|---:|---:|---|---|
| C1 | 完成度 | 5/5 | 4 | PASS | 全受入基準が成立。必須だった実API live gateも完了した。 |
| C2 | 構文・整合 | 5/5 | 5 | PASS | 専用回帰、offline、onlineがすべて0 FAIL。配布元のmanifestとmetadataも一致。 |
| C3 | 機能の実証 | 5/5 | 4 | PASS | 実room取得、100件同期、Actions成功、commit／push／pull、実データ再検索を確認。 |
| C4 | 非エンジニア体験 | 5/5 | 4 | PASS | wizardの現在値表示、確認付き同期、失敗時の日本語案内が成立。 |
| C5 | 安全・規律 | 5/5 | 5 | PASS | private workspaceだけで実Tokenと実データを扱い、公開配布元への混入0を確認。証跡も伏せ字化した。 |
| C6 | 無回帰 | 5/5 | 5 | PASS | 専用34件、合成46件、offline 298件、online 299件がすべて0 FAIL。 |
| C7 | やさしさ | 4/5 | 4 | PASS | 現在状態と次の行動を平易に表示。既存の軽微な文章改善余地のみ。 |
| C8 | wizard体験・デザイン | 5/5 | 4 | PASS | Retry 1のdesktop／mobile／error証跡を再確認し、対象commit不変と回帰保護を確認。 |

**合計:** 39/40。全基準が閾値を満たしたためSprint全体を合格とする。

### Retry 2 回帰結果

- `bash scripts/sprint-014-regression.sh`: `PASS=34 FAIL=0`
  - 内包する合成fixture: `PASS=46 FAIL=0`
- `bash scripts/regression-check.sh --offline`: `PASS=298 FAIL=0`
  - Sprint 013: `PASS=33 FAIL=0`
  - Sprint 014: `PASS=34 FAIL=0`
- `bash scripts/regression-check.sh --online`: `PASS=299 FAIL=0`
  - remote referenceと配布metadataの一致を確認。

### 実API live gate

- 専用workspaceはprivate。
- Repository Secret `CHATWORK_API_TOKEN` は1件登録され、値は取得していない。
- workflowは1件activeで、room discovery（discover）run `29535154486` と初回同期（initial）run `29535300708` はともにcompleted／success。
- `selected-test-room` 1件、1時間間隔、schedule有効、自動push同意あり。
- 同期statusはsuccess。1 room成功、100件取得、履歴1ファイルに100件保存、最終成功時刻あり。
- worktreeはclean。4段階の日本語commitがremoteまで一致し、`git pull --ff-only` はup to date。
- pull後のローカル検索はstatus=found、1件hit。room、日付、抜粋の証跡を確認。
- 公開配布元はpublic、Secret 0件、workflow 0件で、実設定・実履歴・実運用workflowの混入なし。

識別情報を除いた詳細は [Retry 2 live gate 証跡](../evidence/sprint-014/retry-2-live-gate.md) に記録した。実room一覧のscreenshotは作成していない。

### バグ

新規バグはない。初回評価のMinor表示不具合はRetry 1で解消済みであり、必須live gateもRetry 2でPASSした。

### Orchestratorへの後始末引き継ぎ

Evaluatorはschedule停止、Repository Secret削除、room選択解除を行っていない。合格後の外部状態の後始末はOrchestratorが実施する。Evaluatorは `docs/sprints/state.md` を更新していない。
