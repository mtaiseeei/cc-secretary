# yasashii-secretary downstream overlay

`agentic-secretary` の記録済みbaseを、`yasashii-secretary` の狭いedition差分へ変換する宣言です。

- `upstream-base.json`: fetch専用上流、base commit、共通基点、remote契約。
- `upstream-tree.json`: base treeのfile一覧・SHA-256・分類。未分類の追加／削除を止める。
- `mapping.json`: common、metadata、anchor、upstream-onlyの境界。
- `metadata-overrides.json`: JSON field単位のallowlist。
- `anchors.json`: Markdownのedition差分。anchorが無い・複数ある場合は停止する。
- `downstream-owned.json`: README、LICENSE、spec、Sprint、progress、feedback、evidence等のrepo正本。
- `downstream-files.json`: overlay自体が追加するfileの一覧。

通常確認は、上流候補を取得済みの読み取り専用directoryとして渡します。remote操作は行いません。

```text
node scripts/sync-secretary-overlay.mjs --check --candidate /path/to/agentic-secretary
node scripts/sync-secretary-overlay.mjs --apply --candidate /path/to/agentic-secretary
node scripts/sync-secretary-overlay.mjs --reapply --candidate /path/to/agentic-secretary
```

記録済みbaseを更新する `--record` は、上流前進を確認し新しいSprint契約とexternal gateが揃った場合だけ使います。
通常の `--check`／`--apply` はremote追加・変更、fetch、push URL変更、GitHub参照、pushを行いません。
