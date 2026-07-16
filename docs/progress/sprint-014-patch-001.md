# Sprint 014 Patch 001 — Chatwork設定wizardの表示文言とToken導線

## 着手時の契約

- Chatwork設定の接続順を、公式のAPI Token取得／組織申請、現在repoのSecret追加画面、`CHATWORK_API_TOKEN`登録確認、ルーム一覧取得の4段階へ統一する。
- wizardへToken入力欄を作らず、承認・登録確認前にルーム一覧取得を開始しない。
- 6つの自動取得の間隔と30日換算の概算実行回数を表示し、GitHub Actionsの2,000分を処理時間の枠として区別する。
- wizard、`/chatwork`、README、公開guideの用語・順序・公式リンク・確認時点注記を一致させる。
- 同期ロジック、安全gate、17分起点のcron、データ保護は変更しない。

## 検証計画

- `bash scripts/sprint-014-regression.sh`
- `bash scripts/regression-check.sh --offline`
- running wizardでdesktop、mobile、200%相当を操作し、4段階導線、申請分岐、動的Secret URL、ルーム、自動取得の間隔、確認、details、keyboard、横overflowを確認する。
- `skill-creator`の検証と、Node／YAML／JSON構文、Token非漏洩、配布一貫性を確認する。

## 実装結果

- 接続wizardを次の4段階にした。
  1. Chatwork公式ページでAPI Tokenを取得する。Tokenページを使えない場合は、組織管理者へのAPI利用申請へ分岐する。
  2. 現在のGit remoteが指すGitHub.comリポジトリから、Actions Secret追加URLを動的に作る。GitHub.com以外や不正なremoteはURLに使わない。
  3. 利用者が`CHATWORK_API_TOKEN`を登録したことを確認する。Tokenの入力・保存・表示は行わない。
  4. 確認後にだけ自動取得処理（GitHub Actions）を起動し、ルーム一覧を取得する。
- 30分／1時間／3時間／6時間／12時間／手動のみの6択と、30日換算の概算実行回数を表示した。
- GitHub Freeの非公開リポジトリに含まれる月2,000分は「実行回数」ではなく「処理時間」の枠だとdetails内で説明し、公式料金ページへ案内した。
- 確認時の同意文を`取得結果をこのリポジトリへ自動保存します（Gitのcommit・push）`で始め、保存目的を先に示した。
- wizard、`/chatwork`、README、公開guideを同じ用語・順序・公式リンクへ揃えた。
- 既存の同期ロジック、安全gate、17分起点のcron、履歴・取得位置の保護は維持した。

## 技術上の判断

- Secret URLは固定文字列にせず、`git remote get-url origin`の結果をHTTPS／SSH形式として解析し、ownerとrepositoryを許可文字だけで検証してから組み立てた。これにより、別repoで配布しても現在repoの画面へ進める。
- 初回の`POST /api/confirm`は、同じserver processで`POST /api/discover`が成功するまで拒否する。保存済み設定がある設定変更では、従来どおりルーム選択から始める。
- 外部URLはすべて`target="_blank"`、`rel="noopener noreferrer"`、日本語のaccessible name（支援技術へ伝わる名前）を付けた。

## 検証結果

- 専用回帰: `bash scripts/sprint-014-regression.sh` → 内側`PASS=59 FAIL=0`、外側`PASS=41 FAIL=0`。
- 旧Sprint回帰: `bash scripts/sprint-013-regression.sh` → 内側`PASS=35 FAIL=0`、外側`PASS=33 FAIL=0`。
- 全オフライン回帰: `bash scripts/regression-check.sh --offline` → `PASS=298 FAIL=0`。
- running browser回帰: `node scripts/sprint-014-browser-check.mjs --cdp http://127.0.0.1:9224 --url http://127.0.0.1:8765/` → exit 0。desktop 1440×900、mobile 390×844、200% page scale、keyboard focus、横overflowなし、44px以上のbutton、browser error 0を確認した。
- Browser skillで実画面を操作し、4段階接続、組織申請分岐、動的Secret URL、登録前の次へ無効、登録後のルーム取得、6択、料金details、目的先行の同意、keyboard focus-visibleを確認した。desktop／mobileとも横overflowなし、console warn/error 0だった。
- Node構文と`git diff --check`は成功した。JSON／YAMLとToken非漏洩は専用・全回帰内で成功した。
- `skill-creator`の`quick_validate.py`は環境にPyYAMLがなく、`ModuleNotFoundError: No module named 'yaml'`で実行できなかった。代わりに、依存なしのfrontmatter検証と配布参照整合を全回帰で確認した。

## 起動方法

```bash
bash scripts/start-sprint-014-wizard-fixture.sh 8765
```

- URL: `http://127.0.0.1:8765/`
- scriptは一時fixtureを作り、現在repoのGitHub remoteを設定する。終了時は`Ctrl+C`。

## 自己評価

- 機能: 4段階接続、6つの自動取得の間隔、料金details、用語統一、動的Secret URLを要求どおり実装した。
- 安定性: 未登録時のルーム取得をserver側でも止め、Tokenを入力・表示・保存しない。動的URLはGitHub.comだけに限定した。
- 回帰なし: Sprint 013／014専用回帰と全オフライン回帰がすべて成功し、既存の同期・cron・データ保護を維持した。

## 残件・既知の問題

- 実装上の既知問題はない。
- `quick_validate.py`だけは上記の環境依存不足で未実行。frontmatterと参照整合は別の依存なし検査で確認済み。
