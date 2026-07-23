# Yasashii Sprint 037 独立評価 — spec-issue解消後Retry

## 判定

- Sprint contract result: **PASS**
- Product candidate result: **PASS**
- Product findings: **0件**
- Verification-infra findings: **0件（合否を妨げる現行finding）**
- 評価基点: Yasashii開始HEAD
  `204d16fc910851e7954effc721d03e3849205a72` と未commitのSprint 037 candidate
- 固定upstream candidate:
  `d9a62755ff78db12c435f225cdd40e95f86a8055`
- 固定upstream tree:
  `9473f36c2d8d19478fd7b01fb3222a435ddd0fa0`

初回評価のMajor findingは解消した。確認済みの呼び方は
`secretary/memory/preferences.md`、`secretary/AGENTS.md`、
`secretary/memory/MEMORY.md` の3つの現役表示へだけ一致して保存される。
journal本文は `設定を変更: 呼び方`、local commit subjectは
`設定を変更（呼び方）` に完全一致し、commit bodyは空である。

独立合成fixtureでは、呼び方の完全値、入力固有断片、JSON／URL escape、
Base64、SHA-256等の値由来表現がjournal、commit subject、commit bodyへ
0件であることを確認した。5つのfailure injectionでも、3正本、journal、
Git HEAD、index、working treeは開始状態へ戻った。

固定Agentic candidate、review済みbase、overlay分類・冪等性、呼び方4経路、
候補探索、利用者中立化、Yasashii固有copy／identity、Sprint 045保護、
改訂済みの増分回帰も合格した。よってSprint 037をPASSとする。

## 初回findingの再確認

### P1 — 呼び方がjournalとcommit messageへ残る

- Classification: `product`
- 初回Severity: Major
- Retry result: **closed**

共通 `owner-name-transaction.mjs` は、AgenticとYasashiiで6,626 bytes、
SHA-256
`f79242124e4cc13152774f0434b504fc5e97f316304e088884b8bbc7b65d8d24`
のbyte一致だった。入力値は3正本の置換と戻り値にだけ渡され、
journalとcommit messageには入力非依存の固定literalが渡る。

独立fixtureの観測結果:

```text
呼び方を含む現役file:
- secretary/AGENTS.md
- secretary/memory/MEMORY.md
- secretary/memory/preferences.md

journal event: - 09:30 [did] 設定を変更: 呼び方
commit subject: 設定を変更（呼び方）
commit body: <empty>
metadata leak: false
working tree after success: clean
```

次の全失敗点で例外と完全rollbackを確認した。

- `before-write-1`
- `before-write-2`
- `before-write-3`
- `before-journal`
- `before-commit`

初回decision、手書き行、MEMORY索引、Sprint 045のopen／closed project行も
維持された。

## upstreamとoverlay

- Agentic checkoutのHEADは完全SHA
  `d9a62755ff78db12c435f225cdd40e95f86a8055` で、working treeはclean。
- commit subjectは
  `[sprint-037-patch-001] 呼び方を履歴メタデータへ再掲しない`。
- AgenticのPatch独立評価はPASS、product finding 0件。
- Agentic treeは
  `9473f36c2d8d19478fd7b01fb3222a435ddd0fa0`。
- Yasashiiの記録baseとtreeは同じ完全SHA。
- 記録treeは654 files:
  common 220、metadata-overlay 6、anchor-overlay 13、
  repo-owned 392、upstream-only 23、未分類0。
- 現行candidateのmanaged pathは239。
- Gitなしの安全な一時複製で `--check`、`--apply`、`--reapply` を実行。
  apply変更0、reapplyの `secondChanged=0`、
  managed digest
  `d95a36040d265361809259803a5914aaff126ce006c9e3f41d30f4eacbd6f7bb`、
  repo-owned digest
  `766d994d8463c1ae3df791a9fc2ffa6212acca5173d0b3ec5ad56bf6e0694012`
  を確認した。
- repository、neutralization commit、release candidate `0.8.0`、
  external gate、origin／upstream／push-disabled契約は維持された。

## スコア

| 基準 | スコア | 閾値 | 判定と根拠 |
|---|---:|---:|---|
| C1 完成度 | 5/5 | 4 | AC1〜15を満たし、初回Majorを直接解消。 |
| C2 構文・整合 | 5/5 | 5 | 専用・overlay・archive・diff checkが合格。 |
| C3 機能の実証 | 5/5 | 4 | 4経路、候補、成功transaction、5 rollbackを実行。 |
| C4 非エンジニア体験 | 5/5 | 4 | 出典・おすすめ・候補なし・保存前確認が明確。 |
| C5 安全・規律 | 5/5 | 5 | 値の履歴metadata再掲0、探索値非保存、外部write 0。 |
| C6 無回帰 | 5/5 | 5 | 改訂契約の因果範囲suiteはすべて0 FAIL。 |
| C7 やさしさ | 5/5 | 4 | 「あなた」を安全な既定とし、候補なしでも戻れる。 |
| C8 wizard体験・デザイン | N/A | 4 | 常駐UI／wizardの変更なし。 |
| C9 配布チャネル非依存 | 5/5 | 5 | scan 258 files、allowlist 37、unexpected 0、負fixture 3/3。 |
| C10 更新の安全性 | 5/5 | 5 | 3正本、journal、commitのatomic transactionとrollback。 |
| C11 Google Chat境界 | 5/5 | 5 | 対象asset差分0、許可されたloopback面で51/51＋wrapper 12/12。 |
| C12 0.8.0配布準備 | 5/5 | 5 | Gitなしarchive 11/11、manifest／validator／CHANGELOG整合。 |
| C13 edition分離・互換 | 5/5 | 5 | 固定SHA、共通byte一致、overlay未分類0、固有面維持。 |
| C14 会話のMarkdown可読性 | 5/5 | 5 | Yasashii固有anchorと会話可読性回帰を維持。 |
| C15 4ホスト正式配布 | 5/5 | 5 | Claude／Codex両manifestと共通Skill参照に差分なし。 |

全対象閾値を満たした。

## Acceptance Criteria

| # | 結果 | 独立確認 |
|---|---|---|
| 1 | PASS | 固定SHA、tree、Agentic Patch PASS、開始baseから12 commits・63 pathsを確認。 |
| 2 | PASS | base／tree同一SHA。654 filesを全分類し、未分類0。隔離check／apply／reapply合格。 |
| 3 | PASS | 共通2 scriptsとonboarding／settingsにClaude Code／Codex共通の4経路が存在。 |
| 4 | PASS | account-name以外でprovider call 0。host-task-context→Git→OS、任意session探索API 0。 |
| 5 | PASS | NFKC、source、出典、おすすめ、Unicode case-fold正負境界を確認。 |
| 6 | PASS | 全除外値、hostname拒否、名前らしいOS値と `J. Smith` の許可を確認。 |
| 7 | PASS | 候補0件、架空値0、別turn確認、訂正／キャンセル／未確認の副作用0。 |
| 8 | PASS | 探索値の永続化処理0。選択・確認済み値だけを保存。 |
| 9 | PASS | 値は3正本だけ。journal／subject固定、body空、値由来metadata 0、5点rollback。 |
| 10 | PASS | scan 258 files、allowlist 37、unexpected 0、負fixture3/3。 |
| 11 | PASS | common transactionはAgenticとbyte／SHA一致。Yasashii identity／manifest／README／repo-owned面を維持。 |
| 12 | PASS | Sprint 045保護6 filesの開始HEAD差分0。open／closed行も維持。 |
| 13 | PASS | 改訂済み増分suiteは下記のとおり。既存digestとsandbox EPERMは非因果と独立確認。 |
| 14 | PASS | progressに変更path、overlay、回帰、baseline、not-run、external write 0を記録。 |
| 15 | PASS | origin／upstreamを照合し、upstream pushは`DISABLED`。remote／cache／workspace／service／release write 0。 |

## 実行証跡

| Command / check | 結果 |
|---|---|
| `node scripts/sprint-037-patch-001-test.mjs` | 5 PASS / 0 FAIL。 |
| `node scripts/sprint-037-test.mjs` | 14 PASS / 0 FAIL。scan 258、unexpected 0、負fixture3/3。 |
| 独立transaction fixture | 値は3正本だけ、metadata leak false、5 rollbackすべてtrue。 |
| `node scripts/sprint-034-test.mjs /Users/taisei/workspace/agentic-secretary` | 11 PASS / 0 FAIL。 |
| `sync-secretary-overlay --check` | PASS、base完全SHA、managed 239、未分類0。 |
| 隔離複製の `--apply`／`--reapply` | changed 0、secondChanged 0、repo-owned digest不変。 |
| `bash scripts/sprint-011-regression.sh` | 69 PASS / 0 FAIL。 |
| `bash scripts/sprint-012-regression.sh` | 38 PASS / 0 FAIL。 |
| `bash scripts/sprint-022-regression.sh` | 69 PASS / 0 FAIL、wrapper 8 / 0。 |
| Gitなし隔離archiveの `archive-release-gate.mjs` | 11 PASS / 0 FAIL。 |
| restricted sandboxのSprint 013／019 | loopback `listen EPERM` だけで失敗。 |
| loopback許可面のSprint 013 | 35 PASS / 0 FAIL、wrapper 33 / 0。 |
| loopback許可面のSprint 019 | 51 PASS / 0 FAIL、wrapper 12 / 0。 |
| `sprint-035-patch-001-regression.sh` | restricted環境で8 PASS / 3 FAIL。下記の非因果3件だけ。 |
| Sprint 045保護6 filesの `git diff HEAD -- ...` | 0 files。 |
| Yasashii identity／manifest／README／LICENSE／mapping | 開始HEAD差分0。 |
| `git diff --check` | PASS。 |

## 非因果baselineとsandbox分類

`sprint-035-patch-001-regression.sh` の3 FAILは、本Sprintに因果のある
製品failureではない。

1. 旧Google Chat wizard digest:
   現行assetと開始HEADはともにSHA-256
   `fcea246dc0b462f79647849bfffef9285d9fe9a1236d9afc264bf84ddc4ba1df`。
   assetの開始HEAD差分は0で、旧fixtureだけが
   `c8d71dac2faca9caad5eaa63b7d63370bc6f368f7bf3dcf7cb5a86c84b2a185f`
   を期待している。
2. Chatwork loopback:
   restricted sandboxでは `listen EPERM 127.0.0.1`。
   loopback許可面では35/35、wrapper 33/33。
3. Google Chat loopback:
   restricted sandboxでは同じ `listen EPERM 127.0.0.1`。
   loopback許可面では51/51、wrapper 12/12。

旧digestは開始HEADから存在する古いfixture不一致、EPERMは実装到達前の
検証環境制約である。どちらも現candidateの新規product findingへ数えない。
既知redのbroad master／online release gateは改訂契約どおり実行していない。

## 残存リスク

- 旧Google Chat wizard digest fixtureは別Sprintで更新しない限り、
  `sprint-035-patch-001-regression.sh` 全体の表示は赤いままである。
  本Sprintの製品動作や同期差分には因果がない。
- installed cacheと既存利用者workspaceへの反映、remote push、releaseは
  本SprintのNon-scopeであり未実施。今回のPASSはlocal source candidateに対する判定である。

## Not Run / 禁止事項

- broad master／online release gate: 既知redかつ改訂契約外のためnot-run。
- 任意の過去会話、別task、raw transcript、生session log、memory store探索: 0件。
- 実Git user.name／実OSユーザー名の証跡保存: 0件。候補検証は合成値のみ。
- 実OAuth、Repository Secret、Actions、外部API、remote fetch／push、release、
  plugin install／update、installed cache、利用者workspace反映: not-run。
- browser screenshot: 常駐UI変更ではなくsafe harbor外のためnot-run。

## Evaluator自己レビュー

- Generatorの自己評価だけでなく、固定commit／tree、Agentic PASS feedback、
  common byte列、隔離overlay check／apply／reapply、独立transaction、
  5 rollback、必須増分suite、開始HEAD差分を確認した。
- 初回Majorは固定文言の完全一致だけでなく、実合成名のfile出現先、
  入力固有断片、escape、Base64、SHA-256を独立検査してclosedとした。
- restricted sandboxのloopback失敗は、許可面で同じwrapperを再実行して
  製品PASSと環境EPERMを分けた。
- 旧digestは開始HEADと現candidateのasset SHA一致、対象差分0を確認して
  非因果とした。
- broadな既知red suiteを新しい合格条件にせず、改訂contractの増分範囲に限定した。
- 実装、spec、contract、progress、stateは編集していない。
  書き込んだ正本は本feedbackだけである。
