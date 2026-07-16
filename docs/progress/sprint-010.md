# Sprint 010 Progress — G1体験: timeline と節目プロトコル

## ステータス

**Retry 1実装完了 — Evaluator再評価待ち**

## Retry 1 — I1 / I2対応

- 決定確認の規律を、ルーター、memory-care、daily evening、生成`AGENTS.md`で同じ境界へ揃えた。
  - 確認ターンは`この内容を決定として残しますね: <そのターンのユーザー入力全文>`の1行だけを返して停止する。
  - 句読点・助詞・決定表現を含む入力全文を一字も削らず、並べ替えず、言い換えずに使い、引用符も追加しない。
  - 挨拶、解釈、補足、曖昧さの質問、再度の許可依頼、空行、2行目を禁止した。この1行自体を記録可否の確認とする。
  - 確認ターンはツールを呼ばず、decision・journal・commitを変更しない。次の別ターンで明示的な了承を得た後だけ原文を記録し、否定・訂正・別の話題なら記録しない。
  - memory-care内の旧「その場で`remember-decision`に渡す」という緩い重複指示も、確認後だけに統一した。
- 生成`AGENTS.md`の旧「専門用語には、やさしい言い換えをカッコで併記する」を削除し、
  「一般的な技術用語はそのまま使い、馴染みの薄い語だけ初出時に短い補足」へ揃えた。
- `scripts/sprint-010-regression.sh`へ、厳密1行停止、入力全文の無加工、追加説明禁止、確認ターン無副作用、
  別ターン了承後だけの記録、3つの厳密出力例、現行専門用語規約の構造assertを追加した。
- 全体回帰の旧専門用語規約検査も、Evaluatorが再現した文言そのものを禁止対象へ追加した。

### Claude CLI模擬会話

`memory-care/SKILL.md`をsystem promptにし、`--tools ""`で全ツールを無効化して3会話を実行した。
各入力は2回実行しても同じ1行となり、句読点を含む入力全文が保持された。確認ターンのファイル副作用は0である。

```text
入力: Zoomは対面開催にしよう
出力: この内容を決定として残しますね: Zoomは対面開催にしよう

入力: 候補AとBなら、じゃあそれで。
出力: この内容を決定として残しますね: 候補AとBなら、じゃあそれで。

入力: 配布日は7月25日。それで決定。
出力: この内容を決定として残しますね: 配布日は7月25日。それで決定。
```

CLI起動時にユーザー設定由来のpermission rule警告がstderrへ出たが、assistant応答は上記1行だけで、ツールは利用できない条件だった。

## 実装内容

- `scripts/lib/timeline.sh`に決定的なtimeline整形を追加し、`memory-tools.sh timeline`から利用できるようにした。
  - `--from` / `--to`（両端を含む）、`--type decisions|journal|all`、literal検索の`--grep`を組み合わせられる。
  - decision正本とjournalを日付の逆順、同日内は決定・時刻・追記順が決定的になるようMarkdownへ整形する。
  - `all`ではdecision正本を優先し、journalの対応する`decided`を二重表示しない。
  - `変更:`で始まる純追加の変更決定を「決定・変更（最新を優先）」と表示し、過去の決定も後ろに残す。
  - 0件、不正日付、逆転期間、不正type、不明optionを日本語で扱う。読み取り対象もpath guardを通す。
  - timelineの閲覧はファイルを作成・変更しない。「保存して」と明示された場合だけ既存`save-deliverable`へ渡す。
- 薄いルーターとmemory-careへ自然言語導線を追加した。
  - 「今日やったこと」「先週なにしてた」はjournalの期間表示へ接続する。
  - 「いつ決めた」「7月に決まったこと」はdecisionsへ、固有名詞を含む「Zoomの件いつ決めた」は`--grep`へ接続する。
  - 単なる閲覧と「保存して」の成果物保存を別導線に保った。
- ルーター、memory-care、生成`AGENTS.md`へ節目プロトコルを追加した。
  - 「〜にしよう」「じゃあそれで」「それで決定」の3表現を決定の合図として扱う。
  - 原文を膨らませず「この内容を決定として残しますね: …」と1行確認し、了承後だけ`remember-decision`へ渡す。
  - 会話の締めで当日decisionが0件なら会話を読み返し、拾い漏れ候補を1回確認する。
  - 結論のない相談は「要点を案件メモに残しますね: …」と1行確認し、了承後だけ要点を`topic-add`へ渡す。
  - 決定検出はLLMによるため完全自動ではなく、都度＋締めの二段構えで補うことを明記した。
  - sprint-011の「まとめて」設定を現在利用可能な機能として案内しない。
- dailyをmorning / daily / eveningの一続きの体験へ再構成した。
  - morningは`_resume.md`の中断点、journalの`next`、未完TODOを別の役割として確認する。
  - dailyは外部予定・タスクの都度参照、根拠、ローカルTODOの既存責務を維持する。
  - eveningは当日のtimeline・decision、未完TODO、next、決定拾い漏れを確認し、週次要約は作らない。
  - モードに入ったこと自体はjournalへ書かず、正規シームの成功事実だけが1回追記される。TODO完了・持ち越しも既存の2段階確認を維持した。
- `scripts/sprint-010-regression.sh`（Retry 1後は56 assert）と全体回帰section 15を追加した。

## timeline出力の実証

固定fixtureは2026-07-14〜16に、旧決定、活動、申し送り、変更決定を作成した。同じ入力を異なる
`CC_SECRETARY_NOW`で2回実行してもbyte一致し、最新日から次の形で表示された。

```text
# timeline

- 期間: 指定なし 〜 指定なし
- 種類: all

## 2026-07-16

- [決定・変更（最新を優先）] 変更: 「Zoomはオンライン開催にする」(2026-07-14) → 「Zoomは対面開催にする」（会場確保）
- [活動・did 11:30] 会場へ連絡した
```

`--from 2026-07-15 --to 2026-07-15`は15日だけを含み、`--grep 'Zoom[本番]'`は角括弧を
正規表現として解釈せず該当行だけを返した。存在しない語では「該当する記録はありません」と返した。

## 検証結果

### Sprint 010実動作回帰

- コマンド: `bash scripts/sprint-010-regression.sh`
- 結果: `PASS=56 FAIL=0`、exit 0。
- 主な証跡:
  - timelineの同一入力byte一致、逆時系列、from/to境界、decisions/journal/all、literal grep、0件。
  - 変更決定を最新優先で表示しつつ、旧decisionファイルのchecksum不変。
  - 閲覧前後の全ファイルchecksum一致。明示保存だけが成果物とjournal 1行を生成。
  - 不正option 4種のexit 2、境界外journal symlinkのexit 3。
  - 決定3表現、厳密1行停止、入力全文の無加工、確認ターン無副作用、decidedゼロ、topic確認、未実装設定の非案内を配布規律で検査。
  - morning→daily→eveningの読み取りではjournal増分0。中断点、next、TODO、外部根拠、決定を別の正本に保持。

### 全online回帰

- コマンド: `bash scripts/regression-check.sh --online`
- 結果: `PASS=277 FAIL=0`、exit 0。
- online結果: `ONLINE=PASS repo=mtaiseeei/yasashii-harness`。
- sandbox内の初回実行は外部通信不可で`ONLINE=UNVERIFIED`となった。ネットワークを許可した同一コマンドを
  最終コード変更後に再実行し、上記の全緑を確認した。通信不可をPASSには数えていない。

### 構文・差分

- `bash -n`:
  - `scripts/regression-check.sh`
  - `scripts/sprint-010-regression.sh`
  - `plugins/yasashii-secretary/scripts/lib/timeline.sh`
  - `plugins/yasashii-secretary/skills/memory-care/scripts/memory-tools.sh`
  - すべてexit 0。
- `git diff --check`: exit 0。
- 新規timeline共有libとSprint回帰スクリプトの実行権限を確認済み。

## 起動・評価引き渡し

- 製品形態: Claude Code plugin。Web UIはないためテストURLは該当なし。
- 起動:
  1. `/plugin marketplace add mtaiseeei/yasashii-secretary`
  2. `/plugin install yasashii-secretary@yasashii-secretary`
  3. `/secretary`
- Sprint 010単体回帰: `bash scripts/sprint-010-regression.sh`
- 全回帰: `bash scripts/regression-check.sh --online`

## Evaluator向け具体的シナリオ

1. 固定fixtureでtimelineを2回実行し、`cmp`、逆時系列、同日順、from/to両端、各type、literal grep、0件を確認する。
2. 旧決定のchecksumを取り、別日の変更決定を追加して、旧ファイル不変・新しい変更の優先表示・履歴保持を確認する。
3. 「Zoomの件いつ決めた」を閲覧し、`secretary/docs/`が増えないことを確認する。続けて「この結果を保存して」でだけ成果物とjournalが1件増えることを確認する。
4. 次の3会話を行い、応答が原文を保った1行確認になり、了承前にはdecision/journalが増えないことを確認する。
   - 「Zoomは対面開催にしよう」
   - 「候補AとBなら、じゃあそれで」
   - 「配布日は7月25日。それで決定」
5. 決定候補「次回から請求書は月末に送る」を含むが記録しない会話を「今日はここまで」で締め、当日decision 0件から拾い漏れ確認が1回出ることを確認する。
6. 結論のないZoom運用相談を一区切りし、topic保存前の1行確認、了承後の要点だけの保存、逐語ログ不在を確認する。
7. morningで`_resume.md`、next、TODOを分けて表示し、dailyで接続済み外部予定とTODOを根拠つきで突き合わせ、eveningでTODO完了・持ち越しと決定確認を行う。各正規操作のjournal増分が1で、モード閲覧による増分が0であることを確認する。
8. 既定の報告が「やったこと／結果／次に何が起きるか」の3行で、提案がある場合も3行目の1つまで、無断着手なしであることを確認する。

## 既知の範囲・残課題

- Claude Codeへのプラグイン実インストールはGenerator環境では未実施。Retry 1ではmemory-careをsystem promptにしたClaude CLI模擬会話3本を各2回実行して厳密1行を確認し、独立Evaluatorが同じ条件を再評価する。
- `preferences.md` v2、口調・詳しさ変更、「決定の確認: まとめて」の設定UIはsprint-011の範囲。今回は既定の都度確認だけを有効にした。
- weeklyと索引退避運用はsprint-012、dashboardは対象外。eveningは週次要約を行わない。
- 本体repoのcommit・pushは行っていない。別repoにも変更を加えていない。

## 自己評価

| 基準 | スコア | 根拠 |
|---|---:|---|
| C1 完成度 | 5/5 | timeline、節目、朝夕daily統合、ルーターの全ACを実装 |
| C2 構文・整合 | 5/5 | shell構文、参照先、実行権限、配布構造、online参照導線が整合 |
| C3 機能の実証 | 5/5 | 固定fixtureと56 assertに加え、Claude CLIの決定3会話を各2回実行して厳密1行を確認 |
| C4 非エンジニア体験 | 5/5 | 自然言語ルーティング、一般技術用語、3行報告、0件・エラー案内を維持 |
| C5 安全・規律 | 5/5 | 読取path guard、純追加、確認前副作用0、保存明示、外部同期なし、pushなし |
| C6 無回帰 | 5/5 | Sprint単体56 PASS、全online回帰277 PASS / 0 FAIL |
| C7 やさしさ | 5/5 | 1行確認・締め確認・1提案の境界を明示し、規律を緩めていない |
