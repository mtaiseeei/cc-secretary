# Sprint 020 — G9 Google Chat定期運用・実API評価

- Type: main
- 主眼: Sprint 019のOAuth・通常スペース初回取得を、3時間推奨の定期取得、設定変更、確認付き再取得、再認証、専用private test workspaceでの実API評価まで完成させる。
- 依存: sprint-019 done。OAuth秘密非露出、`SPACE`限定、初回取得・基本検索、wizard browser評価が独立評価で成立していること。

## 外から見える成果

1. 利用者は1時間／3時間（おすすめ・初期値）／6時間／12時間／手動のみを選び、実際の自動取得へ反映できる。
2. 同意済みscheduleだけが選択スペースを取得し、同じprivate repoへcommit・pushする。
3. 検索で見つからない時、確認後だけ取得→待機→pull→再検索できる。
4. OAuth失効や管理者ブロックを、API失敗や「履歴がない」と混同せず再認証・管理者確認へ進める。
5. 実Google Chat API経路を、非機密test spaceと伏せ字証跡で検証し、評価後にSecretとscheduleを片付ける。

## スコープ

### A. 定期取得と同意

- 自動取得の選択肢は1時間、3時間（おすすめ・初期値）、6時間、12時間、手動のみ。3時間はChatworkと共通の既定推奨とし、毎時0分を避ける。
- 確定画面で選択space、間隔、保存内容、共同編集者への可視性、GitHub Actions、commit・pushを示し、明示同意後だけscheduleを有効にする。
- 手動のみはschedule無効。表示値、設定値、実際のworkflowを一致させる。

### B. 差分統合・部分失敗

- 新規投稿、thread返信、その取得実行でAPIが返した範囲の編集・削除状態をmessage resource name単位で統合する。`createTime` に基づく差分範囲より古いメッセージの編集・削除が反映されないことを正常仕様として説明する。
- 同じ日への複数回取得、workflow再実行、途中失敗からの再開で重複・既存投稿消失を起こさない。
- space単位に取得位置と成功／失敗を持ち、1space失敗を全成功と報告しない。選択解除は将来取得停止であり、既存履歴削除ではない。
- workflow開始時にも選択済みspace IDの `spaceType=SPACE` を再確認し、直編集された設定にDM／グループDMが含まれても取得しない。

### C. 設定変更

- 選択spaceと間隔をwizardから見直せる。確定前0変更、確定後だけ設定とworkflowへ一貫して反映する。
- 結果画面は変更後の選択space、間隔、schedule有効／無効、直近成功／失敗を現在値として表示し、古い初回結果を再表示しない。

### D. 確認付き再取得と検索

- `/google-chat search` はpull→保存済み検索を先に行う。not found時だけ「取得して再検索／取得しない／対象space見直し」を構造化質問で確認する。
- 承認時だけworkflow dispatch→完了待ち→成功確認→pull→同条件再検索を行う。拒否、キャンセル、失敗、timeoutはrepoを壊さない。
- still not foundでは未選択、保持設定、API取得範囲、keyword、編集・削除、workflow失敗を区別し、存在しないと断定しない。

### E. 再認証と管理者診断

- refresh token失効、同意取消、scope不足、管理者block、Audience不一致、API無効、rate limit、network失敗を区別する。
- 再認証が必要な場合はworkflowを無限再試行せず、Sprint 019のloopbackへ戻す。既存space選択・履歴は保持し、新しいSecret登録成功後だけ接続済みにする。
- 管理者作業が必要な場合は、識別子であるclient IDと必要scope名だけを一時表示する管理者向けチェックリストを出し、厳格secretや本文を含めない。client IDをログ、スクリーンショット、評価証跡、再読込後のDOMへ保存しない。

### F. 実API live gate

- ユーザーが明示許可した場合だけ、組織所有test Cloud project、`Internal` OAuth、専用private test workspace、非機密test spaceを使う。
- OAuth接続、space discovery、選択、初回取得、3時間schedule相当のworkflow、commit、push、pull後検索、再実行の冪等性を実APIで確認する。
- 証跡はprivate状態、Secret名、伏せ字space、件数、workflow状態、commit hash、push／pull、検索状態だけ。OAuth値、space名、本文、発言者名、添付名を残さない。
- 評価後はschedule停止、Google Chat用Secret削除、test space選択解除、Google側OAuth grant／token revokeを確認する。履歴／workspace削除は別の明示確認なしに行わない。

## スコープ外

- External OAuth appのGoogle審査・security assessment、共通callback backend、ワンクリック共通認証。
- DM／グループDM、投稿・編集・削除、reaction操作、添付本文、全space同期。
- Google Workspace Events API等を使うリアルタイム配信。GitHub Actionsの定期取得を正本とする。
- Chatworkの既存設定・保存形式・scheduleの変更。

## 受入基準

1. **間隔とworkflow一致（C2/C3/C11）**: 1h／3h／6h／12h／手動のみで表示・設定・workflowが一致し、3hが推奨・初期値、毎時0分回避、手動のみschedule 0件。Chatwork側も3h推奨・初期値のまま回帰しない。
2. **同意済み自動push（C5/C11）**: 対象、間隔、保存内容、共同編集者への可視性、commit・pushを示した明示同意後だけscheduleが有効。拒否・キャンセルではworkflow／commit／push 0件。
3. **差分の冪等統合（C3/C6/C11）**: 新規、thread、取得範囲内の編集・削除、差分範囲外の古い編集・削除、同日複数回、再実行、途中失敗を検証する。範囲内は反映し、範囲外が反映されない正常仕様を説明でき、message重複、既存投稿消失、添付本文、未選択space取得が0件。
4. **部分失敗（C1/C3）**: 複数spaceの1件失敗で成功／失敗と取得位置を分け、全成功と報告しない。再実行は失敗対象を安全に回復する。
5. **設定変更（C2/C4/C8）**: 確定前0変更、確定後だけspace／間隔／workflowへ反映し、結果画面は現在値を表示する。解除spaceの既存履歴を削除しない。
6. **not found→拒否（C4/C5）**: 取得しない選択でworkflow、commit、push 0件。Google Chatに存在しないと断定しない。
7. **not found→承認（C3/C4/C5）**: dispatch→待機→成功確認→pull→同条件再検索の順を守り、開始前取得、成功未確認pull、timeout黙殺が0件。
8. **再認証（C3/C4/C11）**: token失効、block、scope不足、API無効、rate limit、networkを区別し、reauthorization-neededではworkflow再試行を止める。再認証成功後も既存選択・履歴を保持し、秘密値0件。
9. **browser・accessibility（C4/C8）**: schedule変更、再認証、失敗、timeout、戻る、キャンセルをdesktop／mobile／200%相当で操作し、秘密値のないスクリーンショットを残す。
10. **実API接続（C1/C3/C5/C11）**: 明示許可された組織所有test Cloud project／Internal OAuth／private test workspace／非機密test spaceで、OAuth、discovery、初回取得を実行する。合成fixtureで代替しない。
11. **実Actions・Git・検索（C3/C5/C11）**: 実workflow成功、選択spaceだけの取得、commit、push、pull後search found、再実行時重複0件を伏せ字証跡で確認する。
12. **live秘密非露出（C5/C11）**: OAuth値、不要なspace名、本文、発言者名、添付名がtracked public repo、Action log、feedback、screenshotに0件。public配布repoのGoogle Chat Secret／workflow／設定／履歴0件。
13. **live後始末（C5/C11）**: schedule停止、3つのGoogle Chat Secret削除、test space選択解除、Google OAuth grant／token revokeを確認する。履歴・workspace削除は未確認で行わない。
14. **既存境界と全回帰（C5/C6/C9/C10）**: Chatwork、更新、PJ、build、single private workspace、MIT、単段クレジット、`forkedFrom`、配布チャネル非依存を含む全offline／online回帰が0 FAIL。

## 評価証跡

- 全間隔の表示・設定・workflow比較、同意前後のsnapshot、push有無。
- 新規／thread／編集／削除／同日差分／再実行／部分失敗のデータ回帰。
- 設定変更の現在値、not found拒否／承認、timeout、再認証の模擬会話と実行順。
- desktop／mobile／200%相当のrunning wizard操作とスクリーンショット。
- live gate開始許可、private状態、Secret名だけの存在、伏せ字space、workflow、件数、commit、push／pull、検索、重複0件。
- OAuth値・本文等の非露出横断検査、public配布repoのlive資産0件、後始末結果。
- 全offline／online回帰のPASS／FAIL集計。

## 参照

- `docs/spec/features.md` F34/F35
- `docs/spec/constraints.md` §2、§12
- `docs/spec/domain.md` 実API live gate、Google Chatの取得境界
- `docs/spec/ui.md` Google Chat設定wizard、`/google-chat search`
- `docs/spec/rubric.md` C1〜C11
- Google公式情報は `docs/spec/constraints.md` の2026年7月確認基準
