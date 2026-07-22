# Sprint 035 Patch 002 — Generator Progress

## 実装結果

- Chatwork／Google Chatの共有5 callsiteを `git pull --ff-only --no-rebase` に統一した。
- Agenticと同じ製品引数・実挙動・Patch専用回帰を同期した。4製品fileはAgentic candidateとSHA-256一致。
- `pull.rebase=true` を変更せず、unrelated tracked／untracked／staged差分とindexを保持する。
- rebase、merge commit、force、stash、reset、restore、Git config writeは製品コードへ追加していない。
- Yasashii固有copy／identity、UI、OAuth、Secret、Actions run相関、timeoutは変更していない。

## 変更path

- `plugins/secretary/skills/chatwork/scripts/wizard-server.mjs`
- `plugins/secretary/skills/chatwork/scripts/search-flow.mjs`
- `plugins/secretary/skills/google-chat/scripts/search.mjs`
- `plugins/secretary/skills/google-chat/scripts/search-flow.mjs`
- `scripts/sprint-035-patch-002-git-pull-test.mjs`
- `docs/progress/sprint-035-patch-002.md`

## 全callsite inventory

| # | path | 役割 | 実引数 |
|---|---|---|---|
| 1 | `plugins/secretary/skills/chatwork/scripts/wizard-server.mjs` | Chatwork初回／設定変更後の取得 | `pull --ff-only --no-rebase` |
| 2 | `plugins/secretary/skills/chatwork/scripts/wizard-server.mjs` | Chatworkルーム一覧取得後のpull | `pull --ff-only --no-rebase` |
| 3 | `plugins/secretary/skills/chatwork/scripts/search-flow.mjs` | Chatwork検索前／同期成功後 | `pull --ff-only --no-rebase` |
| 4 | `plugins/secretary/skills/google-chat/scripts/search.mjs` | Google Chat単体検索前 | `pull --ff-only --no-rebase` |
| 5 | `plugins/secretary/skills/google-chat/scripts/search-flow.mjs` | Google Chat検索前／取得成功後 | `pull --ff-only --no-rebase` |

未分類callsiteは0件。

## Patch専用回帰

実行: `node scripts/sprint-035-patch-002-git-pull-test.mjs`

- exit 0、`SPRINT035_PATCH002_CALLSITES=5 SPRINT035_PATCH002_PASS=148 SPRINT035_PATCH002_FAIL=0`
- local bare remote＋cloneで、全5経路のup-to-date／fast-forward／conflicting dirty／divergedを実行。
- local／global相当の `pull.rebase=true`、tracked unstaged、untracked、staged差分を用意した。
- fast-forward時だけHEADがremote commitへ進み、競合／分岐は非成功でHEAD不変。
- unrelated dirty内容、stage状態、index、Git設定snapshotは全fixtureで前後一致。
- merge commit、rebase状態、force、stash、reset、restore、commit、製品Git config writeは0件。
- fixtureとwizard processは終了時にcleanup済み。

## 契約指定の既存回帰

| command | exit | 結果 |
|---|---:|---|
| `node scripts/sprint-014-chatwork-test.mjs` | 0 | 59 PASS / 0 FAIL |
| `node scripts/sprint-019-google-chat-test.mjs` | 0 | 51 PASS / 0 FAIL |
| `node scripts/sprint-020-google-chat-test.mjs` | 0 | 50 PASS / 0 FAIL |
| `node scripts/sprint-022-safety-test.mjs` | 0 | 69 PASS / 0 FAIL |
| `node scripts/sprint-024-data-causality-test.mjs` | 0 | 43 PASS / 0 FAIL |
| `bash scripts/sprint-035-patch-001-regression.sh` | 1 | wrapper 10 PASS / 1 FAIL。既存Sprint 034 overlay baselineで4 finding |
| `git diff --check` | 0 | PASS |

## 既知の問題

- `sprint-035-patch-001` wrapper内のSprint 034 overlay回帰は、記録済みupstream baseと現在candidateが異なること、およびPlannerが変更した `docs/spec/constraints.md` を既存base digestと比較することにより4 findingで停止する。本Patch製品diffとは非因果の verification-infra 候補。契約外のoverlay base／edition surfaceは変更していない。
- 上記1 command以外のPatch専用・Chatwork／Google Chat／timeout／run相関／Secret非露出回帰はすべてgreen。

## 外部操作と安全記録

- 実Chatwork／Google Chat API、OAuth、Repository Secret、GitHub Actions: `not-run`
- external remote write／push／release: `not-run`
- 本番my-vaultと `/Users/taisei/my-vault/vault/.obsidian/workspace.json`: read／write／rename／delete／stage／restore 0件
- 資格情報path、実room／space名・ID、チャット本文: read 0件
- commit: `not-run`。dirty candidateのままEvaluatorへ渡す。

## Evaluator handoff

- UI変更なし。起動URL、browser、screenshotは不要。
- Patch専用148件を先に実行し、実pull引数と4状態のHEAD／dirty／index／Git設定を確認する。
- 近傍回帰を続け、overlay findingは本Patchと非因果かをactual diffで独立評価する。
- Planner／Orchestratorの既存 `docs/spec/constraints.md`、`docs/sprints/state.md`、対象契約差分は保持済み。
