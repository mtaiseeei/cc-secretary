# Sprint 019 評価結果

**判定:** 不合格  
**分類:** implementation-issue  
**評価対象:** Sprint 019 — G9 Google Chat高度接続・初回取得  
**対象commit:** `61ed089620363306943efa57fb92c54fabecdf81`

自動回帰はすべて通過したが、通常利用者のOAuth導線、OAuth取消失敗時の表示、初回0件時の実Git保存経路に3件の実装不具合がある。必須閾値を1つでも下回れば不合格というrubricに従い、Sprint 019はGeneratorへ差し戻す。

## スコア

| ID | 基準 | スコア | 閾値 | 判定 | 根拠 |
|---|---|---:|---:|---|---|
| C1 | 完成度 | 3/5 | 4 | FAIL | 受入基準5、8、9、12が不達 |
| C2 | 構文・整合 | 5/5 | 5 | PASS | manifest、JSON、Skill参照、version 0.5.0、migration、共通asset、3時間設定は整合 |
| C3 | 機能の実証 | 3/5 | 4 | FAIL | synthetic正常系は成立するが、通常OAuthの既定操作と0件の実Git経路が完走しない |
| C4 | 非エンジニア体験 | 3/5 | 4 | FAIL | cleanup失敗を成功と断定し、必要な手動確認を正しく伝えない |
| C5 | 安全・規律 | 4/5 | 5 | FAIL | Secret削除・grant revoke失敗を成功表示するためゼロ許容条件に違反 |
| C6 | 無回帰 | 5/5 | 5 | PASS | 専用、全offline、全onlineは0 FAIL。既存Chatwork、更新、PJ、配布境界も通過 |
| C7 | やさしさ | 4/5 | 4 | PASS | READMEと通常説明は平易。ただし失敗時説明はC4/C5/C8で減点 |
| C8 | wizard体験・デザイン | 3/5 | 4 | FAIL | 色、responsive、44px、サービス名は成立するが、通常OAuthの主要導線が同一タブ遷移で中断 |
| C9 | 配布チャネル非依存 | 5/5 | 5 | PASS | 現行対象100件、旧固有表現0件。MIT、単段クレジット、`forkedFrom`を維持 |
| C10 | 更新の安全性 | 5/5 | 5 | PASS | Sprint 017/018境界と0.4.0→0.5.0 migration回帰は維持 |
| C11 | Google Chat境界 | 4/5 | 5 | FAIL | scope、SPACE限定、秘密非露出は成立するが、OAuth完走とgrant revoke失敗処理が不達 |

## 実行コマンドと結果

- `bash scripts/sprint-019-regression.sh`
  - sandbox内初回: loopback bindが `EPERM`。実装FAILとは分離。
  - loopback許可環境で再実行: `SPRINT019_PASS=37 SPRINT019_FAIL=0`、`SPRINT019_WRAPPER_PASS=11 SPRINT019_WRAPPER_FAIL=0`。
- `bash scripts/regression-check.sh --offline`
  - loopback許可環境で独立再実行、exit 0、`PASS=310 FAIL=0`。
- `bash scripts/regression-check.sh --online`
  - 独立再実行、exit 0、`PASS=311 FAIL=0`。GitHub上の `yasashii-harness` online整合を含む。
- `git add -- google-chat/config.json google-chat/state google-chat/history`
  - 履歴0件相当の一時Git repoで `fatal: pathspec 'google-chat/history' did not match any files`、exit 128。
- `git diff --check`
  - PASS。

実Google OAuth、Google Chat API、Google Cloud、実Repository Secret、実remote pushはSprint 020 live gateのため実行していない。

## browser実操作の証跡

使用面はChrome browser control。実Googleには接続せず、すべてloopbackのsynthetic／失敗fixtureで確認した。

### 通常表示

- `http://127.0.0.1:18766/` Google Chat synthetic wizard
  - desktop 1440×900: region accessible nameと可視文言がともに「Google Chatの設定」。primary背景 `rgb(17, 187, 98)`、前景 `rgb(0, 0, 0)`、CTA 2、横overflowなし。
  - mobile 390×844: `flex-direction: column-reverse`、button 48px、横overflowなし、同じサービス名と色を確認。
- `http://127.0.0.1:18765/` Chatwork synthetic wizard
  - desktop 1440×900: region accessible nameと可視文言がともに「Chatworkの設定」。primary背景 `rgb(240, 55, 71)`、前景 `rgb(0, 0, 0)`、旧青0、CTA 2、button 48px、横overflowなし。
- 指定色と黒前景のcontrast ratioは自動検査で両方4.5:1以上。共通 `index.html`、`style.css`、`common.js`、shellを両サービスが利用している。

### cleanup失敗fixture

- `http://127.0.0.1:18767/`
  1. 接続済み・SPACE 1件の画面で「キャンセル」を押した。
  2. `/api/cancel` は `status=cleanup-required`、`secretsDeleted=false`、`grantRevoked=false`、`manualCheckRequired=true` を返した。
  3. 実DOMは「Repository SecretとOAuth grant／tokenを取り消しました」と成功断定した。
- `http://127.0.0.1:18768/`
  - SPACE 0件かつ同じcleanup失敗状態でも「作成済みRepository SecretとOAuth grant／tokenは取り消しました」と成功断定した。

### スクリーンショット

- `docs/evidence/sprint-019/evaluator/google-chat-desktop-prepare.png`
- `docs/evidence/sprint-019/evaluator/google-chat-mobile-prepare.png`
- `docs/evidence/sprint-019/evaluator/chatwork-desktop-prepare.png`
- `docs/evidence/sprint-019/evaluator/google-chat-cleanup-failure-misreported.png`
- `docs/evidence/sprint-019/evaluator/google-chat-zero-space-cleanup-misreported.png`

画像、DOM、feedbackにはOAuth認可URL、callback URL、client ID、client secret、認可コード、access token、refresh tokenを記録していない。

## 受入基準15項目

| # | 判定 | 評価 |
|---:|---|---|
| 1 | PASS | READMEに管理者要件、組織所有Cloud project、Internal、Desktop app、必要API、read-only scope、公式リンク、People API限界が順序どおり存在 |
| 2 | PASS | `/google-chat` と自然文の専用段階ロードをSkill／router／全回帰で確認 |
| 3 | PASS | read-only 3 scopeのみ、PKCE S256＋state、Desktop app、Google公式endpoint allowlistを専用実動作で確認 |
| 4 | PASS | synthetic strict secret/client IDを永続化しない検査が成功。認可URL／callback URLは証跡へ記録していない |
| 5 | **FAIL** | 通常の「Googleで認証する」は `target="_blank"` がないanchor。クリック時に同じタブがGoogleへ遷移する一方、同じページで500ms後に始める `waitForOAuth()` pollingを前提にしている。callbackページも「このタブを閉じて設定画面へ戻る」と表示するため、既定操作では戻るwizardタブが存在せず、SPACE選択へ自動遷移できない |
| 6 | PASS | private repo gate、3 Secret名、`gh secret set` stdin、登録途中rollback、public／remote不明拒否を確認 |
| 7 | PASS | fixtureのSPACEのみ候補、初期選択0、DM/group DM 0、取得時再検証を確認 |
| 8 | **FAIL** | cleanup APIの `cleanup-required` と `manualCheckRequired` をclientが捨て、取消失敗を成功表示する。0 SPACE経路も同じ |
| 9 | **FAIL** | データ取得の0件自体は成功するが、実Git経路は常に存在しない可能性がある `google-chat/history` をpathspecに含める。0件時にcommit前でexit 128となり、「0件を正常完了」が成立しない。既存専用テストは `YASASHII_GOOGLE_CHAT_SKIP_GIT=1` のため未検出 |
| 10 | PASS | Asia/Tokyo日界、thread、発言者fallback、attachment/deletion metadata、同一message再取得、既存投稿保持を確認 |
| 11 | PASS | foundはspace／日付／行、not foundは保存済み範囲に限定。workflow dispatchなし |
| 12 | **FAIL** | 色、サービス名、mobile、44px、overflow、CTA上限はPASS。ただし主要なOAuth操作が同一タブ遷移で完走せず、running wizardの必須フロー全体は不達。Chrome file chooserによる追加操作は環境応答停止で中断したが、生成anchorと遷移契約の矛盾はコード上で確定 |
| 13 | PASS | Sprint 017/018の監査文書を改変せず、旧「Google Chat全体不在」assertを正式追加に合わせて将来化 |
| 14 | PASS | 全offline 310、全online 311が0 FAIL。Chatwork、PJ、更新、MIT、単段クレジット、`forkedFrom`を維持 |
| 15 | PASS | Chatwork／Google ChatのREADME、wizard、初期値、設定、Chatwork Actions例、fixtureが3時間推奨・初期値で一致。旧青primary 0 |

**集計:** PASS 11 / FAIL 4

## バグ一覧

| # | 重要度 | 内容 | 再現手順／該当箇所 |
|---:|---|---|---|
| 1 | Critical | OAuth認証が同じタブで開き、wizard polling元を失う | `google-chat/assets/wizard/app.js:53-56`。通常モードのanchorに `target="_blank"` がなく、callbackの「閉じて戻る」と矛盾 |
| 2 | Major | Secret削除／grant revoke失敗を成功と断定 | `google-chat/assets/wizard/app.js:144-145`。`/api/cancel` のcleanup結果を無視。0件画面もcleanup結果を受け取らない |
| 3 | Major | 初回0件で実Git保存が失敗 | `google-chat/scripts/wizard-server.mjs:149-155,225-226`。存在しない `google-chat/history` pathspecで `git add` がexit 128 |

## Generatorへの修正指示

1. OAuth認証はwizardを残す新しいタブで開始し、元タブだけがstatus pollingを続ける。popup拒否や手動でタブを閉じた場合も、戻れる操作と状態を表示する。callback成功／失敗画面と元wizardの導線を一貫させる。
2. `cancel()` と0 SPACE経路でserverのcleanup結果を必ず分岐表示する。`manualCheckRequired=true`、Secret削除失敗、grant revoke失敗、API通信失敗を成功扱いせず、どこを手動確認するかを表示する。
3. 0件でも履歴directoryまたはGit pathspecを安全に扱い、明示同意後のconfig／state commit・pushが成功するようにする。Git失敗時のtoken破棄と、作成済みファイル／接続状態の扱いも明示する。
4. 独立回帰を追加する。
   - 通常モードでOAuthリンクが別タブを開き、元wizardがconnected→SPACE選択へ進む。
   - cleanup全成功／Secret削除失敗／grant revoke失敗／両失敗／0 SPACE。
   - `YASASHII_GOOGLE_CHAT_SKIP_GIT` を使わない一時local bare remoteで、0件と1件のcommit・pushを確認する。
5. 修正後に専用、全offline、全online、desktop／mobile／200%相当を再評価する。実Google live gateは引き続きSprint 020まで行わない。

## 残課題

- 実Google OAuth/API、実Repository Secret、実remote pushはSprint 020 live gateでのみ評価する。
- 今回の不合格はlive gate不足ではなく、合成・ローカル経路で再現できる `implementation-issue` である。

---

# Sprint 019 Retry 1 再評価結果

**最新判定:** 合格

**評価対象:** Sprint 019 — G9 Google Chat高度接続・初回取得 Retry 1

**対象commit:** `f01df87d073c03ba99fa13b9515786fd7f73d95b`

初回評価で差し戻した3件を独立再評価し、通常OAuthの元wizard保持、cleanupの失敗分岐、初回0件の実Git保存がすべて成立した。受入基準15項目とC1〜C11は全項目が閾値以上であり、Sprint 019 Retry 1を合格とする。

## Retry 1 スコア

| ID | 基準 | スコア | 閾値 | 判定 | 根拠 |
|---|---|---:|---:|---|---|
| C1 | 完成度 | 5/5 | 4 | PASS | 受入基準15/15。初回FAILだった5、8、9、12を実ブラウザとlocal bare remoteで再確認 |
| C2 | 構文・整合 | 5/5 | 5 | PASS | Node構文、manifest、Skill参照、version 0.5.0、migration、共通asset、3時間設定が整合 |
| C3 | 機能の実証 | 5/5 | 4 | PASS | 通常UI、cleanup各分岐、0件／1件のcommit・push、push失敗、保存・検索を実行 |
| C4 | 非エンジニア体験 | 5/5 | 4 | PASS | popup拒否、認証タブ閉鎖、OAuth拒否、cleanup失敗、Git失敗で、起きたことと次の行動を日本語表示 |
| C5 | 安全・規律 | 5/5 | 5 | PASS | 確認前0副作用、strict secret非露出、cleanup失敗の成功断定0、token破棄を確認 |
| C6 | 無回帰 | 5/5 | 5 | PASS | 専用48、wrapper 12、全offline 310、全online 311が0 FAIL |
| C7 | やさしさ | 5/5 | 4 | PASS | 正式名称を保ちながら、管理者確認先と利用者の次の操作を短く案内 |
| C8 | wizard体験・デザイン | 5/5 | 4 | PASS | running UIのdesktop／mobile／200%相当、サービス名、指定色、label、focus規則、44px、overflow、CTA上限を確認 |
| C9 | 配布チャネル非依存 | 5/5 | 5 | PASS | online参照導線、一般利用者向け公開面、MIT、単段クレジット、`forkedFrom`を維持 |
| C10 | 更新の安全性 | 5/5 | 5 | PASS | Sprint 017/018の診断・更新・migration境界を全回帰で維持 |
| C11 | Google Chat境界 | 5/5 | 5 | PASS | Internal／Desktop app、PKCE＋state、read-only 3 scope、SPACE限定、同意後保存、Secret／token境界が成立 |

## Retry 1 実行コマンドと結果

- `bash scripts/sprint-019-regression.sh`
  - 通常sandboxではloopback bindが `EPERM` となり、環境制約として分離した。
  - loopback許可環境で再実行し、`SPRINT019_PASS=48 SPRINT019_FAIL=0`、`SPRINT019_WRAPPER_PASS=12 SPRINT019_WRAPPER_FAIL=0`。
- `bash scripts/regression-check.sh --offline`
  - 独立再実行、exit 0、`PASS=310 FAIL=0`。
- `bash scripts/regression-check.sh --online`
  - 独立再実行、exit 0、`PASS=311 FAIL=0`。GitHub上の `yasashii-harness` はpublic、`fork=false`、manifest／metadata整合。
- `node scripts/sprint-019-browser-check.mjs --cdp <loopback CDP> --google-url <synthetic wizard> --google-normal-url <normal UI fixture> --chatwork-url <Chatwork fixture> --evidence docs/evidence/sprint-019/evaluator-retry1`
  - exit 0。browser error 0、通常OAuth、desktop／mobile／200%相当、Chatwork共通wizardを確認。
- cleanup／callback追加browser検査
  - evaluator専用の一時検査scriptを実行後に削除し、結果だけを `retry1-ui-evidence.json` と画像へ保存。全成功、Secret削除失敗、grant revoke失敗、両失敗、通信失敗、接続前、0 SPACE、OAuth拒否からの元wizard復帰がすべてPASS。
- `git diff --check`、Node構文検査、strict secret形式とclient ID／OAuth URL／callback URLの評価証跡横断検査
  - PASS。Retry 1証跡への該当値0件。

実Google OAuth、Google Chat API、実Repository Secret、実remote pushはSprint 020のexternal live gateであり、この再評価では実行していない。

## Retry 1 最優先3項目

### 1. 通常OAuthの別タブと元wizard保持 — PASS

- 通常表示fixtureの `http://127.0.0.1:18769/` で認証操作を行った。
- 元wizardは同じURLとDOMに残り、`window.open` は1回、target nameは `yasashii-google-chat-oauth`。見出しは「別タブでGoogle認証を確認しています。」となり、元画面のstatus pollingが継続した。
- 認証タブを手動で閉じると「認証タブが閉じられました」と表示し、再オープン操作を残した。
- popup拒否では「認証タブを開けませんでした」「ポップアップを許可」と表示し、元wizardを失わず再試行できた。
- 合成成功後は元wizardが自動的に通常スペース選択へ進んだ。OAuth拒否のcallback失敗fixtureでは元wizardが「Google認証を完了できませんでした」へ戻り、拒否時は変更されないことと再試行操作を表示した。
- 認可URL、callback URL、client ID、認可コード、tokenはfeedback・画像・JSON証跡へ記録していない。

### 2. cleanup分岐と0 SPACE — PASS

| 条件 | API状態 | running UIの結果 |
|---|---|---|
| 全成功 | `cancelled` | Repository Secret削除とgrant／token取消を完了したと表示 |
| Secret削除失敗 | `cleanup-required` | GitHub `Settings → Secrets and variables → Actions` の手動確認を表示 |
| grant revoke失敗 | `cleanup-required` | Googleのアプリ権限ページの手動確認を表示 |
| 両失敗 | `cleanup-required` | GitHubとGoogleの両方を手動確認するよう表示 |
| 通信失敗 | client側catch | 自動取消結果を確認できないとし、両方の手動確認を表示 |
| 接続前 | `cancelled` | 設定や認証情報を変更していないと表示 |
| 0 SPACE＋grant失敗 | `cleanup-required` | 0件を正常状態として示し、grant取消未完了だけを手動確認へ残す |

失敗ケースのstatus文は `role=alert`、成功／接続前は `role=status`。cleanup失敗を成功と断定する表示は0件だった。

### 3. `YASASHII_GOOGLE_CHAT_SKIP_GIT` なしの初回保存 — PASS

- 専用回帰が毎回新しい一時local repoとbare remoteを作成して実行した。
- 0件: 初期commitに続く2件目のcommitとしてconfig／stateをremoteへpushし、存在しないhistory pathを `git add` しなかった。
- 1件: config／state／historyを2件目のcommitとしてremoteへpushした。
- 確認前: `commitPushConsent=false` はHTTP 400で拒否し、`google-chat/`、commit、pushは0件。
- push失敗: `tokenDiscarded=true`、`savedLocally=true`、`committed=true`、`pushed=false`、接続状態 `save-failed`。running UIも「ローカルcommitまでは完了、push未完了」「token破棄済み」を別々に表示する実装を確認した。

## Retry 1 browser証跡

- `docs/evidence/sprint-019/evaluator-retry1/browser-evidence.json`
- `docs/evidence/sprint-019/evaluator-retry1/retry1-ui-evidence.json`
- `docs/evidence/sprint-019/evaluator-retry1/google-chat-desktop-spaces.png`
- `docs/evidence/sprint-019/evaluator-retry1/google-chat-mobile.png`
- `docs/evidence/sprint-019/evaluator-retry1/google-chat-zoom200.png`
- `docs/evidence/sprint-019/evaluator-retry1/google-chat-normal-oauth-popup-blocked.png`
- `docs/evidence/sprint-019/evaluator-retry1/chatwork-desktop-3h.png`
- `docs/evidence/sprint-019/evaluator-retry1/cleanup-both-failure.png`
- `docs/evidence/sprint-019/evaluator-retry1/cleanup-network-failure.png`
- `docs/evidence/sprint-019/evaluator-retry1/zero-space-cleanup-failure.png`
- `docs/evidence/sprint-019/evaluator-retry1/callback-failure-return.png`

観測値:

- Google Chat: accessible name／可視文言は「Google Chatの設定」、primary `rgb(17, 187, 98)`、前景 `rgb(0, 0, 0)`、旧青0。
- Chatwork: accessible name／可視文言は「Chatworkの設定」、primary `rgb(240, 55, 71)`、前景 `rgb(0, 0, 0)`、旧青0。
- 両サービスで3時間が「おすすめ・初期値」。Google Chatは初期選択0件、確認前2同意とも未選択、確定CTA disabled。
- mobile 390pxは横overflowなし、CTA縦積み、button 44px以上、input labelあり。200%相当も横overflowなし、操作欠落なし。
- 共通 `index.html`、`style.css`、`common.js` と共通shellを両サービスが使用。browser error 0。

## Retry 1 受入基準15項目

| # | 判定 | 再評価結果 |
|---:|---|---|
| 1 | PASS | READMEの管理者要件、組織所有Cloud project、Internal、Desktop app、必要API、公式リンク、People API限界が順序どおり |
| 2 | PASS | `/google-chat` と自然文の段階ロード、既存routerの薄さを全回帰で確認 |
| 3 | PASS | read-only 3 scope、PKCE S256＋state、Desktop app、Google公式endpoint allowlistを確認 |
| 4 | PASS | strict secretとclient IDの永続物・DOM・評価証跡0件。認可URL／callback URLも記録0件 |
| 5 | PASS | 別タブOAuth、元wizard polling、手動閉じ、popup拒否、成功→SPACE、拒否→失敗画面への復帰が成立 |
| 6 | PASS | private repo gate、3 Secret名、stdin直接登録、登録途中rollback、public／remote不明拒否を確認 |
| 7 | PASS | SPACEだけを候補・取得し、初期選択0、DM／group DM 0、実行時再検証を確認 |
| 8 | PASS | 確認前0副作用、cleanup 7状態の正直な表示、OAuth後取消、保存・commit・pushの専用同意が成立 |
| 9 | PASS | 0件／1件／複数page／部分失敗、token破棄、workflow dispatch 0、local bare remoteの実Git保存を確認 |
| 10 | PASS | Asia/Tokyo日界、thread、発言者fallback、attachment／deletion metadata、再取得の重複・消失0件 |
| 11 | PASS | foundはspace／日付／行、not foundは保存済み範囲に限定し、workflow dispatch 0 |
| 12 | PASS | desktop／mobile／200%相当、共通shell、サービス名、label、focus、44px、overflow、CTA最大2、指定色を確認 |
| 13 | PASS | Sprint 017/018監査文書を改変せず、旧全体不在assertを正式追加に合わせて将来化 |
| 14 | PASS | 専用、全offline、全onlineが0 FAIL。Chatwork、PJ、更新、MIT、単段クレジット、`forkedFrom`を維持 |
| 15 | PASS | README、wizard、初期値、設定、Chatwork Actions例、fixtureで両サービスの3時間推奨・初期値が一致 |

**集計:** PASS 15 / FAIL 0

## Retry 1 バグ一覧

なし。

## 残課題

- Sprint 019の範囲に実装不具合は残っていない。
- 実Google OAuth／API、実Repository Secret、3時間schedule相当のworkflow、実remote push／pull、検索、OAuth revoke後始末はSprint 020のexternal live gateで評価する。Sprint 019の合否へは読み替えない。
