# Evaluation Rubric

## プロジェクト種別

Claude Codeプラグイン（Markdownのskills、templates、rules、shellによる安全なシーム）と、
別repo `yasashii-harness` への参照導線。GUI製品ではないため、静的整合、スクリプト化した実動作、
模擬会話、外部repo境界を証跡つきで評価する。

## 合格の基本条件

- Evaluatorは対象スプリントの実物を動かし、実行コマンド、結果、対象ファイル／repo、模擬会話の入力と観測結果を feedback に残す。
- C2・C5・C6 は5/5必須。1件でも構文欠陥、安全違反、新規回帰があれば不合格。
- 1軸でも閾値を下回ればスプリント全体を不合格にする。
- やさしさの得点で安全・規律・回帰の欠陥を相殺しない。

## 検証方法

1. **manifest・参照整合**: marketplace / plugin JSON、SKILL frontmatter、name一意、参照先実在、改名後の識別子一致を検査する。
2. **回帰スイート**: Generatorの引き渡しコマンドを実行し、終了コードとassert数、失敗内容を記録する。既知失敗を合格扱いしない。
3. **シームのドライラン**: 一時 `secretary/` で記憶保護、path guard、journal追記、TODO、settings、reindex、timelineを実行する。文字列の存在だけでなく、構造と副作用をassertする。
4. **固定時刻**: `CC_SECRETARY_NOW` を与え、日付ファイル、期間境界、逆時系列、同一入力の同一出力を確認する。
5. **模擬会話**: LLM規律に関わる導線はgrepだけで合格にしない。Evaluatorが実際の指示・応答を記録する。
6. **リポジトリ境界**: `~/workspace/agentic-harness` をコマンド対象・参照元・複製元にせず、編集、checkout、commit、branch、remote変更、生成物作成を行っていないことを実装経路と作業ログから確認する。`yasashii-secretary` に同梱ハーネスが無く、`yasashii-harness` はpublic・`fork=false`の独立downstreamで、GitHubのorigin/upstream remote、fb9c303到達性、yasashii見出しoverlay、宣言的metadata allowlistが成立することを確認する。
7. **参照導線のoffline / online分離**: offline回帰はローカルの案内、`harness@yasashii-harness` を含む3コマンド、同梱不在、壊したfixtureの検出を評価する。online検査はGitHub APIで `mtaiseeei/yasashii-harness` の実在、`private=false`、`fork=false`、owner/name、marketplace `name` / `repository`、plugin `name` / `source` / `repository` / `homepage`、必要なCodex marketplace識別子と3コマンドの整合を評価する。ネットワーク不可をremote健全性のPASSとして数えず、`UNVERIFIED` 等でoffline結果と分離する。Sprint合格にはEvaluatorのonline証跡が必須。
8. **downstream差分境界**: `gentle-overlay/metadata-overrides.json` の対象ファイル・field・期待値がremote manifestsと完全一致し、allowlist外のmetadata変更、スキル本文・agents・runtimeロジック・その他上流由来の実装行の書換・削除が0件であることを、upstream fb9c303との差分と独自回帰で確認する。`yasashii` 見出しの追加は従来どおり許可する。
9. **手動ライブ確認**: サインイン済みClaude環境が利用可能ならプラグインを実際に導入して主要対話を確認する。利用不可なら、未実施項目を明示し、スクリプト＋模擬会話をゲートとする。

## 必須の模擬会話

対象機能が未実装のスプリントでは該当項目を評価対象外とし、実装された時点から回帰シナリオへ追加する。

1. **決定3本**: 異なる言い回しで決定を含む会話3本を行い、原文を保った節目確認が出ることを確認する。
2. **decidedゼロの日**: 決定を含むが記録されていない会話を締め、拾い漏れ確認が走ることを確認する。
3. **相談文脈**: 結論のない相談を一区切りし、topic追加前の1行確認と要点だけの保存を確認する。
4. **settings 3設定**: 同一タスクを、既定、フランク＋そのままOK、きっちり敬語＋ことば添え＋くわしくで行い、許可された範囲だけ挙動が変わることを確認する。
5. **先回り提案**: 報告3行目が適切なときだけ1提案となり、無断着手しないことを確認する。

個人化された文面の完全一致はassertしない。設定の読込、許可された分岐、既定へのフォールバック、確認フローを評価する。

## 採点基準と閾値

| ID | 基準 | 見るもの | 閾値 |
|---|---|---|---|
| C1 | 完成度 | 対象スプリントの受入基準と外から見える成果 | ≥4 |
| C2 | 構文・整合 | JSON/frontmatter/name/パス/識別子/参照先 | **5** |
| C3 | 機能の実証 | シーム、固定時刻、模擬会話、実データ構造 | ≥4 |
| C4 | 非エンジニア体験 | **既定値**での3行報告、標準語彙、進行、エラー説明 | ≥4 |
| C5 | 安全・規律 | 記憶保護、封じ込め、repo境界、外部同期なし、pushなし | **5** |
| C6 | 無回帰 | 既存＋新規の全回帰が成功 | **5** |
| C7 | やさしさ | 言葉遣い、報告、先回り提案が、規律を緩めず機能する | ≥4 |

## スコアアンカー

### C1 完成度

- 5: 受入基準をすべて実物で確認し、条件付き項目の判断記録も明確。
- 4: 必須成果はすべて成立。任意の補助面だけ未実施で理由がある。
- 3以下: 必須成果、依存、条件付き判断のいずれかが欠ける。→不合格。

### C2 構文・整合【ゼロ許容】

- 5: manifest、SKILL、参照パス、改名後識別子、別repo導線が全て整合し、`harness@yasashii-harness`、remote manifestのname / source / repository / homepage、metadata allowlistの完全一致をonline証跡で確認できる。
- 4以下: JSON破損、name重複、デッドリンク、旧名の実害ある残存、参照先不在、remote manifest不整合、metadata allowlist外変更、またはonline未検証のいずれかがある。→不合格。

### C3 機能の実証

- 5: 固定時刻ドライランと該当する模擬会話が全て成功し、データと副作用の証跡がある。
- 4: 主要シームと模擬会話が成功。補助ケースのみ手動確認で理由がある。
- 3以下: grepや目視だけ、固定時刻未検証、模擬会話未実施、またはassert失敗。→不合格。

### C4 非エンジニア体験

- 5: 既定設定で3行型、一般技術用語、初出補足、進行表示、エラー説明が一貫する。
- 4: 軽微な表現差が1〜2箇所あるが、迷わず次の行動を選べる。
- 3以下: 過度な平易化、長すぎる報告、生英語エラー、進行不明が複数ある。→不合格。

### C5 安全・規律【ゼロ許容】

- 5: 記憶保護、純追加、journal限定例外、path guard、repo境界、外部同期禁止、push規約に違反ゼロ。
- 4以下: 1件でも違反、未確認の破壊操作、または `~/workspace/agentic-harness` を編集・checkout・commit・branch・remote変更・生成物作成・複製元・コマンド対象のいずれかに使った事実がある。→不合格。

### C6 無回帰【ゼロ許容】

- 5: 既存・追加の全assertが成功し、既知の失敗も残らない。
- 4以下: 新規失敗、既知失敗の放置、回帰コマンド未実行のいずれか。→不合格。

### C7 やさしさ

- 5: 3行目の提案が1つ・根拠つき・選択権を残し、言葉遣いと進行表示が自然。規律の省略ゼロ。
- 4: 大筋は守るが、提案や説明の自然さに軽微な改善余地がある。
- 3以下: 押しつけ、無断着手、過度な幼稚化、またはやさしさを理由に検証・役割分離を省く。→不合格。

## スプリント別の重点

| Sprint | 重点 |
|---|---|
| 008 | 改名整合、独立downstream/origin/upstream境界、参照導線、section 12のonline実在検査、全回帰 |
| 009 | journal純追加、シーム副作用、topics/TODO/reindex、固定時刻、記憶保護 |
| 010 | timeline決定性、節目・締め・相談文脈の模擬会話、daily統合 |
| 011 | 先行規約の整合、preferences v2、settings確認、3設定の模擬会話 |
| 012 | journal原本からの週次、索引退避確認、条件付き機能の判断記録 |

## 差し戻し分類

- `implementation-issue`: 実装が仕様を満たさない。Generatorへ戻す。
- `spec-issue`: 契約・仕様が矛盾または不足。Plannerへ戻す。
- rubric変更はEvaluatorが提案できるが、適用はPlannerだけが行う。
