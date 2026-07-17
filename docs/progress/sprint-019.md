# Sprint 019 — G9 Google Chat高度接続・初回取得

**ステータス:** 実装完了 - Evaluatorの独立評価待ち

## 着手時の契約

- ChatworkとGoogle Chatで同じwizard assetを共有し、全画面のサービス名、指定CTA色、3時間推奨・初期値を一貫させる。
- Desktop OAuthのPKCE＋state、loopback限定、read-only scope allowlist、厳格secret非保存を合成fixtureで検証する。
- 選択した通常スペースだけを初回ローカル全page取得し、Asia/Tokyoの日付別Markdownへ冪等保存して検索できるようにする。
- README、Skill、公開guide、回帰を更新し、Sprint 020の定期workflow／dispatchは先行実装しない。

## 実装内容

- **Google Chat専用Skillとルーティング**: `/google-chat` と自然文から必要時だけ専用Skillを読み込む。接続、通常スペース選択、初回取得、保存済み履歴検索を既存の秘書フローへ追加した。
- **組織所有のGoogle Cloud設定案内**: READMEへ「Google Chatをつなぐ（少し高度な設定）」を追加した。組織所有Cloud project、OAuth Audience `Internal`、Desktop app client、Google Chat API、Google People API、Restricted scope、管理者ブロック、People APIの表示名限界を画面順に案内する。
- **Desktop OAuth**: PKCE S256とstateを使い、`127.0.0.1`のloopback callbackで認可コードを即時交換する。要求scopeは `chat.spaces.readonly`、`chat.messages.readonly`、`contacts.readonly` の3つだけで、Web client、write、admin、membership scopeへfallbackしない。
- **資格情報の扱い**: OAuth client JSONはローカルで読み、client secret、認可コード、access token、refresh tokenを画面・ログ・tracked file・証跡へ残さない。成功後は現在のprivate repoへ3つのRepository Secret名だけを直接登録し、値のコピー＆ペーストを通常導線に出さない。登録途中の失敗では作成済みSecretを戻す。
- **失敗とキャンセル**: 同意拒否、state不一致、callback不一致、管理者ブロック、API無効、Secret登録失敗を区別する。OAuth後キャンセルでは作成済みSecretの削除とgrant revokeを行い、曖昧な接続済み状態を残さない。
- **通常スペース限定**: `spaceType=SPACE` だけを候補にし、初期選択は0件。DMとグループDMは候補・設定・履歴に出さず、取得実行時にもspace typeを再確認する。
- **初回ローカル取得**: OAuth直後の同じwizardセッションにあるメモリ上のtokenだけを使い、選択スペースを全page取得する。初回取得後はtokenを破棄し、Repository Secretの読み戻しとworkflow dispatchは行わない。
- **保存と検索**: スペース別・Asia/Tokyoの日付別Markdownへ、発言者、本文、thread、添付メタデータ、削除メタデータを保存する。message resource nameで重複を防ぎ、同日再取得でも既存投稿を失わない。検索結果0件では「保存済み範囲にない」と説明し、Google Chat上に存在しないとは断定しない。
- **共有wizard**: Chatworkのindex、CSS、共通shellをGoogle Chatでも使う。全画面に「Chatworkの設定」または「Google Chatの設定」を可視表示し、accessible nameにも設定した。primary CTAはChatwork `#F03747`、Google Chat `#11BB62`、前景は両方 `#000000` とし、旧青色を除いた。
- **3時間推奨・初期値**: ChatworkとGoogle ChatのREADME、wizard、設定初期値、Actions例、fixture、回帰を3時間へ統一した。Chatworkの既存6候補は維持する。
- **更新経路の継続性**: 配布版を `0.5.0` に揃え、`0.4.0→0.5.0` の無変更migration境界を追加した。複数versionをまたぐ更新はmigration manifestを順に解決し、既存workspaceを自動変更せずに0.5.0へ進める。
- **回帰の将来化**: Sprint 016〜018の古い「Google Chat全体が存在しない」前提を、当時守るべき更新経路との混在禁止へ絞った。過去のfeedback、完了済みprogress、評価証跡は変更していない。

## 自己評価

| 基準 | スコア | 根拠 |
|---|---:|---|
| C1 完成度 | 5/5 | README、OAuth、SPACE選択、初回取得、保存、検索、共通wizardまでSprint契約を一続きにした |
| C2 構文・整合 | 5/5 | manifest 3面、Skill参照、共有asset、3時間設定、migration経路、全Node構文を検査した |
| C3 機能の実証 | 5/5 | OAuth分岐、全page、0件、部分失敗、冪等保存、検索、running wizardを合成fixtureで実行した |
| C4 非エンジニア体験 | 5/5 | 管理者が行う手順と利用者が行う手順、現在のサービス名、次の1手、失敗後の行動を先に示した |
| C5 安全・規律 | 5/5 | read-only 3 scope、loopback限定、DM 0件、同意前0変更、strict secret非露出を確認した |
| C6 無回帰 | 5/5 | 全offline回帰310件、全online回帰311件が0 FAIL |
| C7 やさしさ | 5/5 | OAuthやRestricted scopeの正式名称を保ちつつ、必要な理由と管理者への依頼内容を短く補足した |
| C8 wizard体験 | 5/5 | desktop、mobile、200%相当でサービス名、色、44px target、overflowなし、CTA最大2、labelを確認した |
| C9 配布チャネル非依存 | 5/5 | MIT、単段クレジット、`forkedFrom`、single private workspace、既存配布境界を維持した |
| C10 負テスト | 5/5 | 拒否、state/callback不一致、API無効、管理者ブロック、Secret失敗、DM改ざん、部分失敗を拒否した |
| C11 秘密非露出 | 5/5 | synthetic secretとclient IDをtracked file、Git差分、fixture、browser DOM、スクリーンショット、証跡へ残していない |

## 検証結果

- Sprint 019専用挙動: `node scripts/sprint-019-google-chat-test.mjs` → `SPRINT019_PASS=37 SPRINT019_FAIL=0`
- Sprint 019専用回帰: `bash scripts/sprint-019-regression.sh` → `SPRINT019_WRAPPER_PASS=11 SPRINT019_WRAPPER_FAIL=0`
- Chatwork初回設定回帰: `bash scripts/sprint-013-regression.sh` → `PASS=33 FAIL=0`（内包挙動35件も0 FAIL）
- Chatwork定期同期回帰: `bash scripts/sprint-014-regression.sh` → `PASS=41 FAIL=0`（内包挙動59件も0 FAIL）
- 安全な更新回帰: `bash scripts/sprint-018-regression.sh` → `SPRINT018_PASS=41 SPRINT018_FAIL=0`
- 全offline回帰: `bash scripts/regression-check.sh --offline` → `PASS=310 FAIL=0`（loopback許可環境）
- 全online回帰: `bash scripts/regression-check.sh --online` → `PASS=311 FAIL=0`（loopback・通信許可環境）
- running wizard: Chrome DevTools Protocolでdesktop 1440px、mobile 390px、200%相当を操作し、browser error 0件を確認した。
- computed style: Google Chat `rgb(17, 187, 98)`、Chatwork `rgb(240, 55, 71)`、前景は両方 `rgb(0, 0, 0)`、旧青色0件。
- mobile: 横overflowなし、CTA縦積み、操作対象44px以上、input labelあり。200%相当でも横overflowなし、button 44px以上。
- `git diff --check`、JSON、Node構文、strict secret横断検査 → PASS。

## browser証跡

- `docs/evidence/sprint-019/browser-evidence.json`: computed style、初期選択、3時間既定、同意前disabled、responsive、browser errorの構造化結果。
- `docs/evidence/sprint-019/google-chat-desktop-spaces.png`: Google Chat desktopのSPACE選択画面。
- `docs/evidence/sprint-019/google-chat-mobile.png`: 390px相当のGoogle Chat画面。
- `docs/evidence/sprint-019/google-chat-zoom200.png`: 200%相当のGoogle Chat画面。
- `docs/evidence/sprint-019/chatwork-desktop-3h.png`: Chatworkの3時間推奨・初期値画面。
- `docs/evidence/sprint-019/google-chat-desktop-inapp.jpg`: Codex App内Browserで確認したdesktop画面。

証跡にはOAuth認可URL、callback URL、client ID、client secret、認可コード、tokenを含めていない。

## 既知の課題・live gate

- Generatorは実Google Cloud project、実OAuth同意、実Google Chat API、実Repository Secret、実remote pushを使っていない。これらは権限と非機密test spaceが必要なlive gateで、Sprint 020の契約に従ってEvaluatorまたは利用者が確認する。
- `contacts.readonly` は連絡先にない同僚の表示名を必ず返すものではない。取得できない場合はGoogle Chat resource name等の安定した代替表示を使う。
- Sprint 019は初回ローカル取得までである。定期schedule、設定変更、not foundからのworkflow dispatch、再認証運用はSprint 020で扱う。
- APIと組織の保持設定が返さない過去は取得できない。検索0件は保存済み範囲の結果であり、不在断定ではない。

## Evaluatorへの引き渡し

- 専用回帰: `bash scripts/sprint-019-regression.sh`
- 全回帰: `bash scripts/regression-check.sh --offline` と `bash scripts/regression-check.sh --online`
- Google Chat synthetic wizard起動例:
  `YASASHII_GOOGLE_CHAT_SYNTHETIC=1 YASASHII_GOOGLE_CHAT_TEST_PRIVATE=1 YASASHII_GOOGLE_CHAT_SKIP_GIT=1 YASASHII_GOOGLE_CHAT_FIXTURE=scripts/fixtures/google-chat-wizard/google-chat.json node plugins/yasashii-secretary/skills/google-chat/scripts/wizard-server.mjs --root <private-fixture-root> --port 8766`
- Chatwork synthetic wizard起動例:
  `NODE_ENV=test YASASHII_CHATWORK_TEST_PRIVATE=1 YASASHII_CHATWORK_SKIP_GIT=1 YASASHII_CHATWORK_TEST_SECRET=1 node plugins/yasashii-secretary/skills/chatwork/scripts/wizard-server.mjs --root scripts/fixtures/chatwork-wizard --port 8765`
- browser再検査: 両wizardとCDP有効Chromeを起動後、`node scripts/sprint-019-browser-check.mjs --cdp http://127.0.0.1:9225 --google-url http://127.0.0.1:8766/ --chatwork-url http://127.0.0.1:8765/ --evidence docs/evidence/sprint-019`

### 確認シナリオ

1. READMEだけで管理者依頼、Cloud project、Internal、Desktop app、API有効化、Restricted scopeの意味と順序が分かること。
2. OAuth要求がread-only 3 scopeだけで、PKCE S256、state、loopbackを使い、Web clientへfallbackしないこと。
3. 同意拒否、state不一致、callback不一致、管理者ブロック、API無効、Secret登録失敗で、接続済みと表示せず次の操作を示すこと。
4. `SPACE`、`DIRECT_MESSAGE`、`GROUP_CHAT`を含むfixtureで候補はSPACEだけ、初期選択0件、DM／group DMの設定・履歴0件であること。
5. 0件、複数page、space部分失敗で、全成功と誤表示せず、初回取得後にtokenを破棄しworkflow dispatchしないこと。
6. Asia/Tokyo日界、thread、発言者fallback、添付・削除metadata、同一message再取得の重複0件と既存投稿保持を確認すること。
7. desktop、mobile、200%相当で全画面のサービス名、label、focus、44px target、overflowなし、CTA最大2を確認すること。
8. computed styleでChatwork `#F03747`、Google Chat `#11BB62`、黒前景、旧青色0件、両サービス3時間推奨・初期値を確認すること。
9. synthetic secret、client ID、OAuth URL、callback URLがtracked file、Git差分、ログ、fixture、DOM、スクリーンショット、証跡にないこと。
10. 全回帰でChatwork、更新、PJ、MIT、クレジット、`forkedFrom`、配布チャネル非依存が維持されること。

## Scope change detected

- 配布版 `0.5.0` でもSprint 018の安全な更新を壊さないため、`0.4.0→0.5.0` の無変更migration境界と複数versionのmigration経路解決を追加した。既存workspace本文の自動変更は0件で、Google Chat設定を更新処理へ混在させていない。
- それ以外のSprint 020範囲は実装していない。
