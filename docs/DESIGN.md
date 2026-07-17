---
createdAt: 2026-07-08 00:30
updatedAt: 2026-07-17
tags:
  - Claude
  - AI
  - 開発
  - ドキュメント
status: approved
---

# やさしい秘書プラグイン設計方針（yasashii-secretary）

Claude Codeを使う非エンジニア一般へ配布する、AI秘書プラグインの設計方針。

> **2026-07-15 方針転換の扱い**
> `docs/proposal-2026-07-15-realignment.md` が本作業の唯一の引き継ぎ正本である。
> 本文はその承認事項を恒久設計へ反映したもの。実装・評価の詳細正本は `docs/spec/` と sprint 契約に置く。
>
> **2026-07-16 Chatwork追加方針**
> ユーザーが承認したsingle-repo Git-first + Chatwork方針は `docs/spec/` を追加正本とし、
> 本文の旧「外部同期なし・ローカルだけ・Web UIなし・pushなし」と衝突する箇所を上書きする。

## 確定した意思決定

- 配布対象はClaude Codeを使う非エンジニア一般。年齢、特定の講座・教材の経験、Git / GitHubの習熟を前提にしない。標準環境は Claude デスクトップアプリ／Claude Code。
- 製品名・local repo・remote repo・プラグイン名は **`yasashii-secretary`**。名前とREADMEの両方で非エンジニア向けであることを強調する。
- 秘書の記憶・成果物、通常のプロジェクト開発、選択したChatwork room履歴は、1つのprivate GitHub repoでGit管理する。Chatwork専用repoへ分離しない。
- ChatworkだけはRepository SecretとGitHub Actionsによる同期を許可する。Google / Microsoft 等は公式リモートコネクタで都度参照し、同期層を持たない。
- 初回private repo作成・初回pushと、設定時に同意したChatwork schedule pushを製品フローに含む。それ以外の予期しないpushは実行前に確認する。
- メタファーは「秘書＋道具箱」。部署制・キーワード振り分け・部署間inbox通知は採用しない。
- やさしいハーネスは**同梱しない**。別リポジトリ **`yasashii-harness`** を正本とし、`yasashii-secretary` はインストール案内と接続導線だけを持つ。
- `mtaiseeei/yasashii-harness` は GitHub fork ではない**独立public downstream repo**とし、`fork=false`、fb9c303を初期基点にする。
- downstreamの書込先は `origin=mtaiseeei/yasashii-harness`、読取専用の上流は `upstream=mtaiseeei/agentic-harness` とする。親repoは移管・改名・変更しない。
- `~/workspace/agentic-harness` は**全面操作禁止**。編集、checkout、commit、branch、remote変更、生成物作成、複製元利用、当該checkoutを対象にしたコマンド実行を行わない。追随元はGitHub上の `upstream` remoteだけとする。
- public + MIT、Shin-sibainu/cc-company の単段クレジットを継承する。
- 一般技術用語はそのまま使い、過度な平易化や幼稚なメタファーは避ける。

## アーキテクチャの基本原則

**「1つのprivate GitHub repoに、秘書・開発・Chatworkの文脈をまとめる」**

| レイヤー | 置き場 | アクセス方法 |
|---|---|---|
| Chatwork | 同じprivate GitHub repo | 選択roomだけをRepository Secret + GitHub Actionsで同期 |
| その他の外部データ | 各SaaS | 公式コネクタで都度参照。同期しない |
| 秘書の記憶 | `secretary/memory/` | 保護されたシームで読み書きし、自動コミット |
| 成果物 | `secretary/docs/` | 同じrepoの正本として保存し、自動コミット |
| 開発ハーネス | 別repo `yasashii-harness` | buildから存在確認・案内・接続 |

my-vault から持ち込むのはインフラではなく、スコープ・根拠・出力・記憶保護・スキル分割の規律。
cc-company からは3コマンド導入、オンボーディング、再起動しおり、記憶保護を継承する。

## 製品テーマ

1. **G1【最優先】**: 相談・活動・決定が普段の対話と定義済みシームから三層で蓄積され、`timeline` で時系列に見える。
2. **G2【次点】**: `settings` と `preferences.md` v2 により、役割・言葉遣い・詳しさ・確認方法を途中でも変えられる。
3. **G3**: `yasashii-harness` を別repo正本として上流へ追随し、overlayと独自回帰で健全性を守る。
4. **G4**: やさしさはユーザーに見える面に適用し、規律・3 Agent分離・評価閾値・回帰ゼロ許容は緩めない。
5. **G5**: 1つのprivate repoで秘書・開発・Chatworkを扱い、room選択wizardとGitHub Actions同期から検索までを一続きにする。

## 生成されるワークスペース

```text
<private-workspace-repo>/
├── <通常のプロジェクトファイル>
├── secretary/
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── inbox/todo.md
│   ├── docs/YYYY/MM/
│   ├── projects/
│   └── memory/
│       ├── MEMORY.md
│       ├── preferences.md
│       ├── decisions/
│       ├── journal/
│       ├── topics/
│       └── _resume.md
├── <Chatworkの設定・状態・履歴>
└── <GitHub Actionsの同期設定>
```

- `MEMORY.md` は200行以内の索引。journalは月単位に畳み、topicsを索引対象にする。
- 決定、活動、相談文脈を混ぜない。journalは追記専用、decisionsは純追加で変更履歴を残す。
- `_resume.md` は作業の中断点、journalの `next` は翌日への申し送り。
- 詳細は `docs/spec/domain.md` を正本とする。

## 生成される AGENTS.md の6規律

1. **スコープ**: `secretary/` 配下だけを既定の読み書き対象にする。資格情報は常時禁止。
2. **根拠**: 外部データはサービス名・URL/ID・日付を示し、原文にない事実を補完しない。
3. **出力**: `YYYY-MM-DD_<title>.md`、frontmatter、1ファイル1トピック、固有名詞見出し。
4. **記憶保護**: 空上書き禁止、削除2段階、索引追従、封じ込め。
5. **Git履歴**: 節目で日本語1行のcommit。初回push・同意済みChatwork schedule以外の予期しないpushは確認する。
6. **報告**: 既定は3行。preferencesで「くわしく」が明示された場合だけ3行＋補足1つ。3行目は可能なら次の一手を1つ提案する。

## 配布リポジトリの構成

```text
<yasashii-secretary>/
├── .claude-plugin/marketplace.json
├── plugins/yasashii-secretary/
│   ├── .claude-plugin/plugin.json
│   ├── skills/
│   │   ├── secretary/
│   │   ├── onboarding/
│   │   ├── memory-care/
│   │   ├── daily/             # morning / daily / evening の3モードを統合
│   │   ├── settings/
│   │   ├── weekly/
│   │   ├── setup-google/
│   │   ├── setup-microsoft/
│   │   ├── chatwork/
│   │   └── build/
│   ├── wizard/chatwork/
│   ├── scripts/
│   ├── templates/
│   └── rules/plain-language.md
├── docs/
└── README.md
```

`plugins/*/harness/`、`plugins/*/agents/`、ハーネスのsource baselineは置かない。
SKILLは薄いルーターと段階ロードを維持し、配布されない開発docsへのデッドリンクを作らない。

## やさしいハーネスの別リポジトリ設計

`yasashii-harness` が所有するもの:

- Planner / Generator / Evaluator のやさしい版 agents 3種。
- `gentle-overlay/` の追加セクション断片とアンカー。
- `gentle-overlay/metadata-overrides.json` の配布識別metadata overlay兼allowlist。
- 上流merge後のsync健全性検査と独自回帰。
- 上流との差分、未分類の追加・削除ファイル、アンカー不在を検出する仕組み。

remote topology（接続関係）の正本:

```text
origin   https://github.com/mtaiseeei/yasashii-harness.git   # downstreamの書込先
upstream https://github.com/mtaiseeei/agentic-harness.git    # 上流同期用・読取専用
initial baseline: fb9c303
GitHub API: full_name=mtaiseeei/yasashii-harness, private=false, fork=false
```

本文・スキル・agents・runtimeロジックのやさしさ差分は、見出しに `yasashii` を含む追加セクションだけ。上流由来の実装行を書換・削除しない。
機械的例外は配布識別metadataだけとする。marketplaceは `name=yasashii-harness`、`repository=mtaiseeei/yasashii-harness`、pluginは `name=harness` を維持し、`source=./plugins/harness`、plugin manifestの `repository` / `homepage` は `https://github.com/mtaiseeei/yasashii-harness`、必要なCodex marketplace識別子は同じ配布元へ揃える。これらは `gentle-overlay/metadata-overrides.json` に対象ファイル・field・期待値を宣言する。
上流HEADの前進は巻き取り候補の警告であり、それだけで回帰失敗にしない。
取り込み済み上流＋overlayの合成結果と一致しない場合、metadata期待値が一致しない場合、allowlist外の上流行変更、または未分類ファイルがある場合は失敗にする。

`yasashii-secretary` の build は、`yasashii-harness` が導入済みなら接続し、無ければ `/plugin install harness@yasashii-harness` を含む、非エンジニアが実行できる3コマンドを案内する。
regression section 12 は、案内と同梱不在のoffline構造検査に加え、GitHub APIでrepo実在、public、`fork=false`、owner/name、remote manifestのmarketplace `name` / `repository`、plugin `name` / `source` / `repository` / `homepage` と3コマンドの整合を検査する。ネットワーク不可はremote健全性のPASSにせず、offline構造検査の結果とEvaluatorのonline証跡を分けて報告する。

GitHubのfork badge、parent relation、同じforkから上流へPRする導線は非ゴール。上流変更は本作業のスコープ外であり、将来あらためて明示承認された場合だけ `agentic-harness` 側の別branch / PR手順に分離する。

## パーソナライズの設計

- 初回は5問以内。仕事・役割と説明の詳しさを含めるが、口調は聞かず標準で始める。
- 途中変更は `settings` からいつでも再入可能。適用前に例文、適用後に記憶内容を宣言する。
- `preferences.md` は「基本／言葉遣い／口調のお手本／秘書のメモ」のv2構造。
- 規律と既定値を共通の第1部、preferencesによる明示上書きを第2部として分ける。
- 濃いキャラクタープリセットは同梱しない。

## やさしさの実装面

| 要素 | 主な置き場 |
|---|---|
| 言葉遣い | `rules/plain-language.md` の共通部＋preferences部 |
| 進行表示 | `yasashii-harness` のoverlay |
| 報告 | 既定3行＋明示時だけ補足、agents overlay |
| 内部用語の補足 | build（正式名称を隠さず役割を短く併記） |
| 先回り提案 | 生成AGENTS.mdと各スキル末尾 |

## コネクタ

- 第一級: Gmail / Google Calendar / Google Drive / Microsoft 365 の公式コネクタ。
- 任意: Notion。
- 初期見送り: 公式リモートMCPがない国内チャット。
- 接続診断は実エラーを確認してから原因と対処を日本語で示す。

## 開発順序

1. sprint-008: 改名、別repo分離、参照導線、回帰section 12の復旧。
2. sprint-009: G1配管。journal、シーム副作用、topics、TODO、reindex、固定時刻。
3. sprint-010: G1体験。timeline、節目プロトコル、朝夕・daily統合。
4. sprint-011: G2。先にconstraints/rubric/憲章テンプレを「既定値＋明示上書き」へ揃えてからsettingsを実装。
5. sprint-012: 週次ふりかえりと索引退避。dashboardとmigrationは承認済み条件に従い明示判断する。

## スコープ外

- restoreシーム「昨日の状態に戻して」。Git履歴が守られる事実だけを案内する。
- dashboardをG1の必須条件にすること。
- hooksの同梱。
- `~/workspace/agentic-harness` への一切の操作。
- GitHubのfork badge／parent relationと、`yasashii-harness` から直接上流へPRする導線。

## 参照

- 方針転換の唯一の引き継ぎ正本: `docs/proposal-2026-07-15-realignment.md`
- 実装仕様: `docs/spec/`
- 白紙化前の旧実装: `backup/sprint-007-010-plan`（そのまま復元せずjournal統合形に書き直す）
- 全面操作禁止のローカルcheckout: `~/workspace/agentic-harness`
