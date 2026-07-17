# Sprint 020 Patch 001 — Generator handoff

## 実装した内容

- ChatworkとGoogle Chatの設定wizardを、最初に「今すること」が分かる文章へ書き直した。
- 1画面1判断を保つため、Google Chatの管理者準備を「会社所有のGoogle CloudとAPI」「Internal AudienceとDesktop app」「接続用ファイル」の3画面へ分けた。
- API Token、OAuth、Repository Secret、workflow、commit・push等は、画面上の判断に不要な箇所では、既定で閉じた「詳しい説明」「管理者向け」へ移した。正式名称と管理者手順は削除していない。
- 保存前確認は、読む対象、保存先、共同編集者からの可視性、自動取得・保存、履歴保持を5つの短い項目として表示する。
- 0件、手動のみ、失敗、完了、キャンセルを、それぞれ結果と次の行動が先に分かる文章へ揃えた。
- 共通描画に `data-screen` / `data-state` を付け、画面状態、accessible name、必須意味、primary禁止語を完全一致だけに依存せず検査できるようにした。
- sprint-013/014/019の旧copy完全一致チェックは、現行の意味と画面状態を守る検査へ更新した。OAuth、取得、schedule、保存、cleanup等の機能コードは変更していない。

## copy inventory

- 所在: `docs/progress/sprint-020-patch-001-copy-inventory.md`
- 合計: **52状態**（Chatwork 23、Google Chat 29）
- primary禁止語allowlist: **0件**
- 各状態について、サービス、画面／状態、copyの役割、primary文面、primary／technical区分、必ず残す意味、technical detailの扱いを記録した。

## 代表的なBefore / After

| 場面 | Before | After |
|---|---|---|
| Google Chat準備 | OAuth client JSON、scope、loopback等を主説明へ列挙 | `今すること: Google Cloudで、Google Chatとの接続に使うファイルを作ります。` 正式名称と安全機構は管理者向け詳細へ分離 |
| Chatwork接続 | API TokenとRepository Secretを主説明の中心にする | `今すること: Chatworkの公式ページで、接続に使う情報を発行します。` 登録先の正式名称は詳しい説明で確認可能 |
| 保存前確認 | 自動処理を長い同意文へ集約 | 読む対象、保存先、見える人、自動取得・保存、履歴保持を5項目へ分離 |
| 失敗 | 英語エラーや内部状態を先に表示 | 「何が起きたか→次にすること」を主表示にし、生エラーは閉じた詳細へ移動 |
| 完了 | 内部処理結果を複数段落で表示 | 「設定を保存しました→次は検索できます」の順へ整理 |

## 自動検査

| コマンド | 結果 |
|---|---|
| `node scripts/sprint-020-patch-001-copy-test.mjs` | `PASS=60 FAIL=0 INVENTORY=52` |
| `bash scripts/sprint-020-patch-001-regression.sh` | `WRAPPER_PASS=5 WRAPPER_FAIL=0` |
| `node scripts/sprint-020-patch-001-browser-check.mjs --cdp http://127.0.0.1:9231 --chatwork-url http://127.0.0.1:18784/ --google-new-url http://127.0.0.1:18783/ --google-settings-url http://127.0.0.1:18782/` | `BROWSER_PASS=28 BROWSER_FAIL=0 SCREENS=28` |
| `bash scripts/regression-check.sh --offline` | `PASS=316 FAIL=0` |
| `bash scripts/regression-check.sh --online` | `PASS=317 FAIL=0`、公開先 `mtaiseeei/yasashii-harness` も `ONLINE=PASS` |
| `git diff --check` | PASS |

copy検査は、52状態のinventory、必須意味、heading／button／label／accessible name、DOMのscreen／state、primary禁止語を確認する。安全項目欠落、画面名変更、primary禁止語混入の3つの壊したfixtureも、検査が失敗を検知することを確認した。

## running UIの確認

- Browser実操作: **28状態**。Chatwork／Google Chatの準備、対象、間隔、確認、0件、手動のみ、失敗、完了、戻る、キャンセル、detailsの閉状態を操作した。
- desktop、mobile（390px）、200%相当を確認した。横overflow 0件、CTA高さ44px未満0件、technical detailの意図しない初期展開0件、primary禁止語0件だった。
- Chatwork確認画面とGoogle Chat確認画面はいずれも安全5項目を表示した。
- CTA色はChatwork `#F03747`、Google Chat `#11BB62`、前景 `#000000` をcomputed styleで確認した。
- Browser skillの通常desktop操作を確認した後、現在のChromeウィンドウではviewport overrideが反映されなかったため、responsive証跡はrepo-localのCDP検査で取得した。

証跡:

- `docs/evidence/sprint-020-patch-001/generator/browser-evidence.json`
- `docs/evidence/sprint-020-patch-001/generator/chatwork-review-desktop.png`
- `docs/evidence/sprint-020-patch-001/generator/chatwork-result-desktop.png`
- `docs/evidence/sprint-020-patch-001/generator/chatwork-mobile.png`
- `docs/evidence/sprint-020-patch-001/generator/chatwork-zoom200.png`
- `docs/evidence/sprint-020-patch-001/generator/google-chat-review-desktop.png`
- `docs/evidence/sprint-020-patch-001/generator/google-chat-empty-desktop.png`
- `docs/evidence/sprint-020-patch-001/generator/google-chat-failure-desktop.png`
- `docs/evidence/sprint-020-patch-001/generator/google-chat-zero-manual-result.png`
- `docs/evidence/sprint-020-patch-001/generator/google-chat-mobile.png`
- `docs/evidence/sprint-020-patch-001/generator/google-chat-zoom200.png`

## 起動方法

Chatwork fixture:

```bash
bash scripts/start-sprint-014-wizard-fixture.sh 18784
```

Google Chat初回設定fixture:

```bash
node scripts/start-sprint-020-patch-001-google-chat-fixture.mjs 18783
```

Google Chat設定変更fixture:

```bash
node scripts/start-sprint-020-wizard-fixture.mjs 18782
```

開くURLは、それぞれ `http://127.0.0.1:18784/`、`http://127.0.0.1:18783/`、`http://127.0.0.1:18782/`。

## Evaluatorへ渡す確認シナリオ

1. Chatworkで開始→管理者分岐→登録→対象→3時間推奨→確認→結果→完了を操作し、主説明だけで次の行動が分かるか確認する。
2. Google Chatで3つの管理者準備→接続許可→通常スペース→間隔→確認→初回結果→完了を操作する。技術詳細を開かなくても進め、開けば正式名称と管理者手順を確認できることを見る。
3. 両サービスの確認画面で、安全5項目が別々に読め、明示同意前に設定・履歴・commit・pushが0件である既存回帰を確認する。
4. Chatworkのルーム0件／取得失敗、Google Chatの初回0件／接続失敗／選択0件＋手動のみを確認する。0件を失敗扱いせず、停止と履歴保持を混同していないことを見る。
5. 戻る、キャンセル、details、desktop、mobile、200%相当、keyboard focus、読み上げ順、CTA色、横overflowを確認する。
6. copy inventory 52状態を実画面と突き合わせ、未棚卸しの表示文言がないか独立に確認する。
7. 実装担当ではない評価者で最低3回の初見理解テストを行い、契約の5問をヒントなしで記録する。これはGeneratorの自己評価では代替していない。

## 既知事項

- 実Googleアカウント、実Google Cloud、実Chatwork、実private workspace、実OAuth、実Secretは使用していない。すべてsynthetic fixtureで確認した。
- 初見理解テスト3回と最終rubric判定は独立Evaluatorの担当として未判定である。
- Generatorが確認した範囲では既知の自動回帰失敗は0件だが、Sprintの合否はEvaluatorの実操作と理解テスト後に決まる。
