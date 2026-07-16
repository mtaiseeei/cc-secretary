# Product

## これは何か

`yasashii-secretary` は、ゆるAIコーディング塾の第2期以降で配布する、非エンジニア向けAI秘書プラグイン
（Claude Code plugin / public / MIT）。名前と README の両方で非エンジニア向けであることを明確にする。

中心思想は **「データは外に置いたまま、秘書だけがローカルに住む」**。
メール・予定・ファイル・タスクは各SaaSに置いたまま公式コネクタで都度参照し、
秘書の記憶と成果物だけを `secretary/` に保存して、節目ごとにローカルコミットする。

2026-07-15 の方針転換については `docs/proposal-2026-07-15-realignment.md` が唯一の引き継ぎ正本。
本ファイルは、その承認事項を製品仕様として展開したもの。

## 対象ユーザー

- **主対象**: ゆるAIコーディング塾の30〜60代の受講者。技術に多少関心がある非エンジニアで、標準環境は Claude デスクトップアプリ／Claude Code。Git / GitHub の基礎は第1回で学んでいる。
- **副対象**: 村山さんを含む配布・保守者。受講者向けの導入と保守を、秘書本体と開発ハーネスを独立に更新しながら行う。

## 製品テーマと優先順位

### G1【最優先】話すだけでコンテキストが整う

相談や作業を普段どおり進めるだけで、次の三層が役割を混ぜずに蓄積される。

1. 活動は、成果物保存・TODO・設定変更など定義済みシームの副作用として確実に溜まる。
2. 決定は、会話中の都度確認と会話の締めでの拾い漏れ確認という二段構えで回収する。LLMによる検出であり完全自動保証ではないことを隠さない。
3. 結論に至らない相談の文脈は、一区切りで1行確認して案件メモに残す。

G1 の最小達成状態は、`timeline` により「何がいつ決まり、その日に何をしたか」を決定的に一覧・検索できること。
dashboard は必須条件ではなく、sprint-012 で利用反応を踏まえて判断する。

### G2【次点】100人100通りの秘書

初回と途中変更の両方を `settings` が受ける。職業・役割、言葉遣い、説明の詳しさ、呼び方、
決定確認のタイミングを `preferences.md` v2 に保存し、提案・例示・用語補足に実際に反映する。
既定動作を安全な正本とし、ユーザーが明示した項目だけを opt-in で上書きする。

### G3 やさしいハーネスの分離と上流追随

やさしいハーネスの正本は、本体への同梱コピーではなく別リポジトリ `yasashii-harness` に置く。
`yasashii-secretary` はインストール案内と接続導線だけを持つ。
`mtaiseeei/yasashii-harness` は GitHub forkではない独立public downstream repoとして、fb9c303を初期基点にする。
書込先 `origin` は自身、読取専用の `upstream` は `mtaiseeei/agentic-harness` とし、上流追随とやさしさ差分の検証を反復可能にする。
配布時は marketplace名 `yasashii-harness` とplugin本体名 `harness` を組み合わせ、`harness@yasashii-harness` で一意に導入できるようにする。上流との差分は `yasashii` 見出し追加と、宣言的allowlistに載せた配布識別metadataだけに限定する。

### G4 やさしいハーネスの再定義

> やさしいハーネスの「やさしい」とは、ユーザーに見える言葉遣い・報告・次の一手の先回り提案がやさしいという意味である。やること自体はやさしくしない。6規律、根拠、記憶保護、封じ込め、Planner / Generator / Evaluator の分離、評価閾値、回帰ゼロ許容は削らず、緩めない。

## ゴール

1. 非エンジニアが説明を見ながら3コマンドで導入でき、初回5問以内で `secretary/` を安全に生成できる。
2. 話す・成果物を保存する・TODOを扱う・設定を変えるだけで、三層記憶が定義どおり蓄積される。
3. `timeline` で期間・種類・キーワードを指定し、決定と活動を日付つきで再発見できる。
4. 設定を後から変えられ、適用前の例文プレビューと適用後の宣言により意図しない人格変更を防げる。
5. 外部データはローカル同期せず、根拠を添えて使える。
6. 開発依頼は `yasashii-harness` への健全な参照導線から、規律を維持した3 Agent ループへ接続できる。
7. 既存の記憶保護・封じ込め・単段クレジット・ローカルコミット・明示時のみpushを回帰させない。

## 成功状態

- `journal` / `decisions` / `topics` が役割どおりに蓄積され、会話全文や外部データ本文を保存していない。
- `timeline` は同じ入力から同じ Markdown を返し、「Zoomの件いつ決めたっけ」のような問いをキーワード検索できる。
- `MEMORY.md` は200行以内で、topics と月単位に畳んだ journal を索引できる。
- 初回設定は5問以内。口調は聞かず標準値で開始し、いつでも変更できることを伝える。
- `preferences.md` が欠落または空でも既定値で安全に動き、明示した設定だけが挙動を上書きする。
- 決定を含む模擬会話、決定ゼロの日の締め、3種類の設定差分を Evaluator が実際に確認できる。
- `yasashii-secretary` にハーネスや agents のコピーがなく、`yasashii-harness` への案内が切れていない。
- GitHub上の `mtaiseeei/yasashii-harness` がpublic・`fork=false`で実在し、origin/upstream remoteとfb9c303基点を証跡で確認できる。
- remote manifestsのmarketplace `name` / `repository`、plugin `name` / `source` / `repository` / `homepage` がdownstreamと `harness@yasashii-harness` に整合し、metadata allowlist外の上流行変更が0件である。

## 非ゴール

- 外部データのローカル同期層、キャッシュ層、GitHub Actions 前提の同期は作らない。
- cc-company の部署制、必須 `case-NNN`、`patterns/` 自動統合は導入しない。
- push を自動化しない。復元機能「昨日の状態に戻して」は今回作らない。Git 履歴が守られる事実だけを案内する。
- 濃いキャラクター（関西弁・執事風等）のプリセットは同梱しない。例ペアを育てる方法は塾コンテンツに分離する。
- hooks は同梱しない。採用する場合は先に不変条件を再定義する。
- dashboard は G1 の完了条件にしない。sprint-012 で明示判断する。
- Webアプリ、サーバー、独自GUIを作らない。
- `~/workspace/agentic-harness` を操作しない。編集だけでなくcheckout、commit、branch、remote変更、生成物作成、複製元利用、コマンド対象化を禁止し、上流参照はGitHubに限定する。
- GitHubのfork badge／parent relation、同じforkから上流へPRする導線は作らない。上流変更は本作業のスコープ外であり、将来あらためて明示承認された場合だけ `agentic-harness` 側の別branch / PR手順に分離する。

## 承認済みの条件付き判断

- 第2期配布が新規セットアップのみなら migration は作らない。既存ユーザーがいると確認された場合だけ、sprint-012 で journal ディレクトリ追加と preferences v1→v2 移行導線を扱う。
- dashboard は timeline の利用反応を見て sprint-012 で実施可否を判断し、無断で追加しない。
