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
