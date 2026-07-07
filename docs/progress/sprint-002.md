# Progress — sprint-002（記憶ケアと自動コミット）

- Phase: P1（秘書コア）
- Status: 差し戻し修正済み・自己検証済み（Evaluator へ再提出）
- 実装者: Generator

## 差し戻し（feedback sprint-002）への対応サマリ

Evaluator 指摘（implementation-issue）は2点。いずれも修正済み。

1. **【ブロッキング C5】決定的シームのスコープ封じ込め欠落**: `memory-tools.sh` の `delete` / `remember-decision` / `guarded-write` がパストラバーサル引数で `secretary/` 外を `rm -rf`／書き込みできた。→ 封じ込めガード `_safe_path`（`..` セグメント拒否＋`cd`/`pwd -P` による正規化＋接頭辞検査。realpath 非依存で可搬）を追加し、破壊的操作・書き込みは**必ず `secretary/memory/` 配下に収まることを実行前に検証**、外なら拒否（exit 3）。`remember-decision` の `date` は `YYYY-MM-DD` 厳密形式のみ許可。ヘルパー冒頭の「外は触らない」宣言と実装を一致させた。
2. **【C3】guarded-write の偽装成功**: 親フォルダが無いパスへの書き込み失敗でも exit 0・「書き込みました」と報告していた。→ 書き込み結果を検証し、親フォルダ無し・書き込み失敗は exit 非ゼロで正直に報告するよう修正。あわせて `guarded-write` の引数を `<secretary> <memory相対パス>`（従来は任意パス）に変更し、封じ込めを自然に強制。

Evaluator の3系統エクスプロイト（`delete ../../X --confirm` / `remember-decision date=../../../ESCAPE` / `guarded-write` 任意パス）を再現し、いずれも**拒否され外部ファイルが無事**であることを手動確認済み（絶対パス指定も封じ込め内に留まる）。正常系（`memory/` 配下サブフォルダへの書き込み・決定記録・確認削除）は維持。

## やったこと（実装サマリ）

秘書の記憶を安全に育て・守り・中断から再開できるようにし、記憶更新の節目で日本語ローカルコミット（push なし）を行う導線を実装した。決定的な部分は LLM 非依存のヘルパーに切り出し、回帰で assert 可能にした。**破壊的操作・書き込みは `secretary/memory/` 配下に封じ込める**。

### 作成・変更ファイル

| ファイル | 役割 | 対応 |
|---|---|---|
| `plugins/cc-secretary/skills/memory-care/SKILL.md`（新規） | 記憶ケアの自然言語入口。記憶追加・保護規則・`_resume.md`・オンデマンド振り返り・節目コミット。`${CLAUDE_PLUGIN_ROOT}` 相対参照 | F05, 受入1,7 |
| `plugins/cc-secretary/skills/memory-care/scripts/memory-tools.sh`（新規） | **決定的シーム**。索引追従・空上書き拒否・削除前ガード・**スコープ封じ込め（`secretary/memory/` 外を拒否）**・しおり読み書き・節目コミット（push/remote なし）を提供 | F05,F07, 受入2〜6,8 |
| `plugins/cc-secretary/skills/secretary/SKILL.md`（変更） | 起動時 `_resume.md` チェックを最優先で追加。記憶ケアのモード判定を `${CLAUDE_PLUGIN_ROOT}` 相対で段階ロード | 受入1,5 |
| `scripts/regression-check.sh`（拡張） | section 2 に memory-care を追加、section 5 に体験チェック追加、section 7（記憶ケア）を新設し封じ込め負テスト・偽装成功テストを追加。57→**98 assert**（sprint-002 で計41件追加: section 7=36 / section 2=2 / section 5=3） | 受入9 |

### 設計の要点

- **決定的シーム（memory-tools.sh）**: 保護規則の発火をスクリプトで assert できるよう、判断を伴わない操作をヘルパー化した。サブコマンド: `reindex` / `remember-decision` / `guarded-write`（空拒否・範囲外拒否）/ `delete`（`--confirm` ガード・範囲外拒否）/ `resume-write|check|read|clear` / `commit`（日本語・push しない）。終了コードで結果を返す（0成功 / 2使い方 / 3保護拒否・封じ込め違反）。同じ入力→同じ結果。
- **スコープ封じ込め（`_safe_path`）**: 破壊的・書き込み操作は必ず「解決後の絶対パスが `secretary/memory/` 配下」であることを実行前に検証する。`..` セグメントを拒否し、`cd`＋`pwd -P` で親フォルダを正規化して接頭辞を照合（`realpath` に依存しないため macOS でも可搬）。`rm -rf` は封じ込め確認が通った後にのみ実行。`date` は `YYYY-MM-DD` 厳密形式のみ。
- **記憶はフラット構造**（`secretary/memory/` 直下の `MEMORY.md` / `decisions/` / `preferences.md` / `_resume.md`）。company の部署制・`.company/`・`case-NNN`・`patterns/` は持ち込まない。
- **MEMORY.md 索引の追従**: `reindex` が「## 記録の目次」見出し以下を、実在する記憶ファイル（preferences＋decisions 昇順）から決定的に再生成。追加で +1、削除で −1。
- **push 禁止**: ヘルパーは `git push` も `git remote add` も一切含まない（静的にも grep で担保）。コミットはローカルのみ。
- **パス参照**: すべて `${CLAUDE_PLUGIN_ROOT}` 相対（patch-001 で確定した規約を踏襲）。

## 回帰チェックの実行方法

```bash
bash scripts/regression-check.sh
```

- **実行結果（自己検証）: PASS=98 / FAIL=0（合格）**。うち section 7（記憶ケア）が 36 件。sprint-002 の追加は計 41 件（section 7=36 / section 2 に memory-care 構文 2 件 / section 5 に体験 3 件）。既存 57 件（sprint-001＋patch-001）は無回帰で全パス。
- section 7 は section 3/4 で実体化・git 初期化済みの一時 `secretary/` に対し memory-tools.sh を実行し、索引追従・空上書き拒否・削除ガード・しおり往復・節目コミットを実挙動（終了コード・ファイル内容・git ログ）で assert する。
- 一時ディレクトリは終了時に削除。`~/workspace/agentic-harness` には一切書き込まない。

## 受入基準への対応（自己評価）

1. **スキル構文**: 満たす。`memory-care` の frontmatter 有効・`name` 一意（secretary/onboarding/memory-care の3つが distinct）。ルーター→memory-care／ヘルパーの参照は `${CLAUDE_PLUGIN_ROOT}` 相対でデッドリンクなし（`.sh` も解決検査対象に追加）。
2. **索引の追従**: 満たす。決定追加で索引 +1、削除で元に戻ることを assert。
3. **空上書き拒否**: 満たす。空・空白のみの `guarded-write` は exit 3 で拒否し、既存内容が cksum 不変で保持されることを assert。非空は成功。親フォルダ無し・書き込み失敗は exit 非ゼロで正直に返す（偽装成功を解消）。
4. **削除前警告**: 満たす。`--confirm` なしの `delete` は exit 3 で中断し「何を消すか」を提示、ファイルは残存。`--confirm` 時のみ削除＋索引追従。削除は封じ込め確認が通った後にのみ `rm -rf` する。
5. **再起動しおり**: 満たす。`_resume.md` の無→書く→有→読める（進行中・次アクション・未確定を復元）→閉じる→無、を assert。ルーターが起動時 `resume-check` で有無を検知する記述を assert。
6. **自動コミット＋push 禁止**: 満たす。記憶更新の節目で日本語メッセージのコミットが増え、リモート未設定・upstream なし（未 push）を assert。ヘルパーに push/remote add が無いことも静的に assert。
7. **非エンジニア体験**: 満たす。memory-care は plain-language を参照。削除警告は日常語で失うものを具体提示（「消すと元に戻せません／本当に消してよいですか」）。しおり提案は「前回の続き」を日常語で。報告3行型の骨子は plain-language に定義。
8. **安全・規律**: 満たす。**破壊的・書き込み操作は `secretary/memory/` 配下に封じ込め**（トラバーサル3系統を負テストで拒否確認）、規律1スコープと整合。harness 非書込・同期層なし・記憶に資格情報の実値なし。単段クレジット・6規律チェックは既存 section で全パス。
9. **無回帰**: 満たす。既存 57 assert 全パス＋新規 32 assert 追加。実行コマンドを本ファイルに記録。

自己採点（rubric 目安）: C1=5 / C2=5 / C3=5 / C4=4〜5 / C5=5 / C6=5。

## Evaluator への検証手順（推奨）

1. 既定: `bash scripts/regression-check.sh` → PASS=98/FAIL=0（section 7 が本スプリントの中核）。
2. **封じ込め（今回の修正の主眼）の再現**: 一時 `secretary/` の2階層上に番兵ファイルを置き、
   - `memory-tools.sh delete <sec> "../../番兵" --confirm` → exit 3・番兵は無事。
   - `memory-tools.sh remember-decision <sec> "../../../ESCAPE" "x"` → exit≠0・外部に書かれない。
   - `printf x | memory-tools.sh guarded-write <sec> "../../OUT.txt"` → exit 3・外部に書かれない（絶対パス指定も封じ込め内）。
   - 正常系（`memory/` 配下サブフォルダ・決定記録・確認削除）は動作継続。
   （section 7 に上記の負テストと guarded-write 偽装成功テストを assert 化済み。）
3. 骨抜きでないことの確認（負テスト・Generator 実測済み）:
   - ヘルパーに `git push` を混入 → 「memory-tools.sh に git push が無い」が FAIL。
   - `guarded-write` の空拒否を無効化 → 「空・空白のみの上書きは拒否」「内容不変」が FAIL。
   - いずれも復元で PASS=98 に戻る。
4. パス解決の両立（patch-001 同様）: `CLAUDE_PLUGIN_ROOT` 明示／未設定（`:-$PLUGIN` フォールバック）どちらでも全緑。
5. 手動でヘルパーを触る場合: 一時 `secretary/` を用意し `memory-tools.sh remember-decision/delete/guarded-write/resume-* /commit` を実行して終了コードとファイルを目視。

## 既知の制約

- 実インストール環境での `/secretary` ライブ実行（しおり検知→記憶ケア段階ロードの対話）は本環境では未実施（rubric 6「未実施の手動確認」）。決定的挙動はヘルパー＋スクリプトで代替検証した。
- 節目コミットの「発火」は本スプリントでは記憶更新導線に接続。成果物作成・案件区切りの発火は sprint-003 以降で同手順を再利用する（契約どおりスコープ外）。
- daily・コネクタ参照・出力規約の実運用はスコープ外（未実装。ルーターは準備中として正直に案内）。
