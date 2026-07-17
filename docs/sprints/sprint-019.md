# Sprint 019 — G9 Google Chat高度接続・初回取得

- Type: main
- 主眼: 各利用組織が所有するGoogle CloudプロジェクトとユーザーOAuthを使い、非エンジニアがREADMEとローカルwizardに沿って、選択した通常スペースだけを同じprivate workspaceへ初回取得・検索できるようにする。
- 依存: sprint-018 done。single private workspace、Chatwork、更新、一般PJ／別repo開発PJ、全回帰が成立していること。
- ユーザー決定: `1A` 各社所有Cloud project、`2A` 選択した通常スペースだけ、`3A` Chatworkと同じprivate repo＋GitHub Actions。`my-vault` の現行Google Chat同期を振る舞いの基準にする。

## 外から見える成果

1. READMEの「Google Chatをつなぐ（少し高度な設定）」だけで、管理者に頼む内容と自分が行う内容が分かる。
2. `/google-chat` からOAuth接続状態を確認し、Googleのパスワードや資格情報を会話へ貼らずに認証できる。
3. 利用者は参加中の通常スペースを名前で確認し、必要なものだけ選べる。DMとグループDMは出ない。
4. 選択スペースの取得可能な履歴が、スペース別・日付別Markdownとして同じprivate repoへ保存される。
5. スレッド、発言者、Asia/Tokyoの時刻、添付メタデータを含む保存済み履歴を検索できる。
6. Chatwork／Google Chatを同じwizard骨格で設定でき、全画面のサービス名、primary CTA色、3時間の推奨・初期値で取り違えない。

## スコープ

### A. READMEの高度設定

- Google Workspace管理者またはGoogle Cloudプロジェクト作成権限が必要であることを冒頭に示す。
- 各社のGoogle Workspace組織が所有するCloud project、OAuth Audience `Internal`、Desktop app client、Google Chat API、Google People APIを画面順に案内する。
- `chat.messages.readonly` が読み取り専用でもRestricted scopeであること、社内利用を前提にする理由、管理者のAPI access controlsで拒否される場合があることを短く説明する。
- `contacts.readonly` だけでは連絡先にない同僚名を補完できない場合があり、安定した代替表示になることを故障ではなく仕様として示す。
- Google公式リンクは `docs/spec/constraints.md` の2026年7月確認基準を使い、情報が変わる可能性を明記する。

### B. OAuth接続wizard

- `/google-chat` と自然な「Google Chatにつなぎたい」から段階ロードし、現在状態と次の1手を示す。
- OAuth client JSONをローカルで選び、内容を外部へuploadせず、loopbackで利用者本人の同意を完了する。
- Desktop OAuthはPKCEとstate検証を併用する。認可コードはloopback受領直後にtokenへ交換し、記録しない。
- scopeは `chat.spaces.readonly`、`chat.messages.readonly`、`contacts.readonly` の3つだけ。write、admin、未使用のmembership scopeを要求しない。
- client secret、認可コード、access token、refresh token、OAuth client JSON全文は厳格secretとし、永続物へ出さない。client IDは識別子で、一時的なOAuth認可URLと管理者チェックリストだけ表示できるが、tracked file、Git差分・履歴、ログ、journal、fixture、スクリーンショット、評価証跡、再読込後も残るDOMへ保存しない。
- 一時的なOAuth認可URLとloopback callback URLは漏えいゼロ検査から除外するが、URL自体を画面・ログ・スクリーンショット・評価証跡へ記録しない。
- OAuth成功時、3つの値を現在のprivate repoのRepository Secretへ直接登録する。通常導線で利用者に値をコピー＆ペーストさせない。
- `Internal` 不可、API無効、同意拒否、state不一致、callback不一致、管理者ブロック、Secret登録失敗を区別し、失敗時の副作用と次の行動を示す。

### C. 通常スペース選択

- 利用者本人が参加するspace一覧を取得し、候補は `spaceType=SPACE` だけにする。`DIRECT_MESSAGE` と `GROUP_CHAT` は候補・設定・履歴0件。初回取得の開始時にも選択済みspace IDのspace typeを再確認する。
- 初期選択は0件。名前を主表示、space IDを補助表示し、検索、複数選択、全解除、戻る、キャンセルを提供する。
- 確定前に対象、保存内容、添付本文を取らないこと、共同編集者が本文を読めることを示す。確定前・拒否・キャンセルは設定、workflow、履歴、commit 0件。

### D. 初回取得・保存

- 選択スペースについて、Google Chat APIと組織の保持設定が返せるメッセージを全page取得する。0件を正常とし、取得できない過去を「存在しない」と扱わない。
- 初回取得はOAuth完了直後の同じwizardセッション内で、メモリ上のtokenだけを使ってローカル実行する。tokenはセッション終了時に破棄し、Repository Secretを読み戻さない。以後の取得はSprint 020のGitHub Actionsが担う。
- 初回取得前の確認画面で、対象・保存内容・共同編集者への可視性に加え、「取得結果をこのリポジトリへ保存します（Gitのcommit・push）」を示し、明示同意後だけ取得・保存・commit・pushする。
- `my-vault` と同じくスペース別・日付別Markdown、発言者、本文、スレッド、Asia/Tokyoの時刻を保存する。添付はファイル名、種類、source、参照先等のメタデータだけとし、本文を取得しない。
- message resource name単位で重複を防ぎ、同日に再取得しても既存投稿を失わない。space単位の部分失敗を全成功と見せない。
- 削除済み本文を復元せず、APIが返す削除メタデータだけを扱う。API応答から消えたことだけで取得済み履歴を削除しない。

### E. 基本検索

- `/google-chat search` はpull後の保存済み履歴を、スペース、発言者、日付、キーワードで検索する。
- found時はスペース、日付、該当箇所を根拠として返す。not found時は保存済み範囲の限界を示し、Sprint 020の手動workflowを先行実装しない。

### F. 共通wizard・Chatwork推奨間隔

- ChatworkとGoogle Chatは同じwizard骨格、step構造、responsive・accessibility基準を使う。全画面に「Chatworkの設定」または「Google Chatの設定」を可視見出しとaccessible nameで明示する。
- primary CTAはChatwork背景 `#F03747`、Google Chat背景 `#11BB62`、両方の前景 `#000000` とし、背景色を変えずcontrast ratio 4.5:1以上を満たす。既存の青色primary CTAを残さない。
- Chatworkは30分／1時間／3時間／6時間／12時間／手動のみ、Google Chatは1時間／3時間／6時間／12時間／手動のみを提示し、両サービスで3時間を「おすすめ・初期値」にする。README、wizard、設定初期値、Actions例、回帰fixtureを一致させる。

### G. 回帰の将来化

- Sprint 017/018の履歴文書・feedback・progressは改変しない。
- 過去Sprintで「Google Chat漏出0件」を検査していた回帰は、当時の更新診断／実更新へGoogle Chat変更が混在しないという本来の境界へ絞る。将来の正式なREADME／skill追加を全体不在として拒否する古いassertを残さない。
- Chatwork、更新、プロジェクト管理、Google公式コネクタ、MIT、単段クレジット、`forkedFrom`、配布チャネル非依存を回帰させない。

## スコープ外

- 定期schedule、設定変更、not foundからのworkflow dispatch、再認証運用、実Google Chat API live gate。これらはSprint 020。
- ShigApps共通External OAuth app、OAuth公開審査、サービスアカウント、JSON鍵、Domain-Wide Delegation。
- DM、グループDM、全スペース自動選択、投稿・編集・削除、reaction操作、添付本文ダウンロード。
- public配布repoへのSecret、workflow、space設定、同期状態、履歴の配置。

## 受入基準

1. **README高度設定（C1/C4/C9/C11）**: 管理者要件、組織所有Cloud project、`Internal`、Desktop app、必要API、read-only scope、公式リンクが順序どおりで、一般の非エンジニアが管理者へ依頼できる。
2. **段階ロード（C2/C3/C6）**: `/google-chat` と自然文から専用導線へ入り、既存ルーターの全機能一括ロードを起こさない。
3. **OAuth最小権限（C2/C5/C11）**: 許可されたread-only scopeだけを要求し、write／admin／未使用membership scopeが0件。`Internal`／Desktop app以外へ自動fallbackしない。
4. **OAuth秘密非露出（C5/C11）**: synthetic厳格secretがtracked files、Git差分・履歴、ログ、journal、fixture、スクリーンショット、評価証跡、再読込後も残るDOM、エラーに0件。synthetic client IDは一時的なOAuth認可URL／管理者チェックリスト以外の永続物に0件で、認可URL／callback URL自体を証跡へ残さない。
5. **loopbackと失敗分類（C3/C4/C8/C11）**: PKCE＋stateを使う成功、拒否、state不一致、callback不一致、管理者ブロック、API無効、Secret登録失敗を操作し、認可コード即時交換、外部interfaceへのbind 0件、失敗前後の不正な接続済み状態0件を確認する。
6. **Repository Secret直接登録（C3/C5/C11）**: 現在のprivate repoだけへ3つのSecret名を登録し、通常導線で値のコピー＆ペーストを要求しない。public／remote不明／登録失敗では履歴取得0件。
7. **SPACE限定選択（C3/C5/C11）**: `SPACE`／`DIRECT_MESSAGE`／`GROUP_CHAT`を含むfixtureで候補・選択・設定・履歴のDM／group DMが0件。初期選択0件、未選択space取得0件。設定を直編集しても取得実行時のspace type再検証でDM／group DMを拒否する。
8. **確認とキャンセル（C5/C8/C11）**: OAuth前の戻る、拒否、キャンセル、0spaceではSecret、設定、履歴、commit、pushが0件。OAuth後キャンセルでは作成済みSecretの削除とGoogle OAuth grant／token revokeを案内し、曖昧な接続状態を残さない。初回取得結果の保存・commit・pushは専用確認画面の明示同意後だけ。
9. **初回ローカル全pageと0件（C1/C3/C11）**: 0件、1件、複数page、space部分失敗を同じwizardセッション内で検証し、取得中はtokenがメモリ上だけ、セッション終了後は破棄済みであることを確認する。Repository Secretの読み戻し0件、Sprint 020 workflow dispatch 0件、取得可能範囲の誤説明0件。合成fixtureを実API確認と表現しない。
10. **保存形式と冪等性（C2/C3/C6/C11）**: space別・日付別Markdown、Asia/Tokyo境界、発言者、thread、attachment metadata、削除metadataが構造化され、同一message再取得・同日追加で重複／既存投稿消失0件、添付本文0件。
11. **基本検索（C3/C4）**: foundはspace・日付・該当箇所、not foundは保存済み範囲を示し、Google Chatに存在しないと断定しない。workflow dispatchは0件。
12. **共通wizard・browser・accessibility（C4/C8）**: Chatwork／Google Chatのrunning wizardをdesktop、mobile、200%相当で操作し、共通骨格、全画面のサービス名、keyboard、focus、label、error関連付け、CTA最大2を確認する。computed styleでChatwork `#F03747`／Google Chat `#11BB62`／前景 `#000000`／contrast ratio 4.5:1以上、青色primary CTA 0件を確認し、厳格secretとclient IDのないスクリーンショットを残す。
13. **過去回帰の将来化（C2/C6/C10）**: Sprint 017/018の更新境界は維持しつつ、正式なGoogle Chat README／skillを全体不在として拒否する古いassertが0件。過去の監査文書は未変更。
14. **既存境界と全回帰（C5/C6/C9）**: Chatwork、single private workspace、PJ、更新、build、MIT、単段クレジット、`forkedFrom`、配布チャネル非依存を含む全offline／online回帰が0 FAIL。
15. **3時間推奨の統一（C2/C3/C8）**: Chatwork／Google ChatのREADME、wizard表示、初期値、設定値、Actions例、回帰fixtureで3時間が推奨・初期値として一致し、旧推奨表記と旧青色primary CTAが現行面に0件。

## 評価証跡

- READMEの管理者／利用者フローと公式リンク確認。
- synthetic OAuth各分岐の前後snapshot、bind先、scope allowlist、Secret名だけの存在確認。
- 厳格secretとclient IDの永続物横断0件検査。OAuth認可URL／callback URLは記録せず、検査対象外であることを明示する。
- `SPACE`／DM／group DM候補、選択、キャンセル、初回0件／複数page／部分失敗のデータ検査。
- 日付境界、thread、同日差分、attachment／deletion metadata、重複・消失0件の回帰。
- desktop／mobile／200%相当のrunning wizard操作とスクリーンショット。
- 両サービスの3時間推奨・初期値、サービス名、指定CTA背景・黒前景・contrast ratioのcomputed style検査。
- Sprint 017/018境界、全offline／online回帰のPASS／FAIL集計。

## 参照

- `docs/spec/features.md` F32/F33
- `docs/spec/constraints.md` §2、§12
- `docs/spec/domain.md` Google Chatの取得境界
- `docs/spec/ui.md` Google Chat設定wizard、`/google-chat search`
- `docs/spec/rubric.md` C1〜C11
- `my-vault/app/scripts/sync-gchat.ts`、`my-vault/app/scripts/get-refresh-token.ts`、`my-vault/.github/workflows/sync-gchat.yml`（振る舞いの比較基準。資格情報領域は参照しない）
