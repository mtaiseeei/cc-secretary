# Sprint 012 Patch 001 — 最終監査: 境界規約・serializer・構成正本・復元可能commit

- Type: regular patch
- 主眼: sprint-008〜012の実装後に行った最終監査で見つかった、root規約、通常報告serializer、構成文書、未commit差分の4つのずれを閉じる。新機能は追加しない。
- 依存: sprint-012 done。Sprint 011 Retry 2の18独立sessionとSprint 012の週次対話を含む全評価が合格済みであること。
- 変更先: `yasashii-secretary` 本体だけ。`yasashii-harness` は変更しない。
- 絶対境界: `/Users/taisei/workspace/agentic-harness` および `~/workspace/agentic-harness` は、読み取りを含む全面接触禁止。ファイル操作、`ls` / `stat` / `test`、HEAD / status確認、`git -C`、複製元、symlink先、コマンド対象のいずれにも使わない。上流情報が必要な場合はGitHub上のremote/APIだけを使う。
- リモート権限: local commitは必須。push、tag、release、remote変更は行わない。

## 背景

最終監査で次を確認した。

1. root `CLAUDE.md` だけがローカル `agentic-harness` を「読み取り専用」と表現し、proposal / DESIGN / specの「読み取りを含む全面操作禁止」より弱い。
2. 通常報告の唯一の正本は `rules/plain-language.md` の最終応答serializerだが、`daily`、`connections`、`onboarding`、`setup-google`、`setup-microsoft`、`setup-notion` 等に独自の「3行」指示や引用形式の例が残る。現状の回帰は行頭が素の `やったこと:` である重複を主に検査し、blockquote、箇条書き、コードブロック等へ埋め込まれた競合schemaを見逃し得る。
3. 実装は `daily` 内の morning / daily / evening 3モード統合だが、proposalとDESIGNの構成例には独立 `skills/morning/` / `skills/evening/` 新設の記述が残る。
4. sprint-008〜012の本体差分は検証済みだが、まだ本体repoの1つの復元可能なlocal commitへ収録されていない。

## 外から見える成果

1. 開発者がroot `CLAUDE.md` を入口にしても、禁止checkoutへ読み取りコマンドを向けない。
2. 通常報告は、直接skillを呼んだ場合を含め、`plain-language.md` のserializerが最後に1回だけ適用される。各skillは内容と安全条件だけを定義し、独自の3行／4行schemaを持たない。
3. daily、onboarding、connectionsの実Claude最小対話が、既定で物理3行、明示「くわしく」で物理4行になり、前置き・空行・後書き・二重包装がない。
4. proposal / DESIGNの配布構成が、独立morning/eveningではなくdaily内3モードという実装と一致する。
5. sprint-008〜012と本Patchの全差分が、pushされていない1つのlocal commitから復元できる。

## スコープ

### A. root境界規約の整合

- root `CLAUDE.md` の「読み取り専用」を、読み取りを含む全面接触禁止へ改訂する。
- 禁止対象には、編集だけでなく、存在確認、一覧、status / HEAD / branch / remote確認、checkout / switch、commit、生成物作成、複製元利用、symlink経由、当該checkoutを対象にしたコマンド実行を含める。
- 許可する上流参照はGitHub上の `mtaiseeei/agentic-harness` のremote/APIだけとする。
- root規約、proposal、DESIGN、spec、回帰コメントの意味が同じであることを機械検査する。単に「書き込まない」だけの弱い表現を合格にしない。

### B. 最終応答serializerを唯一の正本へ統合

- 通常報告の行数、prefix、空行、前置き／後書き禁止を所有するファイルは `plugins/yasashii-secretary/rules/plain-language.md` だけとする。
- `daily`、`connections`、`onboarding`、`setup-google`、`setup-microsoft`、`setup-notion` を含む全skills、templates、toneは、serializerへの参照と、当該面が返す内容・安全条件だけを持つ。
- 下位skillに残る独自の完了報告例、3行の書式指定、固定prefix、serializerと競合する引用例を除去または内容要件へ置き換える。独自の見出しが「3行で返す」と再定義する状態も残さない。
- 選択肢の説明として「みじかく=3行」「くわしく=補足1つ」と示すことは許可するが、別schema、別prefix、完成した出力例を持たせない。
- 決定確認、topic保存確認、settings反映確認等、既存の厳密1行プロトコルは通常報告serializerの例外として維持し、3行へ再包装しない。
- `scripts/sprint-012-patch-001-regression.sh` を追加し、同じvalidatorを本物の配布面と意図的失敗fixtureへ使う。
- validatorは少なくとも次の競合schemaを検出して非0にする。
  1. 素の `やったこと:` / `結果:` / `次に何が起きるか:` の複製。
  2. `> やったこと:` 等のblockquote内複製。
  3. `- やったこと:` 等の箇条書き内複製。
  4. fenced code block内の複製。
  5. leading whitespaceやMarkdown装飾を付けた固定prefix複製。
- 正本以外の競合schema件数を0にし、正本参照の欠落、独自包装の再追加、serializer適用前の途中メッセージを回帰で拒否する。

### C. proposal / DESIGNの構成整合

- `morning` / `evening` は独立SKILLではなく、`skills/daily/SKILL.md` 内のモードであると記録する。
- 白紙化前の旧実装をそのまま復元せず、journal、timeline、TODO、`_resume.md` と統合した事実を保つ。
- 歴史説明、モード名、Sprint契約内の「morning / evening」という語は削除対象ではない。独立directoryを現行構成として示す記述だけを直す。

### D. 全差分を復元可能なlocal commitへ収録

- commit前に、現在のHEAD、origin/main、branch、tracked / untracked差分一覧を証跡へ記録する。禁止checkoutは証跡取得の対象にしない。
- Generatorは、sprint-008〜012と本Patchで本体repoに生じた全差分（Planner正本、既存feedback、Generator progress、本体実装、回帰資産、オーケストレーターが作成済みのstateを含む）を、評価用の暫定local commit 1件へ収録する。
- commit messageは日本語とし、`[sprint-012-patch-001]` をprefixにする。
- Generator引き渡し時はindexとworktreeをcleanにし、暫定commitのparentが記録したcommit前HEADと一致することを確認する。Evaluator差し戻し時は、未pushの暫定commitをGeneratorがamendし、最終的なPatch commitを1件に保つ。
- Evaluator合格後、オーケストレーターは自身が更新した最終`state.md`とEvaluatorが書いた本Patchのfeedbackだけを同じ暫定commitへamendする。評価済みの実装・正本・回帰・progressに差分が出ている場合はamendせず、再評価へ戻す。
- 最終amend後、`/private/tmp` の一時cloneで、Patch commitのparentから当該commitを再適用し、生成treeがPatch commitのtreeと一致することを確認する。これにより最終commit単体から全差分を復元できることを実証する。
- `origin/main`、remote URL、remote branchを変更せず、pushしない。

### E. 旧path一時symlinkの終了条件

- Generatorは `/Users/taisei/workspace/cc-secretary` の一時symlinkを評価前に除去しない。Harness継続とEvaluatorの作業pathを保つ。
- Evaluator合格後、オーケストレーターがsymlinkだけを除去する。実体 `/Users/taisei/workspace/yasashii-secretary` は変更・移動・削除しない。
- 除去後は、旧pathが存在せず、新pathがcanonical repoとして利用できることをオーケストレーターが確認してstateへ記録する。

## スコープ外

- 新しい秘書機能、schema、設定項目、コネクタ、UIの追加。
- `yasashii-harness` の変更、commit、push、sync。
- `/Users/taisei/workspace/agentic-harness` への読み取りを含む一切の接触。
- `yasashii-secretary` のpush、tag、release、remote変更。
- 合格前の旧path symlink除去。

## 受入基準

1. **root規約整合（C2/C5）**: root `CLAUDE.md` が読み取り、存在確認、status / HEAD確認を含む全面接触禁止とGitHub参照限定を明記し、proposal / DESIGN / specと意味が一致する。弱い「読み取り専用」「書込禁止」表現がroot規約に残らない。
2. **serializer唯一正本（C2/C4）**: 固定3行／4行schemaの所有者は `plain-language.md` 1件だけ。全skills / templates / tonesは正本参照だけで、独自の行数規約、固定prefix、完成出力例、再包装を持たない。厳密1行プロトコルは維持する。
3. **競合schema検出（C2/C6）**: 専用回帰が素の行、blockquote、箇条書き、コードブロック、indent／装飾の5種以上の意図的失敗fixtureをすべて拒否し、実配布面の正本外競合件数が0。
4. **実Claude daily（C3/C4/C7）**: 実ユーザーデータを含まない合成fixtureで、dailyの既定と「くわしく」を独立sessionで実行する。通常報告はそれぞれ物理3行／4行、空行0、prefix 3/3（詳細は＋`補足:`）、前置き・後書き・途中メッセージ0。
5. **実Claude onboarding（C3/C4/C7）**: onboardingの必要最小対話を既定と「くわしく」で独立実行し、通常の完了報告が物理3行／4行になる。質問や明示確認の厳密プロトコルは通常報告へ数えず、完了turnにschemaを二重適用しない。
6. **実Claude connections（C3/C4/C5/C7）**: connectionsの必要最小対話を既定と「くわしく」で独立実行し、通常報告が物理3行／4行になる。実コネクタ証跡が無い場合は接続状態を「未確認」とし、未接続・認証済み等を断定しない。
7. **構成文書（C2）**: proposal / DESIGNがdaily内3モードを現行構成とし、独立 `skills/morning/` / `skills/evening/` の新設を現行実装として要求しない。実ファイルtreeと一致する。
8. **専用・offline・online回帰（C6）**: Patch専用、Sprint 010、Sprint 011、Sprint 012、全offline回帰が全て0 FAIL。全online回帰はGitHub APIの `ONLINE=PASS` と0 FAILを持つ。ネットワーク不可の `UNVERIFIED` は合格証跡に数えない。
9. **境界（C5）**: 作業・検査・commit・復元リハーサルの全経路で禁止checkout接触0、`yasashii-harness`変更0、実ユーザーの記憶・credentials・業務データの外部送信0、push 0、remote変更0。実Claudeには明示承認されたplugin指示と合成fixtureだけを送る。
10. **復元可能commit（C1/C5/C6）**: `[sprint-012-patch-001]` prefixの日本語local commit 1件が、最終feedbackとdone stateを含む全差分を収録する。最終amend後のindex / worktreeはclean、parentは記録したcommit前HEADと一致し、一時cloneでparentへの再適用後treeがcommit treeと一致する。origin/mainは前後不変。暫定commit後に評価済み実装へ変更があれば再評価する。
11. **symlink後処理（オーケストレーター条件）**: Evaluator合格後に限り、旧path symlinkだけを除去する。新canonical pathとrepo実体は維持し、旧path不在・新path健全をstateへ記録する。

## 評価証跡

- root `CLAUDE.md`、proposal / DESIGN / specの境界文言照合。
- schema owner一覧、全参照面一覧、blockquote等5種以上のnegative fixture結果。
- daily / onboarding / connectionsの各2session、合計6独立Claude sessionのID、入力、全物理行、空行、prefix、外部事実断定の判定。合成fixtureだけを使う。
- Patch専用、Sprint 010 / 011 / 012、全offline / online回帰のコマンド、終了コード、PASS / FAIL / UNVERIFIED集計。
- commit前HEAD / origin/main / status、暫定commitと最終commitのSHA / parent / tree、最終commit後status、push無し、remote不変。
- 一時cloneでの再適用結果とtree一致。
- Evaluator合格後にオーケストレーターが行う旧symlink除去と新path健全性の記録。

## 参照

- `docs/proposal-2026-07-15-realignment.md`
- `docs/DESIGN.md`
- `docs/spec/constraints.md` 1章・既定値と上書き
- `docs/spec/ui.md` 体験の原則・既定値
- `docs/spec/rubric.md` C2 / C4 / C5 / C6 / C7
- `docs/feedback/sprint-011.md` Retry 2 最終再評価
- `docs/feedback/sprint-012.md` 最終評価
