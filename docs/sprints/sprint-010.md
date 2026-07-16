# Sprint 010 — G1 体験: timeline と節目プロトコル

- Type: main
- 主眼: sprint-009の記録配管を、普段の会話で使える体験へ接続する。いつ何をしたか・決めたかを `timeline` で見つけ、会話中と締めで決定・相談文脈を回収する。
- 依存: sprint-009 done。journal、topic、TODO、固定時刻、reindexが回帰で保護されていること。

## 外から見える成果

1. 「今日やったこと」「先週なにしてた」「Zoomの件いつ決めた」「7月に決まったこと」に、日付つきの決定的なtimelineで答えられる。
2. 決定の合図があれば原文を保った1行確認が出て、会話の締めで当日のdecidedが0件なら拾い漏れを確認する。
3. 結論のない相談でも、一区切りでtopic保存前の1行確認が出る。
4. morning / evening / daily / TODOが重複せず、朝の再開・日中の整理・夕方の締めという一続きの体験になる。

## スコープ

### A. timeline

- `memory-tools.sh timeline <sec> [--from/--to] [--type decisions|journal|all] [--grep <キーワード>]` を提供する。
- journalとdecisionsを日付キーで読み、逆時系列Markdownへ決定的に整形する。LLM要約を出力生成に使わない。
- `--from` / `--to` の境界、typeの絞り込み、`--grep` の横断検索、結果0件を分かりやすく扱う。
- decision変更履歴は過去を消さず、新しい決定を優先して分かるように表示する。
- 「保存して」と明示された場合だけ `save-deliverable` で成果物化する。

### B. 節目プロトコル

- ルーターと生成AGENTSの会話規律に、決定の合図、1行確認、原文保存を定義する。
- 既定は都度確認。将来の `決定の確認: まとめて` を受けられる境界を壊さず、sprint-011前に未実装設定を現在機能として案内しない。
- evening／「今日はここまで」で当日decidedが0件なら会話を読み返し、拾い漏れ候補を確認する。
- 結論に至らない相談が一区切りしたら、topic要点の保存前に1行確認する。
- LLM検出が完全保証ではないことを隠さず、都度＋締めの二段構えとして案内する。

### C. morning / evening / daily 統合

- `backup/sprint-007-010-plan` の morning / evening をそのまま戻さず、journalと既存dailyへ統合した形で再構成する。
- morningは `_resume.md` の中断点、journal `next`、TODOを確認し、今日の入口を作る。
- dailyは接続済み外部予定・タスクとローカルTODOを根拠つきで突き合わせる既存責務を維持する。
- eveningは当日のjournal／decision、未完TODO、next、決定拾い漏れを確認する。週次要約は行わない。
- todo-done/carryを対話から呼べるようにし、二重記録や同じ質問の重複を避ける。

### D. ルーター語彙

- journal: 「今日やったこと」「先週なにしてた」。
- decisions: 「いつ決めた」「7月に決まったこと」。
- grep: 固有名詞を含む「Zoomの件いつ決めた」。
- morning / evening: 「今日始めよう」「今日はここまで」等。
- 保存依頼と単なる閲覧を区別する。

## スコープ外

- preferences v2、口調・詳しさの変更、「まとめて」設定のUI（sprint-011）。
- weeklyと索引退避運用（sprint-012）。
- dashboard。

## 受入基準

1. **timeline決定性（C3）**: 固定fixture＋`CC_SECRETARY_NOW` で同一コマンドを2回実行し、同一Markdown、逆時系列、正しい境界を得る。
2. **絞り込み（C1/C3）**: journal/decisions/all、from/to、grep、0件の組合せが仕様どおり。固有名詞検索で該当日＋行を返す。
3. **決定変更（C3/C5）**: 旧決定を消さず、変更履歴を保ちながら新しい方を優先表示する。
4. **保存の明示性（C5）**: 閲覧だけでは成果物を作らず、「保存して」の場合だけ既存保存シームを通る。
5. **決定模擬会話3本（C3/C7）**: 異なる決定表現3本で、原文を保った1行確認が出る。無確認記録しない。
6. **decidedゼロの締め（C3/C7）**: 決定候補を含むが未記録の会話を締めると、拾い漏れ確認が走る。
7. **topic模擬会話（C3/C5）**: 結論のない相談で1行確認後に要点だけを保存し、逐語ログを残さない。
8. **朝夕daily統合（C1/C3）**: morning→daily→eveningの一連シナリオで `_resume`、next、TODO、外部根拠、当日journalが役割どおり扱われ、二重追記がない。
9. **ルーター（C2/C4）**: 各自然言語が正しいモードへ接続し、一般技術用語と3行報告の既定を守る。
10. **無回帰（C6）**: sprint-009までの全回帰＋新規assertが0 FAIL。

## 評価証跡

- timelineの全option組合せと再実行diff。
- 決定3本、decidedゼロ、相談文脈の模擬会話ログ。
- morning→daily→eveningの一連操作と生成ファイル差分。
- 全回帰のPASS/FAIL集計。

## 参照

- `docs/spec/features.md` F06/F18/F19
- `docs/spec/ui.md` 節目プロトコル・timeline導線
- `docs/spec/domain.md` timeline・純追加決定・中断点とnext
