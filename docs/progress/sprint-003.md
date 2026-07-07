# Progress — sprint-003（今日やること・出力規約・Google 接続）

- Phase: P1（秘書コア）
- Status: 実装完了・自己検証済み（Evaluator へ引き渡し）
- 実装者: Generator

## やったこと（実装サマリ）

秘書が Google 系の外部データを**根拠つき・都度参照**で扱い、「今日やること」を3行で返し、成果物を出力規約どおりに保存できるようにした。外部データ本文はローカルに保存しない（同期しない不変条件）。決定的な部分（成果物の保存・TODO の根拠付与）はヘルパーに切り出し、コネクタ実接続なしに回帰で検証できる。

### 作成・変更ファイル

| ファイル | 役割 | 対応 |
|---|---|---|
| `plugins/cc-secretary/skills/setup-google/SKILL.md`（新規） | Google 接続ガイド。**公式コネクタ前提**（設定画面から OAuth）。Cloud Console 手作業は案内しない。接続確認テスト・英語エラー言い換え・接続前の `_resume.md` しおり連携 | F09, 受入2,3,8,9 |
| `plugins/cc-secretary/skills/daily/SKILL.md`（新規） | 今日やること。コネクタ都度参照＋ローカル TODO 突き合わせ、各項目に根拠（サービス名＋リンク/ID＋日付）、外部本文の非保存、未接続時 setup-google フォールバック、3行報告 | F06, 受入4,5,6,9 |
| `plugins/cc-secretary/scripts/workspace-tools.sh`（新規） | 決定的シーム。`save-deliverable`（出力規約: `docs/YYYY/MM/YYYY-MM-DD_<title>.md`＋frontmatter＋見出し）、`todo-add`（根拠必須）、`todo-list`。封じ込め共有ガードを適用 | F08, 受入5,7 |
| `plugins/cc-secretary/scripts/lib/path-guard.sh`（新規） | 封じ込めガード（`_realpath`/`_safe_path`）の**共有ライブラリ**。memory-tools.sh と workspace-tools.sh が source し、封じ込め不変条件を単一実装で担保 | 受入10 |
| `plugins/cc-secretary/skills/memory-care/scripts/memory-tools.sh`（変更） | インラインの封じ込めガードを共有ライブラリの source に置換（挙動不変。111 assert で担保） | 受入10,11 |
| `plugins/cc-secretary/skills/secretary/SKILL.md`（変更） | ルーターに3モード（daily / setup-google / 成果物保存）を `${CLAUDE_PLUGIN_ROOT}` 相対で追加。成果物保存の手順（save-deliverable→commit）を明記 | 受入1 |
| `scripts/regression-check.sh`（拡張） | section 2 に setup-google/daily を追加、section 8（sprint-003）を新設。111→**156 assert** | 受入11 |

### 設計の要点

- **公式コネクタ前提**: setup-google は Claude 設定画面の公式コネクタ（OAuth）でつなぐ手順のみ。Cloud Console でのプロジェクト作成・API 有効化・認証情報発行などの手作業は文言に含めない（回帰で不在を grep）。継承したのは診断の型（実エラーで原因確定→日常語案内）と接続確認テストの発想。
- **同期しない不変条件**: daily は外部データを都度参照し、本文をローカルに保存しない。`workspace-tools.sh` も外部本文を保存せず、残すのは成果物と「TODO＋根拠参照」まで。`10_sources` 型の層を作らない。
- **根拠ルールの決定的強制**: `todo-add` は根拠（サービス名＋リンク/ID＋日付）が空だと拒否（exit 3）。daily 文言は「原文にない事実を足さない・矛盾は両方提示」を明示。
- **封じ込めの共有化**: sprint-002 で作った封じ込めガードを共有ライブラリに切り出し、新シーム（workspace-tools.sh）にも同一の不変条件を適用（symlink 越え・エッジ rel・境界外を拒否）。memory-tools.sh もこれを source（挙動不変、既存 111 assert で担保）。
- **再起動しおり連携**: setup-google は接続前に `memory-tools.sh resume-write` で文脈を残し、再開時に続きから案内。
- **語彙方針（改訂 ui.md ／ ユーザー指示）**: 新規文言は一般的技術用語（ディレクトリ・フォルダ・コミット・コネクタ・カレンダー・メール等）をそのまま使い、OAuth のみ初出補足。幼稚なメタファー「秘書の家」は使わない（回帰で不在を grep）。**sprint-003 で触るファイル（ルーター・workspace-tools.sh）に残っていた「秘書の家」は、許可の範囲でその行だけ「秘書ディレクトリ／秘書フォルダ」に直した**。既存の未編集ファイル（onboarding / memory-care / templates）の一掃は sprint-001-patch-002 の担当のため本スプリントでは触れていない。

## 回帰チェックの実行方法

```bash
bash scripts/regression-check.sh
```

- **実行結果（自己検証）: PASS=156 / FAIL=0（合格）**。sprint-003 で計 45 件追加（section 8=41 / section 2 に setup-google・daily の存在・name=4）。既存 111 件（sprint-001〜002＋各 patch）は無回帰で全パス。
- macOS 既定の `/bin/bash` 3.2.57 でヘルパーが動作することを確認（配列非依存で移植的に実装）。
- 一時ディレクトリのみに書き込み、`~/workspace/agentic-harness` には一切触れない。push なし。

## 受入基準への対応（自己評価）

1. **スキル構文**: 満たす。setup-google/daily の frontmatter 有効・`name` 一意（5スキル distinct）。ルーター参照は `${CLAUDE_PLUGIN_ROOT}` 相対でデッドリンクなし（`.sh` 参照も解決）。
2. **公式コネクタ前提**: 満たす。Cloud Console 手作業語（`Cloud Console`/`API を有効`/`認証情報`/`プロジェクト作成`/`gcp-oauth`/`JSON 鍵`）の不在を grep で確認。「設定画面からコネクタ接続」導線と接続確認テスト手順あり。
3. **英語エラーの言い換え**: 満たす。言い換えの型（表）と具体例が文言にある。生英語をそのまま出さない設計。
4. **根拠ルールの雛形**: 満たす。daily に「サービス名＋リンク/ID＋日付」明示、原文にない事実を足さない・矛盾は両方提示。`todo-add` が根拠なしを拒否（決定的）。
5. **同期層を作らない**: 満たす。daily/ヘルパーが外部本文のローカル保存を指示しない。ドライラン（TODO＋ダミー根拠）で残るのは TODO＋根拠参照のみ、`10_sources` 型なし。
6. **未接続フォールバック**: 満たす。daily は未接続でも壊れず setup-google へ案内する導線を持つ（文言・参照で確認）。
7. **出力規約**: 満たす。ドライランで `docs/YYYY/MM/YYYY-MM-DD_<title>.md`・frontmatter（createdAt/tags）・見出し固有名詞・本文保存を assert。保存の節目で日本語コミット、リモート空（push なし）。
8. **再起動しおり連携**: 満たす。setup-google が接続前に `resume-write` する導線を確認（sprint-002 のしおり機構を利用）。
9. **非エンジニア体験（語彙方針）**: 満たす。sprint-003 で新規/変更した文言（setup-google・daily・ルーター・workspace-tools.sh）に「秘書の家」不在を grep で確認。一般語はそのまま・OAuth のみ初出補足・3行型（次に何が起きるか）。plain-language 参照。
10. **安全・規律**: 満たす。harness 非書込・資格情報の非保存（setup-google 明記＋成果物/TODO に実値なし）。封じ込めは新シームにも共有ライブラリで適用（symlink・エッジ・境界外を拒否）。単段クレジット・6規律は既存 section で全パス。
11. **無回帰**: 満たす。既存 111 assert 全パス＋新規 45 件。実行コマンドを本ファイルに記録。

自己採点（rubric 目安）: C1=5 / C2=5 / C3=5 / C4=4〜5 / C5=5 / C6=5。

## Evaluator への検証手順（推奨）

1. 既定: `bash scripts/regression-check.sh` → PASS=156/FAIL=0（section 8 が本スプリントの中核）。
2. 骨抜きでないことの確認（負テスト・Generator 実測済み）:
   - setup-google に `Cloud Console` を混入 → 「手作業手順が無い」が FAIL。
   - `todo-add` の根拠必須を無効化 → 「根拠なし TODO は拒否」が FAIL。
   - いずれも復元で PASS=156 に戻る。
3. 封じ込めが新シームにも効くこと: 一時 `secretary/docs/2026/09` を外部への symlink にすり替え、`save-deliverable <sec> 2026-09-15 侵入` が exit 3・外部不変（section 8 で assert 済み）。
4. パス解決の両立: `CLAUDE_PLUGIN_ROOT` 明示／未設定（`:-$PLUGIN` フォールバック）どちらでも全緑。
5. bash 3.2 互換: `/bin/bash plugins/cc-secretary/scripts/workspace-tools.sh save-deliverable …` が macOS 既定 bash で成功。

## 既知の制約

- 実インストール環境での `/secretary`＋実コネクタのライブ確認は本環境では未実施（rubric 6「未実施の手動確認」）。コネクタ接続なしで検証できるよう、接続導線は文言検査、成果物/TODO は決定的シームのドライランで実挙動検証した。
- ローカル TODO の置き場は `secretary/inbox/todo.md`（最小・コミット対象）。スキーマは作り込んでいない。
- Microsoft / Notion 接続・接続診断は sprint-004（スコープ外・未実装）。ルーターは準備中として正直に案内。
- 既存配布物（onboarding/AGENTS テンプレ・ルーター冒頭）に残る「秘書の家」等の旧語彙の一掃は sprint-001-patch-002 の担当。本スプリントの新規文言のみ改訂語彙に適合させた。
