# Sprint 013 評価結果

**判定:** 不合格
**分類:** implementation-issue
**評価対象:** Sprint 013 — G5 接続: 1つのrepoとChatwork初回設定

running wizard の `/`、`/style.css`、`/app.js` が実ファイルではなく、Node.js `Buffer` をJSON化した文字列を返す。ブラウザには `{"type":"Buffer","data":[...]}` だけが表示され、room選択を含む全UI操作を開始できない。自動回帰は全件PASSしたが、この障害を検出していないため合格にはできない。

## スコア

| 基準 | スコア | 閾値 | 判定 | 根拠 |
|---|---:|---:|---|---|
| C1 完成度 | 2/5 | 4 | FAIL | single-repo・同期・検索の合成fixtureは成立するが、必須のrunning wizardが利用不能 |
| C2 構文・整合 | 5/5 | 5 | PASS | JSON/frontmatter/Node構文、remote manifest、metadata allowlistのonline検査が成功 |
| C3 機能の実証 | 3/5 | 4 | FAIL | 0/1/100件、冪等、部分失敗、検索は実動作したが、wizardのユーザーフローを実証できない |
| C4 非エンジニア体験 | 2/5 | 4 | FAIL | 最初に表示されるのが説明や次の行動ではなく、内部表現の数値列 |
| C5 安全・規律 | 5/5 | 5 | PASS | public/既存remote/cancel保護、selected room限定、schedule無効、synthetic token非漏洩が成功 |
| C6 無回帰 | 4/5 | 5 | FAIL | 既存assertは全PASSだが、追加wizard回帰が致命的な配信不具合を見逃している |
| C7 やさしさ | 3/5 | 4 | FAIL | 静的文言規約は維持する一方、実画面が内部のBuffer表現だけで次の行動を示さない |
| C8 wizard体験・デザイン | 1/5 | 4 | FAIL | desktop/mobileともwizard DOMがなく、responsive・keyboard・focus・200% zoomを操作評価できない |

## 実行証跡

### 回帰・remote整合

- `bash scripts/regression-check.sh --offline`
  - sandbox内の初回実行はloopback bindで `EPERM`。承認付きで同じコマンドを再実行。
  - 再実行: **exit 0 / PASS=296 / FAIL=0**。
- `bash scripts/sprint-013-regression.sh`
  - **exit 0 / PASS=33 / FAIL=0**。内包するChatwork実動作は **PASS=29 / FAIL=0**。
- `bash scripts/regression-check.sh --online`
  - **exit 0 / PASS=297 / FAIL=0**。
  - `ONLINE=PASS repo=mtaiseeei/yasashii-harness`、`repo=public,fork=false manifests=consistent metadata=exact`。
- `node docs/evidence/sprint-013/cdp-evaluate.mjs`
  - Chrome 150 headless/CDP fallbackで実URLを操作しようとした結果、**exit 2**（room UIが存在しないため証跡化して停止）。
  - DOM: `inputs=0`、`buttons=0`、`scripts=0`、`links=0`。例外ログは0件だが、本文自体がBuffer JSONである。

### Browser検証面

Browser skillを読んだうえでin-app Browserを優先したが、このセッションには必須の `node_repl js` とtool discovery面が公開されていなかった。そのため、役割定義の次順位である既存Chrome headless/CDPへfallbackした。

確認URL: `http://127.0.0.1:8765/`

HTTP応答の実測:

```text
GET /          200 text/html              prefix={"type":"Buffer","data":[60,33,100,...  length=3576
GET /style.css 200 text/css               prefix={"type":"Buffer","data":[58,114,111,... length=16655
GET /app.js    200 text/javascript        prefix={"type":"Buffer","data":[99,111,110,... length=32291
GET /api/bootstrap 200 application/json   prefix={"rooms":{"version":1,"status":"ready"...
```

スクリーンショット:

- [desktop 1440×900](../evidence/sprint-013/desktop-broken-response.png)
- [mobile 390×844](../evidence/sprint-013/mobile-broken-response.png)
- [200%相当（720 CSS px / devicePixelRatio 2）](../evidence/sprint-013/zoom-200-broken-response.png)
- [DOM・viewport記録](../evidence/sprint-013/browser-evidence.json)
- [再現用CDP評価スクリプト](../evidence/sprint-013/cdp-evaluate.mjs)

desktop/mobileの両方でraw Buffer JSONだけが表示された。200%相当では横方向overflowも発生した。これは本来のwizardではなく壊れた応答の表示なので、palette、CTA、typography、keyboard、focus、label、touch targetを「合格」と採点していない。

## 合格した項目

- private repo初期commit・初回push、秘書・project・Chatworkのsame repo構成を隔離local bare remoteで実証。
- public指定拒否、既存remote未確認時のremote変更・push 0件、確認なしpublish/cancel相当の副作用0件を実証。
- synthetic tokenを使い、discoveryログ、同期状態、履歴、部分失敗エラー、network error、fixtureへの漏洩0件を実証。資格情報候補があるworkspaceはcommit・push前に拒否。
- wizard静的面にToken入力欄・Token値surfaceがないことを確認。
- room discoveryの複数room、auth/rate-limit/network失敗、失敗時のroom一覧保持を実証。
- 選択roomだけの0/1/100件、100件上限、message ID冪等、API応答欠落時の既存履歴保持、未選択room取得0件を実証。
- room単位の部分失敗を全成功にせず、失敗情報へtoken・本文を出さないことを実証。
- 基本検索foundはroom・日付・該当箇所、not foundは保存済み範囲の限界を返すことを実証。
- workflowはSprint 013でscheduleを持たず、実GitHub repo作成・実Chatwork API・実tokenは契約どおり未実施。

## 不合格の項目

### 1. [Critical] static assetをBuffer JSONとして返し、wizard全体が利用不能

- **分類:** implementation-issue
- **該当:** 受入基準 5、6、8、10、11、およびrunning wizardを必要とするroom選択・6頻度・戻る入力保持・キャンセル・確定・0件/部分失敗/エラー表示
- **再現手順:** `bash scripts/start-sprint-013-wizard-fixture.sh 8765` → Chromeで `http://127.0.0.1:8765/` を開く。
- **期待:** HTML/CSS/JSが読み込まれ、STEP 1のroom検索・checkbox・CTAが表示される。
- **実際:** `{"type":"Buffer","data":[...]}` の数値列だけが表示され、input/button/script/stylesheetがDOMに0件。
- **実装箇所:** `plugins/yasashii-secretary/skills/chatwork/scripts/wizard-server.mjs:45-52,123-127`。`readFileSync()`の戻り値はBufferだが、`send()`が文字列以外をすべて `JSON.stringify()` する。

### 2. [Major] wizard回帰が壊れたHTML応答をPASSにする

- **分類:** implementation-issue
- **再現手順:** 現状のまま `bash scripts/sprint-013-regression.sh` を実行する。
- **期待:** `/` が実HTMLとして解釈でき、`app.js`ロード後にroom inputが表示されない場合はFAIL。
- **実際:** `scripts/sprint-013-chatwork-test.mjs:106-107` はレスポンス文字列にsynthetic tokenが無いことだけを確認するため、Buffer JSONでもPASS。CSS/JSの有効配信と実DOMを検証しない。

## 未実施・未確認

UIがSTEP 1へ到達しないため、running browserでのroom選択、6頻度の表示と選択、戻る入力保持、キャンセル0変更、確定、0件/部分失敗/エラー表示、keyboard/focus、label、touch target、指定palette、CTA最大2、禁止装飾、200% zoomでの情報保持は実施不能。静的grepや自動assertのPASSで代替していない。

## Generatorへの修正指示

1. `send()`でBufferをそのまま `response.end(body)` できるようにし、JSON objectだけをJSON化する。HTML/CSS/JSの各Content-Typeと本文を実ブラウザで再確認する。
2. 専用回帰へ、`/` が実HTMLであること、`/app.js`がJavaScriptとして評価されること、`/style.css`が適用されること、room inputがrunning DOMに出ることを追加する。token不在だけをDOM健全性の代用にしない。
3. 修正後、同じ起動コマンドでdesktop/mobileの全step、戻る・キャンセル・確定、0件・部分失敗・エラー、keyboard/focus、200% zoomを再評価し、新しいスクリーンショットを取得する。

---

## Retry 1 再評価

**判定:** 合格
**評価対象:** Sprint 013 Retry 1 — static asset配信修正とwizard全導線の再検証

初回不合格の履歴とbroken evidenceは上に保持する。Retry 1では、`Buffer`をJSON化していた配信不具合が解消し、その破損を検出できなかった回帰の穴も埋まった。running UIをdesktop／mobileで実操作し、C1〜C8の全軸が閾値以上であることを確認した。

### スコア

| 基準 | スコア | 閾値 | 判定 | 根拠 |
|---|---:|---:|---|---|
| C1 完成度 | 5/5 | 4 | PASS | single-repo、room設定、初回0/1/100件、基本検索、running wizardの必須成果を実証 |
| C2 構文・整合 | 5/5 | 5 | PASS | 全offline回帰296件、専用回帰33件、HTML/CSS/JSのContent-Typeと実byte本文が全て正常 |
| C3 機能の実証 | 5/5 | 4 | PASS | room検索、複数選択、6頻度、戻る保持、確定、0/1件、400、部分失敗、検索を実動作で確認 |
| C4 非エンジニア体験 | 5/5 | 4 | PASS | 次の行動、費用の注意、100件制約、共同編集者への可視性、失敗理由と再実行方法を日本語で表示 |
| C5 安全・規律 | 5/5 | 5 | PASS | public/既存remote/cancel保護、selected room限定、message ID冪等、token非漏洩、schedule無効が全PASS |
| C6 無回帰 | 5/5 | 5 | PASS | `PASS=296 FAIL=0`。Buffer JSONの意図的失敗fixtureとrunning DOM確認を含む |
| C7 やさしさ | 5/5 | 4 | PASS | 1 step 1 message、次の行動、0件正常、部分失敗の再実行案内が自然で、規律を緩めていない |
| C8 wizard体験・デザイン | 4/5 | 4 | PASS | desktop/mobile、keyboard、visible focus、200%相当reflow、指定palette、禁止装飾0を確認。checkbox再描画後のfocus保持に軽微な改善余地 |

### 回帰と配信の独立証跡

- `bash scripts/sprint-013-regression.sh`
  - sandbox内の初回はloopback bindで `listen EPERM`。
  - 承認付きで同じrepo内コマンドを再実行し、**exit 0 / PASS=33 / FAIL=0**。
  - 内包するChatwork実動作は **PASS=34 / FAIL=0**。
  - `/`、`/style.css`、`/app.js`のContent-Typeと実byte本文、Buffer JSONの意図的失敗fixture、headless Chromeのrunning DOM checkbox描画を含む。
- `bash scripts/regression-check.sh --offline`
  - sandbox内の初回は同じloopback制約で **PASS=295 / FAIL=1**。失敗は `listen EPERM` の1件だけ。
  - 承認付き再実行は **exit 0 / PASS=296 / FAIL=0**。
- running network実測:
  - `GET /` — `200 text/html; charset=utf-8`, 999 bytes
  - `GET /style.css` — `200 text/css; charset=utf-8`, 4692 bytes
  - `GET /app.js` — `200 text/javascript; charset=utf-8`, 8900 bytes
  - `GET /api/bootstrap` — `200 application/json; charset=utf-8`
  - unknown Room IDの `POST /api/confirm` — `400 application/json; charset=utf-8`

これにより、前回の「`Buffer`をJSON化して配信する不具合」と「synthetic token不在だけを見て壊れたHTMLをPASSにする回帰の穴」は、両方とも修正されたと判定する。

### Browser実操作

Browser skillを読み、URLから選択された既存Chrome extension操作面を使用した。Browser操作面が利用できたため、前回のheadless/CDP全面fallbackは不要だった。

確認URL:

- 通常fixture: `http://127.0.0.1:8765/`
- 400／部分失敗variant: `http://127.0.0.1:8766/`

desktop 1440×900:

1. room検索へ「営業」→営業チームを選択、「商品」→商品開発を選択。検索解除後も2件checkedを保持。
2. 30分／1時間／3時間／6時間／12時間／手動のみの6件と、概算run数1440／720／240／120／60／0、既定1時間を確認。
3. 3時間を選び、確認→戻る→room画面まで戻った後もroom 2件と3時間を保持。
4. 確認画面で、同じprivate repo、共同編集者から本文が見えること、最新100件制約、自動pushは同意後だけ有効になることを確認。
5. cancel前後の `/api/bootstrap` は、`selectedRoomIds=[]`、`interval=1h`、`scheduleEnabled=false` で完全一致し、0変更。
6. 確定後、営業チーム `成功・0件`、商品開発 `成功・1件` を同じ結果画面で表示。
7. room一覧を意図的に更新してstale selectionを作り、実POST 400で `role=alert`「room一覧にないRoom IDは保存できません。」を表示。
8. 一覧復元後、営業チーム `成功・0件` と採用プロジェクト `失敗・一時的な通信失敗です。GitHub Actionsの結果を確認して再実行してください。` を区別し、全成功と見せないことを確認。

mobile 390×844:

- room一覧は1 column、CTAは `column-reverse` の縦積み、button幅350px／高さ48px、横overflowなし。
- `Space`でroom checkbox、`Enter`でstep移動、`Space`で6時間radio、`Enter`で確定とキャンセルを操作できた。
- search／checkbox／radioのfocusは3px solid、outline-offset 3pxで可視。
- checkbox変更は一覧を再描画するため、一度focusがbodyへ戻る。Tabでsearch→checkboxへ復帰しkeyboardだけで完走できるため合格範囲だが、将来は変更したcheckboxへfocusを戻すとより良い。

200% zoom相当:

- Browser操作面がpage zoom率を公開しなかったため、1440×900の半分のCSS viewportである720×450をviewport capabilityで再現した。
- room 4件、CTA 2件、見出しを保持し、横overflowなし。CTAは縦積みで幅680px／高さ48px、全内容は縦scrollで到達できた。

console warning/errorは全操作を通して **0件**。

### 視覚・responsive・accessibility

computed styleの実測:

- body: 14px、白 `rgb(255,255,255)`、Graphite `rgb(57,60,65)`。
- h1: desktop 40px、mobile 28px、Carbon Dark `rgb(23,26,32)`、weight 500。
- CTA: 各step最大2、primaryは1件だけ。primary backgroundはElectric Blue `rgb(62,106,225)`。
- button: radius 4px、min-height 48px、14px、weight 500。
- transition: border/background/colorだけ0.33s。
- gradient、shadow、transform、画像、Tesla／Universal Sans、Token input、横overflowはすべて0件。

新しい正常証跡（前回broken evidenceとは別名）:

- [desktop確認画面](../evidence/sprint-013/retry1-desktop-review.png)
- [mobile room選択](../evidence/sprint-013/retry1-mobile-room-selection.png)
- [200% zoom相当](../evidence/sprint-013/retry1-zoom200-equivalent.png)
- [実400エラー表示](../evidence/sprint-013/retry1-400-error.png)
- [部分失敗結果](../evidence/sprint-013/retry1-partial-result.png)
- [DOM／computed style／console／network要約](../evidence/sprint-013/retry1-browser-evidence.json)

前回の `desktop-broken-response.png`、`mobile-broken-response.png`、`zoom-200-broken-response.png`、`browser-evidence.json` は初回不合格の証跡として削除していない。

### 安全・データ境界

- 隔離local bare remoteでprivate repo相当の初期commit・初回push、same repo構成を実証。実GitHub repoは作成していない。
- public指定、既存remote未確認、cancelはcommit・remote変更・push 0件。
- runtime生成synthetic tokenはtracked files、git差分／履歴、ログ、状態、履歴、DOM、error、screenshotへ0件。wizardにToken入力欄もない。
- 0／1／100件、100件上限、selected room限定、未選択room取得0件、message ID冪等、API応答欠落時の既存履歴保持、room部分失敗を全回帰で確認。
- 基本検索foundはroom・日付・該当箇所、not foundは保存済み範囲の限界を返し、「Chatworkに存在しない」と断定しない。
- Sprint 013ではscheduleなし。実Chatwork API、実token、実GitHub remoteへのpushは実行していない。

### 中断した旧Generator work unitの扱い

`docs/sprints/state.md`に記録されたとおり、Retry 1の最初のGeneratorは親ディレクトリ探索により、接触禁止の保護対象repo配下の**ファイル名だけを列挙**した。これは探索境界違反であり、隠さない。内容読取・編集・実装修正の前に停止し、ユーザーへ報告した。

その後、ユーザー承認を受け、対象repo内だけを読むfresh Generatorを新しいwork unitとして開始した。今回の実装安全性はこのfresh work unitと実成果物を対象に評価し、実装経路に保護対象repoの内容利用・編集・複製・Git操作が無いことを確認した。したがって、旧work unitのprocess violationは履歴として残しつつ、Retry 1実装のC5とは分けて判定した。

### 最終判定

**合格。** C1〜C8の全軸が閾値以上。Generatorへの追加差し戻しは不要。checkbox再描画後のfocus保持は将来の改善候補だが、keyboard-only導線、visible focus、操作完了を妨げないため本Sprintの不合格条件には当たらない。
