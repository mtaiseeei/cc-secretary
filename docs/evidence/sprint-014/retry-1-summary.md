# Sprint 014 Retry 1 独立評価証跡

- 評価対象 commit: `bd831af39dddd755852fa97f220745761b1cd060`
- 評価日: 2026-07-16
- 判定: 不合格
- 分類: `external-live-gate-unavailable`
- 実装修正: PASS
- external live gate: UNVERIFIED

## 回帰コマンド

| コマンド | 結果 |
|---|---|
| `bash scripts/sprint-014-regression.sh` | `PASS=34 FAIL=0`。内包する合成fixtureは `PASS=46 FAIL=0` |
| `bash scripts/regression-check.sh --offline` | `PASS=298 FAIL=0`。Sprint 013 `PASS=33 FAIL=0`、Sprint 014 `PASS=34 FAIL=0` |
| `bash scripts/regression-check.sh --online` | `PASS=299 FAIL=0`。`REFERENCE_OK`、`ONLINE=PASS repo=mtaiseeei/yasashii-harness` |

## 設定変更結果の修正確認

running wizardをdesktop 1440×900で操作した。

1. 営業チームと商品開発の2 room、6時間を選択。
2. 確認stepで自動取得・commit・pushへの同意前は確定disabled、同意後はenabled。
3. 初回結果に営業チーム `成功・0件`、商品開発 `成功・1件` が表示されることを確認。
4. 再読込で2 roomが保持されることを確認。
5. 営業チームを解除し、商品開発1 room・手動のみに変更。
6. 確認stepに「営業チームは今後の取得だけを止め、保存済み履歴は削除しない」と表示。
7. 結果stepに現在room=商品開発、現在頻度=手動のみ、schedule=無効（手動のみ）を表示。
8. 結果stepに旧見出し「初回設定の結果です」、旧roomの営業チーム、旧件数 `成功・0件`／`成功・1件` は0件。
9. 結果stepにも「保存済み履歴は削除していない」と表示。合成fixtureで解除済みroomの履歴ファイルが残ることをassert。

## Responsive・accessibility・安全

mobile 390×844で次を確認した。

- room一覧は1 column。
- CTAは `column-reverse` の縦積み。
- buttonはすべて48px。
- 横overflowなし。
- 全inputに可視labelあり。
- 検索欄からTabでRoom ID 101のcheckboxへ移動し、`:focus-visible=true`。
- Token／password入力欄0件、外部originへ送るform 0件。

GitHub権限エラー用read-only loopback fixtureで次を確認した。

- `role=alert` は1件。
- 表示: 「GitHubの書込権限を確認できません。repoのActions権限を確認してください。」
- 失敗後は確定ボタンがenabledへ戻る。
- 同意checkboxはcheckedを保持し、再試行できる。
- browser logのerror／warnは0件。

## Screenshot

- `retry1-wizard-desktop-current-settings.jpg`
- `retry1-wizard-mobile-room-selection.jpg`

## external live gate

開始条件を確認した結果、専用private test workspace、各外部操作へのユーザー明示許可、test用token、非機密test roomが提供されていない。

そのため、次は実行していない。

- private test workspace作成
- Repository Secret設定
- workflow dispatch
- remote push
- Chatwork API送信

実APIのroom一覧、1回同期、workflow成功、commit、push／pull、検索は **UNVERIFIED**。合成fixtureで代替せず、分類を `external-live-gate-unavailable` とする。Sprintは不合格だが、実装不具合ではない。

## スコア

| ID | Score | 判定 |
|---|---:|---|
| C1 | 3/5 | FAIL |
| C2 | 5/5 | PASS |
| C3 | 3/5 | FAIL |
| C4 | 5/5 | PASS |
| C5 | 5/5 | PASS |
| C6 | 5/5 | PASS |
| C7 | 4/5 | PASS |
| C8 | 5/5 | PASS |

合計35/40。C1・C3が閾値未達のためSprint全体は不合格。
