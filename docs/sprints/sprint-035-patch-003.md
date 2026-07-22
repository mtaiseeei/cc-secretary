# Yasashii Sprint 035 Patch 003 — wizardを開いた時に最新の通常スペースを確認する

- Type: regular patch
- Risk: high（既存Repository Secretを使うGitHub Actions、Google Chat APIの全ページ取得、run相関、保存済み設定の保護を横断する）
- 主眼: Google Chat設定wizardを開いたら、保存済みスペースだけを最新一覧として見せず、既存接続を使って参加中の通常スペースを全ページ確認する。以前の選択は保ち、新しい候補は未選択で追加する。
- 依存: Agentic `sprint-035-patch-003` の合格済み固定candidate。Yasashiiは共通wizardを狭いoverlay規律で取り込み、独自実装を複製しない。

## 外から見える成果

利用者はGoogle Chat設定画面を開くだけで、現在の接続を使った最新候補の確認が始まる。Googleへの接続許可を毎回やり直す必要はない。全件確認できた場合、途中まで確認できた場合、確認に失敗した場合がやさしい日本語で区別され、どの場合も以前の選択と履歴は残る。

## Scope

### 1. 起動時に最新一覧を確認する

- 設定済みwizard entryでは、保存済みconfigだけを「現在参加している全スペース」として確定表示しない。
- 画面を開いたら、現在のprivate workspaceに登録済みのGoogle Chat用Repository Secretを使うGitHub Actions discoveryを開始し、今回の結果を待つ。
- 待機中は「最新の通常スペースを確認しています」と、以前の選択は失われないことを示す。Secret値の入力、表示、コピーを求めない。
- 候補更新だけのためにOAuth再認可を必須にしない。既存の明示的な再接続導線は、必要時の回復手段として残す。

### 2. 今回runだけを使う

- entryごとのcorrelationで、dispatch後に始まった対象workflowの今回runだけを採用する。
- 古い成功run、別branch／別workflow、同時run、相関不明runを結果に使わない。
- queue、実行中、成功、失敗、cancel、timeoutを区別し、終わらない待機や残留processを作らない。
- ActionsとAPIの結果にはSecret値、OAuth token、認可code、Google Chatメッセージ本文を含めない。
- 最新候補を見せるため、SPACEの名前とIDは今回runのprivate Actions短期result、wizard local memory、利用者本人へ表示するDOMで処理してよい。実space名／IDをAI会話、通常log、screenshot、評価証跡へは出さない。

### 3. 全ページの通常スペースだけを候補にする

- `spaces.list` は`nextPageToken`がなくなるまで全ページをたどる。1ページ目や固定件数だけで全件確認済みとしない。
- `spaceType=SPACE`だけを安定したspace IDで候補にする。DM、グループDM、type不明、欠損IDは表示しない。
- 重複ID、page token循環、不正応答、途中失敗を検出し、重複表示や無限待機を防ぐ。

### 4. 結果を非破壊でまとめる

- `complete`: 全ページを確認できた。今回の全SPACEを既知設定へID単位でmergeする。
- `partial`: 1ページ以上は確認できたが、後続ページ等が完了しなかった。確認できた範囲と未完了を分けて示す。
- `failed`: 信頼できる今回結果がない。以前の設定を残し、「最新一覧を確認できませんでした」と示す。
- 3状態の全てで既知entry、既存選択、無関係field、schedule、同期状態、履歴を削除・初期化しない。
- 今回結果に現れない既知entryも自動削除・選択解除しない。新規SPACEは必ず未選択にする。
- discoveryだけで同期対象、初回取得、scheduleを増やさない。同じ結果の2回適用で追加差分を出さない。
- `google-chat/spaces-discovery.json` または同等の専用短期resultを許可し、correlation、結果状態、生成時刻、SPACEの名前／ID／typeを保持できる。選択config、同期状態、メッセージ履歴とは分離し、古いresultを今回結果へ使わない。

### 5. Yasashiiの画面と同期規律

- Agenticと同じDOM、step、complete／partial／failed意味、SPACE境界、run相関、安全動作を使う。
- Yasashiiでは、最初に「何が起きているか」「次に何をすればよいか」を示す。GitHub Actionsの初出には「登録済みの接続情報を使って最新候補を確認するGitHubの仕組み」と短く補足する。
- 主導線へ内部用語を詰め込まず、正式名称が必要な説明は既存の「詳しい説明」に置く。安全上必要な意味は省略しない。
- Google Chatの見出し、primary CTA色、keyboard、focus、accessible name、IME検索、checkbox保持、desktop／mobile／200%を維持する。
- Yasashii固有copy／identity／配布metadataだけをoverlayとして保持し、共通wizardやdiscoveryを別実装にしない。同期対象、upstream base、candidate commit、repo-owned file除外をprogressへ記録する。

## Non-scope

- 新しいOAuth scope、write／admin scope、サービスアカウント、Domain-Wide Delegation、External OAuth app。
- wizard起動ごとのOAuth再認可、Repository Secret値のローカル読取・再登録・表示。
- SPACE自動選択、既存選択解除、既知entry／履歴削除、schedule／保存schema／履歴形式の再設計。
- Chatworkの挙動、Token案内、yasashii固有identity／配布metadata／repo-owned docsの不要な変更。
- 実API、実OAuth、実Secret更新、実Actions dispatch、remote push、PR、release。
- Secret値、OAuth token、認可code、Google Chatメッセージ本文を短期result、local memory、DOM、会話、log、screenshot、証跡へ出すこと。
- 実space名／IDをAI会話、通常log、screenshot、評価証跡へ出すこと。private Actions短期result、wizard local memory、利用者本人の候補DOMで必要なspace metadataを処理することは許可する。
- 新しいcollector、attestation、approval manifest、統一証跡schema。

## Acceptance Criteria

1. 設定済みwizard entryで保存済みconfigだけを最新候補として確定表示せず、今回discoveryの待機状態を実DOMで示す。通常entryでOAuth画面、Secret入力、Secretコピーを要求しない。
2. dispatch後のworkflow／branch／event／correlationが一致する今回runだけを採用し、古いrun、同時run、別branch、相関不明runの負fixtureを全て拒否する。
3. 複数ページfixtureで最終`nextPageToken`まで取得し、全ページのSPACEだけを候補にする。DM／グループDM／type不明／重複IDは0件である。
4. complete／partial／failedを別状態として表示し、partial／failedを全件確認済みと表現しない。既知設定だけが残るfailedでも、それを全参加一覧とは表示しない。
5. 3状態の全てで既知entry、既存選択、無関係field、schedule、同期状態、履歴が保持される。新規SPACEは全て未選択、同じ結果の2回適用で追加差分0件である。
6. discoveryによるwriteは `google-chat/spaces-discovery.json` または同等の専用短期resultに限定され、config確定、初回取得、schedule追加、同期状態変更、履歴writeは0件である。
7. Secret値、OAuth token、認可code、client JSON全文、メッセージ本文がDOM、local引数、log、fixture出力、短期result、screenshot、証跡へ0件である。SPACEの名前／IDは短期result、local memory、候補DOMで処理できるが、実値を会話、通常log、screenshot、評価証跡へ出さない。
8. failure、cancel、timeout、rate limit、network失敗、途中page失敗でも以前の状態を保って再試行でき、再試行は新しいcorrelationを使う。
9. desktop、390px相当mobile、200%の実ブラウザで待機、complete、partial、failed、検索、checkbox、再試行、終了を操作し、横overflow、focus消失、未処理例外、console errorが0件である。
10. AgenticとYasashiiでwizard DOM、表示copy、状態意味、候補ID、選択ID、SPACE境界、安全動作が一致し、Yasashii固有overlay以外の未分類差分0件である。
11. IME検索、fast-forward取得、OAuth／Secret／run相関、Chatwork無回帰、Yasashii edition境界の回帰が0 FAILである。
12. 実OAuth／API／Secret／Actions／remote writeを行わないoffline評価では各項目を `not-run` とし、synthetic成功をlive成功へ読み替えない。

## 評価シナリオ

1. 既知選択、既知未選択、新規SPACE、今回未確認の既知SPACEを混ぜたcomplete fixtureを操作する。
2. 3ページ中2ページ後に失敗するpartial fixtureと、今回結果0件のfailed fixtureで表示と保持を確認する。
3. DM／グループDM、重複ID、token循環、古いrun、同時runを混ぜた負fixtureを実行する。
4. desktop、mobile、200%で待機から結果表示、IME検索、checkbox、再試行、終了を操作し、AgenticとのDOM parityを比較する。

## Evidence safe harbor

- Yasashii candidate、同期元Agentic candidate、upstream base、変更path／overlay inventory、実行command、exit、assert数。
- synthetic GitHub Actions／Google Chat API fixtureのcorrelation、採用／拒否run、page進行、resource type、専用短期result、complete／partial／failed結果。space名／IDは合成値だけを使う。
- config、選択、schedule、同期状態、履歴の前後snapshotと二回適用結果。
- desktop／mobile／200%の実URL、DOM操作、状態、候補ID、選択ID、focus、console、横overflow、screenshots。評価用DOMと画像は合成space名／IDだけを使う。
- Secret非露出、Agentic／Yasashii parity、既存回帰の結果。
- 実OAuth／API／Secret／Actions／remote writeの `not-run` 集計。
- 上記で十分とし、実Actions、実API、外部署名、新しいcollector／統一証跡schemaを追加の合格条件にしない。

## External live gate

offline評価はsynthetic GitHub Actions／API fixtureと実DOMで完結する。実Repository Secret値の読取、実Actions dispatch、実Google Chat API、push／PR／releaseは行わない。必要になった場合は対象、副作用、停止方法、cleanupを示し、操作ごとの明示確認を得る。
