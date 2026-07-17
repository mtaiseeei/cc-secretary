#!/usr/bin/env node

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const cdp = args.get("--cdp") || "http://127.0.0.1:9224";
const targetUrl = args.get("--url") || "http://127.0.0.1:8765/";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = await (await fetch(`${cdp}/json/list`)).json();
const page = pages.find((item) => item.type === "page");
if (!page) throw new Error("browser page target not found");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let nextId = 1;
const pending = new Map();
const errors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const waiter = pending.get(message.id); pending.delete(message.id);
    if (message.error) waiter.reject(new Error(JSON.stringify(message.error))); else waiter.resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text || "exception");
});
function send(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || "evaluation failed");
  return result.result.value;
}
async function waitFor(expression, timeout = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await delay(100);
  }
  throw new Error(`timeout: ${expression}`);
}
async function open(width, height, mobile = false) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
  await send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  const navigationUrl = new URL(targetUrl);
  navigationUrl.searchParams.set("browserCheck", `${Date.now()}-${nextId}`);
  await send("Page.navigate", { url: navigationUrl.href });
  await waitFor(`location.href === ${JSON.stringify(navigationUrl.href)} && document.readyState === "complete" && document.querySelector("#app h1") && !document.querySelector("#app h1").textContent.includes("接続状態を確認")`);
}

await send("Page.enable");
await send("Runtime.enable");
await open(1440, 900);
const onboarding = await evaluate(`({
  heading:document.querySelector('#app h1').textContent,
  links:[...document.querySelectorAll('#app a')].map((link)=>({text:link.textContent,target:link.target,aria:link.getAttribute('aria-label')})),
  ctaCount:document.querySelectorAll('.actions .button').length,
  credentialInputs:document.querySelectorAll('input[type="password"],input[name*="token" i]').length
})`);
await evaluate(`(() => { const nativeFetch=window.fetch.bind(window); window.__discoverCalls=0; window.fetch=(url,options)=>{if(String(url).endsWith('/api/discover'))window.__discoverCalls++;return nativeFetch(url,options)};const button=document.querySelector('[data-action="back"]');if(!button)throw new Error('Token接続UIがありません: '+document.querySelector('#app')?.innerText);button.click();return true; })()`);
await waitFor(`document.querySelector('#app h1')?.textContent.includes('組織管理者')`);
const application = await evaluate(`({text:document.querySelector('#app').innerText,discoverCalls:window.__discoverCalls,links:[...document.querySelectorAll('#app a')].map((link)=>({text:link.textContent,target:link.target,aria:link.getAttribute('aria-label')}))})`);
await evaluate(`document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelector('#app h1')?.textContent.includes('API Tokenを取得')`);
await evaluate(`document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelector('#secret-link') !== null`);
const secret = await evaluate(`({href:document.querySelector('#secret-link').href,target:document.querySelector('#secret-link').target,aria:document.querySelector('#secret-link').getAttribute('aria-label'),credentialInputs:document.querySelectorAll('input[type="password"],input[name*="token" i]').length})`);
await evaluate(`document.querySelector('#secret-link').click();true`);
await waitFor(`document.querySelector('#secret-confirmed') !== null`);
const secretConfirmationBefore = await evaluate(`({disabled:document.querySelector('[data-action="next"]').disabled,discoverCalls:window.__discoverCalls})`);
await evaluate(`document.querySelector('#secret-confirmed').click();document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelector('#app h1')?.textContent.includes('参加中のルーム一覧')`);
const discoveryBefore = await evaluate(`({discoverCalls:window.__discoverCalls,ctaCount:document.querySelectorAll('.actions .button').length})`);
await evaluate(`document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelectorAll('.room-list input').length === 4`);
const initial = await evaluate(`({rooms:document.querySelectorAll('.room-list input').length,selected:document.querySelectorAll('.room-list input:checked').length,nextDisabled:document.querySelector('.button-primary').disabled})`);
await evaluate(`document.querySelector('input[value="101"]').click();document.querySelector('input[value="102"]').click();document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelectorAll('input[name="interval"]').length === 6`);
await evaluate(`document.querySelector('input[name="interval"][value="6h"]').click();document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelector('#automatic-consent') !== null`);
const review = await evaluate(`({
  text:document.querySelector('#app').innerText,
  consentChecked:document.querySelector('#automatic-consent').checked,
  confirmDisabled:document.querySelector('[data-action="next"]').disabled,
  ctaCount:document.querySelectorAll('.actions .button').length
})`);
await evaluate(`document.querySelector('#automatic-consent').click();true`);
const consent = await evaluate(`({checked:document.querySelector('#automatic-consent').checked,confirmDisabled:document.querySelector('[data-action="next"]').disabled})`);
await evaluate(`document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelector('#app h1')?.textContent.includes('初回設定の結果')`);
const initialResult = await evaluate(`({text:document.querySelector('#app').innerText})`);

await open(1440, 900);
const savedInitial = await evaluate(`({selected:document.querySelectorAll('.room-list input:checked').length})`);
await evaluate(`document.querySelector('input[value="102"]').click();document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelectorAll('input[name="interval"]').length === 6`);
await evaluate(`document.querySelector('input[name="interval"][value="manual"]').click();document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelector('#automatic-consent') === null && document.querySelector('[data-action="next"]') !== null`);
await evaluate(`document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelector('#app h1')?.textContent.includes('設定変更が完了')`);
const changedResult = await evaluate(`({text:document.querySelector('#app').innerText})`);

await open(1440, 900);
await evaluate(`document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelectorAll('input[name="interval"]').length === 6`);
await evaluate(`document.querySelector('input[name="interval"][value="1h"]').click();document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelector('#automatic-consent') !== null`);
await evaluate(`document.querySelector('#automatic-consent').click();true`);
await evaluate(`(() => {
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(url,options)=>String(url).endsWith('/api/confirm')
    ? Promise.resolve(new Response(JSON.stringify({error:'GitHubの書込権限を確認できません。リポジトリのActions権限を確認してください。'}),{status:400,headers:{'content-type':'application/json'}}))
    : nativeFetch(url,options);
  document.querySelector('[data-action="next"]').click();
  return true;
})()`);
await waitFor(`document.querySelector('[role="alert"]') !== null`);
const errorState = await evaluate(`({message:document.querySelector('[role="alert"]').textContent,buttonEnabled:!document.querySelector('[data-action="next"]').disabled})`);

await open(390, 844, true);
await waitFor(`document.querySelectorAll('.room-list input').length === 4`);
await evaluate(`document.querySelector('#room-search').focus();true`);
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
const keyboard = await evaluate(`({checkbox:document.activeElement?.matches('.room-list input')===true,focusVisible:document.activeElement?.matches(':focus-visible')===true})`);
const mobile = await evaluate(`({
  columns:getComputedStyle(document.querySelector('.room-list')).gridTemplateColumns,
  actionDirection:getComputedStyle(document.querySelector('.actions')).flexDirection,
  horizontalOverflow:document.documentElement.scrollWidth>innerWidth,
  buttonHeights:[...document.querySelectorAll('button')].map((button)=>button.getBoundingClientRect().height),
  labels:[...document.querySelectorAll('input')].every((input)=>input.closest('label')||document.querySelector('label[for="'+input.id+'"]'))
})`);
await open(720, 450);
await waitFor(`document.querySelectorAll('.room-list input').length === 4`);
await send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
const zoom200 = await evaluate(`({horizontalOverflow:document.documentElement.scrollWidth>innerWidth,visibleButtons:[...document.querySelectorAll('button')].every((button)=>button.getBoundingClientRect().width>0&&button.getBoundingClientRect().height>=44)})`);
const report = { onboarding, application, secret, secretConfirmationBefore, discoveryBefore, initial, review, consent, initialResult, savedInitial, changedResult, errorState, keyboard, mobile, zoom200, browserErrors: errors };
const passed = onboarding.heading.includes("API Tokenを取得") && onboarding.ctaCount === 2 && onboarding.credentialInputs === 0
  && onboarding.links.every((link)=>link.target === "_blank" && link.aria?.includes("新しいタブ"))
  && application.text.includes("承認前はルーム一覧を取得しません") && application.discoverCalls === 0
  && application.links.every((link)=>link.target === "_blank" && link.aria?.includes("新しいタブ"))
  && /^https:\/\/github\.com\/[^/]+\/[^/]+\/settings\/secrets\/actions\/new$/.test(secret.href) && secret.target === "_blank" && secret.aria.includes("安全な保管場所") && secret.credentialInputs === 0
  && secretConfirmationBefore.disabled && secretConfirmationBefore.discoverCalls === 0 && discoveryBefore.discoverCalls === 0 && discoveryBefore.ctaCount === 2
  && initial.rooms === 4 && initial.selected === 0 && initial.nextDisabled
  && review.text.includes("営業チーム") && review.text.includes("6時間ごと") && review.text.includes("取得結果をこのリポジトリへ自動保存します")
  && !review.consentChecked && review.confirmDisabled && review.ctaCount === 2
  && consent.checked && !consent.confirmDisabled
  && initialResult.text.includes("初回設定の結果") && initialResult.text.includes("商品開発") && initialResult.text.includes("成功・1件")
  && savedInitial.selected === 2
  && changedResult.text.includes("設定変更が完了") && changedResult.text.includes("営業チーム") && changedResult.text.includes("手動のみ") && changedResult.text.includes("無効")
  && !changedResult.text.includes("初回設定の結果") && !changedResult.text.includes("商品開発") && !changedResult.text.includes("成功・1件")
  && errorState.message.includes("GitHubの書込権限") && errorState.buttonEnabled
  && keyboard.checkbox && keyboard.focusVisible
  && mobile.actionDirection === "column" && !mobile.horizontalOverflow
  && mobile.buttonHeights.every((height) => height >= 44) && mobile.labels
  && !zoom200.horizontalOverflow && zoom200.visibleButtons && errors.length === 0;
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
socket.close();
process.exit(passed ? 0 : 1);
