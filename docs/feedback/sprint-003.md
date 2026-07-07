# Feedback — sprint-003（今日やること・出力規約・Google 接続）

- 判定: **合格**
- 評価者: Evaluator
- 評価日: 2026-07-08
- 評価タイプ: 通常フル評価（6基準）

## 総評（3行）

- setup-google（公式コネクタ前提・Cloud Console 手作業なし・英語エラー言い換え・しおり連携）、daily（根拠ルール・外部本文非保存・未接続フォールバック）、出力規約シーム `workspace-tools.sh`、封じ込め共有ライブラリ化がすべて契約どおり実装され、回帰 156 assert が全緑。
- 新シーム `workspace-tools.sh` にも共有 `path-guard.sh` の封じ込めが効いており、Evaluator の攻撃（中間 symlink 越え・タイトル `..`・不正日付・根拠空）はすべて拒否。memory-tools.sh は共有ライブラリ化後も封じ込め・正常系が無回帰。
- 改訂 ui.md の語彙方針（一般語そのまま・馴染みの薄い語のみ初出補足・「秘書の家」禁止）に新規文言が適合。全11受入基準を満たすため合格。

## 各基準のスコア（rubric.md 準拠）

| # | 基準 | 閾値 | スコア | 判定 |
|---|---|---|---|---|
| C1 | 完成度 | ≥4 | 5 | ✓ 受入1〜11 すべて達成 |
| C2 | 構文・整合 | 5 | 5 | ✓ 5スキル name 一意・`${CLAUDE_PLUGIN_ROOT}` 参照実在・デッドリンクなし |
| C3 | 機能の実証 | ≥4 | 5 | ✓ 出力規約・根拠必須・封じ込め・しおりをドライランで実証 |
| C4 | 非エンジニア体験 | ≥4 | 5 | ✓ 改訂 ui.md 準拠・過剰言い換えなし・「秘書の家」不在 |
| C5 | 安全・規律 | 5 | 5 | ✓ 同期層なし・資格情報非保存・封じ込め・push 禁止 |
| C6 | 無回帰 | 5 | 5 | ✓ 既存 111 assert 全パス＋45 追加 |

→ 全基準が閾値以上のため **合格**。

## 証跡

### 1. 回帰再実行（Evaluator 実行・3モード）

```
既定                              : PASS=156  FAIL=0
env -u CLAUDE_PLUGIN_ROOT（fallback）: PASS=156  FAIL=0
/bin/bash 3.2.57（macOS 既定）       : PASS=156  FAIL=0
```
111→156 の +45 は section 8（sprint-003）＋section 2 の setup-google/daily 存在・name。section 8 の assert は骨抜きでない（終了コード＋実ファイル状態＋内容を検査。例: 中間 symlink 越え保存は exit 3 かつ外部実ファイル `EXT-ORIGINAL` 不変を assert）。

### 2. 公式コネクタ前提／Cloud Console 手作業の不在（受入2・C1/C4）

setup-google SKILL を実読・grep。Cloud Console 手作業語（`Cloud Console`・`API を有効`・`プロジェクト作成`・`認証情報`・`JSON 鍵`・`gcp-oauth`）は**不在**。「Claude の設定画面 → コネクタ（Connectors）を開き有効化」の導線と、接続確認テスト（「直近の予定を1件だけ見せて」）が存在。「管理コンソールでの設定や鍵ファイルの用意は一切要りません」と明記。

### 3. 英語エラーの言い換え・しおり連携（受入3・8・C4/C3）

- 英語エラーを「そのまま見せない」と明記し、言い換えの型（表）＋具体例（not authorized→「接続の許可がまだのようです…」等4例）を提示。「実エラーで原因確定→日常語案内」を踏襲。
- 接続前に `memory-tools.sh resume-write <secretary> "Google接続の設定" …` でしおりを書き、完了時に `resume-clear` で閉じる導線あり（sprint-002 のしおり機構を利用）。

### 4. 根拠ルール・同期しない不変条件・未接続フォールバック（受入4・5・6・C3/C5/C4）

- daily に「各項目に必ず根拠を付ける：サービス名＋リンク/ID＋日付」「原文にない事実を足さない」「矛盾は両方をそのまま示す」を明示。
- 「メール本文・予定の詳細などの全文をローカルファイルに書き出さない・`10_sources` 型の置き場を作らない」を明記。`workspace-tools.sh` も「外部データの本文をローカルに保存しない」とヘッダに明記。
- 未接続時は「失敗として扱わず」setup-google（`${CLAUDE_PLUGIN_ROOT}/skills/setup-google/SKILL.md`）へ案内。接続前でもローカル TODO は提示。
- `todo-add` は根拠（サービス名＋リンク/ID＋日付）が空だと **exit 3** で拒否（決定的強制）。

### 5. 出力規約のドライラン（受入7・C1/C3）— Evaluator 実行

```
$ printf '## 概要\n本文テスト\n' | workspace-tools.sh save-deliverable <sec> 2026-07-08 "企画 骨子" "企画,調査"
→ docs/2026/07/2026-07-08_企画_骨子.md に保存
  createdAt: 2026-07-08 HH:MM / tags: - 企画 - 調査 / 見出し「# 企画 骨子」/ 本文保存
```
空本文は exit 3、不正日付（`2026/07`）は exit≠0、タイトルの `..` は exit≠0 で拒否。保存の節目コミットは日本語メッセージ・`git remote` 空（push なし）。`workspace-tools.sh` 自身は git を呼ばず、コミットは memory-tools.sh commit（push/remote add なし）に委譲。

### 6. 封じ込めが新シームにも効く（受入10・C5）— Evaluator の攻撃

新シーム `workspace-tools.sh` は共有 `lib/path-guard.sh`（`_realpath`/`_safe_path`）を source。原本無変更・scratchpad 上で攻撃:

| 攻撃 | 結果 |
|---|---|
| `docs/2026/09` を外部への symlink にすり替え → `save-deliverable <sec> 2026-09-15 侵入` | exit 3・外部 `EXT-ORIG` 不変・外部に成果物が作られない |
| `save-deliverable <sec> 2026-07-08 "../../escape"`（タイトル traversal） | exit≠0 で拒否 |
| `save-deliverable <sec> "../../../etc" t`（不正日付 traversal） | exit≠0 で拒否 |
| `todo-add <sec> "根拠なし" ""` | exit 3 で拒否 |

正常系（根拠つき todo-add、正規パスの save-deliverable）は rc=0 で成功＝過剰拒否なし。

### 7. 共有ライブラリ化後の memory-tools 無回帰（受入10・11・C6）

`memory-tools.sh` は `../../../scripts/lib/path-guard.sh` を source する形に変更（インライン封じ込めを共有化）。Evaluator の再攻撃で挙動不変を確認:
- `delete <sec> "../../outside/keep.txt" --confirm` → exit 3・外部健在。
- 外向き symlink `memory/link.md` への `guarded-write` → exit 3・外部不変。
- 正常系 `remember-decision` → rc=0。

既存 111 assert（sprint-001〜002＋各 patch）は全パス。

### 8. 語彙方針（改訂 ui.md）への適合（受入9・C4）

- **「秘書の家」不在**: sprint-003 で新規/変更した setup-google・daily・ルーター・workspace-tools.sh に `秘書の家` なし（grep 0件）。`secretary/` は「秘書ディレクトリ／秘書フォルダ」表記。
- **過剰言い換えなし**: フォルダ/ディレクトリ/コミット/カレンダー/メール等の一般語に冗長な括弧補足を付けていない（唯一の括弧「秘書ディレクトリ（`secretary/`）」は識別子の明示で適切）。
- **馴染みの薄い語の初出補足**: OAuth のみ「（OAuth＝アプリ同士を安全につなぐ仕組み）」の初出1回。毎回繰り返していない。
- 3行型（「次は『今日やること』…」等、次に何が起きるかを含む）。plain-language を参照。

### 9. スキル構文・ルーター組み込み（受入1・C2）

- 5スキル（secretary/onboarding/memory-care/setup-google/daily）の `name` すべて一意。
- ルーターに3モード追加: 「今日やること／予定／TODO／段取り」→daily、「Google/Gmail/カレンダー/接続」→setup-google、成果物保存（save-deliverable→commit）。すべて `${CLAUDE_PLUGIN_ROOT}` 相対。起動時 `resume-check` あり。デッドリンクなし（回帰 section 2 全パス）。

### 10. 安全・その他不変条件（受入10・C5）

- `~/workspace/agentic-harness`（Jul 2 16:08）・`~/workspace/inbox/company`（Jun 23 11:11）とも不変 → 非書込。検証は scratchpad のみ。
- 資格情報の実値: 成果物・TODO になし。setup-google は「トークン・パスワード・鍵ファイルを秘書ディレクトリに保存・コミットしない」と明記。
- 同期層（`10_sources` 型）なし。単段クレジット・6規律・封じ込め不変条件は既存 section で維持。

## 軽微な観察（減点なし・記録のみ）

- setup-google/daily のヘッダ行に「専門用語は言い換え併記」という旧 plain-language 方針の文言が残る。実際の本文は改訂 ui.md に適合（一般語そのまま・OAuth のみ補足）しているため実害はない。共有ルールファイル `rules/plain-language.md` の旧文言harmonization は sprint-001-patch-002 の担当（本スプリント対象外）なので減点しない。参考として patch-002 で SKILL ヘッダ側の同文言も見直すと一貫する。
- 実インストール環境での `/secretary`＋実コネクタのライブ確認は本環境で不可（rubric 6「未実施の手動確認」）。接続導線は文言検査、成果物/TODO/封じ込めは決定的シームのドライラン＋Evaluator 攻撃で実挙動検証した。

## 付録: 既定モードの回帰チェック要点

```
== 1〜7 ==  全PASS（マニフェスト/単段クレジット・5スキル構文・生成物6規律・git・体験・安全・記憶ケア封じ込め）
== 8. 今日やること・出力規約・Google 接続 ==  全PASS
   （Cloud Console 手作業不在・設定画面コネクタ導線・接続確認・英語エラー言い換え・resume 連携・
    根拠ルール・本文非保存・10_sources なし・未接続フォールバック・秘書の家不在・
    save-deliverable の規約パス/frontmatter/見出し・空本文/不正日付/.. 拒否・中間symlink越え拒否・
    節目コミット日本語/push なし・todo-add 根拠必須）
== 結果 ==  PASS=156  FAIL=0
```
