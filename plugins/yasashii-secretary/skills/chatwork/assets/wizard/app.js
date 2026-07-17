import { installWizardShell } from "/common.js";

const { app } = installWizardShell("chatwork");
const state = {
  step: 0,
  rooms: [],
  selected: new Set(),
  originalSelected: new Set(),
  interval: "3h",
  consent: false,
  query: "",
  repository: null,
};
const frequencies = [
  ["30m", "30分ごと", 1440], ["1h", "1時間ごと", 720], ["3h", "3時間ごと（おすすめ・初期値）", 240],
  ["6h", "6時間ごと", 120], ["12h", "12時間ごと", 60], ["manual", "手動のみ", 0],
];
const officialLinks = {
  token: "https://www.chatwork.com/service/packages/chatwork/subpackages/api/token.php",
  tokenHelp: "https://help.chatwork.com/hc/ja/articles/115000172402-API%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%82%92%E7%99%BA%E8%A1%8C%E3%81%99%E3%82%8B",
  application: "https://help.chatwork.com/hc/ja/articles/115000169501-API%E3%81%AE%E5%88%A9%E7%94%A8%E7%94%B3%E8%AB%8B%E3%82%92%E6%89%BF%E8%AA%8D-%E5%8D%B4%E4%B8%8B%E3%81%99%E3%82%8B",
  tokenHandling: "https://developer.chatwork.com/docs/endpoints",
  billing: "https://docs.github.com/en/billing/concepts/product-billing/github-actions",
};

function escape(value) {
  return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
}

function externalLink(url, label, className = "text-link") {
  return `<a class="${className}" href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(label)}（新しいタブで開く）">${escape(label)}</a>`;
}

function progress(step) {
  document.querySelectorAll("[data-progress]").forEach((item) => {
    if (Number(item.dataset.progress) === step) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
}

function actions(primary, secondary = "戻る") {
  return `<div class="actions"><button class="button button-secondary" data-action="back">${secondary}</button><button class="button button-primary" data-action="next">${primary}</button></div>`;
}

function renderToken() {
  state.step = 0; progress(0);
  app.innerHTML = `<p class="eyebrow">接続 1 / 4</p><h1>ChatworkでAPI Tokenを取得します。</h1>
    <p class="lead">API Tokenは有効期限がなく、Chatwork機能へフルアクセスできる資格情報です。第三者には見せず、この画面や会話にも貼り付けないでください。</p>
    <div class="panel"><p class="panel-title">公式ページを新しいタブで確認してください。</p>
      <p class="link-list">${externalLink(officialLinks.token, "ChatworkでAPI Tokenを取得する")}<br>${externalLink(officialLinks.tokenHelp, "API Tokenの発行方法を見る")}</p>
      <details><summary>API Tokenの安全な取扱いを見る</summary><p>Token値は次の段階でGitHub上の安全な保管場所へ登録します。wizard、会話、リポジトリには保存しません。${externalLink(officialLinks.tokenHandling, "Chatwork公式のAPI Token取扱いを見る")}</p></details>
    </div>${actions("API Tokenを取得できました", "Tokenページを使えない")}`;
  app.querySelector('[data-action="next"]').onclick = renderSecret;
  app.querySelector('[data-action="back"]').onclick = renderApplication;
}

function renderApplication() {
  state.step = 0; progress(0);
  app.innerHTML = `<p class="eyebrow">接続 1 / 4</p><h1>組織管理者へAPI利用を申請してください。</h1>
    <p class="lead">パーソナルプランを除き、組織管理者の承認が必要です。実際にAPIを使うアカウントで申請し、承認後にこの設定へ戻ってください。承認前はルーム一覧を取得しません。</p>
    <div class="panel"><p class="panel-title">管理者は申請を承認または却下します。</p><p>${externalLink(officialLinks.application, "組織契約のAPI利用申請を見る")}</p><p class="hint">ここまでの設定内容は保持しています。</p></div>
    ${actions("承認後にAPI Token取得へ戻る", "申請をあとで行う")}`;
  app.querySelector('[data-action="next"]').onclick = renderToken;
  app.querySelector('[data-action="back"]').onclick = renderCancelled;
}

function renderSecret() {
  state.step = 0; progress(0);
  const available = Boolean(state.repository?.secretUrl);
  app.innerHTML = `<p class="eyebrow">接続 2 / 4</p><h1>GitHub上の安全な保管場所へ登録します。</h1>
    <p class="lead">現在の非公開のGitHubリポジトリにある、安全な保管場所（Repository Secret）を開きます。Token値はこの画面へ入力しません。</p>
    <div class="panel"><p class="panel-title">登録名</p><p><code>CHATWORK_API_TOKEN</code></p><p class="hint">値の欄にはChatworkで取得したAPI Tokenを、GitHubの画面上で入力します。</p></div>
    ${available ? '<div class="actions"><button class="button button-secondary" data-action="back">戻る</button><a id="secret-link" class="button button-primary" href="#" target="_blank" rel="noopener noreferrer" aria-label="GitHub上の安全な保管場所を開く（新しいタブで開く）">GitHub上の安全な保管場所を開く</a></div>' : '<p class="error" role="alert">現在のGitHubリポジトリを確認できません。originがGitHub.comのリポジトリを指しているか確認してください。</p><div class="actions"><button class="button button-secondary" data-action="back">戻る</button></div>'}`;
  app.querySelector('[data-action="back"]').onclick = renderToken;
  if (available) {
    const link = app.querySelector("#secret-link");
    link.href = state.repository.secretUrl;
    link.addEventListener("click", () => window.setTimeout(renderSecretConfirmation, 100));
  }
}

function renderSecretConfirmation() {
  state.step = 0; progress(0);
  app.innerHTML = `<p class="eyebrow">接続 3 / 4</p><h1>Secretの登録を確認します。</h1>
    <p class="lead">GitHubの画面で、名前を <code>CHATWORK_API_TOKEN</code> として保存できたことを確認してください。Token値は読み戻しません。</p>
    <label class="consent"><input id="secret-confirmed" type="checkbox"><span><code>CHATWORK_API_TOKEN</code> として登録しました</span></label>
    ${actions("ルーム一覧の取得へ進む")}`;
  const checkbox = app.querySelector("#secret-confirmed");
  const next = app.querySelector('[data-action="next"]');
  next.disabled = true;
  checkbox.onchange = () => { next.disabled = !checkbox.checked; };
  next.onclick = renderDiscovery;
  app.querySelector('[data-action="back"]').onclick = renderSecret;
}

function renderDiscovery() {
  state.step = 0; progress(0);
  app.innerHTML = `<p class="eyebrow">接続 4 / 4</p><h1>参加中のルーム一覧を取得します。</h1>
    <p class="lead">自動取得処理（GitHub Actions）、つまり決めた間隔で自動取得を動かすGitHubの仕組みを使います。登録確認後のこの操作で初めてルーム一覧を取得します。</p>
    ${actions("ルーム一覧を取得する")}`;
  app.querySelector('[data-action="back"]').onclick = renderSecretConfirmation;
  app.querySelector('[data-action="next"]').onclick = discoverRooms;
}

async function discoverRooms() {
  const button = app.querySelector('[data-action="next"]');
  button.disabled = true;
  button.textContent = "ルーム一覧を取得中…";
  try {
    const response = await fetch("/api/discover", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "ルーム一覧を取得できませんでした。");
    state.rooms = result.rooms.rooms || [];
    if (state.rooms.length === 0) {
      app.innerHTML = '<p class="eyebrow">接続 4 / 4</p><h1>参加中のルームは0件でした。</h1><p class="lead">これは正常な取得結果です。Chatworkで参加ルームを確認した後、もう一度取得してください。</p><div class="actions"><button class="button button-secondary" data-action="back">接続手順へ戻る</button><button class="button button-primary" data-action="retry">もう一度取得する</button></div>';
      app.querySelector('[data-action="back"]').onclick = renderToken;
      app.querySelector('[data-action="retry"]').onclick = renderDiscovery;
      return;
    }
    renderRooms();
  } catch (error) {
    button.disabled = false;
    button.textContent = "もう一度取得する";
    app.insertAdjacentHTML("beforeend", `<p class="error" role="alert">${escape(error.message)}</p>`);
  }
}

function renderRooms() {
  state.step = 1; progress(1);
  const shown = state.rooms.filter((room) => room.name.toLocaleLowerCase("ja").includes(state.query.toLocaleLowerCase("ja")) || room.roomId.includes(state.query));
  app.innerHTML = `<p class="eyebrow">STEP 1 / 4</p><h1>保存するルームを選びます。</h1><p class="lead">チェックしたルームだけを自動取得処理（GitHub Actions）が読みます。初期状態では1件も選びません。</p>
    <div class="panel"><label class="search-label" for="room-search">ルームを検索</label><input class="search" id="room-search" type="search" value="${escape(state.query)}" placeholder="ルーム名またはルームID">
    <ul class="room-list">${shown.map((room) => `<li><label class="choice"><input type="checkbox" value="${escape(room.roomId)}" ${state.selected.has(room.roomId) ? "checked" : ""}><span class="choice-copy"><span class="choice-title">${escape(room.name)}</span><span class="choice-meta">ルームID（ルームを識別する番号） ${escape(room.roomId)}</span></span></label></li>`).join("")}</ul>
    <p class="hint">選択中: ${state.selected.size}ルーム</p></div>${actions("自動取得の間隔を選ぶ", "キャンセル")}`;
  app.querySelector("#room-search").addEventListener("input", (event) => { state.query = event.target.value; renderRooms(); app.querySelector("#room-search").focus(); });
  app.querySelectorAll('input[type="checkbox"]').forEach((input) => input.addEventListener("change", () => { input.checked ? state.selected.add(input.value) : state.selected.delete(input.value); renderRooms(); }));
  app.querySelector('[data-action="next"]').disabled = state.selected.size === 0;
  app.querySelector('[data-action="next"]').onclick = renderFrequency;
  app.querySelector('[data-action="back"]').onclick = renderCancelled;
}

function renderFrequency() {
  state.step = 2; progress(2);
  app.innerHTML = `<p class="eyebrow">STEP 2 / 4</p><h1>自動取得の間隔を選びます。</h1><p class="lead">3時間ごとがおすすめ・初期値です。負担と新しさのバランスを取りやすい間隔です。表示する実行回数は30日換算の概算です。</p>
    <div class="panel"><ul class="frequency-list">${frequencies.map(([value, label, runs]) => `<li><label class="choice"><input type="radio" name="interval" value="${value}" ${state.interval === value ? "checked" : ""}><span class="choice-copy"><span class="choice-title">${label}</span><span class="choice-meta">約${runs.toLocaleString("ja-JP")}回 / 30日</span></span></label></li>`).join("")}</ul>
    <details><summary>料金と実行時間について</summary><p>実行回数とGitHub Actionsの処理時間は別です。GitHub Freeの非公開リポジトリでは、2026年7月時点で月2,000分の処理時間が含まれます。2,000回の実行枠ではありません。実使用量はプラン、runner、1回あたりの処理時間で変わり、料金や利用枠も変更される可能性があります。</p><p>${externalLink(officialLinks.billing, "GitHub Actionsの料金と利用枠を見る")}</p></details>
    <p class="hint">この画面ではまだ自動実行を有効にしません。</p></div>${actions("内容を確認する")}`;
  app.querySelectorAll('input[name="interval"]').forEach((input) => input.addEventListener("change", () => { state.interval = input.value; }));
  app.querySelector('[data-action="next"]').onclick = renderReview;
  app.querySelector('[data-action="back"]').onclick = renderRooms;
}

function renderReview() {
  state.step = 3; progress(3);
  const selectedRooms = state.rooms.filter((room) => state.selected.has(room.roomId));
  const frequency = frequencies.find(([value]) => value === state.interval);
  const removed = state.rooms.filter((room) => state.originalSelected.has(room.roomId) && !state.selected.has(room.roomId));
  const automatic = state.interval !== "manual";
  app.innerHTML = `<p class="eyebrow">STEP 3 / 4</p><h1>保存内容を確認してください。</h1><p class="lead">確定するまでリポジトリや履歴は変更しません。確定後、設定と自動取得処理（GitHub Actions）を同じcommitへ反映します。</p>
    <dl class="summary"><div class="summary-row"><dt>対象ルーム</dt><dd>${selectedRooms.map((room) => escape(room.name)).join("、")}</dd></div><div class="summary-row"><dt>自動取得の間隔</dt><dd>${frequency[1]}（約${frequency[2].toLocaleString("ja-JP")}回 / 30日）</dd></div><div class="summary-row"><dt>保存先</dt><dd>秘書・通常プロジェクトと同じ非公開のGitHubリポジトリ</dd></div></dl>
    <p class="notice">共同編集者は保存された本文を読めます。各ルームの最新100件以内を取得し、導入前や100件より前の履歴は含まれないことがあります。${removed.length ? `${removed.map((room) => escape(room.name)).join("、")} は今後の取得だけを止め、保存済み履歴は削除しません。` : ""}</p>
    ${automatic ? '<label class="consent"><input id="automatic-consent" type="checkbox"><span>取得結果をこのリポジトリへ自動保存します（Gitのcommit・push）。選択ルームを、選んだ間隔で自動取得することに同意します。</span></label>' : '<p class="notice">手動のみでは自動実行を作らず、検索時も確認後だけ最新メッセージを取り込みます（同期）。</p>'}
    ${actions("設定を確定する")}`;
  const confirmButton = app.querySelector('[data-action="next"]');
  if (automatic) {
    const checkbox = app.querySelector("#automatic-consent");
    checkbox.checked = state.consent;
    confirmButton.disabled = !state.consent;
    checkbox.onchange = () => { state.consent = checkbox.checked; confirmButton.disabled = !state.consent; };
  } else {
    state.consent = false;
  }
  confirmButton.onclick = confirm;
  app.querySelector('[data-action="back"]').onclick = renderFrequency;
}

async function confirm() {
  const button = app.querySelector('[data-action="next"]');
  button.disabled = true; button.textContent = "設定を反映中…";
  const response = await fetch("/api/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ selectedRoomIds: [...state.selected], interval: state.interval, automaticPushConsent: state.consent }) });
  const result = await response.json();
  if (!response.ok) { button.disabled = false; button.textContent = "設定を確定する"; app.insertAdjacentHTML("beforeend", `<p class="error" role="alert">${escape(result.error)}</p>`); return; }
  renderResult();
}

async function renderResult() {
  state.step = 4; progress(4);
  const response = await fetch("/api/status");
  const result = await response.json();
  const configurationChange = result.dispatch.operation === "configuration-change";
  if (configurationChange) {
    const config = result.dispatch.config || {};
    const selected = new Set((config.selectedRoomIds || []).map(String));
    const selectedRooms = state.rooms.filter((room) => selected.has(room.roomId));
    const frequency = frequencies.find(([value]) => value === config.interval) || frequencies[2];
    const automaticExecution = config.scheduleEnabled === true;
    const done = ["success", "failed", "fixture"].includes(result.dispatch.status);
    const heading = result.dispatch.status === "failed" ? "設定は変更しましたが、最新メッセージの取り込みを完了できませんでした。" : done ? "設定変更が完了しました。" : "設定変更を進めています。";
    app.innerHTML = `<p class="eyebrow">STEP 4 / 4</p><h1>${heading}</h1><p class="lead">${escape(result.dispatch.message || "設定の反映状態を確認しています。")}</p>
      <dl class="summary"><div class="summary-row"><dt>現在の対象ルーム</dt><dd>${selectedRooms.map((room) => escape(room.name)).join("、")}</dd></div><div class="summary-row"><dt>現在の自動取得の間隔</dt><dd>${frequency[1]}</dd></div><div class="summary-row"><dt>自動実行</dt><dd>${automaticExecution ? "有効（自動取得・commit・push）" : "無効（手動のみ）"}</dd></div></dl>
      <p class="notice">ルームを解除しても、保存済み履歴は削除していません。</p><div class="actions"><button class="button button-secondary" data-action="close">設定を終了</button></div>`;
    app.querySelector('[data-action="close"]').onclick = renderComplete;
    if (!done) window.setTimeout(renderResult, 2000);
    return;
  }
  const sync = result.sync;
  const done = ["success", "failed", "fixture"].includes(result.dispatch.status);
  const results = ["success", "fixture"].includes(result.dispatch.status) ? (sync?.results || []) : [];
  const zero = sync?.status === "success" && results.reduce((sum, item) => sum + item.fetched, 0) === 0;
  app.innerHTML = `<p class="eyebrow">STEP 4 / 4</p><h1>${done ? "初回設定の結果です。" : "初回取得を進めています。"}</h1><p class="lead">${escape(result.dispatch.message || "自動取得処理（GitHub Actions）の状態を確認しています。")}</p>
    ${results.length ? `<ul class="result-list">${results.map((item) => `<li><strong>${escape(item.roomName)}</strong> — ${item.status === "success" ? `成功・${item.fetched}件` : `失敗・${escape(item.message || "再実行してください")}`}</li>`).join("")}</ul>` : ""}
    ${zero ? '<p class="empty">0件でも設定は成功です。今後の最新メッセージの取り込み（同期）から履歴が蓄積されます。</p>' : ""}
    <div class="actions"><button class="button button-secondary" data-action="close">設定を終了</button></div>`;
  app.querySelector('[data-action="close"]').onclick = renderComplete;
  if (!done) window.setTimeout(renderResult, 2000);
}

function renderComplete() {
  app.innerHTML = '<p class="eyebrow">完了</p><h1>設定画面を閉じて大丈夫です。</h1><p class="lead">次は /chatwork から保存済み履歴を検索できます。</p>';
}

function renderCancelled() {
  progress(0);
  app.innerHTML = '<p class="eyebrow">キャンセル</p><h1>変更せずに終了しました。</h1><p class="lead">ルーム設定、自動取得処理（GitHub Actions）、履歴は変更していません。</p><div class="actions"><button class="button button-secondary" data-action="restart">設定に戻る</button></div>';
  app.querySelector('[data-action="restart"]').onclick = renderToken;
}

fetch("/api/bootstrap").then((response) => response.json()).then(({ rooms, config, repository }) => {
  state.rooms = rooms.rooms || [];
  state.selected = new Set((config.selectedRoomIds || []).map(String));
  state.originalSelected = new Set((config.selectedRoomIds || []).map(String));
  state.interval = config.interval || "3h";
  state.consent = config.automaticPushConsent === true;
  state.repository = repository;
  if (state.selected.size > 0 && rooms.status === "ready") renderRooms();
  else renderToken();
}).catch(() => {
  app.innerHTML = '<p class="eyebrow">接続エラー</p><h1>設定を読み込めませんでした。</h1><p class="lead error" role="alert">wizardを再起動し、GitHubリポジトリのrootを確認してください。</p>';
});
