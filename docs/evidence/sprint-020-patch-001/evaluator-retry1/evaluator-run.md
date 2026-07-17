# Sprint 020 Patch 001 Retry 1 — Evaluator run

## 境界

- 実Google／実Chatwork／実OAuth／実Repository Secret／private live workspace／外部書込／外部pushは未使用。
- running UIは同梱synthetic fixtureだけを使用した。
- Google Chatのfile chooser確認用に作った一時synthetic JSONは `/tmp` から削除済み。repo、証跡、スクリーンショットには含めていない。

## 自動検査

| コマンド | 観測結果 |
|---|---|
| `node scripts/sprint-020-patch-001-copy-test.mjs` | `PASS=64 FAIL=0 INVENTORY=53` |
| `bash scripts/sprint-020-patch-001-regression.sh` | sandbox内ではlocalhost待受がEPERM。sandbox外で同一コマンドを再実行し `WRAPPER_PASS=5 WRAPPER_FAIL=0` |
| `bash scripts/regression-check.sh --offline` | sandbox内ではlocalhost待受がEPERM。sandbox外で再実行しexit 0。引渡し集計は316件だが、Evaluator側の長い出力は最終集計行前で表示打切り |
| `bash scripts/regression-check.sh --online` | sandbox内ではGitHub接続とlocalhost待受が失敗。sandbox外で再実行しexit 0、`ONLINE=PASS repo=mtaiseeei/yasashii-harness`を観測。引渡し集計は317件だが、Evaluator側の長い出力は最終集計行前で表示打切り |

copy検査の64件には、意味要素、screen state、primary禁止語に加え、Retry 1のfixture path欠落、discover failureのloading逆戻り、mobile `column-reverse` 逆戻りを個別に壊して検出する6負テストが含まれる。wrapperはこれを含む5群を全件PASSした。

`node scripts/sprint-020-patch-001-browser-check.mjs ...` の30状態は、評価セッションの長時間停止後に追加実行しない指示を受けたため、Retry 1 Evaluatorとしては未実行。したがって、Generatorの30/30を独立証跡として流用していない。

## Browser Session 1

- URL: `http://127.0.0.1:18784/`（Chatwork初回fixture）
- technical detailsは閉じたまま、接続準備→GitHub登録案内→登録確認→room選択→3時間→確認→初回結果まで実操作した。
- 選択: `営業チーム` 1件だけ。
- 確認画面: 「選んだChatworkルーム（営業チーム）だけ」、保存先は現在の非公開GitHub repo、共同編集者可視、3時間ごとの取得・保存、手動のみ等でも履歴を削除しない、の5要素を確認。
- desktop CTA: DOM／視覚／Tab順はsecondary→primary。primary `rgb(240,55,71)`、foreground `rgb(0,0,0)`、高さ48px、overflowなし、details closed。
- 結果画面: 選択済み `営業チーム — 成功・0件` に加え、未選択の `商品開発 — 成功・1件` も表示された。
- screenshot: `chatwork-review-desktop.jpg`。秘密値なし。

### UI矛盾の切り分け

- `scripts/fixtures/chatwork-wizard/chatwork/state/sync.json:6-9` はroom 101/102のresultsを固定保持する。
- `plugins/yasashii-secretary/skills/chatwork/assets/wizard/app.js:233-244` は `sync.results` を選択room集合で絞らず全件表示する。
- Sprint 013/014回帰は実取得が選択room限定であることをPASSしている。このため実API取得境界の漏出とは断定しない。
- ただしrunning UIは「選んだroomだけを読む」という同意内容と矛盾し、未選択roomを取得・保存したように見せる。fixture固有resultsでも実アプリの表示コードが無条件描画するため、UI implementation issueと判定する。

## 初見理解テスト（独立AI session 3回）

全sessionでtechnical detailsを開く前に5問へ回答した。実参加者によるtestではない。

| Session | Chatwork | Google Chat | 完走 | 安全上の観測 |
|---|---:|---:|---|---|
| 1 Evaluator | 5/5 | 2/5 | Chatwork可、Google不可 | Chatwork結果に未選択room表示。Googleはfile chooserで停止しQ3〜Q5未確認 |
| 2 read-only独立Agent | 5/5 | 2/5 | Chatwork可、Google不可 | 同じChatwork矛盾。Google Q3〜Q5未確認 |
| 3 read-only独立Agent | 5/5 | 2/5 | Chatwork可、Google不可 | 別の選択roomでも同じ矛盾。Google Q3〜Q5未確認 |
| 平均 | **5.0/5** | **2.0/5** | Google未完走 | Googleの合格条件4/5未達 |

Google Chatは3sessionとも管理者準備1/3→2/3→3/3まで進み、接続用ファイル選択で停止した。これは同梱fixtureの自動接続導線を初見testが使えていない設計上の可能性があるが、契約は完走不能を合格扱いしない。Q1は会社所有Cloud projectとAPI準備、Q2は社内向け接続設定と接続用file選択まで回答でき、Q3〜Q5は推測せず0点とした。

## Retry 1初回3不具合

1. launcherの同梱fixture path: copy負テストとwrapperはPASS。Google初回browserはfile chooserで停止し、Evaluator自身によるSPACE選択到達の完走証跡は取れなかった。
2. `google-chat-discover-failure`: copy負テストは独立error state、2 CTA、detailsへの退避をPASS。戻る／再試行のEvaluator browser実操作は未完。
3. mobile／200% CTA順: copy負テストは `column-reverse` 再混入を検出しwrapper PASS。Session 1 desktopはDOM／視覚／Tabが一致。mobile／200%のEvaluator screenshotとTab実操作は未完。

## 結論

新たに確認したChatwork完了表示の安全説明矛盾と、Google Chat初見理解平均2.0/5・完走不能により、不合格は確定する。追加の未実行browser項目をGenerator証跡で補完せず、そのまま受入14／15／18の未達として扱う。
