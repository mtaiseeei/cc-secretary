# Sprint 020 評価結果

**判定:** 不合格  
**分類:** implementation-issue  
**評価対象:** Sprint 020 — G9 Google Chat定期運用・実API評価  
**対象commit:** `61d21da`

synthetic／localの主要機能とrunning wizard、全回帰は成立したが、独立した負テストで3件の実装不具合を再現した。特に、設定用commitへ利用者が以前からstageしていた無関係なファイルを含めてpushする問題は、明示同意の範囲を越えるためC5のゼロ許容条件に違反する。

実Google Cloud／OAuth／API／Repository Secret／Actions／remote pushはユーザーの個別明示許可がないため実行していない。受入基準10〜13は `external-live-gate-unavailable` だが、今回はlive gate不足より先に修正可能な `implementation-issue` があるため、総合分類は `implementation-issue` とする。3件を修正しsynthetic／local再評価に合格するまで、live gateの許可を求めない。

## スコア

| ID | 基準 | スコア | 閾値 | 判定 | 根拠 |
|---|---|---:|---:|---|---|
| C1 | 完成度 | 3/5 | 4 | FAIL | 受入基準1〜9、14のうち3件に実装不具合。10〜13はlive未実施 |
| C2 | 構文・整合 | 5/5 | 5 | PASS | manifest 0.6.0、migration、Skill参照、全間隔の表示／設定／workflowが一致 |
| C3 | 機能の実証 | 3/5 | 4 | FAIL | 通常回帰は成功したが、dispatchしたrunの同定とAPI無効分類が独立負テストで失敗。実APIも未実施 |
| C4 | 非エンジニア体験 | 3/5 | 4 | FAIL | UIは明確だが、API無効を管理者／scope問題として案内し、利用者の次の確認先を誤らせる |
| C5 | 安全・規律 | 4/5 | 5 | FAIL | Google Chat設定への同意だけで、既存staged fileまでcommit・pushする経路がある |
| C6 | 無回帰 | 4/5 | 5 | FAIL | 全offline 314、全online 315は0 FAILだが、追加した独立負テスト3件がFAILし回帰suiteが欠陥を検出しない |
| C7 | やさしさ | 5/5 | 4 | PASS | 設定対象、保存範囲、共同編集者への可視性、3時間推奨、取得境界の説明は自然 |
| C8 | wizard体験・デザイン | 5/5 | 4 | PASS | desktop／mobile／200%相当、サービス名、指定色、黒前景、label、44px以上、横overflow 0、console error 0 |
| C9 | 配布チャネル非依存 | 5/5 | 5 | PASS | 現行対象、MIT、単段クレジット、`forkedFrom`、公開導線を全online回帰で維持 |
| C10 | 更新の安全性 | 5/5 | 5 | PASS | Sprint 017／018の診断、更新、migration、rollback回帰を維持 |
| C11 | Google Chat境界 | 4/5 | 5 | FAIL | SPACE限定、read-only、秘密非露出は成立するが、同意範囲外commit、API無効誤分類、実API未評価が残る |

## 実行コマンドと結果

- `bash scripts/sprint-020-regression.sh`
  - `SPRINT020_PASS=44 SPRINT020_FAIL=0`
  - `SPRINT020_WRAPPER_PASS=15 SPRINT020_WRAPPER_FAIL=0`
- `bash scripts/regression-check.sh --offline`
  - 通常sandboxではSprint 013／014／019のloopback bindが `EPERM` となり、環境制約として分離。
  - localhost許可環境で独立再実行し、`PASS=314 FAIL=0`。
- `bash scripts/regression-check.sh --online`
  - localhost／GitHub参照許可環境で独立再実行し、`PASS=315 FAIL=0`。`mtaiseeei/yasashii-harness` のpublic、`fork=false`、manifest／metadata整合を含む。
- `node docs/evidence/sprint-020/evaluator/adversarial-check.mjs`
  - `ADVERSARIAL_FAIL=3`。
  - Google Chat設定commitへ無関係な既存staged fileが混入。
  - 403 API無効が `admin-or-scope-blocked` に誤分類。
  - dispatch後に新規runが存在しなくても、過去の成功runを待機対象にしてpull／再検索まで進行。
- `git diff --check`
  - PASS。

## running wizardの実操作

使用面はChrome browser control。`http://127.0.0.1:18770/` のsynthetic設定変更wizardを操作し、実Google／GitHubへは接続していない。

1. desktop 1440×900で「Google Chatの設定」、既存2スペース、3時間推奨・初期値を確認。
2. 「間隔を確認する」を押し、1h／3h／6h／12h／手動のみを確認。3hがchecked。
3. 手動のみを選び確認画面へ進み、自動取得同意欄が0件、commit・push同意前は確定button disabledを確認。
4. syntheticのcommit同意を選び確定。結果画面で現在の間隔「手動のみ」、自動実行「無効（手動のみ）」、直近取得「一部失敗」を確認。
5. mobile 390×844と200%相当 720×450で再読込し、サービス名、操作、横overflow 0、button 44px以上、label、CTA最大2を確認。
6. computed styleはprimary `rgb(17, 187, 98)`、前景 `rgb(0, 0, 0)`、旧青primary 0件。console error／warningは0件。

証跡:

- `docs/evidence/sprint-020/evaluator/browser-evidence.json`
- `docs/evidence/sprint-020/evaluator/settings-desktop.png`
- `docs/evidence/sprint-020/evaluator/interval-3h-desktop.png`
- `docs/evidence/sprint-020/evaluator/settings-result-manual.png`
- `docs/evidence/sprint-020/evaluator/settings-mobile.png`
- `docs/evidence/sprint-020/evaluator/settings-zoom200-equivalent.png`

## 受入基準14項目

| # | 判定 | 評価 |
|---:|---|---|
| 1 | PASS | 1h／3h／6h／12h／manualの表示、設定、cronが一致。`23`分起点で毎時0分を回避し、manualはschedule 0。Chatworkも3時間推奨・初期値 |
| 2 | **FAIL** | 同意前0変更はPASS。しかし、同意後の `git commit` が利用者の既存staged fileも含めるため、同意したGoogle Chat資産だけのcommit・pushにならない |
| 3 | PASS | 0件、新規、thread、取得範囲内編集・削除、範囲外古い変更、同日再実行、選択解除後履歴保持をfixtureで確認 |
| 4 | PASS | 1space失敗時は成功spaceだけcursorを進め、再実行で回復。全成功とは報告しない |
| 5 | PASS | running wizardで確定前0変更、manual確定後の現在値を確認。解除space履歴保持も専用回帰で確認 |
| 6 | PASS | not found拒否はdispatch、commit、push 0件で、存在しないと断定しない |
| 7 | **FAIL** | 見かけのevent順は正しいが、dispatch直後の `gh run list --limit 1` が過去runを返しても、そのrunを今回の成功として扱う。新規runが現れない負テストでpull／再検索まで進んだ |
| 8 | **FAIL** | refresh token失効等は区別するが、Chat APIの403 API無効をgenericな `admin-or-scope-blocked` として返す。API無効の個別診断が成立しない |
| 9 | PASS | desktop／mobile／200%相当の設定変更、同意、現在値、service名、色、accessibility、秘密非露出画像を確認 |
| 10 | 未実施 | `external-live-gate-unavailable`。ユーザーの個別明示許可がないため実OAuth／discovery／初回取得を実行していない |
| 11 | 未実施 | `external-live-gate-unavailable`。実Actions、commit、push、pull、search、冪等再実行は実行していない |
| 12 | 未実施 | `external-live-gate-unavailable`。liveのAction log／remote／screenshotを横断検査していない |
| 13 | 未実施 | `external-live-gate-unavailable`。実Secret削除、schedule停止、space解除、grant／token revokeを実行していない |
| 14 | PASS | 全offline 314、全online 315が0 FAIL。Chatwork、更新、PJ、build、MIT、単段クレジット、`forkedFrom`を維持 |

## バグ一覧

| # | 重要度 | 内容 | 再現手順／該当箇所 |
|---:|---|---|---|
| 1 | Critical | Google Chat設定のcommitへ、利用者が以前からstageしていた無関係ファイルを含めてpushする | 一時repoで無関係ファイルを`git add`後、設定確定。`config-transaction.mjs:91`は管理対象pathだけをdirty確認し、`:108-111`の通常`git commit`がindex全体をcommitする |
| 2 | Major | dispatchした新規runではなく、過去のworkflow runを成功確認対象にできる | 新規runを作らないfake `gh`で、`run list`に過去の成功IDだけを返す。`search-flow.mjs:93-100`がそのIDをwatchし、pull／再検索まで進む |
| 3 | Major | Google Chat API無効の403を管理者／scope問題として誤分類する | API無効本文を持つ403を`createGoogleChatClient().getSpace()`へ返す。`client.mjs:7-12`でgeneric 403がAPI無効判定より先に評価され、`admin-or-scope-blocked`になる |

## Generatorへの修正指示

1. 設定transaction開始前に、管理対象外を含む既存staged変更を検出して安全に停止するか、Google Chatの管理対象pathだけを確実にcommitする方法へ変える。利用者のindex／working treeを壊さず、無関係staged fileがcommit／pushされない負テストを追加する。
2. workflow dispatch前のrun ID集合またはdispatch時刻を記録し、dispatch後に現れた新規runだけをpollしてwatchする。新規runが一定時間現れない場合はtimeout／failureで停止し、過去run成功時もpull／再検索0件にする。
3. API error本文の `service disabled`／API無効判定をgeneric 403より先に行い、`api-disabled` として管理者向けCloud API確認へ案内する。scope、admin policy、Audience、API無効、rate、networkの実Client層負テストを追加する。
4. 3件をSprint 020専用回帰へ組み込み、専用、全offline、全online、browserを再実行する。修正後のsynthetic／local評価が全合格してからlive gateへ進む。

## external live gate checklist

実装不具合修正後、次の各操作へのユーザー明示許可とtest資源が揃った場合だけ実行する。

- 組織所有のGoogle Cloud test project、Audience `Internal`、Desktop OAuth client、Google Chat API／People API有効化。
- 非機密のtest spaceと、検索／冪等性確認に使える非機密test message。
- 実利用と同じ構成の専用private test workspace。
- Google Chat用Repository Secret 3件の登録、設定／runtime／workflowのcommit・remote pushへの許可。
- workflow dispatch、完了待ち、pull、伏せ字検索、再実行への許可。
- 評価後のschedule停止、3 Secret削除、test space選択解除、Google OAuth grant／token revokeへの許可。
- 履歴／workspace自体は別の明示確認なしに削除しない。

## 秘密・公開境界

- public配布repo内の利用者用Google Chat Secret、workflow、config、state、historyは0件。
- browser画像、JSON、feedback、独立負テストに実OAuth値、実space名、実本文、実発言者名、実添付名を記録していない。
- 実Google／GitHub live操作は0件。
