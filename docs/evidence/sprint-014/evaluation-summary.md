# Sprint 014 独立評価証跡

- 評価対象 commit: `427a37b99b3fbfa8c537c0b309982add7097cb4f`
- 評価日: 2026-07-16
- running wizard: `http://127.0.0.1:8765/`（評価完了後に停止）
- GitHub権限エラーfixture: `http://127.0.0.1:8766/`（read-only応答、評価完了後に停止）

## 回帰コマンド

| コマンド | 結果 |
|---|---|
| `bash scripts/sprint-014-regression.sh` | `PASS=33 FAIL=0`。内包する合成fixtureは `PASS=44 FAIL=0` |
| `bash scripts/regression-check.sh --offline` | `PASS=298 FAIL=0`。Sprint 013回帰 `PASS=33 FAIL=0`、Sprint 014回帰 `PASS=33 FAIL=0` を含む |
| `bash scripts/regression-check.sh --online` | `PASS=299 FAIL=0`。`REFERENCE_OK` と `ONLINE=PASS repo=mtaiseeei/yasashii-harness` を確認 |

最初のsandbox内実行では、Sprint 013/014のloopback fixtureが `listen EPERM: operation not permitted 127.0.0.1` で停止した。本来のloopback許可条件で同じコマンドを再実行し、上記の結果を得た。これは実装assertの失敗ではない。

## 合成fixtureで独立確認した範囲

- 6頻度: 30分=`17,47 * * * *`、1時間=`17 * * * *`、3時間=`17 */3 * * *`、6時間=`17 */6 * * *`、12時間=`17 */12 * * *`、手動のみ=scheduleなし。
- 設定transaction: 同意前0変更、room必須、設定とworkflowの同一commit、競合時の`update-ref`＋path限定restore、force pushなし。
- 同期: 選択room限定、message ID単位の冪等、重複0、部分失敗時の履歴・`lastSuccessAt`・cursor保持。
- 3択: `sync`／`decline`／`review-rooms`。拒否とroom見直しはdispatch・commit・push 0。
- 承認順序: `pull-before-search → search-local → structured-choice → dispatch → wait → success-confirmed → pull-after-sync → retry-same-query`。
- failure分類: auth、rate limit、network、GitHub permission、workflow failure、timeout、git conflict、partial room failure。
- synthetic token: runtimeログ、状態、履歴、配布fixtureで0件。wizard DOMにもtoken/password入力面なし。
- 配布fixture: README→`/chatwork`→Repository Secret→wizard→最新100件→schedule→確認付きmanual syncが、開発docs・絶対pathなしで完結。

## Browser実操作

### Desktop 1440×900

1. 4 room中2 roomを選択し、6時間を選択。
2. 確認画面で対象room、6時間=`約120 runs / 30日`、private repo、共同編集者、最新100件制約を確認。
3. 自動取得・commit・pushの同意前は「設定を確定する」がdisabled、同意後はenabled。
4. 確定後に再読込し、選択済みroomと6時間が保持されることを確認。
5. 既存roomを1件解除して手動のみに変更。確認画面に「今後の取得だけを止め、保存済み履歴は削除しません」「scheduleを作らず、検索時も確認後だけ同期」と表示。確定後の再読込で1 room選択を確認。
6. GitHub権限エラーfixtureで `role=alert` の日本語メッセージを確認し、確定ボタンが再試行可能なenabled状態へ戻ることを確認。

### Mobile 390×844

- room一覧は1 column、CTAは`column-reverse`の縦積み、buttonは48px、横overflowなし。
- 全inputにlabelあり。検索欄からTab移動するとRoom ID 101のcheckboxへ移り、`:focus-visible=true`。Spaceでcheckboxを変更できた。
- GitHub権限エラー画面も横overflowなし、CTA縦積み、48px、alertが色だけでなく日本語本文を持つ。
- browser consoleのerror/warnは0件。

### Screenshot

- `wizard-desktop-consent-before.jpg`
- `wizard-desktop-consent-after.jpg`
- `wizard-desktop-github-permission-error.jpg`
- `wizard-mobile-room-selection.jpg`
- `wizard-mobile-github-permission-error.jpg`

## live gate（read-only確認）

- `git remote -v`: `origin=https://github.com/mtaiseeei/yasashii-secretary.git`
- `gh repo view --json nameWithOwner,visibility,url,defaultBranchRef`: `mtaiseeei/yasashii-secretary`、`PUBLIC`、default branch `main`
- `gh secret list --json name,updatedAt`: `[]`（Secret値は要求・取得していない）
- `gh workflow list --json name,path,state`: 0件
- 実workflow dispatch、実Chatwork API送信、remote pushは未実行。

このrepoはpublicで、Repository Secretと実workflowも無いため、非機密test roomを使う実API経路を安全に実行できない。実APIのroom一覧取得、1回同期、workflow成功、commit、pull後検索は **UNVERIFIED**。合成fixtureの成功を実API PASSには数えていない。

## Browserで見つかった軽微な問題

設定変更で「2 room・6時間」から「1 room・手動のみ」へ更新した直後の結果stepが、変更前の初回取得結果（2 room）を再表示した。再読込後の保存値は1 roomで正しいため設定transactionの欠陥ではないが、結果表示が現在の変更内容と一致せず、ユーザーが反映失敗と誤解しうる。
