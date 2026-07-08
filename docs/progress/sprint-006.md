# Progress — sprint-006（公開整備・最終スプリント）

- Phase: P4（公開整備・最終）
- Status: 実装完了・自己検証済み（Evaluator へ引き渡し）
- 実装者: Generator
- 前提: **新機能は追加していない（整備のみ）**。既存スキルの挙動は変えていない。

## やったこと（README・公開ガイド・クレジット最終確認）

public / MIT リリースに向けて、README と公開向け使い方ドキュメントを整え、クレジット・LICENSE を最終確認した。README は実装済みの実態（9スキル・manifest 名）と一致させ、未実装機能を「今できる」と謳っていない。

### 作成・変更ファイル

| ファイル | 役割 |
|---|---|
| `README.md`（新規） | 公開の主入口。二層構成（受講者向け前半→技術者向け後半）。3コマンドインストール（manifest 名と一致）・実装済み9スキルと一致する機能一覧・初回体験の最短導線・設計思想・MIT/単段クレジット・第2期の一般導線 |
| `docs/guide/README.md`（新規） | 公開向けガイドの入口（開発内部 docs と分離する旨を明記） |
| `docs/guide/getting-started.md`（新規） | インストールと初回体験 |
| `docs/guide/features.md`（新規） | 機能の使い方（実スキルと一致） |
| `docs/guide/connectors.md`（新規） | Google/Microsoft/Notion 接続の使い方 |
| `scripts/regression-check.sh`（拡張） | section 9 の DIST に README/guide を追加、section 13（公開整備）を新設。266→**284 assert** |

### 設計の要点

- **実態を正とする**: README の機能一覧は `ls plugins/cc-secretary/skills/`（build/connections/daily/memory-care/onboarding/secretary/setup-google/setup-microsoft/setup-notion）を正とし、全9件を記載。国内チャット（Chatwork/LINE）は「対象外・今後」と明記し現在形で謳わない。Notion は任意と明記。
- **インストール名の一致**: 3コマンドの `cc-secretary` を `plugin.json`/`marketplace.json` の `name` からコピー（`/plugin marketplace add mtaiseeei/cc-secretary` → `/plugin install cc-secretary@cc-secretary` → `/secretary`）。回帰で manifest 名と照合。
- **公開 docs の分離**: 使い方は `docs/guide/`（公開向け）。開発内部の `docs/spec`・`docs/sprints`・`docs/progress`・`docs/feedback` と混在させない。配布プラグイン本体（`plugins/`）に使い方 doc を埋め込まない（薄いまま）。
- **クレジット単段・MIT**: LICENSE は MIT。README・`marketplace.json` の `forkedFrom` に元作者 Shin-sibainu/cc-company（MIT）を明記。中間フォーク inoshinichi/bootcamp-company は必須クレジットに含めない。
- **プライバシー線引き**: 第2期カリキュラムは「目玉として配布」「第1回座学の実況語彙と接続」程度の一般記述のみ。塾の非公開教材・受講者個人情報・メールアドレス等の機微情報は書かない（回帰で不在を grep）。
- **語彙・二層構成**: 改訂 ui.md 準拠（一般技術用語そのまま・OAuth 等のみ初出補足・「家」系メタファーなし）。非エンジニア前半→技術者後半の順。
- **スクショ**: GUI が無い製品のため任意（未添付）。README の正確性はスクショに依存させない（rubric のスクショ必須は本種別に非適用）。

## 回帰チェックの実行方法

```bash
bash scripts/regression-check.sh
```

- **実行結果（自己検証）: PASS=284 / FAIL=0（合格）**。sprint-006 で section 13（公開整備）18 件を追加。既存 266 件は無回帰で全パス。
- フォールバック（`CLAUDE_PLUGIN_ROOT` 未設定）でも全緑。push なし・`git remote` 空。

## 受入基準への対応（自己評価）

1. **インストール手順の正確性**: 満たす。README の3コマンドが `plugin.json`/`marketplace.json` の `name`（cc-secretary）と一致（`/plugin install cc-secretary@cc-secretary`・`/secretary`）を grep 照合。
2. **README とプラグイン実態の整合**: 満たす。実スキル全9件が README に記載され、国内チャットは「対象外」と明記（未実装を現在形で謳わない）。
3. **公開 docs の分離**: 満たす。`docs/guide/` に使い方、開発内部 docs と非混在、プラグイン本体に使い方 doc 埋め込みなしを assert。
4. **クレジット・LICENSE 整合**: 満たす。LICENSE=MIT、README に Shin-sibainu/cc-company・MIT、README/guide に bootcamp-company の必須クレジットなし。
5. **カリキュラム導線の線引き**: 満たす。第2期の一般導線あり、README/guide に機微情報（メールアドレス等）なしを grep で確認。
6. **語彙方針・二層構成**: 満たす。家系メタファーゼロ、非エンジニア前半→技術者後半の順を assert。
7. **安全・規律**: 満たす。harness 非書込・秘密情報を書かない・恒久不変条件は既存 section で全パス。
8. **無回帰**: 満たす。既存 266 全パス＋新規 18。push なし。

自己採点（rubric 目安）: C1=5 / C3=5 / C4=5 / C5=5 / C6=5。

## Evaluator への検証手順（推奨）

1. 既定: `bash scripts/regression-check.sh` → PASS=284/FAIL=0（section 13 が本スプリントの中核）。
2. 骨抜きでないことの確認（負テスト・Generator 実測済み）:
   - README のインストール名を別名に変える → 「plugin 名一致」「マーケットプレイス名一致」が FAIL。
   - README に bootcamp-company を混入 → 「README/guide に中間フォークの必須クレジットが無い」が FAIL。
   - いずれも復元で PASS=284。
3. 実態照合: `ls plugins/cc-secretary/skills/` の全9件が README に載っていること、`plugin.json`/`marketplace.json` の `name` と README のインストールコマンドが一致すること。
4. 分離: `docs/guide/` に使い方があり、`plugins/` に使い方 doc が無いこと。
5. パス解決の両立: `CLAUDE_PLUGIN_ROOT` 明示／未設定どちらでも全緑。

## 既知の制約・スコープ

- スクリーンショットは任意（GUI 無し）。載せる場合は実挙動を反映したもののみ。
- push（リリースタグ・公開操作）はユーザーの明示指示時のみ。本スプリントはドキュメント整備まで。
- 塾の非公開教材・受講者個人情報は public リポジトリに含めない（概要ポインタのみ）。
- 本スプリントは整備のみ。新機能・既存挙動の変更なし。**これで P1〜P4（sprint-001〜006）の主要スコープが出揃う。**
