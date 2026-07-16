# Sprint 014 Patch 001 評価結果

**判定:** 合格
**評価対象:** Sprint 014 Patch 001 — Chatwork設定wizardの表示文言とToken導線
**評価対象commit:** `547f89ddad4e466a8420e16558d1f437f3c480b4`
**契約種別:** `Type: micro`

専用回帰・全offline回帰・running wizardの独立操作を実施し、micro patchの必須3軸と受入基準12件をすべて満たした。実Chatwork API、実Token、実Repository Secretは使わず、合成fixtureだけで評価した。

## スコア

| 基準 | スコア | 閾値 | 判定 | 根拠 |
|---|---:|---:|---|---|
| 機能完全性 | 5/5 | 4 | PASS | 4段階Token導線、組織申請、動的Secret URL、6間隔、料金details、用語・配布一貫性を実物で確認 |
| 動作安定性 | 5/5 | 4 | PASS | desktop／mobile／200%相当を完走し、console warn/error 0、主要HTTP応答4件がすべて200 |
| 回帰なし | 5/5 | 5 | PASS | 専用回帰 `PASS=41 FAIL=0`（内包合成59件も0 FAIL）、全offline回帰 `PASS=298 FAIL=0` |

**安全・accessibility gate:** 違反0件。Token入力面・値露出・登録前のルーム取得・横overflow・keyboard不能・visible focus欠落は検出しなかった。

## PASS / FAIL集計

- 受入基準: **PASS=12 / FAIL=0**
- Sprint 014専用回帰（外側）: **PASS=41 / FAIL=0**
- 専用回帰が内包する合成fixture: **PASS=59 / FAIL=0**
- 全offline回帰: **PASS=298 / FAIL=0**
- Browser console warn/error: **0件**
- 主要loopback HTTP失敗: **0件**（4 URLすべて200）

## 実行コマンドと結果

### 1. Sprint 014専用回帰

```bash
bash scripts/sprint-014-regression.sh
```

- sandbox内の初回実行は `listen EPERM: operation not permitted 127.0.0.1` のため `PASS=40 FAIL=1`、exit 1。失敗箇所はloopback bindだけだった。
- 同じコマンドをloopback利用可能な実行条件で再実行し、exit 0。
- 最終結果は外側 `PASS=41 FAIL=0`、内包する合成fixture `PASS=59 FAIL=0`。

### 2. 全offline回帰

```bash
bash scripts/regression-check.sh --offline
```

- exit 0、`PASS=298 FAIL=0`。
- Sprint 013のrunning DOM、Secret非漏洩、選択ルーム限定、Sprint 014のschedule・manual sync・設定transactionを含め、既知失敗0件。

### 3. running wizard

```bash
bash scripts/start-sprint-014-wizard-fixture.sh 8765
```

- URL: `http://127.0.0.1:8765/`
- 評価終了後にserverを停止。実API・実Secret・実remote pushは実行していない。

### 4. loopback network確認

```bash
curl -sS -o /dev/null -w '%{http_code} %{content_type}' <URL>
```

- `/`: `200 text/html; charset=utf-8`
- `/style.css`: `200 text/css; charset=utf-8`
- `/app.js`: `200 text/javascript; charset=utf-8`
- `/api/bootstrap`: `200 application/json; charset=utf-8`

実ブラウザ操作中のルーム一覧取得も成功し、4件のルームがDOMへ描画された。desktop／mobile／200%相当の各local tabでconsole warn/errorは0件だった。

### 5. 公式リンクの到達性補足

- Chatwork developer endpointとGitHub billingはHTTP 200。
- Chatwork Tokenページは未ログイン状態で認証画面へHTTP 302、Chatwork Help 2件は自動アクセスにHTTP 403を返した。いずれも404ではなく、wizard／README／公開guideの正規URLは一致している。
- Browserでは外部リンクの `href`、`target="_blank"`、`rel="noopener noreferrer"`、日本語accessible nameを確認した。実アカウントへのログイン・Secret登録は行っていない。

## Browser実操作の記録

### desktop 1440×900

1. 接続 1/4で「ChatworkでAPI Tokenを取得します。」、Chatwork公式Tokenページ、発行ヘルプを確認。Token／password入力欄は0件、CTAは2件。
2. 「Tokenページを使えない」をクリックし、組織管理者へのAPI利用申請、実際にAPIを使うアカウントでの申請、承認前はルーム一覧を取得しない説明を確認。「承認後にAPI Token取得へ戻る」で元のstepへ戻った。
3. 「API Tokenを取得できました」からSecret登録stepへ進み、現在のremoteから組み立てた `https://github.com/mtaiseeei/yasashii-secretary/settings/secrets/actions/new`、CTA「GitHub上の安全な保管場所を開く」、登録名 `CHATWORK_API_TOKEN` を確認。固定ownerの画面実装ではなく、専用回帰の別remote fixtureでも動的生成を確認した。
4. Secretリンクを開いた後の登録確認stepでは、「ルーム一覧の取得へ進む」はdisabled。checkboxをkeyboardのSpaceで操作するとenabledになり、その後だけ接続 4/4へ進んだ。
5. 接続 4/4で「自動取得処理（GitHub Actions）、つまり決めた間隔で自動取得を動かすGitHubの仕組み」を確認し、「ルーム一覧を取得する」後に4件のルームを表示。
6. 「営業チーム ルームID（ルームを識別する番号） 101」をkeyboardで選択。visible focusは `3px solid`、`outline-offset: 3px`。
7. 自動取得の間隔は6件すべて表示: 30分 約1,440回、1時間 約720回、3時間 約240回、6時間 約120回、12時間 約60回、手動のみ0回。6時間をkeyboardで選択。
8. 「料金と実行時間について」を開き、実行回数と処理時間の区別、月2,000分は処理時間で2,000回ではないこと、2026年7月確認、プラン／runner／1回の処理時間による差、変更可能性、GitHub公式billingリンクを確認。
9. 確認stepで、対象ルーム、自動取得の間隔、同じ非公開のGitHubリポジトリ、共同編集者の閲覧、最新100件、目的先行の「取得結果をこのリポジトリへ自動保存します（Gitのcommit・push）」を確認。同意前は確定disabled、Spaceで同意後はenabled。

### mobile 390×844

- 接続stepからルーム選択、自動取得の間隔まで実操作。
- 1 column、CTAは `column-reverse` の縦積み。buttonは48px高、主要CTAは画面幅内。
- radio／checkboxに可視labelあり。6間隔と概算実行回数は欠落なし。
- `documentElement.scrollWidth === clientWidth` で横overflow 0件。
- 見出しは28px、CTAは最大2件、Token入力欄0件。

### 200%相当

- desktop 1440×900の半分のCSS viewportである720×450を使用し、200%相当のreflowを確認。
- 4段階ナビゲーション、Token説明、3つの公式リンク、CTA 2件が欠落せず、縦scrollで全内容へ到達可能。
- 横overflow 0件、buttonは48px高。

## DOM・accessibility・安全性

- 外部リンクは全件、新しいタブ、`noopener noreferrer`、行き先と目的が分かる日本語accessible name。
- Token入力欄、password入力欄、textarea、Token値表示は0件。スクリーンショットにもToken値なし。
- runtime生成synthetic tokenはログ、状態、履歴、配布fixtureへ漏洩0件（専用回帰）。
- 登録確認前はルーム取得buttonがdisabled。組織申請分岐でも「承認前はルーム一覧を取得しません」を表示。
- keyboardだけでcheckbox／radio／step移動が成立し、focusは色だけでなく3px outlineで可視。
- 各stepのCTAは最大2件。詳細情報は`details`「料金と実行時間について」へ分離。
- desktop／mobile／200%相当で横overflow 0件。console warn/error 0件。
- 実Chatwork API、実Token、実Repository Secretは使用していない。

## 配布面の一貫性

`plugins/yasashii-secretary/skills/chatwork/SKILL.md`、`README.md`、`docs/guide/connectors.md`、`docs/guide/features.md`を独立に読み、次を確認した。

- 4段階の順序が「公式Token取得／必要なら組織申請 → 現在repoの安全な保管場所 → `CHATWORK_API_TOKEN`登録確認 → 確認後だけルーム一覧取得」で一致。
- 「ルーム」「ルームID」「自動取得の間隔」「実行回数」「自動実行」「自動取得処理（GitHub Actions）」「非公開のGitHubリポジトリ」の用語が一致。
- 6間隔、概算回数、2,000分の意味、billingリンク、最新100件、同意後だけ自動実行が一致。
- READMEと公開guideに「公式情報は2026年7月確認。サービス側の変更により手順・料金・利用枠が変わる可能性がある」の注記あり。

## スクリーンショット

- [desktop Secret登録step](../evidence/sprint-014-patch-001/desktop-secret.jpg)
- [desktop 確認step](../evidence/sprint-014-patch-001/desktop-review.jpg)
- [mobile Token取得step](../evidence/sprint-014-patch-001/mobile-token.jpg)
- [mobile 自動取得の間隔](../evidence/sprint-014-patch-001/mobile-interval.jpg)
- [200%相当 720×450](../evidence/sprint-014-patch-001/zoom200-equivalent.jpg)

## 受入基準の判定

1. 用語監査: PASS
2. Token導線: PASS
3. 組織申請分岐: PASS
4. Secret登録: PASS
5. 間隔と回数: PASS
6. 2,000分の意味: PASS
7. 同意理解: PASS
8. 配布一貫性: PASS
9. compact UI: PASS
10. accessibility: PASS
11. 機能不変: PASS
12. 全回帰: PASS

## 不合格項目・バグ一覧

なし。**不具合再現手順:** 該当なし。

## 最終判定

**合格。** 失敗時分類は該当なし（`implementation-issue` / `spec-issue` ともになし）。Generatorへの差し戻しは不要。
