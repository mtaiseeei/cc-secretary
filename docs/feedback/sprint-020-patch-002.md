# Sprint 020 Patch 002 評価結果

**判定:** 不合格

**分類:** implementation-issue

**評価対象:** Sprint 020 Patch 002 — Google Cloud準備をAI会話へ分離する

## 結論

wizardの責務分離、Google Workspace限定、More Simpleな画面、Chatwork非回帰、全回帰は合格した。

一方、CLI正常経路の作成前確認が契約どおりではない。`inspectGcloud()`はログイン中アカウントと組織一覧までしか確認せず、同名Projectの存在とProject作成権限を確認しない。さらに組織一覧取得が権限エラーでも `cli-ready` と誤判定する。Project作成を試して失敗してから衝突・権限不足を知る流れになり、受入基準3、6、7の「作成前に確認」を満たさない。

## スコア

| 基準 | スコア | 閾値 | 判定 |
|---|---:|---:|---|
| C1 完成度 | 3/5 | 4 | FAIL |
| C2 構文・整合 | 5/5 | 5 | PASS |
| C3 機能の実証 | 3/5 | 4 | FAIL |
| C4 非エンジニア体験 | 5/5 | 4 | PASS |
| C5 安全・規律 | 5/5 | 5 | PASS |
| C6 無回帰 | 4/5 | 5 | FAIL |
| C7 やさしさ | 5/5 | 4 | PASS |
| C8 wizard体験・デザイン | 5/5 | 4 | PASS |
| C9 配布チャネル非依存 | 5/5 | 5 | PASS |
| C10 更新の安全性 | 5/5 | 5 | PASS |
| C11 Google Chat境界 | 5/5 | 5 | PASS |

## 回帰結果

| コマンド | 結果 |
|---|---|
| `bash scripts/sprint-020-patch-002-regression.sh` | 8/8 PASS |
| `bash scripts/regression-check.sh --offline` | 316/316 PASS |
| `bash scripts/regression-check.sh --online` | 317/317 PASS |
| running wizard browser check | 31/31 PASS、browser exception 0 |

既存回帰は0 FAILだが、今回追加した独立負テストが契約未達を検出したため、C6のゼロ許容を満たさない。

## 受入基準20項目

| # | 判定 | 根拠 |
|---:|---|---|
| 1 | PASS | README／skill／wizardの利用者向け面はGoogle Workspace版のみ。個人Google、External、Test users、公開審査のcopy 0件。 |
| 2 | PASS | `/google-chat` と自然文ルート、未準備時のCloud準備先行を確認。会社別ルーティング混入0件。 |
| 3 | **FAIL** | repo root／subdir／no repo／文字・長さ調整は合格。ただし全体重複を確認する読み取り処理がなく、作成前の衝突調整を実証できない。 |
| 4 | PASS | Project案、組織、2 API、Billing非接続を表示。未承認・拒否の変更0件。 |
| 5 | PASS | Google公式、導入自体は無料、Cloud変更能力、承認後だけの説明と手動fallbackを確認。 |
| 6 | **FAIL** | ログイン・組織確認はあるが、同名ProjectとProject作成権限の事前確認が0件。契約の正常経路を満たさない。 |
| 7 | **FAIL** | Project作成後の衝突・権限エラー分類はあるが、組織一覧の権限エラーを `cli-ready` と誤分類する。 |
| 8 | PASS | 公式リンク、Project指定、一画面一操作、「できました」待ちをfixtureで確認。 |
| 9 | PASS | Browser Use／Chrome拡張なしの手動案内が成立し、拡張導入要求0件。 |
| 10 | PASS | 完了工程allowlist、次工程、secret-free resume、完了工程skipを確認。 |
| 11 | PASS | running wizardはJSON選択開始。旧Cloud画面・SVG 0件、JSONなしのAI戻り導線あり。 |
| 12 | PASS | 明示OAuth CTA、別タブ実装、polling、SPACE自動進行と既存エラー分岐を合成回帰で確認。実OAuthは外部変更gateにより未実施。 |
| 13 | PASS | 自動3時間・手動のみの一体型設定をrunning UIで完走。完了CTAは終了だけ。 |
| 14 | PASS | READMEのAI主導線・手動公式リンクあり。旧案内SVGと参照0件、新規スクリーンショット掲載0件。 |
| 15 | PASS | secret scan 0件。JSON内容、client secret、token、認可URL／callback URLを証跡へ残していない。 |
| 16 | PASS | 実Cloud／OAuth／Secret／Billing／push変更0件。合成をlive成功と表現していない。 |
| 17 | PASS | desktop／mobile／200%、keyboard、focus、details、CTA色、44px、overflow 0、console error 0。 |
| 18 | PASS | Chatwork実装差分0。主要導線、3時間、`#F03747`、選択room結果、responsiveが合格。 |
| 19 | PASS | Sprint 019 51/51、Sprint 020 50/50、敵対条件16/16。既存Google Chat境界の回帰0件。 |
| 20 | **FAIL** | 既存専用・offline・onlineは0 FAILだが、必須の権限／既存候補preflightを検出する負テストがなく、独立負テストで未達を確認。 |

## 実画面の証跡

Codex App Browserの `iab` backendはこのEvaluatorセッションで利用不可だった。Browser skillのtroubleshooting後、AGENTS.mdのfallbackに従い、空の一時プロファイルを使うheadless Chrome＋既存CDP検査でrunning UIを操作した。

- Google Chat JSON選択開始: [google-chat-file-desktop.png](../evidence/sprint-020-patch-002/evaluator/google-chat-file-desktop.png)
- Google Chat確認: [google-chat-review-desktop.png](../evidence/sprint-020-patch-002/evaluator/google-chat-review-desktop.png)
- Google Chat mobile: [google-chat-mobile.png](../evidence/sprint-020-patch-002/evaluator/google-chat-mobile.png)
- Google Chat 200%相当: [google-chat-zoom200.png](../evidence/sprint-020-patch-002/evaluator/google-chat-zoom200.png)
- Chatwork確認: [chatwork-review-desktop.png](../evidence/sprint-020-patch-002/evaluator/chatwork-review-desktop.png)
- Chatwork mobile: [chatwork-mobile.png](../evidence/sprint-020-patch-002/evaluator/chatwork-mobile.png)
- DOM・computed style・状態遷移: [browser-evidence.json](../evidence/sprint-020-patch-002/evaluator/browser-evidence.json)
- 全実行記録: [evaluator-run.md](../evidence/sprint-020-patch-002/evaluator/evaluator-run.md)

## バグ一覧

| # | 重要度 | 内容 | 再現手順 |
|---:|---|---|---|
| 1 | Major | CLI準備前に同名ProjectとProject作成権限を確認しない | 合成runnerで `inspectGcloud()` を実行しcall一覧を取得する。`version`、`auth list`、`organizations list`だけで `cli-ready` になる。 |
| 2 | Major | 組織一覧の権限エラーを `cli-ready` と誤分類する | active account成功、`organizations list`=`PERMISSION_DENIED` のfixtureで `inspectGcloud()` を実行すると `status: cli-ready`、`organizations: []` になる。 |

該当箇所の手がかり: `plugins/yasashii-secretary/skills/google-chat/scripts/cloud-setup.mjs` の `inspectGcloud()`（94〜117行付近）と、Project作成を最初の変更コマンドにする `gcloudPlan()`（120〜126行付近）。

## Generatorへの指示

1. `inspectGcloud()`または同等の読み取り専用preflightへ、最終Project IDの既存／衝突確認と、対象Google Workspace組織でのProject作成権限確認を追加する。実コマンドはdependency-injected runnerを通し、標準評価で実Cloudを変更しないこと。
2. account／organization／既存候補／権限確認の各コマンドが失敗した場合を、`login-needed`、`organization-selection-needed`、`permission-needed`、読み取り失敗等へ分ける。失敗を `cli-ready` にしない。
3. Project ID衝突時は理由つき調整案を作り、最終Project IDをもう一度提示して明示確認を取り直す。調整後の確認前はProject作成・API変更0件にする。
4. 次の負テストを追加する: 同名Projectあり／なし、Project ID全体重複、Project作成権限あり／なし、組織一覧403、既存候補確認失敗、調整後の再確認前変更0件。
5. 修正後も専用wrapper、offline 316件以上、online 317件以上、running wizard、Chatwork非回帰をすべて再実行する。

## 外部変更と後始末

- 実`gcloud`導入、実Google Cloud Project／API／OAuth Client、実OAuth、Repository Secret、Billing、push: すべて0件。
- 合成fixtureをlive成功とは扱っていない。
- 評価用サーバー4件とheadless Chromeは停止済み。専用ポート5件はすべて `STOPPED` を確認した。
