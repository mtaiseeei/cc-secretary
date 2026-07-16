# Sprint 010 Retry 1 Evaluation — G1体験: timeline と節目プロトコル

## 再評価判定

**合格**

初回評価で不合格とした I1（決定確認が厳密1行に安定しない）と I2（生成AGENTSの旧専門用語規約）は、
いずれも解消された。Claude CLIを前回と同じツール無効条件で独立実行し、決定3表現を各2回、
合計6回確認した。全応答が固定prefixと句読点を含むユーザー入力全文だけの厳密1行となり、
追加説明、再許可、空行、2行目はなかった。

確認ターンは `--tools ""` のため書込手段を持たず、独立fixtureでも実行前後のファイルtreeが一致した。
別ターンの明示了承を模擬した後にだけ正規 `remember-decision` シームを実行すると、3件とも
decision 1行とjournal `decided` 1行が追加された。専用回帰56件と全online回帰277件も0 FAILである。

## 再採点

| 基準 | スコア | 判定根拠 |
|---|---:|---|
| C1 完成度 | 5/5 | timeline、節目、topic、morning / daily / evening、ルーターの全受入基準を実動作回帰と模擬会話で確認 |
| C2 構文・整合 | 5/5 | shell構文、配布参照、manifest、生成AGENTS、online参照導線が全て成功 |
| C3 機能の実証 | 5/5 | 固定fixture、決定3表現6回、了承前後の副作用境界、56 assertに実証あり |
| C4 非エンジニア体験 | 5/5 | 既定3行、一般技術用語を保持、馴染みの薄い語だけ初出補足という規律が配布面で一貫 |
| C5 安全・規律 | 5/5 | 確認ターン無副作用、別ターン了承後のみ純追加、保存明示、path guard、repo境界に違反なし |
| C6 無回帰 | 5/5 | Sprint専用56 PASS、全online 277 PASS、既知失敗なし |
| C7 やさしさ | 5/5 | 1行確認が選択権を残しつつ余分な再確認を増やさず、3行報告と1提案の境界も維持 |

C2・C5・C6のゼロ許容基準は全て5/5、その他も閾値4以上である。

## Retry 1 実行証跡

### 1. I1 — 決定3表現のClaude CLI模擬会話

前回と同じく、配布 `memory-care/SKILL.md` をsystem promptとして与え、Claude CLIの全ツールを
`--tools ""` で無効化した。セッションを保存せず、応答本体をJSONの `result` で確認した。

```console
$ claude -p --tools "" \
    --system-prompt-file plugins/yasashii-secretary/skills/memory-care/SKILL.md \
    --no-session-persistence --output-format json '<決定表現>'
```

必須サンプルは各表現2回、合計6回。全実行で `subtype=success`、`num_turns=1`、
`stop_reason=end_turn`、`permission_denials=[]` だった。

| 入力 | 2回の観測結果 | 厳密1行 |
|---|---|---|
| `Zoomは対面開催にしよう` | `この内容を決定として残しますね: Zoomは対面開催にしよう` | 2/2 |
| `候補AとBなら、じゃあそれで。` | `この内容を決定として残しますね: 候補AとBなら、じゃあそれで。` | 2/2 |
| `配布日は7月25日。それで決定。` | `この内容を決定として残しますね: 配布日は7月25日。それで決定。` | 2/2 |

比較条件は次のすべてを同時に満たすこととした。

- prefixが正確に `この内容を決定として残しますね: ` である。
- prefix以降が、そのターンのユーザー入力とbyte単位で一致する。
- `。`、`、`、助詞、「じゃあそれで」「それで決定」を省略・正規化していない。
- 応答が1行だけで、前後の挨拶、解釈、曖昧さ質問、再許可、空行、2行目がない。

全6回が全条件を満たした。補助の追加spot実行も同じ結果だった。

### 2. 確認ターンと別ターン了承後の副作用

`/private/tmp` に配布templateから独立 `secretary/` fixtureを作った。Claude CLIを
`--tools ""` で実行した確認ターンの前後で全ファイルのchecksumを比較した。

```console
TREE_EQUAL=true
```

したがって、確認と同じターンでdecision / journal / commitは変化していない。
続く別ターンの明示了承「はい、記録してください」を模擬した後にだけ、確認済み原文を
`memory-tools.sh remember-decision` へ1回渡した。

```text
入力1: AFTER_SEPARATE_ACK_DECISION=1 AFTER_SEPARATE_ACK_JOURNAL=1
入力2: AFTER_SEPARATE_ACK_DECISION=1 AFTER_SEPARATE_ACK_JOURNAL=1
入力3: AFTER_SEPARATE_ACK_DECISION=1 AFTER_SEPARATE_ACK_JOURNAL=1
```

3件とも原文がdecisionへ1行、対応するjournal `decided`へ1行だけ追加された。

### 3. I2 — 専門用語規約

配布プラグイン全体を対象に、初回評価で検出した文言と旧規約の類型を再検索した。

```console
$ rg -n '専門用語には、やさしい言い換えをカッコで併記する|専門用語は必ず|言い換えを併記|言い換え併記' \
    plugins/yasashii-secretary
OLD_POLICY_COUNT=0
```

生成される `templates/AGENTS.md` は次の現行規約へ変更されている。

```text
一般的な技術用語はそのまま使う。馴染みの薄い語だけ、初出時に短い補足を添える。
```

`templates/AGENTS.md`、`rules/plain-language.md`、全9スキルの合計11面で
「馴染みの薄い語だけ」を確認した。全体回帰section 3・9・10でも、template実体化後の生成AGENTS、
過度な平易化の不在、旧規約ゼロを確認した。

### 4. Sprint 010専用回帰

```console
$ bash scripts/sprint-010-regression.sh
PASS=56 FAIL=0
```

exit 0。初回50件から追加された6件を含め、次を確認した。

- timelineのbyte一致、逆時系列、from/to、type、literal grep、0件。
- 変更決定の最新優先表示と旧decisionファイル不変。
- timeline閲覧の副作用0、明示保存時だけ成果物1件とjournal 1行。
- 決定3表現、厳密1行、入力全文無加工、追加説明禁止、確認ターン無副作用、別ターン了承後だけ記録。
- decidedゼロの締め、topic 1行確認、逐語ログ禁止。
- morning / daily / eveningの閲覧増分0、中断点・next・TODO・外部根拠・decisionの分離。
- 生成AGENTSの節目プロトコルと現行専門用語規約。

### 5. 全online回帰

sandbox内の初回実行では外部通信を利用できず、remote検査だけをPASSに数えなかった。

```console
ONLINE=UNVERIFIED GitHub API request failed or a required file returned 404
PASS=276 FAIL=1
```

ネットワーク許可付きで同一コマンドを再実行した。

```console
$ bash scripts/regression-check.sh --online
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
PASS=277 FAIL=0
```

exit 0。remote実在性を含む全sectionが成功した。

### 6. 構文・差分

```console
$ bash -n scripts/regression-check.sh scripts/sprint-010-regression.sh \
    plugins/yasashii-secretary/scripts/lib/timeline.sh \
    plugins/yasashii-secretary/skills/memory-care/scripts/memory-tools.sh \
    plugins/yasashii-secretary/scripts/workspace-tools.sh
SHELL_OK

$ git diff --check
DIFF_CHECK_OK
```

## 前回合格面の再確認

- **timeline**: 専用回帰の実fixtureで決定性、期間境界、種別、literal検索、変更履歴、閲覧副作用0を再確認。
- **保存**: timeline閲覧では成果物0、明示 `save-deliverable` 後だけ成果物1件とjournal 1行を再確認。
- **topic**: 全回帰の正規シームで、確認済み要点だけの保存、MEMORY索引追従、逐語ログなしを再確認。
- **morning / daily / evening**: 専用fixtureで `_resume`、journal `next`、TODO、外部根拠、decisionの役割分離と閲覧増分0を再確認。

## ブラウザ検証

未実施。対象はWeb UIを持たないClaude Code pluginであり、評価面はshellシーム、Markdown会話規律、
Claude CLI模擬会話、GitHub APIのonline参照導線である。UI・responsive・視覚品質は採点対象外のため、
スクリーンショットも対象外。

## 初回指摘の解消状況

| 指摘 | 状態 | 再評価結果 |
|---|---|---|
| I1 決定確認が原文1行に安定しない | 解消 | 3表現×2回が全て固定prefix＋入力全文の厳密1行。確認ターン無副作用、別ターン了承後のみ記録 |
| I2 生成AGENTSに旧専門用語規約 | 解消 | 旧規約0件。現行規約が生成AGENTS・共通rule・全スキルで一貫 |

実装上の未解決指摘はない。次の処理はオーケストレーターによる `state.md` の合格遷移である。

---

# 初回評価記録（履歴）

## 判定

**不合格 — implementation-issue**

timeline、保存境界、decidedゼロの締め、topic、morning / daily / evening、onlineを含む全回帰は成立した。
ただし必須の決定模擬会話3本で、実際のClaude応答が「ユーザー原文を保った1行確認」に安定して収まらなかった。
また、生成される `AGENTS.md` に現行の専門用語規約と矛盾する旧指示が1行残っている。

## 採点

| 基準 | スコア | 判定根拠 |
|---|---:|---|
| C1 完成度 | 3/5 | timelineと朝夕dailyは完成しているが、受入基準5の必須模擬会話3本が未達 |
| C2 構文・整合 | 5/5 | shell構文、配布参照、manifest、online参照導線が全て成功 |
| C3 機能の実証 | 3/5 | 固定時刻fixtureは成功したが、必須の決定3会話で1行・原文保持を満たさない応答を再現 |
| C4 非エンジニア体験 | 4/5 | 3行報告と朝夕導線は明瞭。ただし生成AGENTSに旧専門用語規約が1箇所残る |
| C5 安全・規律 | 5/5 | 閲覧副作用0、明示保存、純追加、topic逐語ログ不在、path guard、repo境界を確認 |
| C6 無回帰 | 5/5 | Sprint単体50 PASS / 0 FAIL、online全回帰277 PASS / 0 FAIL |
| C7 やさしさ | 4/5 | 選択権を残す確認と3行型は自然。ただし決定確認ターンの余分な説明が構造を不安定にする |

C1とC3が合格閾値4を下回るため、スプリント全体は不合格。

## 実行証跡

### 1. Sprint 010単体回帰

```console
$ bash scripts/sprint-010-regression.sh
PASS=50 FAIL=0
```

exit 0。timeline、保存境界、決定変更、節目規律、朝夕dailyの50 assertが成功した。

### 2. 全online回帰

最初のsandbox内実行では外部通信が使えず、section 12だけが次のとおり未検証になった。

```console
ONLINE=UNVERIFIED GitHub API request failed or a required file returned 404
PASS=276 FAIL=1
```

これはPASSに数えず、ネットワーク許可付きで同一コマンドを再実行した。

```console
$ bash scripts/regression-check.sh --online
REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact
ONLINE=PASS repo=mtaiseeei/yasashii-harness
PASS=277 FAIL=0
```

exit 0。remote実在性を含む全sectionが成功した。

### 3. 独自timeline fixture

Generatorの回帰fixtureとは別に `/tmp/yasashii-eval-s010.pYesPr/secretary` を作成し、
2026-07-14〜16のdecision / journalを固定時刻で投入した。

確認した組合せ:

- `--type decisions`、`journal`、`all`
- `--from`のみ、`--to`のみ、同日`--from/--to`
- `--grep "Zoom"`とliteral検索 `--grep "Zoom[本番]"`
- 0件 `--grep "存在しない語"`
- 異なる `CC_SECRETARY_NOW` で同じtimelineを2回生成

結果:

```console
CMP=0
READ_TREE_EQUAL=yes
OLD_DECISION_EQUAL=yes
FROM_ONLY dates=2026-07-16,2026-07-15
TO_ONLY dates=2026-07-15,2026-07-14
type-decisions decisions=2 journal=0
type-journal decisions=0 journal=6
type-all decisions=2 journal=4
```

主な実出力:

```markdown
## 2026-07-16

- [決定・変更（最新を優先）] 変更: 「Zoomはオンライン開催にする」(2026-07-14) → 「Zoomは対面開催にする」（会場確保）
- [活動・did 11:30] 会場へ連絡した

## 2026-07-15

- [活動・did 16:00] Zoom[本番]資料を作成
- [活動・next 08:30] 請求書を確認する

## 2026-07-14

- [決定] Zoomはオンライン開催にする
```

逆時系列、変更決定の最新優先表示、旧決定の保持、`all`でのdecided二重表示なしを確認した。
異なる現在時刻で生成した2ファイルはbyte一致した。

### 4. 閲覧と明示保存

独自fixtureのtimeline閲覧前後で全ファイルchecksumを比較した。

```console
READ_TREE_EQUAL=yes
DOCS_BEFORE=1 DOCS_AFTER=2 SAVE_JOURNAL=1
```

`.gitkeep` を除く成果物は閲覧だけでは増えず、`save-deliverable`を明示実行したときだけ1件増加した。
journalの「成果物を保存」も1件だけだった。

### 5. 決定模擬会話3本

Claude Code CLIへ `memory-care/SKILL.md` をsystem promptとして与え、
`Bash / Write / Edit / Read` 等のツールを禁止して応答だけを確認した。
このため、確認前のファイル副作用は0件である。

#### 会話1 — 「〜にしよう」

入力:

```text
Zoomは対面開催にしよう
```

観測:

```text
この内容を決定として残しますね: 「Zoomは対面開催にしよう」
```

これは原文1行確認を満たした。

#### 会話2 — 「じゃあそれで」

入力:

```text
候補AとBなら、じゃあそれで。
```

観測:

```text
すみません、「それで」がどちらを指すか確認させてください。候補Aと候補B、どちらに決めますか？（両方採用でしたらその旨教えてください）
お返事いただけたら「この内容を決定として残しますね: 〜」と1行で確認してから記録します。
```

曖昧さを確認する安全な応答ではあるが、契約上の「異なる決定表現3本で原文1行確認」は成立しない。
前文脈を加えた再試行でも、次のように確認行の前後へ説明が追加された。

```text
承知しました、候補Aで進めますね。

この内容を決定として残しますね: 「候補Aで。じゃあそれで」

よろしければ、今日（2026-07-16）の決めごととして記録します。
```

#### 会話3 — 「それで決定」

入力:

```text
配布日は7月25日。それで決定。
```

観測例:

```text
この内容を決定として残しますね: 「配布日は7月25日」

よろしければ、今日の日付（2026-07-16）で決定として記録します。
```

決定内容自体は保っているが、ユーザー原文末尾の「それで決定」が省かれ、確認応答も1行だけではない。
別実行では全文を含む確認行も出たため、規律が構造を安定して拘束できていない。

### 6. decided=0の締め

入力条件:

- 当日のdecisionは0件
- 会話中の未確認候補: 「次回から請求書は月末に送る」
- 締め入力: 「今日はここまで」

観測:

```text
この内容を決定として残しますね: 「次回から請求書は月末に送る」

よろしければ、今日の日付（2026-07-16）の決定として記録します。
```

拾い漏れ候補を検出し、記録前に確認している。ツールは禁止していたため無確認記録はない。

### 7. topic模擬会話

結論のないZoom運用相談を一区切りにした観測:

```text
要点を案件メモに残しますね: Zoom運用は、参加者へのURL送付タイミングと当日の担当者が未確定のまま検討中。

よければこの1行だけ記録します。会話の全文は保存しません。
```

確認中は副作用0。了承後に独自fixtureで `topic-add` を1回実行した。

```console
TOPICS_BEFORE=1 TOPICS_AFTER=2
TRANSCRIPT_LINES=0 JOURNAL=1
```

生成ファイルの本文は次の1要点だけで、逐語ログはなかった。

```markdown
## 確認済みの要点

- 参加者へのURL送付タイミングと当日の担当者は未確定で、次回も検討する
```

### 8. morning → daily → evening

固定fixtureで次の正本を分けて用意した。

- `_resume.md`: Zoom資料の図を仕上げる
- journal `next`: Zoom資料を完成する
- TODO: Zoom資料を送る（Googleカレンダー / event-20 / 2026-07-20）
- decision: 配布は17時にする

`resume-read`、timeline、`todo-list`の閲覧前後でjournal行数は不変だった。
中断点は`_resume.md`だけ、申し送りはjournal `next`だけ、TODOは根拠つき、decisionはdecision正本とjournalに各1件だった。

Claude CLIでのmorning観測:

```text
中断点・申し送り・TODOを確認して、今日の入口を整えました。
再開点はZoom資料の図の仕上げ、申し送りはZoom資料の完成、TODOはZoom資料の送付（Googleカレンダー / event-20 / 2026-07-20）です。
次は「図の続きから始めよう」と言ってください。中断点から再開します（しおりは再開後に確認してから消します）。
```

daily観測:

```text
今日の予定とTODOを突き合わせました。
今日（2026-07-16）当日の予定はなく、要点は2つです。Zoom説明会は4日後です（Googleカレンダー / event-20 / 2026-07-20）、その前にZoom資料の送付（TODO・根拠: Googleカレンダー / event-20 / 2026-07-20）。
次は「資料送付を進めたい」と言ってください。説明会の詳細をその場でカレンダーから確認します。
```

evening観測:

```text
今日の記録を締めました。やったことは「Zoom資料を送った」、決定は「配布は17時にする」の各1件です。
未完のTODO「請求書を確認する」はそのまま残し、「請求書を明日確認する」を申し送りにしました。
次は明日の朝「今日始めよう」と言ってください。この申し送りとTODOから入口を作ります。
```

いずれも3行型で、根拠と次の1提案を保ち、週次要約や閲覧由来のjournal追記はなかった。

### 9. 構文と差分

```console
$ bash -n scripts/regression-check.sh scripts/sprint-010-regression.sh \
    plugins/yasashii-secretary/scripts/lib/timeline.sh \
    plugins/yasashii-secretary/skills/memory-care/scripts/memory-tools.sh \
    plugins/yasashii-secretary/scripts/workspace-tools.sh
SHELL_OK

$ git diff --check
# exit 0
```

## 指摘事項

### I1. 決定確認が「原文を保った1行」に安定しない

- 重要度: 必須受入基準の未達
- 分類: `implementation-issue`
- 対象: `skills/secretary/SKILL.md`、`skills/memory-care/SKILL.md`、生成`AGENTS.md`

現在も「1行で確認」と書かれているが、実応答では挨拶、補助説明、再度の許可依頼が追加される。
確認ターンでは指定の1行だけを返して止めること、ユーザー原文を省略・正規化せずそのまま確認欄へ入れることを、
より明確な禁止事項と出力テンプレートで拘束する必要がある。

再現は上記「決定模擬会話3本」を参照。修正後は同じ3表現を実際のClaude応答で再評価する。

### I2. 生成AGENTSに旧専門用語規約が残る

- 重要度: 軽微だが現行specとの明示矛盾
- 分類: `implementation-issue`
- 対象: `plugins/yasashii-secretary/templates/AGENTS.md`

再現:

```console
$ rg -n '専門用語には、やさしい言い換えをカッコで併記する' plugins/yasashii-secretary/templates/AGENTS.md
```

観測:

```text
- 専門用語には、やさしい言い換えをカッコで併記する。
```

これは `rules/plain-language.md` と `docs/spec/constraints.md` の
「一般技術用語はそのまま使い、馴染みの薄い語だけ初出で短く補足」に反する。
生成物側も同じ現行規約へ揃える必要がある。

## ブラウザ検証

未実施。対象はWeb UIを持たないClaude Code pluginで、評価面はshellシーム、Markdown規律、Claude CLI模擬会話、
GitHub APIのonline参照導線である。UI・responsive・視覚品質の採点対象が無いため、スクリーンショットも対象外。

## 再評価条件

1. I1を修正し、決定表現3本をClaude CLIで実行して、各応答の確認部分がユーザー原文を保つ1行だけになること。
2. 3本とも了承前のdecision / journal増分が0、了承後は各1件だけになること。
3. I2を修正し、生成AGENTSと`plain-language.md`の専門用語規約が一致すること。
4. `bash scripts/sprint-010-regression.sh` が0 FAIL。
5. `bash scripts/regression-check.sh --online` が `ONLINE=PASS` かつ0 FAIL。
