# Sprint 020 Patch 002 — 独立評価の実行記録

## 結論

- 専用回帰、全offline／online回帰、running wizardのブラウザ検査はすべて0 FAIL。
- ただし独立の負テストで、`gcloud`正常経路に必須の「同名Projectの事前確認」と「Project作成権限の事前確認」が実行されないことを確認した。
- `gcloud organizations list` が権限エラーでも `cli-ready` になるため、受入基準3、6、7、20は未達。判定は `implementation-issue` の不合格。

## 実行結果

| 検査 | 結果 |
|---|---|
| `bash scripts/sprint-020-patch-002-regression.sh` | `SPRINT020_PATCH002_WRAPPER_PASS=8 FAIL=0` |
| `bash scripts/regression-check.sh --offline` | `PASS=316 FAIL=0` |
| `bash scripts/regression-check.sh --online` | `PASS=317 FAIL=0` |
| running wizard browser check | `SPRINT020_PATCH001_BROWSER_PASS=31 FAIL=0 SCREENS=31` |
| Cloud準備の独立負テスト | 既存Project確認なし、作成権限確認なし、組織一覧権限エラーを `cli-ready` と誤分類 |

最初の専用回帰はEvaluatorの通常sandboxでloopback待受が `EPERM` となった。製品の失敗ではないため、許可済みのローカル待受環境で同じコマンドを再実行し、8/8 PASSを確認した。

## running wizard

Codex App Browserの `iab` backendはこのEvaluatorセッションで利用できなかった。Browser skillのtroubleshootingに従って利用可能面を確認後、AGENTS.mdのfallback順にある既存CDP browser検査を、空の一時プロファイルのheadless Chromeで実行した。

一時URL:

- Chatwork: `http://127.0.0.1:28784/`
- Google Chat初回: `http://127.0.0.1:28783/`
- Google Chat手動のみ: `http://127.0.0.1:28781/`
- Google Chat設定変更: `http://127.0.0.1:28782/`

確認した操作:

- Google Chatは接続用JSON選択から開始し、旧Cloud準備画面・案内画像は0件。
- JSONなしでは設定を終了し、AIへ「Google Chatを設定したい」と伝える導線を表示。
- JSON選択後に明示的なOAuth CTAを表示し、別タブ実装・許可後のSPACE自動進行を専用回帰で確認。実OAuthは実施していない。
- SPACE選択、3時間推奨、安全5項目、`この設定で始める`、初回取り込み＋自動取得、`設定を終了する`を合成fixtureで完走。
- 手動のみは初回取り込み1回、schedule無効、完了CTAは `設定を終了する` だけ。
- Chatworkの準備、選択room、手動のみ、結果、キャンセルを実操作。
- desktop、390px mobile、200%相当でoverflow 0。CTAは48px、mobile／200%では縦積み。
- detailsは初期closed、山形表示、keyboard開閉、visible focus、accessible nameが成立。
- CTAはChatwork `rgb(240, 55, 71)`、Google Chat `rgb(17, 187, 98)`、前景は両方黒。
- browser exception 0。

主なスクリーンショット:

- `google-chat-file-desktop.png`
- `google-chat-review-desktop.png`
- `google-chat-mobile.png`
- `google-chat-zoom200.png`
- `google-chat-manual-initial-result.png`
- `chatwork-review-desktop.png`
- `chatwork-mobile.png`
- `chatwork-zoom200.png`

詳細なDOM・computed style・状態遷移は `browser-evidence.json` に保存した。厳格secret形式、認可URL、callback URLは評価証跡に0件。

## 独立負テスト

`inspectGcloud()`へ合成runnerを渡した結果、呼ばれた読み取りコマンドは次の3つだけだった。

1. `gcloud version --format=json`
2. `gcloud auth list --filter=status:ACTIVE --format=json`
3. `gcloud organizations list --format=json`

`gcloud projects list`／`describe`等の同名候補確認と、Project作成権限の読み取り確認は0件だった。そのまま `status: cli-ready` となる。

また、active accountは取得できるが `gcloud organizations list` が `PERMISSION_DENIED` のfixtureでも、結果は次のようになった。

```json
{
  "status": "cli-ready",
  "changed": false,
  "organizations": []
}
```

このため、Project ID衝突は作成前には検知できず、最初の作成試行が失敗した後にしか区別できない。契約が求める「既存候補と作成権限を確認後、最終案を示して承認を得てから作成」と一致しない。

## 外部変更と後始末

- 実`gcloud`導入: 0件
- 実Google Cloud Project／API／OAuth Client変更: 0件
- 実OAuth／Repository Secret／Billing／push: 0件
- 合成fixtureをlive成功とは扱っていない。
- 評価用ポート `28784`、`28783`、`28781`、`28782`、`19231` はすべて停止済み。
