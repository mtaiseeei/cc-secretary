# Sprint 003 — 今日やること・出力規約・Google 接続

- Phase: P1（秘書コア）
- 主眼: 秘書が外部データ（Google 系）を根拠つきで参照し、「今日やること」を3行で返せるようにする。成果物の出力規約を効かせる。
- 依存: sprint-001, sprint-002

## スコープ（含む）

- `skills/setup-google/`（F09）: Gmail / Calendar / Drive を公式コネクタ（設定画面の OAuth）で接続する手順＋接続確認テスト。手作業の Google Cloud Console 設定を要求しない。英語エラーは言い換えて提示（「実エラーで原因確定してから案内」）。
- `skills/daily/`（F06）: コネクタから予定・タスクを参照し、ローカル TODO と突き合わせ、各項目に根拠（サービス名・リンク・日付）を付けて3行で提示。外部データ本文はローカル保存しない。
- 出力規約（F08）: 成果物を `secretary/docs/YYYY/MM/YYYY-MM-DD_<title>.md`、frontmatter 必須、1ファイル1トピックで保存する振る舞い。

## スコープ外

- Microsoft / Notion（sprint-004）。

## 受入基準（薄い契約・詳細化は着手時）

- setup-google が Google Cloud Console 手作業なしの手順として成立し、接続確認テストと英語エラー言い換えを含む。
- daily が根拠つき3行報告を返し、外部データ本文をローカルに書き込まない（同期層を作らない不変条件を満たす）。
- 成果物保存が出力規約どおり（パス・frontmatter・命名）であることをドライランで検証できる。

## 参照

- `docs/spec/features.md` F06 F08 F09 / `docs/spec/domain.md`（コネクタ・出力規約）/ `docs/spec/constraints.md`（同期層禁止・根拠ルール）
- **company の一次情報**（`~/workspace/inbox/company`、読むだけ）: MCP 連携ガイドは SKILL.md 630-852 行。ただし cc-secretary は**公式リモートコネクタ優先**のため、company の Google Cloud Console 手作業手順は**ほぼ不要**（DESIGN.md 参照）。診断の型（実エラーで原因確定→案内）だけ継承する。
