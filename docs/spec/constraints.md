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

1. Gmail / Calendar / Drive / Microsoft 365 / Notion等は公式リモートコネクタで都度参照し、同期層や `10_sources` 型の複製を作らない。**唯一の同期例外は、選択したChatwork roomを同じprivate repoへ保存する承認済みGitHub Actions**とする。
2. コネクタ由来の本文を記憶やjournalへ複製しない。Chatwork本文は専用の履歴領域だけに保存し、取得件数・room・時刻等の同期状態もjournalではなくChatwork専用の状態記録に分ける。
3. Chatwork API Tokenを含む資格情報、パスワード、APIキーを保存・コミットしない。Chatwork API Tokenの正本はGitHub上の安全な保管場所（Repository Secret）だけであり、repo本文、設定、ログ、エラー、fixture、スクリーンショット、会話、wizardに値を出さない。Tokenは有効期限がなくChatwork機能へフルアクセスできる資格情報として扱い、第三者へ開示しない。
4. ユーザーワークスペースはprivate GitHub repoでなければならない。public repoへの初回pushまたはChatwork保存を拒否し、privateからpublicへ変更されたことを検出した場合は同期を止める。
5. private repoの共同編集者は保存されたChatwork本文を読める。wizardはroom選択確定前にこの影響を表示し、ユーザーは所属組織の情報管理方針に従う。
6. 初回オンボーディングはrepo作成、初期commit、初回pushを完了条件とする。既存remoteがある場合は現在のrepoを使う確認を行い、Chatwork専用repoを黙って作らない。
7. scheduleによるChatworkの自動commit・pushは、対象room・頻度・保存内容を示して同意を得た後だけ許可する。検索不成立等から開始する予期しない手動同期は、実行直前に構造化質問で確認する。
8. 通常の秘書・開発成果のpushは同じrepoのGit運用に従う。Chatworkを別repoへ分離したり、秘書の記憶・成果物だけを永続的なローカル専用正本にしたりしない。
9. Chatworkの取得は選択roomだけに限定し、message ID単位で冪等、つまり同じ取得を繰り返しても重複しない。API応答に無いことだけを理由に取得済み履歴を削除しない。
10. Chatwork APIの最新100件制約をユーザーへ明示する。導入前履歴の欠落、初回0件、100件より古い履歴を取得できない状態をエラーや「存在しない」の根拠にしない。
11. コミットメッセージは、何をしたかが分かる日本語1行とし、可能な範囲で固有名詞を含める。`git log` を予備のタイムラインとして使える粒度を保つ。
12. public / MIT と Shin-sibainu/cc-company の単段クレジットを維持する。中間フォークを必須クレジットとして追加しない。
13. public配布repo `yasashii-secretary` へChatworkのRepository Secret、同期workflow、room設定、同期状態、履歴を置かない。これらは利用者ごとのsingle private workspaceだけに置く。
14. 実API評価は専用private test workspaceで行う。test workspaceもpluginの利用設定・生成物、秘書、通常project、Chatwork設定・workflow・履歴を同じrepoに置き、Chatwork専用repoへ分離しない。public配布ソース自体の複製は要求しない。
15. private test workspaceの作成、Repository Secret設定、workflow dispatch、remote push、Chatwork API送信はexternal live gateとする。各操作へのユーザー明示許可と、test用token・非機密test roomの準備が揃う前に実行しない。
16. external live gateの準備が無い場合、合成fixtureで実APIを代替せずSprintを不合格とする。ただし理由は `external-live-gate-unavailable` と明記し、実装不具合としてGeneratorへ誤分類しない。
17. live gateの権限は、専用private test workspaceと非機密test roomの読取・同期に必要な範囲へ限定する。証跡にはSecret名の存在、workflow run状態、件数、commit、push／pull、検索状態だけを残し、token値、不要なroom名、Chatwork本文を残さない。
18. live gate完了後はscheduleを停止し、Repository Secretを削除し、test roomの選択を解除する。test workspaceと取得済み履歴を削除・archiveする場合は対象と影響を示し、ユーザーの明示確認後だけ行う。

## 3. 記憶保護と封じ込め

1. 空内容・実質空で既存記憶を上書きしない。
2. 削除は、対象を示す警告とユーザーの明示確認を分ける2段階にする。
3. 記憶の増減時は `MEMORY.md` 索引を追従させ、200行以内を保つ。
4. `secretary/` の記憶・成果物に対する読み書き・削除・ディレクトリ作成は path guard を先に通し、symlink解決後も `secretary/` 内である場合だけ許可する。基点自体が外部を指す symlink の場合も拒否し、拒否前に副作用を出さない。
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

## 8. Chatwork設定wizard

1. wizardはloopbackだけで利用するローカル設定画面とし、外部公開サーバーや常設サービスにしない。
2. 画面へAPI Token入力欄を作らず、会話にもToken値を貼らせない。接続順は、(1) ChatworkでTokenを取得または組織管理者へ利用申請、(2) 現在のGitHub repoのSecret追加画面を開く、(3) 名前 `CHATWORK_API_TOKEN` で登録、(4) 登録確認後にルーム一覧取得、とする。
3. Chatwork公式のTokenページ、発行ヘルプ、組織契約のAPI利用申請ヘルプへ直接案内する。パーソナルプランを除き組織管理者への申請が必要であり、実際にAPIを利用するアカウントで申請する。承認前はルーム一覧取得へ進めない。Tokenページが利用できない状態では「組織管理者へAPI利用申請→承認後に戻る」を示し、設定途中の選択を保持する。
4. Secret追加画面は `https://github.com/<owner>/<repo>/settings/secrets/actions/new` を現在のrepo情報から組み立て、CTAを「GitHub上の安全な保管場所を開く」とする。固定owner／repo pathを使わず、外部リンクは新しいタブで開き、行き先と目的が分かる日本語ラベルを付ける。
5. 変更は確認画面まで副作用を出さず、確定後だけルーム設定・自動取得の間隔・scheduleへ一貫して反映する。キャンセル時は0変更。
6. 「30分ごと」「1時間ごと（おすすめ）」「3時間ごと」「6時間ごと」「12時間ごと」「手動のみ」を選べる。scheduleは17分起点とし、選択値と実際の動作を一致させる。
7. 30日換算の概算実行回数1,440／720／240／120／60／0回を表示する。実行回数と処理時間を区別し、GitHub Freeの非公開リポジトリに含まれる月2,000分は2,000回ではなくGitHub Actionsの処理時間枠であることを明記する。2026年7月確認の参考情報であり、プランや1回の処理時間で実使用量が変わり、料金・枠は変更されうることと、GitHub公式billingページへのリンクを併記する。
8. ユーザー向け表示では `room` を原則「ルーム」、識別子が必要な箇所を「ルームID」、`頻度` を「自動取得の間隔」、`runs` を「実行回数」とする。`schedule` は「自動実行」、`workflow` は「自動取得処理（GitHub Actions）」、`private repo` は「非公開のGitHubリポジトリ」、`Repository Secret` は初出で「GitHub上の安全な保管場所（Repository Secret）」とする。内部コード、設定key、CLI、正式なAPI名は対象外。
9. GitHub Actionsの初出には「決めた間隔で自動取得を動かすGitHubの仕組み」と短く補足する。`同期` の初出は「最新メッセージの取り込み（同期）」とし、commit・pushは正式名称を保ったまま「取得結果をこのリポジトリへ自動保存します（Gitのcommit・push）」と目的を先に示す。
10. wizard本文は決定に必要な情報へ絞り、料金・実行時間などの補足は「料金と実行時間について」のdetailsまたは短いhelpへ置く。1 step 1 primary message、CTA最大2、既存デザイン言語を維持する。
11. wizardは白／薄灰、Carbon Dark／Graphite／Pewter、primary CTAだけElectric Blue `#3E6AE1`を用いる。gradient・shadow・装飾写真・Tesla商標／wordmark・ライセンス不明フォントを使わない。
12. UIは4px radius、8px spacing、400/500 weight、14px中心、headline最大40pxを守る。hoverは0.33秒のcolor／border変化だけで、scale／translateを使わない。
13. 768px未満は1 column・CTA縦積みとし、desktopは中央寄せの広い余白を持つ。keyboard操作、visible focus、可視ラベル、accessible name、エラー関連付け、十分なcontrast、200% zoomでの非欠落を必須にする。日本語化で折返しや横overflowを増やさない。

### 公式情報の確認基準（2026年7月）

- Chatwork API Token: `https://www.chatwork.com/service/packages/chatwork/subpackages/api/token.php`
- Chatwork公式発行ヘルプ: `https://help.chatwork.com/hc/ja/articles/115000172402-API%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%82%92%E7%99%BA%E8%A1%8C%E3%81%99%E3%82%8B`
- Chatwork組織契約の申請・承認ヘルプ: `https://help.chatwork.com/hc/ja/articles/115000169501-API%E3%81%AE%E5%88%A9%E7%94%A8%E7%94%B3%E8%AB%8B%E3%82%92%E6%89%BF%E8%AA%8D-%E5%8D%B4%E4%B8%8B%E3%81%99%E3%82%8B`
- Chatwork API Tokenの取扱い: `https://developer.chatwork.com/docs/endpoints`
- GitHub Actions billing: `https://docs.github.com/en/billing/concepts/product-billing/github-actions`

公開ガイドには「公式情報は2026年7月確認。サービス側の変更により手順・料金・利用枠が変わる可能性がある」と明記する。
