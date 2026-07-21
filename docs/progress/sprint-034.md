# Sprint 034 — yasashii-secretary下流overlay

**ステータス:** Generator実装・local自己検証完了。fresh独立Evaluator待ち

## 実装結果

`agentic-secretary` の記録済みbase `467043802ea030b67d092d86761caffa84675d61` を
読み取り専用candidateとして使い、`yasashii-secretary` の差分を宣言的overlayへ整理した。
remote追加・変更、fetch、push URL変更、GitHub API／Web参照、push、公開は行っていない。

### 1. 上流baseと分類

- `secretary-overlay/upstream-base.json` に上流repository、base commit、neutralization commit、
  release candidate `0.8.0`、external live gateを固定した。
- `secretary-overlay/upstream-tree.json` に上流605 fileのpath、SHA-256、分類を記録した。
- 分類はcommon 203、metadata overlay 4、anchor overlay 11、repo-owned 361、upstream-only 26。
- README、LICENSE、`docs/`、`.harness/`、release validatorはrepo-ownedとし、同期で書き換えない。
- agentic固有style／copy、4 host adapter、Agentic回帰はupstream-onlyとし、下流へ混入させない。

### 2. 冪等なoffline overlay

- `scripts/sync-secretary-overlay.mjs` に `--check`、`--apply`、`--reapply`、`--record` を実装した。
- commonはbyte単位、metadataはJSON Pointerのfield allowlist、Markdown／script差分はexact anchorで適用する。
- 未分類追加、上流削除、anchor 0件／複数件、metadata allowlist外差分、upstream advanceを停止する。
- 二回目のapplyは `secondChanged=0`。managed digestは
  `49b927952a917b2197dabcd57ad1539c4c2c60e5635a2e40d1453cbfa068a47f`。
- repo-owned digestをapply前後で比較し、一致を確認した。digest値はprogress自身を含むため、
  自己参照になる固定値を本fileへ埋め込まず、各 `--check`／`--reapply` の出力へ記録する。

### 3. 共通安全修正の取り込み

上流baseから、edition guard、path guard、safe Git、更新診断、memory resume、Chatwork／Google Chat
wizard server、会話validator等の共通修正を取り込んだ。wizardのDOM／copy／OAuth／sync assetは
agentic candidateとbyte単位一致を維持した。

共通testがactive editionをmanifestから解決する変更へ追従し、yasashii側の回帰assertionも
固定文言ではなくactive copyを検査するようにした。`/tmp` が `/private/tmp` へ解決される環境でも、
公開0.7.0の履歴gateがNode CLIを正しく起動するようhistorical archive rootをrealpath化した。

### 4. yasashii固有の設定表示

設定確認と更新結果を `key=value` の1行からMarkdown箇条書きへ変更した。

- 日本語の項目名を先に表示する。
- 正式keyは `<セクション>.<キー>` と `言葉遣い.報告の詳しさ` 等の形で参照できる。
- 設定値とSecret実値は会話、journal、commit messageへ再掲しない。
- agentic candidateの `<変更項目>=<値>` は変更せず、yasashii anchor内だけに差分を閉じた。

### 5. README、mapping、クレジット

- READMEと `docs/yasashii-upstream-mapping.md` に別repo、fetch専用契約、所有境界を記載した。
- 両editionはMIT。`forkedFrom` とLICENSEはShin-sibainu/cc-companyへの単段creditを維持し、
  agentic repoを追加の必須creditにはしていない。

## 主な変更file

- `secretary-overlay/{upstream-base,upstream-tree,mapping,anchors,metadata-overrides,downstream-owned,downstream-files}.json`
- `scripts/sync-secretary-overlay.mjs`
- `scripts/sprint-034-test.mjs`
- `docs/yasashii-upstream-mapping.md`
- `plugins/secretary/skills/settings/SKILL.md`
- `plugins/secretary/rules/styles/yasashii.md`
- 共通baseから同期した `plugins/secretary/rules/`、`scripts/lib/`、wizard server、更新安全処理
- README

## 自動テスト結果

| 検査 | コマンド | 最終結果 |
|---|---|---:|
| overlay exact check | `node scripts/sync-secretary-overlay.mjs --check --candidate /Users/taisei/workspace/agentic-secretary` | PASS、managed 218 |
| overlay二回適用 | `node scripts/sync-secretary-overlay.mjs --reapply --candidate /Users/taisei/workspace/agentic-secretary` | PASS、secondChanged 0 |
| Sprint 034専用・負テスト | `node scripts/sprint-034-test.mjs /Users/taisei/workspace/agentic-secretary` | 11 PASS / 0 FAIL |
| settings／preferences | `bash scripts/sprint-011-regression.sh` | 69 PASS / 0 FAIL |
| 公開0.7.0履歴gate | `bash scripts/sprint-025-regression.sh` | 25 PASS / 0 FAIL |
| yasashii rule／copy | `bash scripts/sprint-029-regression.sh` | 4 PASS / 0 FAIL |
| 反対edition・guard | `TMPDIR=/private/tmp bash scripts/sprint-030-regression.sh` | 7 wrapper PASS / 0 FAIL、内部54 / 0 |
| neutral plugin path | `bash scripts/sprint-031-regression.sh` | 7 PASS / 0 FAIL |
| 新規0.8.0・equal／downgrade | `bash scripts/sprint-032-regression.sh` | 5 PASS / 0 FAIL、内部15 / 0 |
| 会話可読性 | `bash scripts/sprint-032-patch-001-regression.sh` | 7 PASS / 0 FAIL、可読性28 / 0 |
| host-neutral可読性 | `bash scripts/sprint-032-patch-002-regression.sh` | 8 PASS / 0 FAIL、内部32 / 0 |
| wizard copy parity | `bash scripts/sprint-027-regression.sh` | 5 PASS / 0 FAIL |
| serializer schema | `python3 scripts/check-report-schema.py --plugin-root plugins/secretary` | PASS、conflicts 0 |
| release整合 | `python3 scripts/check-release-integrity.py --root .` | PASS |
| Gitなしarchive | `node <archive>/scripts/archive-release-gate.mjs --root <archive>` | 11 PASS / 0 FAIL |
| 構文・差分 | `node --check ...`、`git diff --check` | PASS |

共通masterはlocalhost fixtureを許可した環境で1回実行した。初回結果は `PASS=338 / FAIL=2`。
FAILは実装ではなく、(1) `/tmp` symlink上のhistorical Node CLI起動、(2) 証拠ruleの旧固定文言を期待する
Sprint 029 assertionだった。前者をhistorical rootのrealpath化、後者をactive edition copy検査へ修正し、
失敗した `sprint-025` と `sprint-029` を個別再実行して上表の0 FAILを確認した。
長いmaster全体の再々実行は行っていない。master内のその他31 sectionは同じ実行で0 FAILだった。

## Browser手動確認

localの実wizardを `127.0.0.1` だけで起動し、Browserでdesktopとmobileを確認した。
外部linkの遷移、file選択、設定確定、API、OAuthは実行していない。

- Chatwork desktop／mobile: `Chatworkの接続情報を用意します。`、2 CTA、詳細説明を確認。
- Chatwork mobile: 375×844、横overflowなし、CTAは各335pxで縦積み。
- Google Chat desktop／mobile: 接続用JSONのfile input、非露出説明、disabled CTAを確認。
- Google Chat mobile: 375×844、横overflowなし、password input 0件。
- 両wizard: `yasashii-secretary` identity、local-only表示、4段階進捗を確認。

スクリーンショットはBrowser上で確認したが、GeneratorはEvaluator所有の `docs/evidence/` へ書き込んでいない。
独立Evaluatorが採点時に正式な証跡を保存する。

## 起動・確認方法

常駐アプリはない。repo rootで次を実行する。

```bash
node scripts/sync-secretary-overlay.mjs --check --candidate /Users/taisei/workspace/agentic-secretary
node scripts/sync-secretary-overlay.mjs --reapply --candidate /Users/taisei/workspace/agentic-secretary
node scripts/sprint-034-test.mjs /Users/taisei/workspace/agentic-secretary
TMPDIR=/private/tmp bash scripts/sprint-030-regression.sh
bash scripts/sprint-032-regression.sh
bash scripts/sprint-032-patch-002-regression.sh
```

manual test URLはChatwork `http://127.0.0.1:<port>/`、Google Chat
`http://127.0.0.1:<port>/`。fixture serverが実行時portを表示する。

## 外部live gateと残余リスク

1. 実local remoteは変更していない。`origin`、`upstream` fetch URL、push URL無効化を実remoteで確認する
   gateは `external-live-gate-unavailable`。
2. 実remote gateを行う場合は、対象remoteと変更内容を示して再承認を得た後、origin不変確認、
   upstream fetch URL設定、upstream push無効化、fetch、base確認の順で行う。upstream pushは常に禁止。
3. 公開0.7.0からのstandard live updateは既知blockerがあるため成功扱いしていない。0.8.0新規導入、
   equal／downgradeの副作用0停止だけをlocal回帰で確認した。
4. GitHub repo参照、push、public、release、plugin install、OAuth、Secret操作は0件。

## Evaluatorへの引き渡し

1. 最初にoverlay `--check`、`--reapply`、Sprint 034専用testをfresh実行する。
2. `TMPDIR=/private/tmp` でSprint 030、Sprint 032、会話可読性を再実行する。
3. Gitなしarchiveを作り、release gate 11/0とlegacy／canonical CHANGELOG byte一致を確認する。
4. Chatwork／Google Chatをdesktop／mobileで操作し、DOM、copy、OAuth scope、横overflow、
   `Name`／`Secret`案内のスクリーンショットをEvaluator evidenceへ保存する。
5. external live gateは再承認なしに実行せず、未実行なら `external-live-gate-unavailable` のまま採点する。

## Generator自己評価

local実装とoffline受入基準は満たした。overlayは上流baseの追加／削除／byte変更へfail-closedで、
二回適用しても同じ結果となり、repo-owned docs／evidenceを変更しない。最終完了判定はfresh独立Evaluatorと
Orchestratorへ委ねる。
