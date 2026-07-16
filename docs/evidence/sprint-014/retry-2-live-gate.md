# Sprint 014 Retry 2 live gate 証跡

**評価日:** 2026-07-17
**評価対象commit:** `bd831af39dddd755852fa97f220745761b1cd060`
**判定:** PASS

この証跡は実Chatwork APIを使った最終確認を、機密情報を残さない形でまとめたものである。実roomは一貫して `selected-test-room` と表記し、room名／room ID、account情報、message ID、本文、検索語、Token値は記録していない。

## 回帰

- Sprint 014専用回帰: `PASS=34 FAIL=0`
- 内包する合成fixture: `PASS=46 FAIL=0`
- offline全体回帰: `PASS=298 FAIL=0`
- online整合確認: `PASS=299 FAIL=0`
- Sprint 013回帰: `PASS=33 FAIL=0`

## 専用private test workspace

- GitHub repository visibility: private
- Repository Secret `CHATWORK_API_TOKEN`: 登録済み。値は取得していない。
- GitHub Actions workflow: 1件、active
- room discovery（discover）run `29535154486`: completed／success
- 初回同期（initial）run `29535300708`: completed／success
- `git pull --ff-only`: `Already up to date.`

同期後の状態を、識別情報を除いて集計した結果は次の通り。

| 項目 | 結果 |
|---|---|
| 選択room数 | 1 (`selected-test-room`) |
| 同期間隔 | `1h` |
| schedule | enabled |
| 自動pushへの同意 | true |
| 同期状態 | success |
| 成功room数 | 1 |
| 取得件数 | 100 |
| 履歴ファイル数 | 1 |
| 保存件数 | 100 |
| 最終成功時刻 | 記録あり |

single-repo構成として、秘書本体、サンプルproject、設定、workflow、履歴が同じprivate workspaceに存在することを確認した。

## Git履歴と検索

worktreeはcleanで、ローカルHEAD、upstream、remoteが一致した。履歴は次の4段階に分かれ、日本語commit messageを持つ。

| 段階 | commit | 確認内容 |
|---|---|---|
| 初期workspace | `6f56bca0f0278336e41fef0cfc18aaeffb1877ad` | 必要なworkspace構成を作成 |
| room discovery | `94aaeae4f2a9bdf9229e2933008451a20587ff2c` | discovery状態を更新 |
| 設定確定 | `99fc67661723f39512eeca046209fae14244b60a` | 設定とworkflowを同じcommitで更新 |
| 同期 | `5fa06366626843d9086f3e5a2c1c9c56ed3c886c` | 同期状態と履歴を更新 |

実装側の `search.mjs` をprivate workspaceへ向け、実メッセージ本文から内部生成した検索語で再検索した。検索語そのものは出力していない。

- 検索実行: true
- status: found
- hit数: 1
- room証跡: あり
- 日付証跡: あり
- 抜粋証跡: あり

これにより、実room一覧取得から1回同期、workflow成功、commit／push、pull後の同条件検索までを一続きで確認した。

## 公開配布元との分離

公開配布元はpublicのままで、次を確認した。

- Repository Secret: 0件
- GitHub Actions workflow: 0件
- repository rootの `chatwork/`: なし
- repository rootの実運用用 `.github/workflows/chatwork-sync.yml`: なし

実Token、実設定、実履歴、実運用workflowは公開配布元へ混入していない。

## Browser証跡

Retry 1のdesktop／mobile／GitHub権限error証跡を再確認した。評価対象commitはRetry 1から変わっておらず、設定変更後に現在値を表示する修正は専用回帰 `PASS=34` と合成fixture `PASS=46` でも保護されている。実room一覧のscreenshotは作成していない。

## 後始末

Evaluatorは外部状態の後始末を行っていない。合格後にOrchestratorが次を実施する。

1. scheduleを停止する。
2. Repository Secret `CHATWORK_API_TOKEN` を削除する。
3. `selected-test-room` の選択を解除する。
