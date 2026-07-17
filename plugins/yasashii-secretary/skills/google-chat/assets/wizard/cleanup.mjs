export function cleanupDescription(cleanup, { networkFailure = false } = {}) {
  if (networkFailure || !cleanup) return {
    kind: "manual",
    text: "自動取消の結果を確認できませんでした。GitHubのRepository SecretsとGoogleのアプリ権限を手動で確認してください。",
  };
  if (!cleanup.hadConnection) return { kind: "none", text: "接続前だったため、設定や認証情報は変更していません。" };
  if (!cleanup.manualCheckRequired && cleanup.secretsDeleted && cleanup.grantRevoked) return {
    kind: "success",
    text: "Repository Secretを削除し、Google OAuth grant／tokenを取り消しました。",
  };
  const missing = [];
  if (!cleanup.secretsDeleted) missing.push("GitHubリポジトリの Settings → Secrets and variables → Actions");
  if (!cleanup.grantRevoked) missing.push("Googleのアプリ権限ページ");
  return { kind: "manual", text: `自動取消を完了できませんでした。${missing.join(" と ")}を手動で確認してください。` };
}
