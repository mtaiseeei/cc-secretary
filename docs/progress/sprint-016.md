# Sprint 016 — 配布チャネルに依存しない公開面

## 着手時の契約

- 実装対象は、README、LICENSE、CLAUDE.md、現行公開ガイド、配布プラグインの利用者向け文面、Sprint 016専用回帰。
- 主対象をClaude Codeを使う一般の非エンジニアへ統一し、特定の教育サービスへの参加を前提にしない。
- MIT、Shin-sibainu/cc-companyへの単段クレジット、`forkedFrom`、配布識別子、既存機能を維持する。
- 過去のprogress、feedback、完了済みSprint契約、backup、Git履歴は変更しない。
- 更新機能、バージョン変更、CHANGELOG、workspace migration、新しいチャット連携は実装しない。

## 成功の検証方法

- `git ls-files`を母集団にした決定的な対象一覧と、監査記録等の除外理由を出力する。
- 現行対象への旧固有表現混入で失敗し、除外した監査記録に同じ表現があっても誤失敗しない負テストを実行する。
- MIT、単段クレジット、`forkedFrom`、配布識別子、バージョン不変を正の検査で守る。
- Sprint 016専用回帰、Sprint 015回帰、全offline回帰を0 FAILにする。

## 実装内容

- README前半の対象者見出し、CLAUDE.mdの製品説明、LICENSEの著作権者表記を、Claude Codeを使う一般の非エンジニア向けへ整理した。
- README末尾にあった特定の教育サービスへの接続説明を削除した。インストール、初回起動、機能一覧、Chatwork、開発導線、MITと単段クレジットは維持した。
- `plain-language.md` の「計画→道具→確認→結果」を製品共通の進行表示として維持し、教育サービス由来の説明だけを外した。
- 既存の公開整備回帰を一般利用者向けの正本に合わせ、Sprint 016専用回帰を全offline回帰へ接続した。
- `check-distribution-channel.py` を追加し、`git ls-files --cached --others --exclude-standard`から現行対象を決定的に分類するようにした。
  - 現行対象77件をファイル単位で出力する。
  - 過去のevidence 26件、feedback 20件、progress 20件、完了済みSprint契約20件、開発検査tool 34件を、理由つきの除外規則として出力する。
  - README画像1件はバイナリ対象として明示し、目視確認へ引き渡す。
- 現行対象への旧固有表現混入で失敗するfixtureと、過去の監査記録に同じ表現があっても誤失敗しないfixtureを追加した。
- MIT、Shin-sibainu/cc-companyの単段クレジット、`forkedFrom`、marketplace／plugin識別子、version `0.2.0`を正の検査で保護した。
- 過去のprogress／feedback／evidence／完了済みSprint契約／backupの差分が0件であることを検査した。
- CHANGELOG、update skill、workspace migration、新しいチャット連携の公開面への漏出が0件であることを検査した。

## 自己評価

| 基準 | スコア | 根拠 |
|---|---:|---|
| C1 完成度 | 5/5 | 受入基準の公開文面、配布rule、対象一覧、除外理由、正負fixtureを実装した |
| C2 構文・整合 | 5/5 | JSON、Python構文、識別子、参照path、version不変を検査した |
| C3 機能の実証 | 5/5 | 専用回帰と既存の実動作回帰を実行した |
| C4 非エンジニア体験 | 5/5 | README前半だけで対象、導入、初回起動、主要機能へ進める |
| C5 安全・規律 | 5/5 | 外部変更、push、資格情報保存、過去監査記録変更が0件 |
| C6 無回帰 | 5/5 | Sprint 015は68/68、全offline回帰は300/300 PASS |
| C7 やさしさ | 5/5 | 進行表示を一般機能として維持し、正式な技術用語と安全説明を削っていない |
| C8 wizard体験 | 5/5 | wizard実装は未変更で、既存browser相当の合成回帰を維持した |
| C9 配布チャネル非依存 | 5/5 | 現行対象77件で旧固有表現0件、維持項目と監査記録例外を機械検査した |

## 技術的な判断

- 単純なリポジトリ全体grepは使わず、現在のユーザー面と監査記録をpath規則で分類した。これにより、履歴を残す方針と現行面0件の両方を検証できる。
- 検査script自身と負fixtureが検査対象語を持つため、文字列は断片から組み立てる。現行対象へ同じ文字列が戻った場合の検出能力はself-testで保証する。
- READMEの進行表示は一般利用者にも現在地を伝える既存機能なので削除せず、由来説明だけを外した。
- 全offline回帰の初回はsandbox内のloopback bind制限でSprint 013／014が各1件失敗した。コード欠陥ではないため、同じコマンドをloopback許可環境で再実行し300/300 PASSを確認した。

## 既知の課題

- なし。README画像は本Sprintで変更しておらず、専用検査がバイナリ対象として表示するため、Evaluatorが表示内容を目視確認する。
- online検査と外部操作は本Sprintの文言整理に不要であり実行していない。

## Evaluatorへの引き渡し事項

- 起動方法: 常設アプリの起動なし。回帰が一時的に `127.0.0.1` のwizardを起動する。
- テスト対象URL: Sprint 013／014回帰が表示する一時URL。Sprint 016固有の常設URLはなし。
- Sprint 016専用回帰: `bash scripts/sprint-016-regression.sh`
- 直前Sprint回帰: `bash scripts/sprint-015-regression.sh`
- 全回帰: `bash scripts/regression-check.sh --offline`（loopback bindを許可した環境で実行）
- 構文確認: `python3 -c "compile(open('scripts/check-distribution-channel.py', encoding='utf-8').read(), 'scripts/check-distribution-channel.py', 'exec')"`
- 確認シナリオ:
  1. READMEの前半から一般利用者向け見出し、3コマンド、`/secretary`、主要機能へ参照切れなく進める。
  2. 専用回帰の対象77件、除外理由5区分、バイナリ対象1件を確認する。
  3. self-testで、現行対象への再混入は失敗し、除外した監査記録は誤失敗しないことを確認する。
  4. READMEとLICENSEのMIT／単段クレジット、marketplaceの`forkedFrom`、version `0.2.0`を確認する。
  5. `git diff --name-only HEAD`で過去のprogress／feedback／evidence／完了済みSprint契約／backupが変更されていないことを確認する。
  6. README画像を表示し、教育サービス固有の文字や秘密情報が写っていないことを確認する。
  7. CHANGELOG、update skill、workspace migration、新しいチャット連携が追加されていないことを確認する。

## Scope change detected

- なし。Sprint 017候補の更新体験には着手していない。
