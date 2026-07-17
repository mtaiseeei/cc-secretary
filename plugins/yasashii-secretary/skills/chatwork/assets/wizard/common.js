const SERVICE = Object.freeze({
  chatwork: { name: "Chatwork", accent: "#F03747", context: "Chatworkの設定" },
  "google-chat": { name: "Google Chat", accent: "#11BB62", context: "Google Chatの設定" },
});

export function installWizardShell(service) {
  const detail = SERVICE[service];
  if (!detail) throw new Error("未対応の接続サービスです。");
  const app = document.querySelector("#app");
  document.documentElement.dataset.service = service;
  document.documentElement.style.setProperty("--service-accent", detail.accent);
  document.title = `${detail.context} — yasashii-secretary`;
  app.setAttribute("aria-label", detail.context);
  const stepLabels = service === "google-chat"
    ? ["接続", "1 スペース", "2 自動取得の間隔", "3 確認", "4 結果"]
    : ["接続", "1 ルーム", "2 自動取得の間隔", "3 確認", "4 結果"];
  document.querySelectorAll("[data-progress]").forEach((item, index) => { item.textContent = stepLabels[index]; });

  const ensureContext = () => {
    if (app.firstElementChild?.classList.contains("service-context")) return;
    const label = document.createElement("p");
    label.className = "service-context";
    label.textContent = detail.context;
    app.prepend(label);
  };
  const observer = new MutationObserver(ensureContext);
  observer.observe(app, { childList: true });
  ensureContext();
  return { app, detail, ensureContext };
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;" }[character]));
}

export function externalLink(url, label, className = "text-link") {
  return `<a class="${className}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}（新しいタブで開く）">${escapeHtml(label)}</a>`;
}

export function setProgress(step) {
  document.querySelectorAll("[data-progress]").forEach((item) => {
    if (Number(item.dataset.progress) === step) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
}

export function wizardActions(primary, secondary = "戻る") {
  return `<div class="actions"><button class="button button-secondary" data-action="back">${escapeHtml(secondary)}</button><button class="button button-primary" data-action="next">${escapeHtml(primary)}</button></div>`;
}
