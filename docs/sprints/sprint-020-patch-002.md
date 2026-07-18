# Sprint 020 Patch 002 — Google Cloud準備をAI会話へ分離する

- Type: regular patch
- Base Sprint: sprint-020
- 依存: sprint-020-patch-001 done。More Simpleな日本語、共通wizard、OAuth別タブ、SPACE限定、一体型確定、Chatwork非回帰が独立評価済みであること。
- 主眼: Google Chatの難しいGoogle Cloud準備をlocal wizardから切り離し、Google Chat skillが `gcloud` と公式の直接リンクで段階支援する。接続用JSON取得後だけwizardを開き、非エンジニアが拡張機能に依存せず進められるようにする。

## ユーザーが確定した判断

1. 正式サポートはGoogle WorkspaceのGoogle Chatだけ。無料の個人Googleアカウント向け説明・分岐は利用者向け面に一切出さない。
2. Project表示名はGit repo root名＋`-google-chat`。Project IDも同じ初期案を使い、Google制約または全体重複時だけ調整し、作成前に確認する。
3. CLIで可能なproject作成とGoogle Chat API／People API有効化まではAIが支援する。本人操作が必要なGoogle画面は、Project指定の直接リンクと一画面一操作で案内する。
4. `gcloud`がなければ、Google公式・インストール自体は無料・非公式ソフトではないことと、Cloud変更能力を説明し、承認後だけ導入する。導入できなければ手動リンク支援へ切り替える。
5. Browser Use／Chrome拡張機能は必須にしない。ユーザーが操作し、「できました」と返して進むことを標準にする。
6. JSON取得後だけlocal wizardを開く。wizardはJSON選択、OAuth許可、通常スペース選択以降を担当する。

## 外から見える成果

1. 利用者は「Google Chatを設定したい」と伝えるだけで、現在のrepoに対応するGoogle Cloud準備を始められる。
2. `gcloud`が使える環境では、変更予定を確認してからproject作成と必要API有効化まで進められる。
3. `gcloud`がない／入れられない環境でも、公式リンクと一操作ずつの説明で同じJSON取得地点まで進められる。
4. Google画面で何を押すかは一度に一つだけ示され、利用者の「できました」後に次へ進む。
5. JSON取得後のwizardはファイル選択から始まり、OAuth許可後に通常スペース選択へ自動で進む。
6. READMEとwizardから現行のGoogle Cloud説明画像と重複手順がなくなり、READMEはAIへ話しかける主導線と手動向け公式リンクに絞られる。

## スコープ

### A. Google Workspace限定の入口

- `/google-chat`、「Google Chatを設定したい」等の自然文からGoogle Chat skillへ段階ロードする。
- 未設定時はlocal wizardを先に開かず、Google Cloud準備の現在地と次の一手を会話で示す。
- Google Workspace組織のGoogle Chatだけを対象にし、OAuth Audienceは `Internal` に固定する。
- 利用者向けREADME、skill会話、wizardに、無料の個人Googleアカウント、`External`、Test users、公開審査の説明・選択肢・fallbackを出さない。

### B. repoとProject案

- 現在位置がGit repo内なら、Git repo rootのディレクトリ名を使う。サブディレクトリから起動してもサブディレクトリ名を使わない。
- repo root名が `hogehoge` の場合、Project表示名を `hogehoge-google-chat` とする。Project IDも同じ値を初期案にする。
- Project IDがGoogleの命名制約を満たさない、長すぎる、またはGoogle Cloud全体で使用済みの場合だけ、理由を示して安全な候補へ調整する。無関係な固定名や利用者名へ置き換えない。
- 作成前にProject表示名、Project ID、Google Workspace組織、Google Chat API、People API、Billing Accountを自動接続しないことをまとめて示し、明示確認を得る。
- Git repo rootを確認できない場合はprojectを作らず、Google Chatを接続するrepoを選ぶよう案内する。

### C. `gcloud`の確認・導入・CLI準備

- 最初に `gcloud`の有無とログイン状態を変更なしで確認する。
- 未導入時は、Google公式の管理ツールでありインストール自体に料金は発生せず、非公式ソフトではないことを伝える。同時にGoogle Cloudの設定を変更できるため、インストール方法と実行予定を先に示し、利用者の明示承認後だけ導入を試みる。
- 利用者が断る、会社PC等で導入できない、安全な導入方法を判断できない場合は、失敗扱いで終わらずDの手動リンク支援へ切り替える。別の大きな開発環境を無断で導入しない。
- CLIを使える場合は、Google Workspaceアカウントのログイン、利用可能な組織、既存の同名候補project、作成権限を先に確認する。未ログインでは本人がGoogleログインを完了し、複数組織では選択を求める。
- 利用者がBの最終案を承認した後だけprojectを作成し、Google Chat APIとPeople APIを有効にする。Billing Accountは自動接続せず、`gcloud`の既定project等、他の作業へ影響する全体設定を無断変更しない。
- Project ID衝突、権限不足、project作成失敗、片方のAPIだけの失敗を区別する。完了した工程と未完了の工程を分け、全体成功と表示しない。

### D. 公式リンクによる一画面一操作

- CLIでprojectとAPIを準備できた後は、対象Project IDを指定したGoogle公式リンクを順に出す。`gcloud`を使えない場合はproject作成とAPI有効化も同じ形式で案内する。
- 各応答は「今すること」「開くリンク」「押す場所」「完了条件」「できたら『できました』と返信」の順にし、同時に複数画面を操作させない。
- 少なくとも次の公式画面を対象にする。
  1. Google Cloud projectの作成または選択。
  2. Google Chat APIの有効化。
  3. People APIの有効化。
  4. Google Auth platformのAudienceで「内部（Internal）」を選択・保存。
  5. ClientsでApplication type「Desktop app」のOAuth Clientを作成。
  6. 作成したClientの接続用JSONをダウンロード。
- 各リンクで対象Projectが選ばれていることを先に確認させる。リンクのラベルは行き先と目的を日本語で示し、`ここ`だけにしない。
- 利用者が「できました」と返すまで次の操作へ進まない。操作不能、画面名変更、管理者権限不足では、現在画面と不足事項を確認し、推測で完了扱いしない。
- Browser Use、Chrome拡張機能、特定のサインイン済みブラウザを必要条件にしない。利用者が希望し利用可能な場合でも補助であり、標準手順を拡張機能依存に変えない。

### E. 中断と再開

- 厳格secretを含めず、対象repo、Project表示名／ID、Google Workspace組織、完了済み工程、次の工程、最終確認日時だけで進行を再開できる。
- `gcloud`未導入、未ログイン、複数組織、権限不足、インストール不可、Project ID衝突、CLI途中失敗、手動画面の中断を区別する。
- 「Google Chatの設定の続き」で対象repoとProjectを再確認し、完了済み工程を無条件に作り直さず、次の未完了工程から一操作ずつ再開する。
- client secret、OAuth client JSON本文、認可URL、認可コード、access token、refresh tokenを再開情報、会話、ログ、journalへ残さない。

### F. JSON取得後のlocal wizard

- 接続用JSONをダウンロードできたと利用者が確認した後だけlocal wizardを起動する。
- wizardの開始画面は「Google Cloudから取得した接続用ファイルを選ぶ」とし、Google Cloud project、API、Audience、Client作成の説明画面と現行の案内画像を表示しない。
- JSONがまだない状態でwizardを直接開いた場合は、秘密値を貼らせず、設定を終了してAIへ「Google Chatを設定したい」と伝える次の一手を示す。
- JSONの内容とclient secretを画面・会話・ログへ表示せず、外部へuploadしない既存境界を維持する。
- JSON確認後に「Googleの確認画面を開く」等、次に起きることが分かる明示ボタンでOAuth画面を別タブに開く。JSON選択だけでOAuthを自動開始しない。
- 元wizardは状態確認を続け、許可後は通常スペース選択へ自動で進む。ポップアップ拒否、認証タブ閉鎖、同意拒否、state不一致、callback不一致、管理者ブロック、再試行のSprint 019合格動作を維持する。
- 通常スペース選択以降はsprint-020-patch-001の一体型フローを維持する。スペース→3時間推奨の間隔→安全確認→`この設定で始める`→初回取り込み＋自動取得設定→`設定を終了する` とし、手動のみは初回取り込みあり・schedule 0件、部分失敗は完了／未完了／次の行動を分ける。

### G. READMEと配布面

- READMEの主導線は「Google Chatを設定したい」とAIへ伝える短い説明にする。
- AIを使わず手動で進めたい人向けには、Google公式のproject作成、Chat API、People API、Audience、Clientsのリンクと、対象Project確認の注意を折りたたみ等で短く残す。
- 現行のGoogle Cloud案内画像と、その画像を前提にした説明をREADME、wizard、現行配布面から外す。実画面スクリーンショットは本Patchで新規作成・掲載しない。
- `gcloud`のインストール自体が無料であることとGoogle Cloudサービスの料金は別であり、本導線はBilling Accountを自動接続しないことを誤解なく示す。
- Google公式情報の確認日と、画面名・ボタン名が変わる可能性を残す。

### H. 回帰と評価環境

- Cloud command runner、Google Cloud応答、公式リンク、途中再開は合成fixtureで検証できるようにし、実Google Cloudへ接続しない標準評価経路を持つ。
- `gcloud`インストール、project作成、API有効化、OAuth Client作成等の実外部変更は、ユーザーの明示許可と専用test資源がある場合だけlive gateとして行う。許可がなければ外部変更0件を証跡化し、合成結果をlive成功と表現しない。
- sprint-019のOAuth、sprint-020のschedule／検索／live後始末、sprint-020-patch-001のMore Simpleな日本語／一体型設定、Chatwork全導線、全offline／online回帰を維持する。

## 非ゴール

- 無料の個人Googleアカウント、`External` Audience、Test users、OAuth公開審査の案内・対応。
- Browser Use、Chrome拡張機能、ブラウザ自動操作を標準手順にすること。
- Google Cloudを共通External OAuth appやサービスアカウントへ置き換えること。
- 会社別・相手別にGoogle Chat／Chatworkを自動判定するチャットルーティング。
- DM／グループDM、write scope、投稿・編集・削除、添付本文取得。
- Chatwork wizard、保存形式、取得間隔、検索の仕様変更。
- 実Google Cloud project、実OAuth Client、実Billing設定を、評価のためにユーザー許可なく作成すること。

## 受入基準

1. **Workspace限定（C2/C5/C11）**: README、Google Chat skill、wizardの利用者向け面はGoogle WorkspaceのGoogle Chatだけを案内し、個人Googleアカウント、`External`、Test users、公開審査の分岐・fallbackが0件。Internal以外へ自動切替しない。
2. **自然文と段階ロード（C2/C3/C4）**: `/google-chat` と「Google Chatを設定したい」から専用skillへ入り、未準備時はwizardを先に開かずCloud準備の次の一手を1つ示す。会社別チャット自動判定は追加しない。
3. **repo名Project案（C2/C3/C4）**: repo root `hogehoge` とそのサブディレクトリから開始した両方で、Project表示名／ID初期案が `hogehoge-google-chat`。no repoではCloud変更0件。無効文字、長さ、全体重複では理由つき調整案を作成前に表示する。
4. **作成前確認（C4/C5/C11）**: Project表示名、最終Project ID、Google Workspace組織、Google Chat API、People API、Billing非接続を示し、明示確認前のproject作成、API変更、全体設定変更が0件。拒否・キャンセルも0件。
5. **`gcloud`安心説明と導入確認（C4/C5/C7）**: 未導入時にGoogle公式、インストール自体は無料、非公式ソフトではない、Cloud変更能力がある、実行予定を先に示す、承認後だけ実行を自然な日本語で説明する。無断インストール0件。
6. **CLI正常経路（C1/C3/C5）**: ログイン、組織、権限、既存候補を確認後、承認済みProjectだけを作り、Google Chat API／People APIだけを有効にする。Billing自動接続、無関係API、他作業へ影響する既定project変更0件。
7. **CLI異常とfallback（C1/C3/C4/C5）**: 未ログイン、複数組織、権限不足、導入拒否、導入不可、Project ID衝突、project作成失敗、片方のAPI失敗を区別する。完了／未完了と次の一手を示し、直接リンク支援へ安全に切り替えられる。
8. **直接リンクと一操作（C2/C4/C7）**: project、Chat API、People API、Audience、Clients／Desktop app、JSON取得の公式リンクが対象Projectを指定し、行き先と目的が分かる。各段階は一画面一操作で、「できました」前に次工程へ進まず、Project選択確認を欠かさない。
9. **拡張機能非依存（C4/C8）**: Browser Use、Chrome拡張、特定ブラウザがないfixtureでもJSON取得地点まで案内が完結する。拡張機能のインストールを要求する主導線0件。
10. **途中再開（C1/C3/C5）**: `gcloud`未導入、未ログイン、API片方完了、Audience完了、JSON待ちの各中断状態から、対象repo／Projectを再確認し、次の未完了工程から再開する。完了工程の無条件再実行0件、厳格secret保存0件。
11. **wizard責務分離（C1/C2/C4/C8）**: JSON取得後だけwizardを開き、開始画面はJSON選択。Cloud project、API、Audience、Client作成の準備画面、現行案内画像、重複手順が0件。JSON未取得で直接開いた場合も、秘密値を貼らせずAI会話へ戻れる。
12. **OAuth安全動作（C3/C5/C8/C11）**: JSON確認後の明示ボタンでOAuthを別タブに開き、元wizardを保持する。JSON選択直後の無断起動0件。許可後の自動SPACE選択、popup拒否、タブ閉鎖、拒否、state／callback不一致、管理者block、再試行がSprint 019合格動作どおりで、厳格secret非露出。
13. **一体型設定の非回帰（C3/C4/C6/C8/C11）**: SPACE選択→3時間推奨間隔→安全5項目→`この設定で始める`→初回取り込み＋自動取得設定→`設定を終了する` を完走する。手動のみは初回取り込みあり・schedule 0件、部分失敗は正直な結果、追加設定ループ0件。
14. **READMEと画像撤去（C1/C2/C4/C9）**: READMEはAIへ話しかける主導線と手動向け公式リンクを持ち、現行Google Cloud案内画像、その参照、画像を前提にしたcopyが現行配布面に0件。実画面スクリーンショットの新規掲載0件。
15. **安全・秘密（C5/C11）**: client JSON本文、client secret、認可コード、access token、refresh token、認可URL／callback URLがtracked file、Git差分・履歴、ログ、journal、再開情報、fixture、DOM、スクリーンショット、評価証跡に0件。client IDの既存例外境界を維持する。
16. **外部変更gate（C3/C5）**: 標準評価では実`gcloud`導入、実project／API／OAuth Client変更、Billing、OAuth、Secret、pushが0件。live検証はユーザー明示許可＋専用test資源がある場合だけで、未実施をlive成功と表現しない。
17. **UX・accessibility（C4/C7/C8）**: skill会話は一度に一操作、失敗は「何が起きたか→次にすること」、CTA／リンクは結果が分かる日本語。wizardはdesktop／mobile／200%、keyboard、focus、label、accessible name、CTA色、details開閉、横overflowを維持する。
18. **Chatwork非回帰（C2/C4/C6/C8）**: Chatworkの接続準備、選択room限定、3時間推奨、`#F03747`、選択roomだけの結果、More Simpleな日本語、desktop／mobile／200%が変わらない。
19. **既存Google Chat境界（C5/C6/C11）**: Internal、read-only 3 scope、PKCE＋state、loopback、SPACE限定、DM／group DM／添付本文0件、同意済みschedule、再認証、検索、後始末の全回帰が0 FAIL。
20. **全回帰（C2/C6/C9/C10）**: 本Patch専用fixture／負テスト、sprint-019／020／020-patch-001、Chatwork、全offline／online回帰が0 FAIL、既知失敗0件。

## 評価証跡

- `gcloud`あり／なし／承認／拒否／導入不可、未ログイン、複数組織、権限不足、Project ID調整、API部分失敗の会話・command runner fixture。
- repo root／subdirectory／no repo、Project表示名／ID案、作成前確認、Billing非接続、確認前外部変更0件のsnapshot。
- project／Chat API／People API／Audience／Clients／JSON取得の直接リンク、Project指定、案内文、「できました」前後の状態遷移。
- 途中再開の各状態と、完了工程の再実行0件、厳格secret非保存の検査。
- README主導線、手動リンク、現行画像・参照0件、Google Workspace限定・個人向けcopy 0件のinventory。
- JSON選択からOAuth別タブ、SPACE選択、一体型確定、手動のみ、部分失敗、desktop／mobile／200%のrunning wizard操作と秘密値のないスクリーンショット。
- Chatwork／Google Chat専用回帰、全offline／online回帰のPASS／FAIL集計。
- external live gateを実施しない場合は、実Google Cloud／OAuth／Secret／push変更0件の明示記録。実施する場合はユーザー許可、専用test資源、伏せ字結果、後始末を別に記録する。

## 参照

- `docs/spec/features.md` F32〜F35
- `docs/spec/constraints.md` §2、§12、§13
- `docs/spec/domain.md` Google Chatの取得境界、OAuth接続状態
- `docs/spec/ui.md` Google Cloud準備の会話、Google Chat設定wizard
- `docs/spec/rubric.md` C1〜C11
- `docs/sprints/sprint-019.md`
- `docs/sprints/sprint-020.md`
- `docs/sprints/sprint-020-patch-001.md`
