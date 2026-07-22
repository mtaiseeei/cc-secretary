# Sprint 035 Patch 003 Evaluation

## Verdict

- Result: **FAIL**
- Failure kind: `implementation-issue`
- Primary classification: `product`
- Escalation recommendation: `none`

Yasashii 版でも共通 wizard の再試行が、ユーザーの未保存チェック状態と検索欄の操作状態を失う。AC8/AC9 の retry state preservation と focus/caret/checkbox 保持を満たさないため FAIL とする。

## Scores

| Criterion | Score | Evidence |
|---|---:|---|
| C1 Core experience | 3/5 | discovery の各状態は表示できるが、failed retry がユーザー入力状態を破棄する。 |
| C2 Space filtering | 5/5 | 専用回帰テストで確認。 |
| C3 Discovery result display | 4/5 | 既知・欠落・新規候補を区別。再試行後の選択復元に欠陥。 |
| C4 Partial-result handling | 4/5 | partial の説明を確認。終了操作の全経路は未評価。 |
| C5 Failure safety | 5/5 | 保存済み候補の継続利用と retry を案内。 |
| C6 Stability / no regression | 4/5 | 専用回帰は green だが High regression を実ブラウザで再現。 |
| C7 Copy / guidance | 4/5 | 主要状態の案内は理解可能。全分岐の文言精査は未評価。 |
| C8 Interaction quality | 3/5 | focus、caret、未保存 checkbox が retry で保持されない。 |
| C9 Privacy / secrets | 5/5 | synthetic data のみ。実 OAuth/API/Secret は未実行。 |
| C10 Workflow causality | 5/5 | 共通の因果関係回帰は PASS。 |
| C11 Existing Chatwork behavior | 5/5 | 共通 Chatwork 回帰は PASS。 |
| C12 Edition identity | 5/5 | 実行画面で `yasashii-secretary` を確認。 |
| C13 Overlay / reproducibility | 4/5 | 専用テストは PASS。全 overlay 再適用は `not-run`。 |
| C14 Visual integrity | 5/5 | desktop 表示で横 overflow なし、console error 0。 |
| C15 Yasashii edition preservation | 5/5 | 版識別と専用候補の discovery suite は PASS。既存 Yasashii 全面再評価は未実施。 |

C8 が必須閾値を下回るため FAIL。

## Findings

### High — 再試行が未保存の選択と検索欄の操作状態を破棄する

- Classification: `product`
- Route: Generator
- Affected acceptance: AC8、AC9
- Location: `plugins/secretary/skills/google-chat/assets/wizard/app.js:157`

再現:

1. failed 画面で検索欄に `今回` と入力し、カーソルを末尾へ置く。
2. 未選択の保存済み候補 `spaces/synthetic-missing` をチェックする。選択数は 2。
3. 「最新候補をもう一度確認する」を押し、再び failed になるまで待つ。
4. 検索語は残るが、カーソルは 2 から 0、フォーカスは検索欄から見出し、選択数は 2 から 1 になり、追加チェックが消える。

期待は、検索語、フォーカス、カーソル、チェック状態を再試行後も維持すること。`discoverConfiguredSpaces()` が保存済み設定を UI 選択へ再代入するため、ユーザーの編集中状態を上書きしている。専用テストにはこの操作順の検証がない。

### Info — 旧回帰 wrapper の固定 digest は現行共通ファイルと一致しない

- Classification: `verification-infra`
- Agentic 側の旧 wrapper は固定 digest 差分で overall FAIL だが、Chatwork の基礎回帰は PASS。
- 製品 FAIL の直接原因ではない。

## Executed Evidence

| Command / check | Result |
|---|---|
| `node scripts/sprint-035-patch-003-discovery-test.mjs` | 32 PASS / 0 FAIL |
| 実 wizard DOM の Yasashii complete 表示 | edition identity `yasashii-secretary`、console error 0、横 overflow 0 |
| `git diff --check` | PASS |

共通コードの追加回帰として、Agentic 候補で Google Chat 50/50、因果関係 43/43、git pull 148/148、Chatwork 35/35 と 33/33 PASS を確認した。ただし、それらは Yasashii 版の全 overlay 再適用を代替する証拠とは扱わない。

Browser screenshot: `/tmp/gchat-eval-browser/yasashii-complete-desktop.png`

## Not Run / 未評価

- 実 Google OAuth、Google Chat API、実 Secret 値、GitHub Actions、remote write: `not-run`
- 正確な browser 200% zoom、mobile の Yasashii 固有再確認: `not-run`
- back / exit の全経路: `not-run`
- Yasashii 全 overlay 再適用: `not-run`
- TypeScript `app` build: `not-run`

## Evaluator Self-review

- 共通 wizard の High finding は実動作する候補で再現し、Yasashii 候補が同じ原因行を持つことを確認済み。
- 実アカウントや外部 write は使っていない。
- 評価で編集したのは clone 内のこの feedback ファイルだけである。
- 実アカウントや外部 write は使っていない。
- 評価で編集したのは clone 内のこの feedback ファイルだけである。

---

## Retry 1 Evaluation — 最新判定

### Verdict

- Result: **PASS**
- Previous High finding: **resolved**
- Failure kind: `none`
- Finding classification: 初回の `product` finding は修正済み。Retry 1で新規findingなし。
- Escalation recommendation: `none`

初回FAILとHigh findingは上に保持する。Retry 1のYasashii候補は、Agentic共有 `app.js` とRetry専用回帰がbyte一致し、専用回帰も独立に45/45 PASSした。

### Retry 1 Evidence

| Command / check | Result |
|---|---|
| `node scripts/sprint-035-patch-003-discovery-test.mjs` | 45 PASS / 0 FAIL |
| Agentic／Yasashii `app.js` | SHA-256 `fcea246dc0b462f79647849bfffef9285d9fe9a1236d9afc264bf84ddc4ba1df` で一致 |
| Agentic／Yasashii Retry専用回帰 | SHA-256 `1294a89d11e8ca6cc43d49891089ccb552b1687dc839f5c22dd6ecfcd681836b` で一致 |
| `node scripts/sync-secretary-overlay.mjs --reapply --candidate /private/tmp/gchat-yas-base-p003` | `OVERLAY_REAPPLY_PASS`、`secondChanged=0`、repo-owned digest維持 |

- complete／partial／failedの各Retryでquery=`今回`、caret=`2/2`、activeElement=検索欄、未保存変更を含む選択2件を専用45件で確認した。
- 実DOMはbyte一致するAgentic共有面で同じ再現手順を操作し、3結果すべて保持、desktop／390px相当overflow 0、console error 0を確認した。
- bootstrapは保存済み選択1件だけで初期化した。再認証→終了でRetry snapshotは持ち越されず、明示的な全解除はRetry後も0件を保持した。
- overlay再適用は2回目追加変更0。共有面一致、Yasashii固有面のrepo-owned digest不変を確認した。

### Retry 1 Scores

| Criterion | Score | Evidence |
|---|---:|---|
| C1 Core experience | 5/5 | 3結果のRetryで編集状態を保持。 |
| C6 Stability / no regression | 5/5 | 専用45/45、共有主要回帰green、overlay再適用0差分。 |
| C8 Interaction quality | 5/5 | query、focus、caret、未保存選択、明示破棄を確認。 |
| C13 Overlay / reproducibility | 5/5 | `secondChanged=0`、共有面一致、固有面不変。 |
| C14 Visual integrity | 5/5 | byte一致共有DOMでdesktop／390px相当overflow 0、console error 0。 |
| C15 Yasashii edition preservation | 5/5 | repo-owned digest維持、edition固有面変更0。 |

初回評価で合格済みかつRetry actual diffと無関係な基準は証跡を引き継ぐ。旧Patch 001の固定digest／edition inventoryは、今回意図的に変更した共有 `app.js` の旧baselineであり、Retry 1の製品FAILとは因果がない。必須閾値未達はなく、最新判定はPASS。

### Not Run / 未評価

- 実Google OAuth、Google Chat API、Repository Secret、GitHub Actions、remote write: `not-run`
- 正確なbrowser 200% zoom: `not-run`
- TypeScript app build: `not-run`

### Retry 1 Evaluator Self-review

- 初回finding履歴を消さず、Retry 1の最新判定だけを追記した。
- 製品コード、progress、stateは編集していない。
- 実アカウント、Secret値、OAuth、外部writeは使用していない。
