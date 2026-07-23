# Yasashii Sprint 036 — 呼び方候補の下流同期（旧方針）

- Status: superseded by `sprint-037`
- Type: main sprint
- 置換理由: 実装開始前に、呼び方候補をhostが明示した値だけに限定する方針から、
  現在タスクへhostが提供済みの文脈、Git表示名、OSユーザー名を順に使うbest-effort探索へ
  ユーザー判断が変わった。旧契約を実装せず、履歴だけを残す。

## 旧方針

- オンボーディングは「あなた」「アカウント名」「指定の名前」「その他」の4経路にする。
- account-name候補はhostが現在の会話へ明示した値だけに限定し、Git／OSを読まない。
- 共通実装はAgenticの合格済みcandidateからYasashii overlayへ同期する。

## 置換先

探索source、正規化、除外、候補非保存、下流overlay同期、Yasashii固有surface保護を含む
正式契約は [`sprint-037.md`](sprint-037.md) とする。本SprintではGenerator／Evaluatorを起動せず、
実装、progress、feedback、state遷移を行わない。
