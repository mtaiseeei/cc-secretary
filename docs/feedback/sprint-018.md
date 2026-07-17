# Sprint 018 評価結果

**判定:** 合格  
**失敗分類:** なし  
**評価対象:** Sprint 018 — G8後半 確認後だけ行う安全な更新  
**契約種別:** `Type: main`  
**評価実装:** `00cbbd0`（`[sprint-018] 確認後だけ行う安全な更新を実装`）

Sprint 017の読み取り専用診断から、別ターンの明示了承、pushしない保護commit、plugin更新、
`/reload-plugins` 後の再開、migrationのdry-runと本実行、更新後検証、rollbackまでを独立に操作した。
実ユーザーworkspace、実installed plugin、実remoteは変更せず、一時Git repo、local bare remote、
固定引数を記録する `claude-fixture` adapterだけを使用した。

受入基準14件はすべて成立した。C2・C5・C6・C9・C10のゼロ許容基準はすべて5/5である。

## スコア

| 基準 | スコア | 閾値 | 判定 | 根拠 |
|---|---:|---:|---|---|
| C1 完成度 | 5/5 | 4 | PASS | 受入基準14/14。診断から保護、更新、reload後再開、移行、検証、復元まで実物で確認 |
| C2 構文・整合 | 5/5 | **5** | PASS | version 3面、migration manifest、plan hash、台帳4field、公式pluginコマンドとscopeが整合 |
| C3 機能の実証 | 5/5 | 4 | PASS | 一時workspaceでclean、customized、unknown、0.2.0、失敗、再開、rollbackを操作 |
| C4 非エンジニア体験 | 5/5 | 4 | PASS | 変更・影響・対象・保護・pushなし・戻し方を先に示し、停止理由と次の操作も日本語で分かる |
| C5 安全・規律 | 5/5 | **5** | PASS | 了承前0変更、secret非露出、管理対象限定、実環境変更0、push／remote変更0 |
| C6 無回帰 | 5/5 | **5** | PASS | Sprint 018専用41/41、全offline 308/308、全online 309/309 |
| C7 やさしさ | 5/5 | 4 | PASS | 正式コマンド名を保ちつつ、現状維持の既定、reload理由、失敗時の次の操作を平易に案内 |
| C8 wizard体験・デザイン | N/A | 4 | 対象外 | Sprint 018は対話とCLIだけで新規UIなし。既存wizardは全回帰のrunning loopback DOM検査を維持 |
| C9 配布チャネル非依存 | 5/5 | **5** | PASS | 現行87対象で旧固有表現0件。MIT、単段クレジット、`forkedFrom`、一般利用導線を維持 |
| C10 更新の安全性 | 5/5 | **5** | PASS | 明示了承、保護commit、個別選択、secret非保存、dry-run一致、冪等migration、検証、rollbackが成立 |

## PASS / FAIL集計

- 受入基準: **PASS=14 / FAIL=0**
- Sprint 018専用回帰: **PASS=41 / FAIL=0**
- Sprint 017回帰: **PASS=32 / FAIL=0**
- release整合: **PASS**
- serializer: **surfaces=19 / conflicts=0**
- Sprint 016回帰: **PASS=2 / FAIL=0**
- 全offline回帰: **PASS=308 / FAIL=0**
- 全online回帰: **PASS=309 / FAIL=0**
- 独自一時Git repo検査: **8シナリオ、PASS**
- 独自secret／私的本文検査: **2シナリオ、PASS**
- 既知の製品失敗: **0件**

## 実行コマンドと結果

### 1. Sprint 018専用回帰

```bash
bash scripts/sprint-018-regression.sh
```

- exit 0、`SPRINT018_PASS=41 SPRINT018_FAIL=0`。
- 了承前0変更、保護commit、pluginコマンド順序、reload前migration 0件、dry-run、plan hash、
  customized／unknownの現状維持、secret拒否、途中再開、検証失敗、rollback、push禁止を確認した。

### 2. 直前Sprint・release・配布面

```bash
bash scripts/sprint-017-regression.sh
python3 scripts/check-release-integrity.py
python3 scripts/check-report-schema.py --plugin-root plugins/yasashii-secretary
bash scripts/sprint-016-regression.sh
```

- Sprint 017: exit 0、`PASS=32 FAIL=0`。
- release整合: exit 0、`PASS release integrity: manifests and CHANGELOG are consistent`。
- serializer: exit 0、`surfaces=19 conflicts=0`。
- Sprint 016: exit 0、`SPRINT016_PASS=2 SPRINT016_FAIL=0`。

### 3. 全offline回帰

```bash
bash scripts/regression-check.sh --offline
```

- sandbox内の初回は `PASS=306 FAIL=2`。失敗2件は既存Sprint 013／014のlocalhost serverが
  `127.0.0.1` へbindする際の `listen EPERM` だけだった。
- loopback許可環境で再実行し、Sprint 013は `PASS=33 FAIL=0`、Sprint 014は
  `PASS=41 FAIL=0`。Sprint 014が内包するsynthetic fixtureも `PASS=59 FAIL=0`。
- したがって同一suiteの最終結果は exit 0、`PASS=308 FAIL=0`。
- sandboxの権限制限と製品失敗を分離し、EPERMを既知失敗として残していない。

### 4. 全online回帰

```bash
bash scripts/regression-check.sh --online
bash scripts/check-yasashii-harness-online.sh
```

- offlineと同一の308件にonline実在検査1件を加え、`PASS=309 FAIL=0`。
- 単独のonline検査は exit 0。

```text
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
```

### 5. Claude Codeの現行CLI確認

```bash
claude --version
claude plugin update --help
claude plugin marketplace update --help
```

- Claude Code `2.1.211`。
- `claude plugin update <plugin> --scope <scope>` は `user`、`project`、`local`、`managed`を受ける。
- `claude plugin marketplace update [name]` は指定marketplaceを更新する。
- 実装がfixtureへ渡した順序は次の2件だけで、`shell: false` の固定引数だった。

```text
plugin marketplace update yasashii-secretary
plugin update yasashii-secretary@yasashii-secretary --scope user
```

### 6. 構文と差分

```bash
node --check plugins/yasashii-secretary/scripts/update-apply.mjs
git diff --check
```

- どちらもexit 0。

## 独自の一時Git repo検査

EvaluatorがGeneratorの集計を流用せず、次の構成を一時ディレクトリ内に作った。

- version `0.3.0` のcurrent plugin fixture
- version `0.4.0` の評価対象plugin
- `secretary/`、記憶、preferences、一般PJ、成果物、Chatwork、`.claude/settings.json`を持つworkspace
- 初期状態だけをpushしたlocal bare remote
- 実pluginを更新せず固定引数だけ記録する `claude-fixture`

観測結果は次のとおり。

```text
INDEPENDENT_EVAL_PASS scenarios=cancel,protect,command-order,dry-run,plan-mismatch,apply,protected-surfaces,rollback
commit_delta=1 commit_changed_paths=0 push_after_setup=0 remote_config_changes=0
plugin_commands=marketplace-update->plugin-update scope=user reload-gate=required
protected_surfaces=memory,preferences,project,deliverable,chatwork,settings plugin_restored=false-manual-step-shown
```

- `cancel` はplugin、workspace、`.git`を含む全snapshotが一致し、adapter呼出し0件。
- 明示了承後は保護commitがちょうど1件増えた。空commitなので変更pathは0件だが、更新前treeを復元地点として保持した。
- pluginコマンド後、reload前のworkspace migrationは0件。
- dry-runではworkspaceの全file hashが一致した。
- plan hash不一致は非ゼロで拒否し、workspace変更0件。
- apply後、記憶、preferences、一般PJ、成果物、Chatwork、settingsのhashはすべて一致した。
- 初期push後から評価終了までbare remoteのrefsとworkspaceのremote設定は一致し、追加push 0件、remote変更0件。
- rollback後はworkspace全file hashが更新前と一致した。pluginは未復元であることと確認手順を正確に表示した。

## secret・私的本文の独自検査

synthetic値を使い、Generatorの専用回帰より広い保存面を確認した。

```text
SECRET_PRIVACY_EVAL_PASS rejected_secret_state=absent commit_delta=0 output_exposure=0 log_exposure=0
private_body_exposure=0 surfaces=stdout,stderr,ledger,session,protection-commit-patch
```

- tracked fileにsynthetic `access_token` を入れた場合、保護commit前に拒否した。
- 拒否後のHEADは一致し、session file、台帳、plugin adapter logは作られなかった。
- synthetic値はstdout、stderr、Git commit message、plugin logへ0件。
- customized fileの私的本文は、stdout、stderr、台帳、`.git`内session、保護commitのpatchへ0件。
- sessionが保持するのはversion、hash、path、選択、段階だけで、本文や資格情報を保持しない。

## plugin失敗・reload・migration

- `claude-fixture` でplugin updateを失敗させると、保護commitだけが残り、workspace migrationは0件。
- `retry-plugin` は同じ保護commitを使い、commitを増やさない。
- plugin更新成功後もphaseは `awaiting-reload` で止まり、管理対象fileは不変。
- `/reload-plugins` 後を模擬した `resume` は、渡されたplugin rootのversionが予定版 `0.4.0` と一致する場合だけdry-runへ進む。
- version不一致、plan hash不一致、dry-run後のfile hash変更はすべて本実行前に拒否する。
- dry-runとapplyは同じplanを使い、対象pathとactionが一致する。
- 途中停止後は保存済みplanから再開し、markerによりsectionを重複追記しない。
- 完了済みsessionの再実行は `migrationCount: 0` で追加変更0件。

## 台帳なし0.2.0 bootstrap

- 既知の0.2.0基準hashと一致する `secretary/AGENTS.md` と `secretary/CLAUDE.md` だけを
  `unchanged` と判定した。
- 基準一致を証明できないfileは `unknown-baseline` とし、無応答では現状維持。
- bootstrap台帳は確認済み2件だけで、各recordは次の4fieldだけ。

```text
path
installedVersion
baselineHash
templateVariables
```

- 本文、差分、記憶、会話、Chatwork本文、token、password、secret、資格情報は保存しない。

## 更新後検証とrollback

- 更新後検証はplugin version、台帳、個別選択、migration marker、update skill、秘書、記憶、settings、
  Chatwork、一般PJ、buildを確認する。
- 検証fixtureを1件失敗させるとexit非ゼロで「更新後の検証に失敗しました」となり、成功報告を出さない。
- 続けてrollbackを実行すると、管理対象と台帳が保護commitの状態へ戻り、記憶、PJ、Chatwork、settings、成果物は不変。
- `git reset --hard`、push、force push、remote変更は使わない。
- plugin旧版は公式CLIだけで自動復元できないため、`pluginRestored: false` と未復元項目、
  `/plugin` → `Installed` で確認する手順を表示する。自動復元済みとは報告しない。

## Claude Code公式資料との照合

2026-07-17に一次資料を確認した。

- [Plugins reference — CLI commands and version management](https://code.claude.com/docs/en/plugins-reference)
  - `claude plugin update <plugin> --scope <scope>` とscopeを定義している。
  - pluginのversionを更新可否のcache keyとして扱い、同じversionなら更新をskipする。
- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)
  - marketplace更新、plugin更新、更新後の `/reload-plugins`、Installed／Marketplaces画面を説明している。
- [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
  - pluginがversion別cacheへコピーされること、`plugin.json` のversionがmarketplace entryより優先されること、
    同じversion文字列では更新をskipすることを説明している。

実装のmarketplace更新→plugin更新→reload案内→新version確認の順序は公式仕様と一致する。
実installed pluginは評価中に更新していない。

## version対応

| 配布面 | 観測値 | 判定 |
|---|---|---|
| `.claude-plugin/marketplace.json` | `0.4.0` | PASS |
| `plugins/yasashii-secretary/.claude-plugin/plugin.json` | `0.4.0` | PASS |
| `plugins/yasashii-secretary/CHANGELOG.md` 最新見出し | `0.4.0` | PASS |

## 受入基準の判定

1. 開始前説明と明示確認: **PASS**
2. 安全な保護commit: **PASS**
3. customized個別選択: **PASS**
4. secret非露出: **PASS**
5. plugin更新境界: **PASS**
6. reload／restartと再開: **PASS**
7. dry-run一致: **PASS**
8. 冪等migration: **PASS**
9. 台帳なし0.2.0 bootstrap: **PASS**
10. 更新後検証: **PASS**
11. rollback: **PASS**
12. push 0件: **PASS**
13. 既存境界と全回帰: **PASS**
14. Google Chat漏出0件: **PASS**

## UI・画像証跡の扱い

Sprint 018が追加したのは対話規律とCLIで、常設画面、HTML、responsive UI、視覚デザイン変更はない。
そのため画像・browser screenshotは評価対象外とした。代替証跡として、通常表示のCLI、JSON出力、
前後snapshot、Git refs、plugin adapter log、loopback上の既存wizard回帰を記録した。
既存Chatwork wizardは変更されておらず、全offline／online回帰でrunning DOMとloopback serverの動作を維持している。

## 既存境界と公開面

- 現行対象87件で旧配布チャネル固有表現0件。
- README、公開guide、配布pluginの利用者向け出力に内部呼称「Sprint 018」0件。
- MIT License、Shin-sibainu/cc-companyへの単段クレジット、`forkedFrom`を維持。
- 記憶保護、single private workspace、Chatwork、一般PJ、別repo開発PJ、buildを全回帰で維持。
- Google Chatのskill、script、manifest、wizard、案内追加0件。
- OAuthの既存記述はGoogle／Microsoft／Notion公式コネクタの説明だけで、本Sprintの追加やGoogle Chat機能ではない。

## 改善余地

合否を覆す欠陥はない。今後の保守性向上として次の2点を推奨する。

1. `verifyUpdate()` の `push` checkは現在定数 `true` である。実装経路にpushはなく、独立remote snapshotでも0件を確認したが、
   session開始時のremote refsを保存し、検証時に実測比較すると自己診断の根拠がさらに強くなる。
2. 配布skillの標準導線はREADMEの既定installに合わせて `--scope user` を使う。CLI自体は `project`／`local`も受けるため、
   将来それらの導入を公開サポートする場合は、installed scopeを診断して同じscopeを自動選択すると迷いが減る。

## 最終判定

**合格。** 受入基準14/14、Sprint 018専用41/41、全offline 308/308、全online 309/309。
C2・C5・C6・C9・C10はすべて5/5で、実装不具合・仕様不具合・既知失敗はない。
OrchestratorはSprint 018を`done`へ更新できる。
