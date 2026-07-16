# Constraints

横断制約・禁止事項・安全方針。ここに書く条件は、受け入れ済み機能を含め**回帰させてはならない不変条件**。

## 1. 製品とリポジトリの境界

1. `~/workspace/agentic-harness` は全面操作禁止。ファイル編集、checkout / switch、commit、branch作成・変更、remote変更、生成物作成、複製元としての利用、当該checkoutを対象にしたコマンド実行をすべて禁止する。上流参照はGitHub上の `mtaiseeei/agentic-harness` だけを使う。
2. やさしいハーネスの正本は別リポジトリ `yasashii-harness`。`yasashii-secretary` に `harness/` のコピーや planner / generator / evaluator の agents を同梱しない。
3. `yasashii-secretary` は `yasashii-harness` のインストール案内・存在確認・接続導線だけを持つ。参照先が無い、リンクが切れる、同梱コピーが復活する状態を回帰として扱う。
4. `mtaiseeei/yasashii-harness` は独立public downstream repoとして、GitHub API上 `private=false`、`fork=false` でなければならない。初期基点は `mtaiseeei/agentic-harness` の fb9c303 とする。
5. `yasashii-harness` の本文・スキル・agents・runtimeロジックの差分は、**見出しに `yasashii` を含む追加セクションだけ**。上流由来の実装行の書換・削除は禁止。上流変更は本作業のスコープ外であり、将来あらためて明示承認された場合だけ上流側の別branch / PR手順に分離する。
6. remoteは `origin=https://github.com/mtaiseeei/yasashii-harness.git` と、読取専用の `upstream=https://github.com/mtaiseeei/agentic-harness.git` を分離する。上流追随はGitHubの `upstream/main` から行い、ローカル `~/workspace/agentic-harness` を参照元・複製元・書込先・検査対象にしない。
7. 親repo `mtaiseeei/agentic-harness` は移管・改名・変更しない。GitHubのfork badge／parent relation／同じforkから上流へPRする導線は非ゴール。上流変更は本作業では行わず、将来あらためて明示承認された場合だけ `agentic-harness` 側の別branch / PR手順に分離する。
8. 上流由来行を変更できる機械的例外は、独立downstreamの配布識別metadataだけ。`.claude-plugin/marketplace.json` のmarketplace `name=yasashii-harness` / `repository=mtaiseeei/yasashii-harness`、plugin `name=harness` / `source=./plugins/harness`、plugin manifestの `repository` / `homepage=https://github.com/mtaiseeei/yasashii-harness`、必要なCodex marketplace識別子をdownstream向けに揃える。
9. metadata例外は `gentle-overlay/metadata-overrides.json` に対象ファイル・JSON field・期待値を宣言し、これをoverlay兼allowlistの唯一の正本とする。sync後に完全一致を検査し、allowlist外のmetadata変更と上流由来行の書換・削除は0件でなければならない。

## 2. 外部データ・プライバシー・Git

1. 外部データのローカル同期層、キャッシュ層、`10_sources` 型の複製を作らない。公式リモートコネクタで都度参照し、根拠はサービス名＋URL/ID＋日付で示す。
2. コネクタ由来の本文を記憶やjournalへ複製しない。事実を記録する必要があるときは出典を行内に明記する。
3. 資格情報、トークン、パスワード、APIキーを保存・コミットしない。自動コミットは無差別なstageで秘密情報を黙って履歴化しない。
4. 自動コミットはローカルだけ。pushはユーザーの明示指示時のみ。ただし sprint-008 のlocal/remote改名と、独立public repo `mtaiseeei/yasashii-harness` の新設・初期公開に必要なリモート操作は承認済み。
5. コミットメッセージは、何をしたかが分かる日本語1行とし、可能な範囲で固有名詞を含める。`git log` を予備のタイムラインとして使える粒度を保つ。
6. public / MIT と Shin-sibainu/cc-company の単段クレジットを維持する。中間フォークを必須クレジットとして追加しない。

## 3. 記憶保護と封じ込め

1. 空内容・実質空で既存記憶を上書きしない。
2. 削除は、対象を示す警告とユーザーの明示確認を分ける2段階にする。
3. 記憶の増減時は `MEMORY.md` 索引を追従させ、200行以内を保つ。
4. すべての読み書き・削除・ディレクトリ作成は path guard を先に通し、symlink解決後も `secretary/` 内である場合だけ許可する。基点自体が外部を指す symlink の場合も拒否し、拒否前に副作用を出さない。
5. 境界外、空・`.`・親方向への脱出を非ゼロで拒否する。境界外 symlink は `exit 3` とし、文字列の前方一致だけで判定しない。
6. 再セットアップは既存 `secretary/` のバックアップ提案と明示確認を先に行い、無確認で上書き・再初期化しない。

### journal の限定例外

- journal は追記専用の事実ログ。定義済みシームが成功した事実だけは、ユーザー確認なしで副作用として追記してよい。
- 無確認追記を許すシームは `save-deliverable`、`todo-add`、`todo-done`、`todo-carry`、`remember-decision`、`topic-add`、settings の設定変更に限定する。
- `journal-add` は末尾appendのみ、空本文拒否、既存行の書換・削除機能なし。会話全文・逐語ログ・未確認の推測は書かない。
- `decided` と `topics` は、シームを呼ぶ前に節目プロトコルの確認を受ける。journal自体の副作用で確認を省略してよいという意味ではない。

### 決定の純追加

- 過去の decision 行を書き換えない。変更・撤回は新しい日付ファイルに、元の決定・日付・新しい決定・理由を追記する。
- 表示時は新しい決定を優先する。週次で矛盾を統合するときもユーザー確認を挟む。

## 4. 既定値＋opt-in 上書き

1. 共有規律と既定の体験を第1部、個人設定による上書きを第2部として分ける。
2. `preferences.md` が無い・空・該当項目未設定なら既定値で動く。暗黙推測で設定を変えない。
3. 既定値は、丁寧で堅すぎない口調、専門用語「ふつう」、報告「みじかく（3行）」、決定確認「都度」。
4. 報告は**既定3行**。`preferences.md` で「くわしく」が明示された場合だけ、3行＋補足1つへ拡張できる。憲章テンプレの規約も同じ形にする。
5. 一般技術用語は常にそのまま使う。「ことば添え」のopt-inでも語彙を置換せず、馴染みの薄い語またはユーザーの役割から未知と思われる語に短い補足を足すだけにする。
6. パーソナライズされた文面の完全一致は回帰対象にしない。rubricは既定値を採点し、設定分岐は構造・適用・安全なフォールバックと模擬会話で確認する。
7. 自発的な `秘書のメモ` 追記、口調・呼び方・詳しさ等の変更は、適用前に1行確認する。

## 5. やさしさと規律

1. やさしさは、言葉遣い、報告、進行の見せ方、次の一手の先回り提案に適用する。
2. 6規律（スコープ・根拠・出力・記憶保護・自動コミット・報告）、封じ込め、Planner / Generator / Evaluator の分離、書込責務、評価閾値、回帰ゼロ許容は削らず、緩めない。
3. 一般技術用語はそのまま使う。過度な平易化、幼稚なメタファー、生の英語エラーの放置は禁止。
4. 先回り提案は報告3行目を標準とし、1つまで、根拠を一言、着手はユーザーが決める。提案が無ければ無理に作らない。
5. 口調や詳しさの違いを、C2・C5・C6のゼロ許容基準とトレードオフにしない。

## 6. データと実行の決定性

1. 日付を使う処理は `CC_SECRETARY_NOW` で時刻を注入でき、未指定時だけ現在時刻を使う。
2. 回帰では固定時刻を与え、ファイル名・日付境界・並び順を決定的に検証する。ロケール依存の曜日表示はしない。
3. `timeline` はLLMを介さず、同一入力から同一Markdownを返す。
4. reindex が200行を超える場合は、既存の終了コード契約 0/2/3 を壊さず、`exit 0` と stderr 警告で退避提案へつなぐ。

## 7. 配布構成

1. 配布物は改名後の `plugins/yasashii-secretary/` 配下に置き、manifest・marketplace・README・インストールコマンドの名前を一致させる。
2. 配布SKILLは同梱されない開発docsを参照しない。必要な規律は配布 `rules/` やテンプレに含める。
3. 同梱スクリプトの実行権限と案内する実行方法を一致させる。
4. 薄いルーターと段階ロードを維持し、部署制・自動case生成・patterns自動統合・hooksを追加しない。
5. `yasashii-secretary` から同梱ハーネス、agents、ハーネスベースラインを撤去し、section 12 は参照導線の健全性を検査する。
