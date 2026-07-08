# Sprint 003 Patch 001 — Codex レビュー指摘対応

- Type: patch（通常）
- Base: 合格済みスプリント群（sprint-001 / 002 / 003 と各 patch）の配布物。外部レビュー（Codex / GPT-5.5 high）の指摘に対応する。
- Phase: P1（秘書コア）の是正
- 主眼: セキュリティ（封じ込め・秘密情報）と破壊防止（再セットアップ）の High 指摘を塞ぎ、Medium/Low の整合不良を是正する。**sprint-004 に入る前に完了させる**。
- 依存: sprint-001〜003（＋ sprint-001-patch-001 / sprint-002-patch-001）。関連: sprint-001-patch-002（文言一掃・合格 done。**finding 7 の `templates/AGENTS.md` 取りこぼしは本パッチに編入**）。

## 背景

ユーザー指示による Codex 外部レビューで、封じ込めの基点 symlink 抜け・再セットアップの破壊リスク・秘密情報の履歴化など複数の指摘が出た。恒久的な安全不変条件は `docs/spec/constraints.md`（プライバシー・安全／構成上の制約）に昇格済み。本パッチはそれを実装に反映する。

## スコープと個別受入基準

各指摘について「再現手順が塞がったことを実挙動で assert」する。証跡は `docs/feedback/sprint-003-patch-001.md` に残す。

### High（必須）

**H1. 封じ込めの基点 symlink 抜け＋しおり系のガード迂回（C5, ゼロ許容）**
- 修正: (a) 境界の基点自体（`secretary/`・`secretary/memory/`）が外向き symlink の場合も拒否する。基点を実解決して境界化するだけの実装をやめる。(b) `resume-write/check/read/clear` と TODO 系・成果物保存を含む**全導線を同一のガード**（`_safe_path` 相当）に通す。(c) `mkdir -p` は**検証の後**に実行し、拒否前に外部へディレクトリ/ファイルを作らない。
- 受入（**回帰の負テストに追加**）:
  - `secretary/memory` を外部ディレクトリへの symlink にした状態で、記憶書き込み・`resume-write`・`resume-clear`・TODO 読み・成果物保存を試みる → すべて `exit 3` で拒否、**外部に `_resume.md` 等が作成・削除されない**。
  - `secretary` 自体が外向き symlink のケースも同様に拒否。
  - 拒否時に外部へディレクトリが `mkdir` されていない（副作用ゼロ）ことを assert。

**H2. 再セットアップ導線の破壊リスク（C5, ゼロ許容）**
- 修正: ルーター/onboarding の「もう一度セットアップ」「作り直したい」等は、既存 `secretary/` を検出したら、テンプレコピー・`git init` に進む前に**バックアップ提案＋明示確認を挟む別フロー**へ分岐する。無確認で上書き・再初期化しない。
- 受入: 既存 `secretary/` があるディレクトリで再セットアップ導線に入ると、確認・バックアップ提案の手順が発火し、確認なしでは既存が上書き/再 init されないことを確認（手順検査＋ドライラン）。

**H3. `git add -A` による秘密情報の履歴化（C5, ゼロ許容）**
- 修正: 自動コミットが無差別に stage しないようにする。commit 前の秘密情報パターン検査で拒否する、または初期 `.gitignore` で除外＋検出時警告（方式は Generator 裁量。「秘密情報が黙ってコミットされない」を満たすこと）。
- 受入: 秘密情報らしきファイル（例: トークンを含むファイル）がワークスペースにある状態で自動コミットを走らせると、そのファイルが**履歴に入らない**（拒否 or 除外＋警告）ことを assert。正常な記憶/成果物のコミットは従来どおり成功。

### Medium

**M4. 配布スクリプトの実行方法不一致（C1, C3）**
- 修正: 同梱スクリプトに executable bit を付与、または SKILL・回帰の双方で `bash "<path>"` 形式に統一（`docs/spec/constraints.md` 構成制約）。
- 受入: SKILL の指示と回帰スクリプトの呼び出し方式が一致し、実インストール相当の配置でスクリプトが起動できることを確認。

**M5. `save-deliverable` / `todo-list` のガード迂回・先行 mkdir（C5, ゼロ許容）**
- 修正: `save-deliverable` は safe check を通してから `mkdir`（symlink なら拒否が先、外部にディレクトリを作らない）。`todo-list` も `_safe_path` を通し、外向き symlink を読めないようにする（H1 と同じガードに統一）。
- 受入: 外向き symlink 環境で `save-deliverable`・`todo-list` が拒否され、外部にディレクトリ作成・外部読み取りが起きないことを assert（負テスト）。

**M6. 配布 SKILL が同梱されない `docs/spec/**` を参照（C1, C4）**
- 修正: onboarding 等の配布 SKILL から `docs/spec/domain.md` 等**開発専用ファイルへの参照を削除**し、必要な要点は同梱 `rules/`（`${CLAUDE_PLUGIN_ROOT}` 配下）へ移設（`docs/spec/constraints.md` 構成制約）。
- 受入: 配布物（`plugins/**`）に `docs/spec/` や `docs/sprints/` への参照が残っていない（grep でゼロ）。移設先の要点が同梱 `rules/` に存在。

### Low

**M8. `.mcp.json` が未実装の setup-microsoft に言及（C4）**
- 修正: `.mcp.json` の注記を現状（「今は Google のみ。Microsoft/Notion は後続」）に合わせる。
- 受入: `.mcp.json` に未実装機能を既に使えるかのように書いていない（文言検査）。

**M9. `reindex` の `for f in $(ls …)` が空白名に弱い（C3）**
- 修正: `find -print0` ＋ `while IFS= read -r -d ''` 方式等、空白入りファイル名に頑健な列挙へ。
- 受入: 空白を含む記憶ファイル名でも索引が正しく追従することを assert（負テスト）。

### 文言（Codex finding 7・本パッチに編入）

**F7. `templates/AGENTS.md` の「家」系メタファー＋旧「言い換え併記」残存（C4, C5）**
- 背景: Codex finding 7。`sprint-001-patch-002`（文言一掃）は**合格・done・コミット済み**で受入基準が確定しているため、そこへ遡って拡張しない。同一の Codex レビュー対応バッチとして、**本パッチに編入**する（Generator は本パッチ未着手のため Scope Change Gate に抵触しない）。
- 修正: `plugins/cc-secretary/templates/AGENTS.md` から「この家」等の「家」系メタファーを一掃し「秘書ディレクトリ／秘書フォルダ」に統一。旧「（専門用語は）言い換え併記」規定を撤去し、改訂 `docs/spec/ui.md` 準拠の語彙方針に更新する。
- 受入:
  - 配布物（`plugins/**` 配下、`templates/AGENTS.md` を含む）への `grep -rn "秘書の家\|この家\|お家\|おうち"` が**ゼロ件**（メタファー検出を「家」系全般に拡張）。
  - `templates/AGENTS.md` に「専門用語は必ず言い換えを併記」に相当する旧文言が残っていない（grep 確認）。
  - `templates/AGENTS.md` の文言が改訂 `docs/spec/ui.md`「体験の原則」に適合。
- 注記: patch-002 が既に一掃した範囲（onboarding/secretary/memory-care、`templates/memory/**`、`rules/plain-language.md`、`plugin.json`、`workspace-tools.sh`）は対象外。本項は **patch-002 の取りこぼし（`templates/AGENTS.md`）と検出範囲の拡張**に限定する。

## スコープ外

- 新機能の追加（sprint-004 の Microsoft/Notion 等）。
- patch-002 で既に一掃済みの文言範囲の再修正（本パッチは `templates/AGENTS.md` の取りこぼしのみ扱う）。
- 機能の仕様変更（安全化・整合是正に限定）。

## 総合受入基準

1. **High 3件が実挙動で塞がれている**（H1〜H3 の各負テスト/手順検査がパス）。C5 ゼロ許容。
2. **Medium/Low が是正されている**（M4〜M9 の各受入がパス）。
3. **文言 finding 7 が是正されている**（F7: `templates/AGENTS.md` の「家」系メタファー・旧言い換え併記の撤去、grep ゼロ件）。
4. **無回帰（C6, ゼロ許容）**: 既存回帰スイート（**168 assert**）が全パス。H1・M5・M9 の攻撃/エッジシナリオを**負テストとして追加**し、総 assert 数が増えている。
5. **副作用ゼロ**: 拒否時に外部へディレクトリ/ファイルが作られない。push が発生していない（`git remote` 空）。
6. **安全・規律（C5）**: `docs/spec/constraints.md` の昇格済み不変条件（基点検証・全導線ガード統一・秘密情報非履歴化・再セットアップ確認・配布 SKILL の同梱内参照）に適合。

### rubric 対応
- C1 完成度: M4,M6 / C3 機能実証: M4,M5,M9,H3 / C4 体験: M6,M8,F7 / C5 安全・規律: H1,H2,H3,M5,M6,F7 / C6 無回帰: 4

## Generator への引き継ぎメモ

- H1・M5 は同じ封じ込めガードの統一で一括対応できる。`_safe_path` 相当を**唯一の入口**にし、resume/todo/deliverable/memory すべてを通す。基点（`sec`・`sec/memory`）は「存在するなら実ディレクトリで境界内、外向き symlink なら拒否」を先に判定し、`mkdir -p` はその後。
- H3 は「黙ってコミットしない」が本質。`git add -A` を避け、明示的に対象を stage、または秘密パターン検査で拒否。初期 `.gitignore` を置く場合も検出時警告を残す。
- 負テストは一時ディレクトリで symlink/秘密ファイル/空白名ファイルを仕込んで exit コードと副作用不在を assert する形が扱いやすい。
- パス参照は `${CLAUDE_PLUGIN_ROOT}` 相対を維持。push しない。

## 参照

- `docs/spec/constraints.md`（昇格した安全・構成の不変条件）/ `docs/spec/rubric.md`（C5/C6 採点）/ `docs/spec/domain.md`（封じ込め・パス解決）
- `docs/sprints/sprint-002.md`・`sprint-002-patch-001.md`（記憶ツール封じ込めの基盤）/ `sprint-001.md`（onboarding・commit）/ `sprint-001-patch-002.md`（合格済みの文言一掃。finding 7 の `templates/AGENTS.md` 取りこぼしは本パッチが扱う）
