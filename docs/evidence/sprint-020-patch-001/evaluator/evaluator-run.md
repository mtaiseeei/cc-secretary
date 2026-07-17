# sprint-020-patch-001 Evaluator evidence

## 判定に使った環境

- 対象: `/Users/taisei/workspace/yasashii-secretary`
- HEAD（評価開始時）: `3fd5ec2`
- 実アカウント、実Google Cloud、実Chatwork、実private workspace、実OAuth、実Secret、外部書込、product push: **0件**
- ブラウザ: Codex Browser（Chrome binding）と、隔離した一時profileのheadless Chrome/CDP
- 証跡内の厳格secret、認可URL、callback URL、チャット本文: **0件**

## 自動検査

| 検査 | 結果 |
|---|---|
| `node scripts/sprint-020-patch-001-copy-test.mjs` | `PASS=60 FAIL=0 INVENTORY=52` |
| `bash scripts/sprint-020-patch-001-regression.sh` | sandbox外のローカルfixture許可後 `WRAPPER_PASS=5 WRAPPER_FAIL=0` |
| `bash scripts/regression-check.sh --offline` | `PASS=316 FAIL=0` |
| `bash scripts/regression-check.sh --online` | `PASS=317 FAIL=0` |
| 引渡しどおりのbrowser check | **FAIL**: `google-chat-select-spaces` 待機timeout |
| 同梱Google Chat fixtureを明示した切り分けbrowser check | `BROWSER_PASS=28 BROWSER_FAIL=0 SCREENS=28` |

copy test内の負検査は、次の3種類をそれぞれ検出した。

1. 共同編集者可視性の必須意味を削除したfixture
2. `settings-result-manual` の画面IDを変更したfixture
3. primaryへ `wizard` / `token` を混入したfixture

## 引渡しfixtureの再現結果

### 実行

1. `node scripts/start-sprint-020-patch-001-google-chat-fixture.mjs 18783`
2. Google Chatで管理者準備1/3→2/3→3/3を進む
3. 合成OAuth成功状態を作り、通常スペース取得へ進む
4. `node scripts/sprint-020-patch-001-browser-check.mjs ...`

### 観測

- `/api/bootstrap` は接続済みを返すが、`/api/spaces` は `reauth-required` となる。
- running UIは `google-chat-discover-loading` のまま、次を追記する。
  - `処理を完了できませんでした。`
  - `通信や設定を確認して、もう一度お試しください。`
- 戻る、再試行、キャンセルのCTAは0件。利用者は先へ進めない。
- browser checkは `google-chat-select-spaces` を待ってtimeoutする。
- `scripts/start-sprint-020-patch-001-google-chat-fixture.mjs` は synthetic/private/secret/skip-gitを設定するが、同梱の `scripts/fixtures/google-chat-wizard/google-chat.json` を `YASASHII_GOOGLE_CHAT_FIXTURE` として渡していない。
- 同梱fixtureを明示した切り分け環境では28画面を完走した。したがって、copy本体だけでなく、引渡し起動経路の欠落である。

## browser / DOM / 視覚確認

### 操作した主な状態

- Chatwork: 開始、管理者、登録、登録確認、対象、3時間、手動のみ、確認、初回結果、完了、0件、失敗、戻る、キャンセル、details
- Google Chat: 管理者準備1/3〜3/3、接続失敗、通常スペース、3時間、手動のみ、確認、初回0件、対象0件、停止結果、戻る、キャンセル、details
- 引渡しGoogle Chat初回導線は、通常スペース取得中の失敗表示で停止した。

### DOM / style

- service accessible name: `Chatworkの設定` / `Google Chatの設定`
- heading: 各画面にH1 1件
- checkbox/radio/search: 可視labelまたはaccessible nameあり
- primary禁止語: 切り分けbrowser 28画面で0件
- details: 初期状態で全て閉
- 安全5項目: Chatwork / Google Chat確認画面とも5/5
- console error/warn: Codex Browserで0件
- 横overflow: desktop/mobile/200%相当で0件
- CTA高さ: 48px（44px以上）
- CTA computed style:
  - Chatwork `rgb(240, 55, 71)` / 黒、contrast `5.34:1`
  - Google Chat `rgb(17, 187, 98)` / 黒、contrast `8.31:1`
- keyboard focus: search input、全解除buttonで3px solid outlineを確認

### 読み上げ順の不一致

- DOM順は secondary CTA → primary CTA。
- 390px mobileと720px + pageScale 2の200%相当では `.actions { flex-direction: column-reverse; }`。
- 視覚順は primary CTA → secondary CTAへ反転する。
- したがって、スクリーンリーダーの読み上げ順と視覚順が両サービスで一致しない。

## 初見理解テスト

評価主体はすべて実装担当ではない独立AI session。**human testではない**。technical detailsを開く前に回答した。

質問:

1. 今することは何か。
2. primary CTAのあとに何が起きるか。
3. どのルーム／スペースを読むか。
4. どこへ保存し、誰が見られるか。
5. 自動取得を止めたとき、取得済み履歴はどうなるか。

| Session | Chatwork | Google Chat | 安全3〜5の重大誤解 | 判定 |
|---|---:|---:|---|---|
| 1（Evaluator本体） | 5/5 | 5/5（設定変更確認画面で補完） | 0 | Chatwork合格。Google初回はspace取得で停止 |
| 2（独立child） | 5/5 | 2/5 | 0。ただし3〜5は未到達で回答不能 | Google不合格 |
| 3（独立child） | 5/5 | 1/5 | 0。ただし2〜5は未到達で回答不能 | Google不合格 |

Session 2/3はいずれもGoogle Chatの接続用ファイル選択以降を完走できなかった。重大な誤答が無かったことと、必要情報へ到達できなかったことを分けて扱う。Google Chatは3 session平均 `2.67/5` で、必要な `4/5` を下回る。

## screenshots

- `chatwork-review-desktop.png`
- `chatwork-mobile.png`
- `chatwork-zoom200.png`
- `google-chat-review-desktop.png`
- `google-chat-mobile.png`
- `google-chat-zoom200.png`
- `google-chat-session1-discover-failure-desktop.jpg`
- `google-chat-zero-manual-result.png`

`browser-evidence.json` は同梱Google Chat fixtureを明示した切り分け環境の28画面観測値であり、引渡しfixtureの合格証跡としては扱わない。
