#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const cdp = args.get("--cdp") || "http://127.0.0.1:9225";
const googleUrl = args.get("--google-url") || "http://127.0.0.1:18766/";
const googleNormalUrl = args.get("--google-normal-url") || null;
const chatworkUrl = args.get("--chatwork-url") || "http://127.0.0.1:18765/";
const evidence = resolve(args.get("--evidence") || "docs/evidence/sprint-019");
const delay = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms));
const pages = await (await fetch(`${cdp}/json/list`)).json();
const page = pages.find((item) => item.type === "page" && (item.url === "about:blank" || item.url.includes("127.0.0.1"))) || pages.find((item) => item.type === "page");
if (!page) throw new Error("browser page target not found");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolveOpen, reject) => { socket.addEventListener("open", resolveOpen, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let nextId = 1;
const pending = new Map();
const browserErrors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) { const waiter = pending.get(message.id); pending.delete(message.id); message.error ? waiter.reject(new Error(JSON.stringify(message.error))) : waiter.resolve(message.result); }
  if (message.method === "Runtime.exceptionThrown") browserErrors.push(message.params.exceptionDetails.text || "exception");
});
function send(method, params = {}) { const id = nextId++; socket.send(JSON.stringify({ id, method, params })); return new Promise((resolveSend, reject) => pending.set(id, { resolve: resolveSend, reject })); }
async function evaluate(expression) { const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; }
async function waitFor(expression, timeout = 8000) { const start = Date.now(); while (Date.now() - start < timeout) { if (await evaluate(expression)) return; await delay(100); } throw new Error(`timeout: ${expression}`); }
async function open(url, width, height, mobile = false) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
  await send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  const target = new URL(url); target.searchParams.set("browserCheck", `${Date.now()}-${nextId}`);
  await send("Page.navigate", { url: target.href });
  await waitFor(`location.href === ${JSON.stringify(target.href)} && document.readyState === "complete" && document.querySelector("#app h1")`);
}
async function screenshot(name) {
  const dimensions = await evaluate(`({width:Math.max(document.documentElement.scrollWidth,innerWidth),height:Math.max(document.documentElement.scrollHeight,innerHeight)})`);
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: dimensions.width, height: dimensions.height, scale: 1 } });
  writeFileSync(resolve(evidence, name), Buffer.from(result.data, "base64"));
}

await send("Page.enable");
await send("Runtime.enable");
mkdirSync(evidence, { recursive: true });

await open(googleUrl, 1440, 900);
await evaluate(`fetch('/api/oauth/synthetic',{method:'POST',headers:{'content-type':'application/json'},body:'{"mode":"success"}'}).then(r=>r.json())`);
await send("Page.reload", { ignoreCache: true });
await waitFor(`document.querySelectorAll('.room-list input').length === 3`);
const googleDesktop = await evaluate(`({
  service:document.querySelector('#app').getAttribute('aria-label'),
  context:document.querySelector('.service-context')?.textContent,
  spaces:document.querySelectorAll('.room-list input').length,
  selected:document.querySelectorAll('.room-list input:checked').length,
  cta:[...document.querySelectorAll('.button-primary')].map((item)=>({bg:getComputedStyle(item).backgroundColor,fg:getComputedStyle(item).color})),
  blue:[...document.querySelectorAll('.button-primary')].filter((item)=>getComputedStyle(item).backgroundColor==='rgb(62, 106, 225)').length,
  secretInputs:document.querySelectorAll('input[type=password],input[name*="secret" i],input[name*="token" i]').length,
  clientLeak:document.documentElement.innerText.includes('synthetic-runtime-id')||document.documentElement.innerText.includes('client_secret')
})`);
await screenshot("google-chat-desktop-spaces.png");

await evaluate(`document.querySelector('input[value="spaces/space-a"]').click();document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelectorAll('input[name="interval"]').length === 5`);
const googleFrequency = await evaluate(`({selected:document.querySelector('input[name="interval"]:checked')?.value,text:document.querySelector('#app').innerText})`);
await evaluate(`document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelector('#save-consent') !== null`);
const googleReview = await evaluate(`({
  text:document.querySelector('#app').innerText,
  saveChecked:document.querySelector('#save-consent').checked,
  gitChecked:document.querySelector('#git-consent').checked,
  disabled:document.querySelector('[data-action="next"]').disabled,
  ctaCount:document.querySelectorAll('.actions .button').length
})`);

await open(googleUrl, 390, 844, true);
await waitFor(`document.querySelectorAll('.room-list input').length === 3`);
const googleMobile = await evaluate(`({
  service:document.querySelector('#app').getAttribute('aria-label'),
  columns:getComputedStyle(document.querySelector('.room-list')).gridTemplateColumns,
  actions:getComputedStyle(document.querySelector('.actions')).flexDirection,
  overflow:document.documentElement.scrollWidth>innerWidth,
  buttonHeights:[...document.querySelectorAll('button')].map((item)=>item.getBoundingClientRect().height),
  labels:[...document.querySelectorAll('input')].every((input)=>input.closest('label')||document.querySelector('label[for="'+input.id+'"]'))
})`);
await screenshot("google-chat-mobile.png");

await open(googleUrl, 720, 450);
await waitFor(`document.querySelectorAll('.room-list input').length === 3`);
await send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
const googleZoom = await evaluate(`({overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('button')].every((item)=>item.getBoundingClientRect().height>=44),service:document.querySelector('.service-context')?.textContent})`);
await screenshot("google-chat-zoom200.png");

let googleNormal = { skipped: true };
if (googleNormalUrl) {
  await open(googleNormalUrl, 1440, 900);
  await evaluate(`fetch('/api/oauth/client',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({clientJson:JSON.stringify({installed:{client_id:['browser',Date.now()].join('-'),client_secret:['runtime',Date.now(),Math.random()].join('-'),auth_uri:'https://accounts.google.com/o/oauth2/v2/auth',token_uri:'https://oauth2.googleapis.com/token',redirect_uris:['http://localhost']}})})}).then(r=>r.json())`);
  await send("Page.reload", { ignoreCache: true });
  await waitFor(`document.querySelector('[data-action="authorize"]') !== null`);
  const originalUrl = await evaluate(`location.href`);
  await evaluate(`window.__oauthPopup={closed:false,opener:null};window.__oauthOpen={count:0,name:null};window.open=(url,name)=>{window.__oauthOpen={count:window.__oauthOpen.count+1,name};return window.__oauthPopup};document.querySelector('[data-action="authorize"]').click();true`);
  await waitFor(`document.querySelector('[data-action="reopen"]') !== null`);
  const launched = await evaluate(`({sameTab:location.href===${JSON.stringify(originalUrl)},openCount:window.__oauthOpen.count,targetName:window.__oauthOpen.name,heading:document.querySelector('#app h1').textContent,reopen:document.querySelector('[data-action="reopen"]').textContent})`);
  await evaluate(`window.__oauthPopup.closed=true;true`);
  await waitFor(`document.querySelector('[data-oauth-status]')?.textContent.includes('認証タブが閉じられました')`, 3000);
  const closed = await evaluate(`document.querySelector('[data-oauth-status]').textContent`);
  await evaluate(`fetch('/api/oauth/synthetic',{method:'POST',headers:{'content-type':'application/json'},body:'{"mode":"success"}'}).then(r=>r.json())`);
  await waitFor(`document.querySelectorAll('.room-list input').length === 3`, 4000);
  await evaluate(`fetch('/api/oauth/client',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({clientJson:JSON.stringify({installed:{client_id:['browser',Date.now()].join('-'),client_secret:['runtime',Date.now(),Math.random()].join('-'),auth_uri:'https://accounts.google.com/o/oauth2/v2/auth',token_uri:'https://oauth2.googleapis.com/token',redirect_uris:['http://localhost']}})})}).then(r=>r.json())`);
  await send("Page.reload", { ignoreCache: true });
  await waitFor(`document.querySelector('[data-action="authorize"]') !== null`);
  await evaluate(`window.open=()=>null;document.querySelector('[data-action="authorize"]').click();true`);
  await waitFor(`document.querySelector('#app h1')?.textContent.includes('認証タブを開けませんでした')`);
  const blocked = await evaluate(`({heading:document.querySelector('#app h1').textContent,text:document.querySelector('#app').innerText,reopen:Boolean(document.querySelector('[data-action="reopen"]'))})`);
  googleNormal = { skipped: false, launched, closedReported: closed.includes("認証タブが閉じられました"), connectedToSpaces: true, blocked };
  await screenshot("google-chat-normal-oauth-popup-blocked.png");
}

await open(chatworkUrl, 1440, 900);
await waitFor(`document.querySelector('#app h1') && document.querySelector('.service-context')?.textContent==='Chatworkの設定'`);
const chatwork = await evaluate(`({
  service:document.querySelector('#app').getAttribute('aria-label'),
  context:document.querySelector('.service-context')?.textContent,
  cta:[...document.querySelectorAll('.button-primary')].map((item)=>({bg:getComputedStyle(item).backgroundColor,fg:getComputedStyle(item).color})),
  blue:[...document.querySelectorAll('.button-primary')].filter((item)=>getComputedStyle(item).backgroundColor==='rgb(62, 106, 225)').length,
  secretInputs:document.querySelectorAll('input[type=password],input[name*="token" i]').length,
  clientLeak:document.documentElement.innerText.includes('client_id')||document.documentElement.innerText.includes('client_secret')
})`);
await evaluate(`document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelector('#secret-link') !== null`);
await evaluate(`document.querySelector('#secret-link').click();true`);
await waitFor(`document.querySelector('#secret-confirmed') !== null`);
await evaluate(`document.querySelector('#secret-confirmed').click();document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelector('#app h1')?.textContent.includes('参加中のルーム一覧')`);
await evaluate(`document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelectorAll('.room-list input').length === 4`);
await evaluate(`document.querySelector('input[value="101"]').click();document.querySelector('[data-action="next"]').click();true`);
await waitFor(`document.querySelectorAll('input[name="interval"]').length === 6`);
const chatworkFrequency = await evaluate(`({selected:document.querySelector('input[name="interval"]:checked')?.value,text:document.querySelector('#app').innerText})`);
await screenshot("chatwork-desktop-3h.png");

const report = { googleDesktop, googleFrequency, googleReview, googleMobile, googleZoom, googleNormal, chatwork, chatworkFrequency, browserErrors };
const passed = googleDesktop.service === "Google Chatの設定" && googleDesktop.context === "Google Chatの設定" && googleDesktop.spaces === 3 && googleDesktop.selected === 0
  && googleDesktop.cta.every((item) => item.bg === "rgb(17, 187, 98)" && item.fg === "rgb(0, 0, 0)") && googleDesktop.blue === 0 && googleDesktop.secretInputs === 0 && !googleDesktop.clientLeak
  && googleFrequency.selected === "3h" && googleFrequency.text.includes("3時間ごと（おすすめ・初期値）")
  && googleReview.text.includes("取得結果をこのリポジトリへ保存します（Gitのcommit・push）") && !googleReview.saveChecked && !googleReview.gitChecked && googleReview.disabled && googleReview.ctaCount === 2
  && googleMobile.service === "Google Chatの設定" && googleMobile.actions === "column" && !googleMobile.overflow && googleMobile.buttonHeights.every((height) => height >= 44) && googleMobile.labels
  && !googleZoom.overflow && googleZoom.buttons && googleZoom.service === "Google Chatの設定"
  && (googleNormal.skipped || (googleNormal.launched.sameTab && googleNormal.launched.openCount === 1 && googleNormal.launched.targetName === "yasashii-google-chat-oauth" && googleNormal.launched.heading.includes("別タブ") && googleNormal.launched.reopen.includes("もう一度") && googleNormal.closedReported && googleNormal.connectedToSpaces && googleNormal.blocked.heading.includes("開けませんでした") && googleNormal.blocked.text.includes("ポップアップを許可") && googleNormal.blocked.reopen))
  && chatwork.service === "Chatworkの設定" && chatwork.context === "Chatworkの設定" && chatwork.cta.every((item) => item.bg === "rgb(240, 55, 71)" && item.fg === "rgb(0, 0, 0)") && chatwork.blue === 0 && chatwork.secretInputs === 0 && !chatwork.clientLeak
  && chatworkFrequency.selected === "3h" && chatworkFrequency.text.includes("3時間ごと（おすすめ・初期値）") && browserErrors.length === 0;
writeFileSync(resolve(evidence, "browser-evidence.json"), `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
socket.close();
process.exit(passed ? 0 : 1);
