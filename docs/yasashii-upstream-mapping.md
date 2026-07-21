# yasashii-secretary upstream mapping

## 関係

- 上流完成品: `agentic-secretary`
- 下流完成品: `yasashii-secretary`
- 上流GitHub repository: `mtaiseeei/agentic-secretary`
- 下流GitHub repository: `mtaiseeei/yasashii-secretary`
- 共通plugin path: `plugins/secretary/`
- 記録済み上流base: `467043802ea030b67d092d86761caffa84675d61`
- 共通基点: `52016cf10c1c5587fbd83ff2faf3888e29282d5e`
- release candidate: `0.8.0`

`agentic-secretary` が技術者向けの上流、`yasashii-secretary` が非エンジニア向けの下流です。
同じGit系譜を共通基点まで保持し、下流は上流の共通安全修正を宣言的overlayで取り込みます。
2つを設定で切り替える構成や、片方のdocs／評価証跡をもう片方へ複製する構成にはしません。

## 所有境界

上流からbyte単位で取り込むのは、共通の安全rule、workspace境界、Chatwork／Google Chat wizard、
OAuth scope、同期、更新保護、host非依存の会話validator等です。

yasashii固有の差分は、会話、診断、報告、developer handoff、配布識別metadata、
`yasashii-harness` への開発導線、設定確認の読みやすい表示に限定します。
README、LICENSE、`docs/spec/`、Sprint、progress、feedback、evidence、公開計画は下流repo自身が所有し、同期しません。

詳細な分類は次を正本とします。

- [`../secretary-overlay/upstream-base.json`](../secretary-overlay/upstream-base.json)
- [`../secretary-overlay/mapping.json`](../secretary-overlay/mapping.json)
- [`../secretary-overlay/downstream-owned.json`](../secretary-overlay/downstream-owned.json)
- [`../secretary-overlay/downstream-files.json`](../secretary-overlay/downstream-files.json)
- [`../secretary-overlay/metadata-overrides.json`](../secretary-overlay/metadata-overrides.json)
- [`../secretary-overlay/anchors.json`](../secretary-overlay/anchors.json)

## fetch専用remote契約

将来のlocal `upstream` remoteはfetch URLを `https://github.com/mtaiseeei/agentic-secretary.git` とし、
push URLを無効にします。`origin` は引き続き `https://github.com/mtaiseeei/yasashii-secretary.git` です。
上流へのpushは許可対象にしません。

Sprint 034のGeneratorではremote追加・変更、fetch、push URL変更、GitHub参照、pushが未承認のため、
実remote設定は変更していません。localの読み取り専用candidate treeだけでoverlayを検証し、
remote実証は `external-live-gate-unavailable` として引き渡します。

## LICENSEとクレジット

両editionともMITを維持します。クレジットはShin-sibainu/cc-companyへの単段表記であり、
`agentic-secretary` を追加の中間クレジットにはしません。`forkedFrom` も同じ単段表記を維持します。
