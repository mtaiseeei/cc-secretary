# Spec Index

`yasashii-secretary` は、ゆるAIコーディング塾の非エンジニア受講者向けAI秘書プラグイン（Claude Code plugin / public / MIT）。
2026-07-15 の製品方針転換は `docs/proposal-2026-07-15-realignment.md` が唯一の引き継ぎ正本であり、
この spec 群は承認済みの全決定を実装・評価できる形に正本化したものである。

## ひとことで

**相談したり話したりするだけで、活動・決定・相談の文脈が安全に溜まり、いつ何をしたかを後から探せる秘書。**
外部データは公式コネクタで都度参照し、記憶と成果物だけをローカル `secretary/` に保存する。
開発依頼は別リポジトリ `yasashii-harness` への参照導線から、規律を緩めない Planner → Generator → Evaluator のループへ接続する。

## 製品テーマ

| ID | テーマ | 達成の要点 |
|---|---|---|
| G1 | 話すだけで記録が整う | 三層記憶、シーム副作用、節目確認、決定的な `timeline` |
| G2 | 100人100通りの秘書 | `settings`、`preferences.md` v2、既定値＋明示的な opt-in 上書き |
| G3 | やさしいハーネスの分離と追随 | `yasashii-harness` を独立downstreamの別リポジトリ正本にし、`upstream` remoteからの追随を反復可能にする |
| G4 | やさしさの再定義 | 言葉遣い・報告・先回り提案はやさしくし、規律・役割分離・評価閾値は緩めない |

## 詳細仕様

| ファイル | 内容 |
|---|---|
| [product.md](spec/product.md) | 目的、対象ユーザー、G1〜G4、成功状態、非ゴール |
| [features.md](spec/features.md) | F01〜F22 とユーザーから見た振る舞い |
| [constraints.md](spec/constraints.md) | 安全・記憶保護・既定値＋上書き・別リポジトリ境界などの不変条件 |
| [domain.md](spec/domain.md) | 三層記憶、journal、timeline、preferences v2、時刻・索引・コミット規約 |
| [ui.md](spec/ui.md) | 対話UX、節目プロトコル、設定体験、3行報告、先回り提案 |
| [rubric.md](spec/rubric.md) | ゼロ許容基準、やさしさ軸、模擬会話を含む評価方法 |

## スプリント

進行状態の正本は `docs/sprints/state.md`（オーケストレーターのみが更新）。
2026-07-15 の方針転換後は次の順序で進める。

| スプリント | 主眼 | 依存 |
|---|---|---|
| [sprint-008](sprints/sprint-008.md) | 配布物の再編、改名、`yasashii-harness` 分離、section 12 復旧 | 最優先 |
| [sprint-009](sprints/sprint-009.md) | G1 配管: journal、シーム副作用、topics、TODO、reindex、固定時刻 | sprint-008 |
| [sprint-010](sprints/sprint-010.md) | G1 体験: timeline、節目プロトコル、朝夕・daily 統合、ルーター | sprint-009 |
| [sprint-011](sprints/sprint-011.md) | G2: 先行規約改訂後に settings / preferences v2 / tones | sprint-010 |
| [sprint-012](sprints/sprint-012.md) | G1 仕上げ: 週次ふりかえり、索引退避運用、条件付き追加 | sprint-011 |

既存 sprint-001〜006 と各 patch の契約・progress・feedback は履歴として保持する。
sprint-007 は製品方針転換で白紙化され、旧計画と実装は `backup/sprint-007-010-plan` に退避済みである。

## 最優先の不変条件

1. `~/workspace/agentic-harness` は全面操作禁止。編集、checkout、commit、branch、remote変更、生成物作成、複製元利用、当該checkoutを対象にしたコマンド実行を行わない。上流参照はGitHubだけを使う。
2. 外部データのローカル同期層を作らず、公式コネクタで都度参照する。
3. 記憶は空上書き禁止・削除2段階・`MEMORY.md` 索引追従。journal の無確認追記は定義済みシーム副作用だけ。
4. push はユーザーの明示指示時のみ。ただし sprint-008 の改名と、独立public repo `mtaiseeei/yasashii-harness` の新設・初期公開に必要なリモート操作は承認済み。
5. 一般技術用語はそのまま使う。過度な平易化や幼稚なメタファーは禁止。
6. やさしさのために、6規律、3 Agent 分離、評価閾値、C系ゼロ許容を緩めない。
7. `yasashii-harness` で上流由来行を変えられる例外は、宣言的allowlistに列挙した配布識別metadataだけ。plugin本体名 `harness` を維持し、`harness@yasashii-harness` で導入できる整合を守る。
