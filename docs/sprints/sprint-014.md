# Sprint 014 — G5 運用: 定期同期と確認付き再検索

- Type: main
- 主眼: Chatworkの定期同期、設定変更、見つからない時の確認付きmanual sync→wait→pull→retry、実API評価、配布導線を完成させる。
- 依存: sprint-013 done。single private repo、secret案内、room wizard、初回取得、基本検索が全回帰で保護されていること。

## 外から見える成果

1. wizardで選んだ頻度どおりにGitHub Actionsが動き、同意済みの選択room履歴だけを同じrepoへcommit・pushする。
2. room・頻度を後から安全に変更でき、表示設定と実際のscheduleが一致する。
3. `/chatwork search` で見つからない時、同期するかをユーザーが選び、承認時だけ同期完了後に再検索できる。
4. 失敗、timeout、競合、API制約を区別し、「無い」と誤断定しない。
5. Repository Secretを使う実API経路と、配布後の案内が証跡つきで成立する。

## Retry 1で確定した評価境界

- `yasashii-secretary` はpublic配布repoであり、ChatworkのRepository Secret、同期workflow、room設定、履歴を置かない。
- 実API live gateは、実利用時と同じsingle-repo構成を持つ専用private test workspaceで行う。test workspace内にpluginの利用設定・生成物、秘書、通常project、Chatwork設定・workflow・履歴をまとめ、Chatwork専用repoを作らない。public配布ソース自体の複製は要求しない。
- private test workspace作成、Repository Secret設定、workflow dispatch、remote push、Chatwork API送信はexternal live gateである。ユーザーの各操作への明示許可と、test用token・非機密test roomの準備が揃うまで実行しない。
- 準備不足では実APIを合成fixtureで代替せず、本Sprintを不合格とする。不合格理由は `external-live-gate-unavailable` とし、実装不具合と混同しない。

## スコープ

### A. 定期scheduleと自動push同意

- 30分／1時間／3時間／6時間／12時間は17分起点で実際のscheduleへ反映し、手動のみはscheduleを無効にする。
- schedule有効化前に対象room、頻度、保存内容、自動commit・pushを示して同意を得る。
- 同意なし、privateでない、Secret不在、room未選択ではschedule同期を開始しない。
- 同じrepoの変更と競合した場合は履歴を壊す強制pushをせず、安全に失敗して再試行方法を示す。
- 同一room・message IDの反復取得は重複せず、複数実行が重なっても履歴を欠落・破損させない。

### B. 設定変更

- `/chatwork` からroomと頻度を見直し、変更前後と影響を確認してから反映する。
- room解除は今後の取得停止であり、取得済み履歴を自動削除しない。履歴削除は本sprintの非ゴール。
- 頻度変更は表示、保存設定、scheduleを一度に一致させる。途中失敗は半端な有効状態を残さない。
- 設定変更後の結果stepは、変更後の選択room、頻度、schedule有効／無効を現在状態として表示する。変更前の初回取得結果を再表示しない。
- busy roomの最新100件が覆う時間幅を推奨材料として表示してよいが、ユーザーの選択を上書きしない。

### C. `/chatwork search` の確認付きmanual sync

- 検索は最初にpullし、保存済み履歴を検索する。
- not found時はAskUserQuestionまたはCodexのstructured input等、hostの構造化質問で「同期して再検索（推奨）／同期しない／対象roomを見直す」を提示する。
- 同期承認時だけmanual workflowを開始し、完了待ち、成功確認、pull、同じ条件で再検索する。
- 拒否・room見直し・workflow失敗・timeoutでは、不要なcommit・push・検索断定を行わない。
- 再検索でも見つからない場合、導入前、最新100件、未選択room、keyword差、編集・削除、同期失敗を区別する。

### D. エラー回復と状態表示

- 認証、rate limit、network、GitHub権限、workflow失敗、timeout、git競合、部分room失敗を区別する。
- 生の英語errorだけを返さず、「何が起きたか／現在守られているもの／次に何をするか」を日本語で示す。
- 失敗時に最終成功時刻・取得位置を進めず、前回の履歴を検索可能なまま保つ。
- retryは同じ結果を重複させず、token・本文をログやerrorへ露出しない。

### E. 実API評価と配布仕上げ

- public配布repoではなく、専用private test workspaceのRepository Secretと非機密test roomで、参加room一覧取得、選択roomの同期、同じrepoへのcommit・push、pull後検索を実APIで確認する。
- test workspaceの権限は、非機密test roomの読取・同期と対象private repoのActions実行に必要な範囲へ限定する。
- 証跡はprivate状態、Secret名の存在、workflow run ID／状態、room件数、取得件数、commit hash、push／pull、検索状態に限定する。token値、不要なroom名、本文を記録しない。
- 評価後はschedule停止、Repository Secret削除、test room選択解除を行う。test repo・workflow・履歴の削除／archiveは、対象と影響を示してユーザーが明示確認した場合だけ行う。
- public配布repoにRepository Secret、Chatwork workflow、room設定、履歴が0件であることを確認する。
- READMEと`/chatwork`の導入案内は、private repo作成、Secret登録、wizard、100件制約、頻度、Actions使用量、検索時の手動同期確認を一続きで説明する。
- 配布物だけで導線が完結し、開発用docsや実装repo固有pathへ依存しない。

## スコープ外

- Chatworkへの投稿、編集、削除。
- 100件より前を保証するbackfill。
- Chatwork履歴の自動削除、保持期限、public公開。
- Chatwork以外のサービスへのGitHub Actions同期の一般化。
- 既存remoteへのforce push。
- public配布repoへのRepository Secret、Chatwork workflow、room設定、履歴の配置。
- Chatwork専用のprivate test repo。

## 受入基準

1. **schedule全選択（C2/C3）**: 30分／1h／3h／6h／12hが17分起点で実際のworkflowへ反映され、手動のみでschedule無効。wizard表示・保存設定・workflowの不一致0件。
2. **自動push同意（C5）**: 同意前、public repo、Secret不在、room未選択ではschedule実行・commit・pushが0件。同意後だけ選択roomの変更を同じprivate repoへpushする。
3. **冪等・競合（C3/C5）**: 同一fixtureの反復・重複実行でmessage重複0件。git競合時にforce push・履歴欠落0件で、安全な失敗になる。
4. **設定変更（C1/C3/C5）**: room追加／解除、全頻度変更、キャンセル、途中失敗を検証し、確定後だけ一貫して反映。room解除で既存履歴を削除しない。
5. **not found→拒否（C3/C5）**: pull・検索後に3択質問が出て、「同期しない」でdispatch・commit・pushが0件。
6. **not found→room見直し（C3/C4）**: wizardの選択room確認へ進み、同期や設定変更を無断実行しない。
7. **not found→承認（C3/C5）**: 承認後だけdispatch→wait→success確認→pull→同条件retryの順で実行し、追加メッセージをfoundとして返せる。
8. **同期後not found（C4/C7）**: 導入前／100件／未選択room／keyword／編集・削除／workflow失敗の可能性を区別し、存在しないと断定しない。
9. **失敗・timeout（C3/C5）**: auth／rate limit／network／GitHub権限／workflow failure／timeout／git競合／部分room失敗で、状態位置を誤更新せず、前回履歴を保持し、token非漏洩。
10. **実API（C1/C3/C5）**: ユーザーが明示許可した専用private test workspaceで、Repository Secret経由のroom一覧と非機密test room同期を実行し、同じrepo内のpluginの利用設定・生成物、秘書、project、Chatwork設定／workflow／履歴、workflow成功、commit、push、pull後検索を確認する。Chatwork専用repoとpublic配布repoはlive実行場所にせず、public配布ソース自体の複製も要求しない。合成fixtureで代替しない。
11. **配布導線（C1/C2/C4）**: クリーンな配布fixtureでREADME→`/chatwork`→Secret→wizard→初回／schedule→検索の案内が完結し、dead link・開発path依存0件。
12. **browser再評価（C8）**: 設定変更とerror状態をdesktop／mobileのrunning wizardで操作し、スクリーンショットを残す。sprint-013のdesign・responsive・accessibilityを回帰させない。
13. **全回帰（C6）**: sprint-013までの全回帰＋schedule／manual sync／実API／配布の新規assertが0 FAIL。既知失敗0件。
14. **設定変更結果（C1/C4/C8）**: 既存設定をroom・頻度とも変更した直後の結果stepが、変更後の選択room、頻度、schedule状態を表示する。変更前の初回取得結果を再表示しない。desktop／mobileの実ブラウザと回帰assertで確認する。
15. **external live gateと後始末（C3/C5）**: private test workspace作成、Secret設定、dispatch、push、API送信の前に明示許可とtest用token・非機密test roomの準備を確認する。準備不足は `external-live-gate-unavailable` としてSprint不合格にし、implementation-issueとしない。実行後はschedule停止、Secret削除、test room選択解除を確認する。
16. **live証跡とpublic境界（C2/C5）**: token値、不要なroom名、本文を含まない伏せ字証跡で、private状態、Secret名の存在、workflow状態、件数、commit、push／pull、検索結果を確認できる。public配布repoのSecret、Chatwork workflow、room設定、履歴は0件。

## 評価証跡

- 6頻度の表示値・保存値・実schedule比較と、同意前後のworkflow結果。
- 重複・競合・各failure fixtureの状態差分、token漏洩0件検査。
- 3択それぞれと、承認時のdispatch→wait→pull→retryの順序ログ。
- 実APIのprivate test workspace構成、伏せ字済みroom件数、workflow結果、commit、push／pull後検索、権限確認、schedule停止・Secret削除・test room選択解除。
- 設定変更後の現在room・頻度・schedule状態と、旧初回結果を再表示しないdesktop／mobile証跡。
- clean distribution fixtureの導入結果。
- desktop／mobileの設定変更・error画面スクリーンショット。
- 全回帰のPASS／FAIL集計。

## 参照

- `docs/spec/features.md` F23〜F27
- `docs/spec/constraints.md` public／private境界・external live gate・Chatwork同期・push同意・secret・wizard
- `docs/spec/domain.md` private test workspace・同期間隔・検索状態・手動同期の状態遷移
- `docs/spec/ui.md` 設定変更結果・`/chatwork search`の対話導線
- `docs/spec/rubric.md` C1/C2/C3/C5/C6/C7/C8
