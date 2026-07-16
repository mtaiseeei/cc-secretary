# Sprint 014 Patch 001 — Chatwork設定wizardの表示文言とToken導線

- Type: micro
- Base Sprint: sprint-014
- 主眼: 受入済みのChatwork設定フローを変えず、非エンジニアが設定結果と料金上の意味を誤解しない表示へ整える。
- 理由: 同一wizard・同一フロー内の文言改善であり、既存の自動回帰とbrowser評価面があるためmicro patchとする。

## 外から見える成果

1. wizard、`/chatwork`、README、公開ガイドで、ルーム選択から自動取得まで同じ日本語と同じ順序で案内される。
2. API Tokenをwizardや会話へ貼らず、公式の取得／申請ページから現在のGitHub repoの安全な保管場所へ登録できる。
3. 6つの間隔ごとの月間実行回数と、GitHub Actionsの2,000分が処理時間の枠であることを区別できる。
4. schedule、workflow、private repo等の英語だけの表示が、正式名称を必要な範囲で残した日本語へ変わる。

## スコープ

### A. API Token取得と安全な登録

- 接続順は次で統一する。
  1. ChatworkでAPI Tokenを取得する。公式Tokenページと公式発行ヘルプへ直接案内する。
  2. 現在のGitHub repoのowner／nameから `https://github.com/<owner>/<repo>/settings/secrets/actions/new` を組み立て、「GitHub上の安全な保管場所を開く」で新しいタブを開く。
  3. 利用者自身が名前 `CHATWORK_API_TOKEN` で登録する。Token値はwizard、会話、repo、ログ、fixture、スクリーンショットへ出さない。
  4. 登録できたことを利用者が確認した後だけ、参加中のルーム一覧取得へ進む。
- パーソナルプランを除き組織管理者へのAPI利用申請が必要である。Tokenページを利用できない場合は、「組織管理者へAPI利用申請→承認後に戻る」を示す。管理者以外は実際にAPIを使うアカウントで申請し、管理者が承認または却下する。承認前はルーム一覧取得へ進めず、設定途中の選択を保持する。
- Chatwork API Tokenは有効期限がなく、Chatwork機能へフルアクセスできるため第三者へ開示しない、と短く示す。

### B. 表示用語

| 現在の表示 | 変更後の表示 |
|---|---|
| room | ルーム。識別子は「ルームID（ルームを識別する番号）」 |
| 頻度 | 自動取得の間隔 |
| runs | 実行回数 |
| schedule | 自動実行 |
| workflow | 自動取得処理（GitHub Actions） |
| private repo | 非公開のGitHubリポジトリ |
| Repository Secret | GitHub上の安全な保管場所（Repository Secret） |
| 同期 | 初出は「最新メッセージの取り込み（同期）」 |

- GitHub Actionsの初出には「決めた間隔で自動取得を動かすGitHubの仕組み」と短く補足する。
- commit・pushは正式名称を残し、「取得結果をこのリポジトリへ自動保存します（Gitのcommit・push）」と目的を先に示す。
- 内部コード、設定key、CLI、API名は変更対象にしない。一般的な技術用語を幼稚な比喩へ置き換えない。
- wizardの表示文言とaccessible nameを監査し、英語だけの見出し／状態、説明のない略語、操作結果が分からない文言を残さない。

### C. 自動取得の間隔と料金補足

| 選択肢 | 30日換算の概算実行回数 |
|---|---:|
| 30分ごと | 約1,440回 |
| 1時間ごと（おすすめ） | 約720回 |
| 3時間ごと | 約240回 |
| 6時間ごと | 約120回 |
| 12時間ごと | 約60回 |
| 手動のみ | 0回 |

- 「実行回数」と「GitHub Actionsの処理時間」は別である。2,000分を2,000回と説明しない。
- 2026年7月時点で、GitHub Freeの非公開リポジトリには月2,000分のGitHub Actions処理時間が含まれる。実使用量はプラン、runner、1回あたりの処理時間で変わり、料金や利用枠は変更される可能性がある。
- wizard本文は決定に必要な情報へ絞り、上記補足は「料金と実行時間について」のdetailsまたは短いhelpに置く。GitHub公式billingページへリンクする。

### D. 配布文書との一貫性

- wizard、`/chatwork` skill、README、`docs/guide/` のChatwork説明を、A〜Cの順序・用語・安全説明へ揃える。
- READMEと公開ガイドには「公式情報は2026年7月確認。サービス側の変更により手順・料金・利用枠が変わる可能性がある」と明記する。
- 外部リンクは新しいタブで開き、行き先と目的が分かる日本語ラベルを使う。

## スコープ外

- ルーム取得、同期、schedule生成、commit／push、検索の処理ロジック変更。
- API Tokenをwizardや会話で受け取る方式への変更。
- GitHub Actionsの料金計算器、使用量取得、プラン判定の追加。
- デザインpalette、layout system、同期規律、安全gate、評価閾値の緩和。

## 受入基準

1. **用語監査（C1/C4）**: wizardの可視文言とaccessible nameを監査し、ユーザー向け英語だけの `room`、`runs`、`schedule`、`workflow`、`private repo`、説明なしの `Repository Secret` が0件。正式名称・内部値は除外する。
2. **Token導線（C1/C4/C5）**: 公式Tokenページ／発行ヘルプ／組織契約の申請ヘルプへ直接進める。Token値の入力欄・会話貼付要求・保存は0件。
3. **組織申請分岐（C1/C4/C5）**: Tokenページを利用できない状態から「組織管理者へAPI利用申請→承認後に戻る」へ進め、承認前はルーム一覧取得0件。戻った後も設定途中の選択が保持される。
4. **Secret登録（C2/C4/C5）**: 現在のowner／repoからSecret追加URLを動的生成し、固定owner／pathが0件。CTAは「GitHub上の安全な保管場所を開く」、登録名は `CHATWORK_API_TOKEN`、登録確認後だけルーム一覧取得へ進む。
5. **間隔と回数（C1/C3/C4）**: 6選択肢が「30分ごと／1時間ごと（おすすめ）／3時間ごと／6時間ごと／12時間ごと／手動のみ」と表示され、30日換算は1,440／720／240／120／60／0回。保存値と実scheduleはSprint 014から不変。
6. **2,000分の意味（C4）**: 2,000分を処理時間の枠として説明し、実行回数と区別する。2026年7月確認、プラン・各回の処理時間による差、料金・枠の変更可能性、GitHub公式billingリンクを確認できる。
7. **同意理解（C4/C5）**: 確認stepで対象ルーム、自動取得の間隔、同じ非公開リポジトリへの保存、共同編集者の閲覧、最新100件、自動保存の影響を理解できる。「取得結果をこのリポジトリへ自動保存します（Gitのcommit・push）」を目的先行で表示する。
8. **配布一貫性（C1/C2/C4）**: wizard、`/chatwork` skill、README、公開ガイドが同じ4段階のToken導線、用語、公式リンク、2026年7月確認注記を持つ。dead link 0件。
9. **compact UI（C8）**: 1 step 1 primary message、CTA最大2、補足detailsを守る。desktopとmobile 768px未満、200% zoomで折返しによる情報欠落・横overflow・操作不能が0件。
10. **accessibility（C8）**: keyboard操作、visible focus、可視ラベル、外部リンクの日本語accessible name、エラー関連付けが成立する。外部リンクは新しいタブで開く。
11. **機能不変（C3/C5）**: 同期処理、17分起点、6間隔、手動のみ、自動push同意、Token非漏洩、選択ルーム限定、削除2段階に変更0件。
12. **全回帰（C6）**: Sprint 014専用回帰と全回帰が0 FAIL。既知失敗0件。

## Evaluatorの確認方法（micro）

- lightweight scoringとして完成度、安定性、無回帰を評価し、安全gateとaccessibilityのゼロ許容違反も確認する。
- running wizardを実ブラウザで操作し、API Token取得／組織申請／Secret登録／ルーム選択／間隔／確認の各表示を確認する。
- desktopとmobile 768px未満、200% zoomのスクリーンショットを残し、折返し・overflow・CTA数・details・accessible nameを記録する。
- `scripts/sprint-014-regression.sh` と `scripts/regression-check.sh --offline` を実行し、必要な新規文言／URL／動的path／Token非漏洩assertを追加した回帰も0 FAILであることを記録する。

## 公式参照（2026年7月確認）

- Chatwork API Token: `https://www.chatwork.com/service/packages/chatwork/subpackages/api/token.php`
- Chatwork公式発行ヘルプ: `https://help.chatwork.com/hc/ja/articles/115000172402-API%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%82%92%E7%99%BA%E8%A1%8C%E3%81%99%E3%82%8B`
- Chatwork組織契約の申請・承認ヘルプ: `https://help.chatwork.com/hc/ja/articles/115000169501-API%E3%81%AE%E5%88%A9%E7%94%A8%E7%94%B3%E8%AB%8B%E3%82%92%E6%89%BF%E8%AA%8D-%E5%8D%B4%E4%B8%8B%E3%81%99%E3%82%8B`
- Chatwork API Tokenの取扱い: `https://developer.chatwork.com/docs/endpoints`
- GitHub Actions billing: `https://docs.github.com/en/billing/concepts/product-billing/github-actions`
