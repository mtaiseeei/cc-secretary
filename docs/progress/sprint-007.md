# Progress — sprint-007（朝夕の定例化）

- Phase: P5（定例運用）
- Status: 実装完了・自己検証済み（Evaluator へ引き渡し）
- 実装者: Generator

## スプリント契約（着手時宣言）

### 何を作るか（F17 / F18）

1. **朝ブリーフ（F17）**: `skills/morning/SKILL.md` を新設。daily（F06）を段階ロードして土台にし、朝向けの体裁（あいさつ→今日の要点→最初の一歩のブロック構成）で返す。根拠ルール・同期禁止・未接続フォールバックは daily と同一。
2. **定時実行テンプレート＋セットアップ案内（F17）**: `templates/prompts/morning-brief.md`（貼り付け用・環境変数非依存の自己完結文）を同梱。morning スキル内に scheduled tasks（本命）→ Routines（代替）→ 手動（フォールバック）の案内（英語 UI 対訳・しおり連携・「未設定でも『おはよう』で同じもの」明示）。
3. **夕方の振り返り（F18）**: `skills/evening/SKILL.md` を新設。完了確認→繰越→ひとこと振り返り→節目コミット。TODO 操作は決定的シームに追加した `todo-done` / `todo-carry`（`--confirm` 必須・封じ込めガード経由）。
4. **ルーター組み込み**: 「おはよう」系→morning、「おつかれ」系→evening の2行を追加（薄いまま）。

### どう検証するか

回帰スイート `scripts/regression-check.sh` に section 14（朝夕の定例化・64 assert）を追加し、契約の受入基準1〜9を対話 Claude に依存せず検証する。既存 assert は無回帰で全パスさせる。

## 実装内容

| ファイル | 変更 | 役割 |
|---|---|---|
| `plugins/cc-secretary/skills/morning/SKILL.md` | 新規 | 朝ブリーフ。daily を段階ロード（二重実装しない）、朝向けブロック構成（将来の項目差し込みに開く）、定時実行3方式のセットアップ案内（対訳・resume-write/clear 連携・UI 名称変更に耐える型） |
| `plugins/cc-secretary/skills/evening/SKILL.md` | 新規 | 夕方の振り返り。番号つき完了確認→確認のうえ1件ずつ消し込み→繰越→価値ある振り返りだけ記憶→節目コミット→3行型（今日できたこと／明日へ送ること／次に何が起きるか） |
| `plugins/cc-secretary/templates/prompts/morning-brief.md` | 新規 | 定時実行に貼る自己完結プロンプト。環境変数・開発専用ファイルに依存しない。根拠ルール・本文非保存・不可逆操作禁止を文面に内蔵 |
| `plugins/cc-secretary/scripts/workspace-tools.sh` | 拡張 | `todo-done <sec> <番号> [--confirm]`（消し込み）と `todo-carry <sec> <番号> <YYYY-MM-DD> [--confirm]`（繰越）。`--confirm` なしは対象を提示して exit 3（無確認削除の禁止）。inbox/todo.md への操作は既存 `_safe_path` 封じ込めガード経由 |
| `plugins/cc-secretary/skills/secretary/SKILL.md` | 拡張 | ふりわけ表に morning / evening の2行＋参照2行を追加（薄いまま） |
| `plugins/cc-secretary/skills/onboarding/SKILL.md` | 1行追記 | `templates/prompts/` は秘書ディレクトリにコピーしない旨（生成構造の決定性を維持） |
| `README.md`・`docs/guide/features.md` | 追従 | 機能一覧に morning / evening を追加（README のスキル一覧照合 assert に追従） |
| `scripts/regression-check.sh` | 拡張 | section 2 に morning/evening（name 一意=11）、section 3 / mk_sec に prompts/ 非コピー、section 14（64 assert）新設。290→**348 assert** |
| `scripts/harness-source-baseline.sha256` | 再記録 | 下記「既存問題への対応」参照 |
| `docs/progress/sprint-007.md` | 本ファイル | 契約宣言・自己評価・引き渡し |

### 設計の要点（仕様にない部分の技術判断）

- **朝ブリーフは独立スキル（morning）**にしたが、突き合わせの中身は daily を段階ロードして共有（二重実装なし）。morning が持つのは「朝向けの体裁（ブロック構成）」と「定時実行セットアップ案内」だけ。ブロック構成は sprint-009 の返信待ち警告をブロックとして差し込める形（先取り実装はしていない）。
- **テンプレートの置き場**は契約どおり `templates/` 配下（`templates/prompts/`）。ただしオンボーディングの雛形実体化と混ざらないよう「prompts/ はコピーしない」を onboarding に明記し、回帰の実体化処理も追従。生成される秘書ディレクトリ構造は不変（決定性維持）。
- **貼り付け文面は環境変数非依存**（`${CLAUDE_PLUGIN_ROOT}` を含まない）。定時実行側で解決できない前提（引き継ぎメモ準拠）。SKILL からテンプレートへの参照は `${CLAUDE_PLUGIN_ROOT}` 相対。
- **消し込み・繰越の保護は記憶保護と同型**: `--confirm` なしでは「何をどうするか」を提示して exit 3。繰越は削除ではなく「（繰越: 日付）」付記で残す（翌日の朝ブリーフがそのまま拾う）。番号指定のズレ対策として evening に「大きい番号から順に消す」を明記。
- **todo.md のスキーマは既存のまま**（`- [ ] 本文 （根拠: …）` 行の連なり）。作り込みすぎない。

## 既存問題への対応（着手時に発見・本スプリントの変更起因ではない）

回帰 section 12 の A1（複製元 agentic-harness の非改変・ゼロ許容）2件が、**本スプリント着手前から**失敗していた（`git stash` した変更前状態で再現確認済み: PASS=282 / FAIL=2）。原因は複製元 `~/workspace/agentic-harness` がユーザー自身のコミット（PR #1/#2 マージ・LICENSE 修正）で記録 HEAD `56ce6938…` → `fb9c3037…` に進んだこと。**作業ツリーはクリーン**で、cc-secretary 側からの書き込みではないことを確認した（`git -C ~/workspace/agentic-harness status --porcelain` 空・履歴は正規の git コミットのみ）。対応として、複製元には一切書き込まず、`scripts/harness-source-baseline.sha256` と記録 HEAD を現在のクリーンな状態で取り直した（regression-check.sh に更新履歴コメントを残置）。非改変検査そのものは弱めていない。

## 自己評価（Evaluator と同じ6軸。`docs/spec/rubric.md` の基準）

| 基準 | スコア(1-5) | コメント |
|------|------------|---------|
| 機能完全性 | 5 | 受入基準1〜9すべてに対応する実装＋assert。スコープ外（返信待ち・会議・週次）には触れていない |
| 動作安定性 | 5 | 回帰 348/348 パス。`CLAUDE_PLUGIN_ROOT` 明示／未設定の両方で全緑。todo-done/todo-carry は不正番号・不正日付・symlink 越えで非ゼロ拒否 |
| デザイン性 | 4 | GUI なし。文言・体裁は ui.md「定例の体験」準拠（朝: 要点＋最初の一歩、夕: 3分で締め）。ブロック構成で将来拡張に開く |
| 独自性 | 4 | 消し込み保護を記憶保護と同型に統一・繰越を「削除でなく付記」にして朝ブリーフへ自然接続、など仕様の隙間を製品思想に沿って埋めた |
| エラーハンドリング | 5 | 未接続フォールバック（daily 継承）、番号/日付の使い方エラー、未確認時の安全側中断、封じ込め拒否、Routines 制約の正直な案内 |
| 回帰なし | 5 | 既存 assert 全パス（A1 の既存失敗は上記のとおり原因確定のうえベースライン再記録で解消。検査は弱めていない） |

## 既知の課題

- todo-done/todo-carry の対象指定は「一覧の上からの番号」。消すたびに番号が詰まるため、SKILL に「大きい番号から順に」と明記したが、LLM 側の運用規律に依存する（本文一致指定は同文 TODO の曖昧性があるため見送り）。
- scheduled tasks / Routines の UI 名称は執筆時点の具体名＋「設定→定時実行の登録→貼り付け」の型で案内しており、ホスト UI の大幅変更時は文言更新が必要。
- 定時実行そのもの（実時刻の自動起動）は rubric 注記どおり検証対象外。テンプレート・案内・手動導線までを検証済み。

## Evaluator への引き渡し事項

- **起動方法**: マークダウン資産のためサーバー起動なし。実ライブ確認する場合は `/plugin marketplace add`（ローカルパス）→ `/plugin install cc-secretary@cc-secretary` → `/secretary` に「おはよう」「おつかれ」。
- **回帰チェック**: `bash scripts/regression-check.sh` → **PASS=348 / FAIL=0**（section 14 が本スプリントの中核・64 assert）。`CLAUDE_PLUGIN_ROOT="$PWD/plugins/cc-secretary"` を明示しても全緑。
- **テストシナリオ（推奨）**:
  1. 既定の回帰実行（上記）。
  2. 骨抜きでないことの負テスト（Generator 実測済み・いずれも復元で全緑）:
     - `templates/prompts/morning-brief.md` に `docs/spec/...` 参照を追記 → 「テンプレートが docs/spec・docs/sprints を参照しない」が FAIL。
     - ルーターから「おはよう」行を削除 → 「ルーターに朝ブリーフ（おはよう→morning）の行がある」が FAIL。
  3. 消し込み保護の手動確認: 一時 secretary を作り `workspace-tools.sh todo-add` → `todo-done <sec> 1`（--confirm なし）が exit 3 で何も消さないこと、`--confirm` で該当行だけ消えること。
  4. 繰越の手動確認: `todo-carry <sec> 1 2026-07-16 --confirm` で「（繰越: 2026-07-16）」付きで残ること。
  5. A1 ベースライン再記録の妥当性: `git -C ~/workspace/agentic-harness log --oneline -5`（ユーザーコミットで fb9c3037 に前進）と `status --porcelain`（クリーン）を確認。
- **証跡の残し場所**: `docs/feedback/sprint-007.md`。
