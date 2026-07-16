# yasashii-secretary

ゆるAIコーディング塾 第2期以降で配布する、非エンジニア向けAI秘書プラグイン
（Claude Code plugin / public / MIT）。一般的な技術用語は保ち、何が起きているかと次の行動を先に伝える。

## 正本

- 方針転換の引き継ぎ正本: `docs/proposal-2026-07-15-realignment.md`
- 恒久設計: `docs/DESIGN.md`
- 実装仕様: `docs/spec.md` と `docs/spec/`
- 進行状態: `docs/sprints/state.md`

## リポジトリ境界

- 秘書本体の配布物は `plugins/yasashii-secretary/`。
- 開発ハーネスは別リポジトリ `mtaiseeei/yasashii-harness` が正本。本体には `harness/` や Planner / Generator / Evaluator のagentsを同梱しない。
- `/Users/taisei/workspace/agentic-harness` と `~/workspace/agentic-harness` は、**読み取りを含む全面接触禁止**。
  編集、存在確認、一覧、status / HEAD / branch / remote 確認、checkout / switch、commit、生成物作成、
  複製元利用、symlink 経由、当該 checkout を対象にしたコマンド実行を行わない。
  上流情報は GitHub 上の `mtaiseeei/agentic-harness` の remote / API だけを参照する。
- 秘書の記憶・成果物・通常のプロジェクト・選択したChatwork room履歴は、1つのprivate GitHub repoでGit管理する。Chatwork専用repoへ分離しない。
- Chatworkだけは、Repository SecretのAPI Tokenを使うGitHub Actions同期を許可する。その他の外部データは公式コネクタで都度参照し、同期層を作らない。
- 初回private repo作成・初回pushと、設定時に同意したChatwork schedule pushは製品フローに含む。それ以外の予期しないpushは実行前に確認する。

## 報告

既定は「やったこと／結果／次に何が起きるか」の3行。一般的な技術用語はそのまま使い、
馴染みの薄い語だけ初出で短く補足する。過度な平易化や幼稚なメタファーは使わない。
