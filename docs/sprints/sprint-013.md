# Sprint 013 — G5 接続: 1つのrepoとChatwork初回設定

- Type: main
- 主眼: 初回オンボーディングからprivate GitHub repoの作成・初回push、Chatwork Secret案内、room選択wizard、初回取得、基本検索までを一続きで成立させる。
- 依存: sprint-012 done。既存の記憶保護、timeline、settings、`yasashii-harness`参照導線が全回帰で保護されていること。

## 外から見える成果

1. 1つのprivate GitHub repoが、秘書・通常のプロジェクト開発・Chatwork履歴の共通ワークスペースとして作られ、初回pushまで完了する。
2. `/chatwork` が接続状態を示し、API TokenをRepository Secretへ安全に登録する手順を案内する。
3. 参加room一覧をローカルwizardで見て複数選択し、同期間隔と保存影響を確認できる。
4. 選択roomの最新100件以内を初回取得し、0件でも正常完了する。
5. 保存済み履歴に対する基本検索が、room・日付・該当箇所の根拠つきで答える。

## スコープ

### A. single-repoオンボーディング

- 新規ユーザーはrepo名と保存内容を確認し、private GitHub repo作成、初期commit、初回pushまで完了する。
- 同じrepoに秘書の記憶・成果物、通常のproject、Chatwork設定・履歴を置く。Chatwork専用repoを作らない。
- public repoを拒否する。既存remoteがある場合は別repoを黙って作らず、現在のrepoを使うか確認する。
- 完了時にprivate状態、remote、初回push成功を示す。

### B. `/chatwork` 接続とroom discovery

- 未接続／room選択待ち／初回取得済み／要確認を区別し、次の行動を1つ示す。
- API TokenはGitHub Actions Repository Secretへ登録し、repo、設定、ログ、journal、DOM、fixtureへ値を保存しない。
- Secret登録後にGitHub Actionsが参加room一覧を取得して同じprivate repoへ反映し、wizardがその一覧を読む。0 room、認証失敗、rate limit、network失敗を区別する。
- room名を主表示、Room IDを補助表示して複数選択できる。初期状態で全roomを自動選択しない。

### C. ローカル設定wizard

- room選択、頻度選択、確認、初回取得結果のstepを提供する。
- 頻度は30分／1時間／3時間／6時間／12時間／手動のみ。既定推奨1時間と、30日換算run数1440／720／240／120／60／0を表示する。
- run数と実課金分数を区別し、private GitHub Freeの2,000分は変更されうる参考値として扱う。
- 確認stepで選択room、頻度、同じprivate repoへ本文を保存すること、共同編集者から見えること、API最新100件制約、自動pushは同意後だけ有効になることを示す。このsprintではschedule自体を有効化しない。
- 確定前は副作用0件、戻る操作で入力保持、キャンセルで0変更。

### D. design・responsive・accessibility

- Pure White／Light Ash、Carbon Dark／Graphite／Pewter、primary CTAだけElectric Blue `#3E6AE1`を使う。
- gradient、shadow、装飾写真、Tesla商標／wordmark、ライセンス不明フォントを使わない。
- 4px radius、8px spacing、400/500 weight、14px中心、headline最大40px、1 step 1 primary message、CTA最大2。
- transitionはcolor／background／borderの0.33秒だけ。scale／translate hoverなし。
- 768px未満は1 column・CTA縦積み。keyboard、visible focus、label、contrast、44px相当のtouch targetを満たす。

### E. 初回取得と基本検索

- 選択roomだけを対象に最新100件以内を取得し、message ID単位で重複なく同じrepoへ保存する。
- 0件、1件、100件を正常に扱い、100件より前を取得済みと見せない。
- roomごとの成功・失敗・取得件数を区別し、部分失敗を全成功としない。
- `/chatwork search` はpull後の保存済み履歴をroom、発言者、日付、キーワードで検索する。
- 見つからない場合は「現在の保存済み履歴には見つからない」と伝える。手動同期の確認・dispatch・待機・再検索はsprint-014で扱う。

## スコープ外

- 定期scheduleの有効化と自動push。
- 見つからない時の確認付きmanual workflow dispatch。
- Chatworkへの投稿、編集、削除。
- 100件より前の履歴を遡るbackfill。
- 常設Webアプリ、外部公開server、Chatwork専用repo。

## 受入基準

1. **one repo（C1/C5）**: 隔離した新規ユーザーfixtureでprivate repo作成、初期commit、初回pushが成功し、秘書・project・Chatwork設定が同じrepoにある。実装repoのremoteへはpushしない。
2. **public／既存remote保護（C3/C5）**: public指定を拒否し、既存remote検出時は確認前のrepo作成・remote変更・pushが0件。キャンセル時も0変更。
3. **Secret非漏洩（C2/C5）**: synthetic tokenがtracked files、git差分／履歴、logs、DOM、errors、screenshotsに0件。値を入力・表示するwizard UIがない。
4. **room discovery（C1/C3）**: 0 room／複数room／認証失敗／rate limit／network失敗をfixtureで区別し、room名とRoom IDを選択できる。未選択roomの取得0件。
5. **wizard設定（C1/C2）**: 6頻度、既定1時間、概算run数、実課金との差、100件制約、共同編集者への可視性が表示される。選択値がrepo設定へ保存される。
6. **確定境界（C5）**: 確定前・戻る・キャンセルの副作用を検証し、確定後だけroom設定と初回取得が起きる。
7. **初回0／1／100件（C3/C5）**: 0件を成功、100件を上限として扱い、message IDの再取得で重複0件。過去取得済み履歴をAPI応答欠落だけで削除しない。
8. **部分失敗（C3/C4）**: room単位の成功・失敗・件数を区別し、失敗理由と再試行方法を日本語で示す。tokenや本文をエラーへ出さない。
9. **基本検索（C3/C4）**: found時はroom・日付・該当箇所、not found時は保存済み範囲の限界を示し、Chatworkに存在しないと断定しない。
10. **desktop UI（C8）**: running wizardをdesktop browserで全step操作し、指定palette・余白・CTA・typography・禁止装飾を確認したスクリーンショットがある。
11. **mobile／accessibility（C8）**: 768px未満で1 column・CTA縦積みを確認し、keyboard、focus、label、touch target、200% zoomの証跡とスクリーンショットがある。
12. **無回帰（C6）**: sprint-012までの全回帰＋single-repo／Chatwork／wizardの新規assertが0 FAIL。

## 評価証跡

- 隔離したprivate repoの作成・初回push結果と、single-repo構成。
- synthetic tokenの全surface漏洩検査結果。
- room APIの0／複数／各error fixture、初回0／1／100件、重複取得前後差分。
- running wizardのdesktop／mobile操作ログと各スクリーンショット。
- found／not foundの基本検索結果。
- 全回帰のPASS／FAIL集計。

## 参照

- `docs/spec/features.md` F04/F07/F23/F24/F25
- `docs/spec/constraints.md` single private repo・secret・100件・wizard
- `docs/spec/domain.md` Chatworkの取得境界
- `docs/spec/ui.md` Chatwork設定wizard
- `docs/spec/rubric.md` C2/C3/C5/C6/C8
