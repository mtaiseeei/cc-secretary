# Sprint 004 — 接続拡張（Microsoft / Notion / 診断）

- Phase: P2（接続拡張）
- 主眼: Google 以外の第一級/任意コネクタを追加し、接続状態を診断できるようにする。
- 依存: sprint-003（setup-google の接続ガイド様式を踏襲）

## スコープ（含む）

- `skills/setup-microsoft/`（F11）: Microsoft 365 を公式コネクタで接続する手順＋接続確認テスト。
- Notion 接続（F12）: `mcp.notion.com`（OAuth 自動）を任意機能として案内。
- 接続診断（F13）: 複数コネクタの接続状態を診断し、失敗時は実エラーから原因を確定して日常語で案内。

## スコープ外

- 国内チャット（Chatwork / LINE）は初期スコープ外（constraints 準拠）。

## 受入基準（薄い契約・詳細化は着手時）

- setup-microsoft が setup-google と同じ様式（手順＋接続確認＋英語エラー言い換え）で成立。
- Notion 接続が任意機能として案内でき、未接続でも他機能を壊さない。
- 接続診断が各コネクタの状態を返し、失敗時に原因確定→日常語案内を行う。

## 参照

- `docs/spec/features.md` F11 F12 F13 / `docs/spec/domain.md`（コネクタ表）
