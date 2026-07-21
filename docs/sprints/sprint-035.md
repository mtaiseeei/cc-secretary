# Sprint 035 — 2 edition最終parity・Harness 0.5.0互換・公開gate

- Type: main
- Risk: high（2 Secretary repo、正式Plugin配布、cross-repo整合、外部公開、後始末）
- 主眼: agentic／yasashiiの共通性、意図した差分、Git系譜、`0.8.0` candidate、安全性、会話可読性、対応Harness 0.5.0との分離連携、host-neutralなplugin root解決を証明し、明示許可された場合だけ公開する。
- 依存: sprint-034 done。Sprint 029〜034のfeedbackが全てpass。
- 対象repo: `/Users/taisei/workspace/agentic-secretary` と `/Users/taisei/workspace/yasashii-secretary`。
- 絶対禁止境界: `/Users/taisei/workspace/agentic-harness` はread、list、存在確認、status、HEAD、branch、remote確認を含め一切対象にしない。

## ユーザー決定と前提

1. SecretaryとHarnessは別Plugin／別Repoの現行設計を維持する。Secretaryは対応Harnessの識別、導入状態確認、host別の導入案内、導入済みHarnessへの接続だけを持つ。
2. Harness本体のskills、agents、commands、hooks、runtime script、vendor依存、Git履歴をSecretaryへmerge、vendor、submodule、symlink、コピーで内包しない。Secretary manifestからの暗黙自動導入も行わない。
3. `agentic-secretary` の対応先はGitHub `mtaiseeei/agentic-harness` `main` `0.5.0`、`yasashii-secretary` の対応先はGitHub `mtaiseeei/yasashii-harness` `main` `0.5.0` とする。2026-07-21のread-only観測commitはそれぞれ `aafdf97d1f673a856c5a2a2fe72f87f1a4b57e89`、`8f9eb4c1d9e14414a7e94051ca6f4c34da282784`。公開判定時はGitHub `main` を再観測し、前進または識別変更があれば推測で追随せず差分を記録する。
4. 既存の `CLAUDE.md`、`AGENTS.md`、Agent定義、製品固有指示、個人Harness設定を全面置換しない。0.5.0追随は必要な設定・運用案内・互換回帰だけを既存正本へ統合する。
5. `docs/sprints/state.md` の0.5.0遅延移行と状態更新はOrchestratorだけが行う。Generator／Evaluatorはstateを編集しない。

## 外から見える成果

2 editionが対象ユーザーに合わせた完成品としてClaude Code／Codexから安全に導入・更新でき、互いのworkspaceを壊さない。
開発依頼では対応Harness 0.5.0を正しいhost別手順で案内し、導入済みなら同じ3 roleループへ接続する。
保守者は製品parity、Harness互換、公開可否を、後付けの過剰な証明基盤ではなく契約済みの実用証拠から判断できる。

## Scope

### A. 2 edition最終整合

- 両repoのcommon／edition／archive／official validator suiteを同一の `0.8.0` candidateで実行する。
- Git共通祖先、別repo、fetch専用upstream、push URL無効、overlay冪等性、repo-owned docs、LICENSE／単段クレジットを確認する。
- wizard DOM／copy／OAuth scope／同期／安全ruleのparityと、会話・診断・報告・developer handoffだけのedition差分を確認する。
- neutral／legacy／反対edition／混在／不明、新規0.8.0導入、equal／downgrade副作用0停止を確認する。旧 `0.7.0` raw CHANGELOGは歴史的互換fileとして正本とbyte一致を確認するが、未検証のlive update成功を公開条件にしない。
- 両editionの全会話面に段落・改行・必要なMarkdown箇条書きがあり、Chatwork Secret入力案内が共通で具体的であることを確認する。
- README、mapping、CHANGELOG、Claude／Codex manifest・marketplace、配布ID、version、repository／homepageを最終照合する。

### B. 対応Harness 0.5.0への追随

- GitHub remote／raw／APIのread-only結果だけを使い、両Harness `main` のobserved commit、Claude marketplace／plugin manifest、Codex repo marketplace／plugin manifest、README、version `0.5.0` を記録する。
- Claude CodeではAgenticを `agentic-harness`／`harness@agentic-harness`、Yasashiiを `yasashii-harness`／`harness@yasashii-harness` と案内する。
- CodexではAgenticを `agentic-harness-local`／`harness@agentic-harness-local`、Yasashiiを `yasashii-harness`／`harness@yasashii-harness` と案内する。ClaudeのIDをCodexへ、または逆へ流用しない。
- edition設定、`build`、README、導入確認、接続案内、offline／online検査がhost別の正式値と一致する。通常会話からの起動と、Claude Codeの `/harness`、Codexの `$using-harness`／`$harness-loop` を混同しない。
- 両Secretary repoの `.harness/config.toml` は既存model／effort／lifecycleを保持したまま、lineage dispatch上限10、同一Sprintのspec-issue差し戻し上限2を扱う。
- repo内 `AGENTS.md`／`CLAUDE.md`／`docs/harness-guidance.md` は、`verification-scope-issue`、findingのproduct／verification-infra区分、契約済み証拠のsafe harbor、active Sprintの基準変更gate、Spec-Issue Count／Lineage Dispatches、増分再評価、同一candidate証拠の条件付き再利用、`done-by-user-decision` を矛盾なく扱う。
- 誤version、誤host ID、manifest欠落、network不可、Harness実体／agentsの復活、既存製品指示の消失を負ケースとして検出する。

### C. host-neutral plugin rootとCodex正式配布parity

- 共通15 skillsの `SKILL.md` とそこから参照するscripts、rules、templatesをinventoryする。
- 各 `SKILL.md` の実パスを起点に共通plugin root `plugins/secretary/` を解決する。通常shellで未設定の `${CLAUDE_PLUGIN_ROOT}` を前提にせず、未解決変数、空path、誤rootをcommand引数またはfilesystem pathへ渡さない。
- `${CLAUDE_PLUGIN_ROOT}` 以外のslash command、Hook、Claude固有UI、Claude marketplace、Claudeだけの起動・更新前提も全15 skillsと配布面でinventoryする。共通化できる意味内容・script参照・安全契約はhost-neutral本文にし、真にhost固有な導入・起動・UI・更新だけをadapter／案内で分ける。
- 共通skills本文をhost別に複製しない。静的inventory、任意の絶対pathへ配置したfixture、既存Codex正式installテストを主証拠にし、Claude Code、Codex App、Codex CLIの代表script確認は必要最小限にする。
- `agentic-secretary` と `yasashii-secretary` の双方に `plugins/secretary/.codex-plugin/plugin.json` とrepo root `.agents/plugins/marketplace.json` を持たせる。両manifestは同じ `plugins/secretary/skills/` を参照し、edition別identity、`0.8.0`、repository、marketplace、`source.path=./plugins/secretary` を正しく表す。
- agentic側だけのCodex manifest、Claude marketplaceのlegacy互換、手動skillsコピー、repo-local `AGENTS.md`／configだけでyasashiiのCodex正式配布PASSを作らない。

### D. 最終外部gate

- internal candidateの全受入を先に完了し、候補commit、対象操作、副作用、rollback、後始末を示す。
- ユーザーがその操作を明示許可した場合だけpush、正式plugin install／update、public設定、release、private test workspace、Secret、OAuth、workflow dispatchへ進む。

## Non-scope

- edition switching、co-install、反対edition ledger／marker／履歴のmigration。
- 公開gate中の新機能追加、根拠なしの `forkedFrom` 変更。
- same-version bootstrap bridge、公開済み `0.7.0` のin-place差替え、version downgrade／equal update。
- 旧0.7.0利用者向けexternal recovery／bootstrapと、未検証の標準live update互換の主張。
- Harness本体またはHarness Git履歴のSecretaryへの内包、Harness repo同士またはSecretaryとのGit merge、Harnessの改造・release。
- schema v2／v3の統一collector／driver／attestor、challenge、二層artifact等を本Sprintの新しい必須証明基盤として作ること。
- host-neutral監査だけのために新しい大規模runner、実host collector、統一attestation schemaを作ること。

## 受入基準

1. 両repoの本Sprint対象master／edition／archive／official validator suiteが0 FAILで、internal必須項目の未実行が0件。external許可待ちはinternal PASSへ混ぜず `external-live-gate-unavailable` として分離する。
2. common parityは完全一致し、edition差分は4面と宣言済み配布identity／overlay面だけ。agenticの技術者向け直接性とyasashiiの非エンジニア向け段階表示を維持する。
3. Git merge-base、agentic別directory／repo、yasashii fetch専用upstream、push URL無効、overlay二回適用同一digestが証拠化される。
4. 旧raw CHANGELOGが正本とbyte一致し、0.7.0の歴史記録が不変で、新規0.8.0導入とequal／downgrade副作用0停止が合格する。旧0.7.0 updaterの既知blockerを対応済みまたはlive互換PASSと誤表示しない。
5. 反対edition、混在、不明は両方向で副作用0件。co-install／切替UI 0件。
6. LICENSE、単段クレジット、README／mapping、Claude／Codex manifest・marketplace、version／URL／IDが `0.8.0` candidateで整合する。公開済み `0.7.0` の記録・fixture・履歴は不変で、`forkedFrom` はvalidator証拠と一致する。
7. 対応HarnessのGitHub `main` は両方とも `0.5.0`。Claude／Codex別のmarketplace、plugin name、install ID、repository／homepageが各Secretaryのedition設定、build案内、README、online検査と一致する。network不可をPASSにしない。
8. Secretary配布物とGit履歴にHarness実体、3 agents、commands、hooks、runtime script、vendor依存、Harness commitの取り込みが0件。manifestの暗黙依存・自動installも0件。
9. 両Secretary repoのHarness設定・ガイダンスが0.5.0の停止上限10／2、第三の失敗分類、safe harbor、基準変更gate、state counter責務、増分再評価、証拠再利用、user-decision出口を扱い、既存の製品固有指示・model／effort・agentic／yasashii差を保持する。
10. 全15 skillsの参照で未解決 `${CLAUDE_PLUGIN_ROOT}`、空path、cwd依存の誤rootが0件。各SKILL実パスから共通plugin rootへ決定的に到達し、未解決変数をshellへ渡す負ケースは副作用0件で停止する。
11. 全15 skillsと配布面についてClaude Code限定前提のinventoryがあり、共通本文への不必要なClaude限定動作0件、host adapter／案内が必要な面の欠落0件、host別skill本文コピー0件。任意path fixtureと既存Codex正式installテストが合格し、Claude Code、Codex App、Codex CLIの最小代表script確認で同じ共通本体への到達を示す。
12. 両editionの `.codex-plugin/plugin.json` と `.agents/plugins/marketplace.json` が正式構造、edition identity、`0.8.0`、共通skills参照、repository、source.pathを満たす。agenticだけのPASSをyasashiiへ流用せず、Codex App／CLIで各editionを別々にdiscoverできる。
13. agentic／yasashiiの全会話面がMarkdown可読性を満たし、内容と対象ユーザーの差を維持する。Chatwork wizardは `Name` 欄=`CHATWORK_API_TOKEN`、`Secret` 欄=本人が公式画面で取得したTokenと明示し、実値を製品側へ入力させない。
14. 外部操作はその都度の明示許可範囲だけ。実施した場合はSecret、schedule、OAuth、test選択、不要なsession／test artifactの後始末が完了する。履歴またはtest workspaceの削除は別の明示許可なしに行わない。
15. Finding High〜Low、未検証のinternal必須項目、cleanup残りが0件で、許可済みexternal gateも完了した場合だけ `ready`。許可不足は `external-live-gate-unavailable`、製品不具合は `implementation-issue`、仕様不足は `spec-issue`、検証基盤だけの過剰要件・不備は `verification-scope-issue` として分離する。

## Safe harborとなる合格証拠

Evaluatorは次を満たせば、それ以上の統一attestation基盤を追加の必須条件にしない。

- 実行したcommand、終了コード、assert／suite集計、対象candidate commit。
- cross-repo diff／digest、merge-base、remote fetch／push設定、overlay二回適用結果。
- GitHub API／rawから得たobserved Harness commit、version、Claude／Codex manifest・marketplaceの必要field。
- 15 skillsと配布面の静的inventory、任意path fixture、既存Codex正式install結果、3 hostの最小代表script到達記録。
- running wizardのURL／DOM／操作／computed styleと、UI評価に必要なscreenshots。
- 外部gateを実行した場合の対象、許可、結果、rollback可能性、後始末。未許可なら未実行を明記する。

同一commitに結びつき、対象file、manifest、installed cache、host sessionが変わっていない既存証拠は再利用できる。
変更された面、失効条件に該当する面、証拠が欠ける面だけ増分再評価する。回帰スイートが実行不能または失敗のままなら再利用で補わない。

## 回帰保護

- 両repoのmaster offline／online、edition、archive、overlay、新規0.8.0導入、equal／downgrade停止、反対edition、conversation readability、secret／Git／wizard suiteを実行する。
- Harness 0.5.0 compatibility gateは両edition×Claude／Codexを別集計し、wrong version、wrong host ID、missing manifest、network unavailable、bundled Harness復活、既存guidance消失を検出する。
- plugin root／host-neutral gateは15 skills全件、未設定env、空値、文字列 `${CLAUDE_PLUGIN_ROOT}`、誤cwd、任意path、Claude限定前提inventory、Claude／Codex配布rootを検査する。
- manifest／CHANGELOG／README／mapping／edition設定のcross-repo整合と、壊したfixtureを検査する。

## 手動・browser証跡

- agentic／yasashiiの4面を同一scenarioで比較し、意図した差分と共通安全情報を記録する。
- 両edition×両wizardをdesktop／mobile／200%で操作し、screenshots、DOM、computed style、focus、44px、OAuth scopeを記録する。
- 新規0.8.0導入、equal／downgrade停止、反対edition停止を会話・実file状態で確認する。旧0.7.0 updater blockerは未解消として正直に区別する。
- Claude Code、Codex App、Codex CLIで、共通skillから代表scriptへ到達する。Codex App／CLIは両editionの正式manifest／marketplaceを別々に確認する。

## External live gate

GitHub repo／remote、push、public設定、release、実plugin install／update、private test workspace、Secret、OAuth、workflow dispatchは、
各操作直前に対象repo、候補commit、実行内容、副作用、rollback、後始末を示してユーザーへ再確認する。
read-onlyのGitHub remote／raw／API確認はこの外部write gateに含めない。
許可不足は `external-live-gate-unavailable`。履歴／test workspaceの削除は別の明示許可が必要で、公開後も後始末未完了なら `ready` にしない。
