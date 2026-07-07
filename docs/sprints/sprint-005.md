# Sprint 005 — やさしいハーネスと開発の入口

- Phase: P3（開発機能）
- 主眼: agentic-harness を平易化したフォークを同梱し、非エンジニアが開発依頼を出せる入口（build）を作る。
- 依存: sprint-001〜003（ルーター・記憶・報告ルールが揃っていること）

## スコープ（含む）

- やさしいハーネス同梱（F14）:
  - `~/workspace/agentic-harness` を**このリポジトリ内に複製**（元は変更しない）。
  - 平易化3点: (a) Planner ヒアリングの日常語化（質問・選択肢に具体例）、(b) 報告の型固定（全エージェントが `rules/plain-language.md` を参照）、(c) 進行の見せ方（計画→道具→確認→結果を毎回宣言）。
  - 裏側の docs/spec・sprint 契約等の技術的文脈は維持。
- `skills/build/`（F15）: 開発依頼を受け取りやさしいハーネスに接続。進行が非エンジニアに見える形で走る。
- `agents/`（planner/generator/evaluator のやさしい版）を配置。

## スコープ外

- 公開整備（README/docs/クレジット）は sprint-006。

## 受入基準（薄い契約・詳細化は着手時）

- 複製元 `agentic-harness` に一切書き込みが発生していないこと（不変条件、ゼロ許容）。
- 同梱フォークが平易化3点を満たす（日常語ヒアリング・報告型参照・進行宣言）。
- build スキルから開発依頼→計画→道具→確認→結果の進行が起動できる。

## 参照

- `docs/spec/features.md` F14 F15 / `docs/spec/constraints.md`（agentic-harness 変更禁止・やさしいハーネス平易化3点）
- 複製元: `~/workspace/agentic-harness`（読み取り専用）
