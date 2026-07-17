# Sprint 020 Patch 001 — Evaluator feedback

## 判定

- **不合格**
- 分類: **implementation-issue**
- 理由: 引渡しGoogle Chat初回fixtureの必須導線停止、失敗状態のinventory/CTA欠落、mobile/200%相当の読み上げ順不一致、初見理解テスト未達がある。仕様は判断可能で、実装と評価fixtureの修正で解消できる。
- external live gate: このPatchでは実アカウント操作を要求しない。実Googleアカウント、実Google Cloud、実Chatwork、実private workspace、OAuth、Secrets、外部書込、product pushは行っていない。

## Rubric scores

| ID | Score | 閾値 | 判定 | 根拠 |
|---|---:|---:|---|---|
| C1 完成度 | 3/5 | 4 | FAIL | 受入1, 8, 10, 12, 14, 15, 16, 18が未達 |
| C2 構文・整合 | 5/5 | 5 | PASS | copy 60/60、offline 316/316、online 317/317 |
| C3 機能の実証 | 3/5 | 4 | FAIL | 引渡しGoogle初回fixtureが通常スペース選択前で停止 |
| C4 非エンジニア体験 | 4/5 | 4 | PASS | 主説明と安全5項目は理解可能。ただしGoogle失敗導線は操作不能 |
| C5 安全・規律 | 5/5 | 5 | PASS | 同意前0変更、履歴保持、SPACE限定、DM除外、secret非露出の回帰PASS |
| C6 無回帰 | 4/5 | 5 | FAIL | offline/onlineはPASSだが、引渡しbrowser commandがFAIL |
| C7 やさしさ | 4/5 | 4 | PASS | 主説明は自然で簡潔。規律の意味も残る |
| C8 wizard体験・デザイン | 3/5 | 4 | FAIL | mobile/200%の読み上げ順不一致とGoogle初回導線停止 |
| C9 配布チャネル非依存 | 5/5 | 5 | PASS | onlineを含む全回帰で維持 |
| C10 更新の安全性 | 5/5 | 5 | PASS | Sprint 018回帰を含む全回帰PASS |
| C11 Google Chat境界 | 5/5 | 5 | PASS | read-only 3 scope、SPACE限定、DM/group DM 0、secret 0を回帰確認 |

**合計: 46/55。1軸でも閾値未達なら全体FAILのため不合格。**

## 受入基準18項目

| # | 判定 | 根拠 |
|---:|---|---|
| 1 copy inventory完全性 | FAIL | Google space取得失敗が `discover-loading` のまま共通errorを追記し、52状態にない表示状態となる |
| 2 今すること | PASS | 主要画面の最初の1文、1画面1判断、CTA最大2を確認 |
| 3 難語除去と詳細退避 | PASS | primary禁止語0、details閉のまま通常導線を理解可能 |
| 4 自然な日本語 | PASS | 主要画面で直訳、主語不足、英日混在、二重表現の受入違反0 |
| 5 画面別情報量 | PASS | 28画面の切り分けbrowser確認とscreenshotsで上限内 |
| 6 安全同意 | PASS | 5項目を別表示。同意前の設定・履歴・commit・push 0 |
| 7 Chatwork固有準備 | PASS | 発行、管理者承認、安全登録、選択room限定、値表示0 |
| 8 Google Chat固有準備 | FAIL | 準備3画面のcopyは成立するが、引渡しfixtureでは接続後の通常スペース選択へ進めず完結しない |
| 9 0件・手動のみ・履歴保持 | PASS | 初回0件、対象0件、手動のみ、履歴保持をDOM/回帰で区別 |
| 10 失敗と完了 | FAIL | Google space取得失敗は次行動文があるが、再試行/戻るCTA 0、画面stateもloadingのまま |
| 11 両サービス整合 | PASS | 共通情報順、service名、固有準備の分離を確認 |
| 12 CTA色・accessibility | FAIL | 色、contrast、focus、labelはPASS。mobile/200%でDOM読み上げ順と視覚CTA順が逆転 |
| 13 desktop/mobile/200% | PASS | secret-free screenshots、overflow 0、欠落0を切り分け環境で確認 |
| 14 browser実操作 | FAIL | ChatworkとGoogle設定変更は操作。引渡しGoogle初回はspace選択前で停止 |
| 15 初見理解テスト | FAIL | Chatwork 3 session平均5/5。Googleは5/5, 2/5, 1/5で平均2.67/5 |
| 16 回帰の質 | FAIL | 壊したcopy fixture 3種は検出。ただし引渡しfixture欠落とCTA読み上げ順不一致を自動検査が見逃す |
| 17 機能漏出なし | PASS | Sprint 019/020、Chatwork、Google Chatの機能回帰が全PASS |
| 18 全回帰 | FAIL | wrapper/offline/onlineは0 FAILだが、引渡しbrowser checkが1 FAIL |

## Bugs / reproduction

### [P1] 引渡しGoogle Chat初回fixtureが通常スペース選択へ進めない

- 該当基準: 8, 14, 15, 18 / C1, C3, C6, C8
- 再現:
  1. `node scripts/start-sprint-020-patch-001-google-chat-fixture.mjs 18783`
  2. client準備とsynthetic接続成功後にspace discoveryへ進む
  3. `node scripts/sprint-020-patch-001-browser-check.mjs ...`
- 実際: `/api/spaces` が `reauth-required`。`google-chat-select-spaces` 待機timeout。
- 原因: `scripts/start-sprint-020-patch-001-google-chat-fixture.mjs:13-19` が `YASASHII_GOOGLE_CHAT_FIXTURE` を渡していない。
- 期待: 引渡しコマンドだけで同梱の合成SPACE/DM/group DM fixtureを読み、通常スペース選択へ進める。

### [P1] Google Chatのspace discovery失敗がloading stateのまま操作不能

- 該当基準: 1, 10, 14, 16 / C1, C3, C4, C8
- 再現:
  1. Google Chatで接続済みだがspace一覧取得が失敗する状態を作る
  2. 通常スペース確認へ進む
- 実際:
  - `plugins/yasashii-secretary/skills/google-chat/assets/wizard/app.js:150-160` のcatchは `errorMessage` を追記するだけ。
  - `data-screen=google-chat-discover-loading`、`data-state=loading` のまま。
  - 再試行、戻る、キャンセルCTAは0件。
  - copy inventoryの独立した失敗画面として追えない。
- 期待: `discover-failure` 等の明示stateで「何が起きたか→次にすること」を表示し、再試行または戻るCTAを提供する。

### [P1] mobile/200%相当で視覚順と読み上げ順が逆転する

- 該当基準: 12, 16 / C8
- 再現:
  1. ChatworkまたはGoogle ChatのCTAが2件ある画面を390pxで開く
  2. DOM/accessibility snapshotとスクリーンショットを比較する
- 実際:
  - DOM順: secondary → primary
  - 視覚順: primary → secondary
  - 原因: `plugins/yasashii-secretary/skills/chatwork/assets/wizard/style.css:85` の `flex-direction: column-reverse`
  - Google Chatも同じ共通CSSを使うため両サービスで再現。
- 期待: DOM順と視覚順を一致させる。見た順とスクリーンリーダーが読む順を同じにする。

## 初見理解テスト詳細

実装担当ではない独立AI sessionを3つ使用した。human testとは表現しない。

- Session 1: Chatwork 5/5、Google Chat 5/5（Googleは設定変更確認画面でQ3〜Q5を補完）。重大誤解0。ただし初回接続はspace discoveryで停止。
- Session 2: Chatwork 5/5。Google Chatは接続用ファイル選択までで、Q1/Q2のみ回答でき2/5。Q3〜Q5は重大誤解ではなく未到達・回答不能。
- Session 3: Chatwork 5/5。Google Chatは接続用ファイル選択までで、Q1のみ回答でき1/5。Q2〜Q5は重大誤解ではなく未到達・回答不能。
- 合格条件: 各サービス平均4/5以上、かつ安全3〜5の重大誤解0。
- 結果: Chatwork `5.0/5` PASS、Google Chat `2.67/5` FAIL。

## 証跡

- [Evaluator run](../evidence/sprint-020-patch-001/evaluator/evaluator-run.md)
- [browser evidence](../evidence/sprint-020-patch-001/evaluator/browser-evidence.json)
- desktop: `chatwork-review-desktop.png`, `google-chat-review-desktop.png`
- mobile: `chatwork-mobile.png`, `google-chat-mobile.png`
- 200%相当: `chatwork-zoom200.png`, `google-chat-zoom200.png`
- 引渡し導線停止: `google-chat-session1-discover-failure-desktop.jpg`
- 0件/手動のみ: `google-chat-zero-manual-result.png`

## Generatorへの差し戻し

1. 引渡しGoogle初回fixtureへ同梱fixture pathを渡し、progress記載コマンドだけでbrowser checkを完走させる。
2. Google space discovery catchを独立したerror stateへ遷移させ、再試行/戻るCTAを付ける。inventoryと回帰も実DOMに合わせる。
3. mobile CTAのDOM順と視覚順を一致させ、browser checkで順序をassertする。
4. 修正後、3つの新しい独立AI sessionでGoogle Chatを初回導線から再試験する。
