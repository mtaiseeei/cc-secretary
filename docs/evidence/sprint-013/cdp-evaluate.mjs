#!/usr/bin/env node

import { writeFileSync } from "node:fs";

const evidenceDir = new URL("./", import.meta.url);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const page = pages.find((item) => item.type === "page" && item.url === "about:blank") || pages.find((item) => item.type === "page");
if (!page) throw new Error("CDP page target not found");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
const browserErrors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") browserErrors.push(message.params.exceptionDetails.text || "exception");
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") browserErrors.push(message.params.entry.text);
});

function send(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const response = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || "Runtime.evaluate failed");
  return response.result.value;
}

async function waitFor(expression, timeout = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await delay(100);
  }
  throw new Error(`Timed out: ${expression}`);
}

async function metrics(width, height, deviceScaleFactor = 1, mobile = false) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor, mobile, screenWidth: width, screenHeight: height });
}

async function navigate() {
  await send("Page.navigate", { url: "http://127.0.0.1:8765/" });
  await waitFor("document.readyState === \"complete\"");
  await delay(250);
}

async function screenshot(name) {
  const image = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  writeFileSync(new URL(name, evidenceDir), Buffer.from(image.data, "base64"));
}

async function key(key, code, windowsVirtualKeyCode, text = undefined) {
  await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode, ...(text ? { text } : {}) });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode });
  await delay(100);
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await send("Network.enable");

const report = { target: page.id, browser: "Chrome 150 headless/CDP fallback", desktop: {}, mobile: {}, zoom200: {}, errors: browserErrors };

await metrics(1440, 900);
await navigate();
const functionalRoomUi = await evaluate(`document.querySelectorAll(".room-list input").length === 4`);
if (!functionalRoomUi) {
  report.blocked = await evaluate(`(() => ({
    title: document.title,
    bodyPrefix: document.body.innerText.slice(0, 500),
    bodyLength: document.body.innerText.length,
    inputs: document.querySelectorAll("input").length,
    buttons: document.querySelectorAll("button").length,
    scripts: document.querySelectorAll("script").length,
    links: document.querySelectorAll('link[rel="stylesheet"]').length,
    contentType: document.contentType,
    viewport: [innerWidth, innerHeight]
  }))()`);
  await screenshot("desktop-broken-response.png");
  await metrics(390, 844, 1, true);
  await navigate();
  report.blocked.mobile = await evaluate(`({viewport:[innerWidth,innerHeight], horizontalOverflow:document.documentElement.scrollWidth > innerWidth, inputs:document.querySelectorAll("input").length})`);
  await screenshot("mobile-broken-response.png");
  await metrics(720, 450, 2, false);
  await navigate();
  report.blocked.zoom200 = await evaluate(`({viewport:[innerWidth,innerHeight], devicePixelRatio, horizontalOverflow:document.documentElement.scrollWidth > innerWidth, inputs:document.querySelectorAll("input").length})`);
  await screenshot("zoom-200-broken-response.png");
  report.errors = browserErrors;
  writeFileSync(new URL("browser-evidence.json", evidenceDir), `${JSON.stringify(report, null, 2)}\n`);
  socket.close();
  console.log(JSON.stringify(report, null, 2));
  process.exit(2);
}
report.desktop.initial = await evaluate(`(() => ({
  h1: document.querySelector("h1").textContent,
  rooms: document.querySelectorAll(".room-list input").length,
  selected: document.querySelectorAll(".room-list input:checked").length,
  nextDisabled: document.querySelector(".button-primary").disabled,
  tokenInputs: [...document.querySelectorAll("input")].filter((input) => /token|api.?key|secret/i.test([input.name,input.id,input.placeholder,input.type].join(" "))).length,
  tokenText: /synthetic|token値|api tokenを入力/i.test(document.body.innerText)
}))()`);

await evaluate(`document.body.focus(); document.activeElement.blur(); true`);
await key("Tab", "Tab", 9);
report.desktop.firstTabFocus = await evaluate(`({ tag: document.activeElement.tagName, id: document.activeElement.id, type: document.activeElement.type })`);

await evaluate(`document.querySelector('input[value="101"]').focus(); true`);
await key(" ", "Space", 32, " ");
await evaluate(`document.querySelector('input[value="102"]').focus(); true`);
await key(" ", "Space", 32, " ");
await waitFor(`document.querySelectorAll(".room-list input:checked").length === 2`);
await evaluate(`document.querySelector('[data-action="next"]').click(); true`);
await waitFor(`document.querySelectorAll('input[name="interval"]').length === 6`);
report.desktop.frequency = await evaluate(`(() => ({
  count: document.querySelectorAll('input[name="interval"]').length,
  values: [...document.querySelectorAll('input[name="interval"]')].map((input) => input.value),
  labels: [...document.querySelectorAll(".frequency-list .choice-title")].map((item) => item.textContent),
  runs: [...document.querySelectorAll(".frequency-list .choice-meta")].map((item) => item.textContent),
  defaultValue: document.querySelector('input[name="interval"]:checked').value
}))()`);
await evaluate(`document.querySelector('input[name="interval"][value="6h"]').click(); document.querySelector('[data-action="next"]').click(); true`);
await waitFor(`document.querySelector(".summary") !== null`);
report.desktop.review = await evaluate(`(() => ({
  text: document.querySelector("#app").innerText,
  ctaCount: document.querySelectorAll(".actions .button").length,
  config: null
}))()`);
report.desktop.review.config = await evaluate(`fetch("/api/bootstrap").then((response) => response.json()).then((data) => data.config)`);
await screenshot("desktop-review.png");

await evaluate(`document.querySelector('[data-action="back"]').click(); true`);
report.desktop.backFrequency = await evaluate(`document.querySelector('input[name="interval"]:checked').value`);
await evaluate(`document.querySelector('[data-action="back"]').click(); true`);
report.desktop.backRooms = await evaluate(`[...document.querySelectorAll(".room-list input:checked")].map((input) => input.value)`);
const beforeCancel = await evaluate(`fetch("/api/bootstrap").then((response) => response.json()).then((data) => JSON.stringify(data.config))`);
await evaluate(`document.querySelector('[data-action="back"]').click(); true`);
await waitFor(`document.querySelector(".eyebrow").textContent === "CANCELLED"`);
const afterCancel = await evaluate(`fetch("/api/bootstrap").then((response) => response.json()).then((data) => JSON.stringify(data.config))`);
report.desktop.cancel = { heading: await evaluate(`document.querySelector("h1").textContent`), before: beforeCancel, after: afterCancel, unchanged: beforeCancel === afterCancel };

await evaluate(`document.querySelector('[data-action="restart"]').click(); true`);
await evaluate(`document.querySelector('input[value="101"]').click(); document.querySelector('input[value="102"]').click(); document.querySelector('[data-action="next"]').click(); true`);
await evaluate(`document.querySelector('input[name="interval"][value="6h"]').click(); document.querySelector('[data-action="next"]').click(); true`);
await waitFor(`document.querySelector(".summary") !== null`);

await evaluate(`(() => {
  if (!window.__nativeFetch) window.__nativeFetch = window.fetch.bind(window);
  window.fetch = (url, options) => String(url).endsWith("/api/confirm")
    ? Promise.resolve(new Response(JSON.stringify({error:"合成エラー: 入力内容を確認してください。"}), {status:400, headers:{"content-type":"application/json"}}))
    : window.__nativeFetch(url, options);
  document.querySelector('[data-action="next"]').click();
  return true;
})()`);
await waitFor(`document.querySelector('[role="alert"]') !== null`);
report.desktop.confirmError = await evaluate(`({ text: document.querySelector('[role="alert"]').textContent, buttonEnabled: !document.querySelector('[data-action="next"]').disabled })`);
await screenshot("desktop-confirm-error.png");

await evaluate(`(() => {
  window.fetch = (url, options) => {
    if (String(url).endsWith("/api/status")) return Promise.resolve(new Response(JSON.stringify({
      dispatch:{status:"fixture",message:"合成fixtureの部分失敗結果です。"},
      sync:{status:"partial",results:[
        {roomName:"営業チーム",status:"success",fetched:0},
        {roomName:"商品開発",status:"failed",fetched:0,message:"rate limitのため再実行してください"}
      ]}
    }), {status:200, headers:{"content-type":"application/json"}}));
    return window.__nativeFetch(url, options);
  };
  document.querySelector('[data-action="next"]').click();
  return true;
})()`);
await waitFor(`document.querySelector(".result-list") !== null`);
report.desktop.partialResult = await evaluate(`({ heading: document.querySelector("h1").textContent, text: document.querySelector("#app").innerText })`);
report.desktop.savedConfig = await evaluate(`window.__nativeFetch("/api/bootstrap").then((response) => response.json()).then((data) => data.config)`);
await screenshot("desktop-result-partial.png");

report.desktop.visual = await evaluate(`(() => {
  const all = [...document.querySelectorAll("*")];
  const blue = all.filter((element) => getComputedStyle(element).backgroundColor === "rgb(62, 106, 225)");
  const buttons = [...document.querySelectorAll("button")];
  return {
    viewport: [innerWidth, innerHeight],
    bodyFont: getComputedStyle(document.body).fontSize,
    h1Font: getComputedStyle(document.querySelector("h1")).fontSize,
    blue: blue.map((element) => ({tag:element.tagName,className:element.className})),
    gradients: all.filter((element) => getComputedStyle(element).backgroundImage !== "none").length,
    shadows: all.filter((element) => getComputedStyle(element).boxShadow !== "none").length,
    transformed: all.filter((element) => getComputedStyle(element).transform !== "none").length,
    images: document.images.length,
    tesla: /tesla|wordmark|universal sans/i.test(document.documentElement.innerHTML),
    buttonRadius: buttons.map((button) => getComputedStyle(button).borderRadius),
    buttonHeights: buttons.map((button) => button.getBoundingClientRect().height),
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth
  };
})()`);

await metrics(390, 844, 1, true);
await navigate();
report.mobile.room = await evaluate(`(() => {
  const roomGrid = document.querySelector(".room-list");
  const roomLabels = [...document.querySelectorAll(".room-list label")];
  return {
    viewport: [innerWidth, innerHeight],
    gridColumns: getComputedStyle(roomGrid).gridTemplateColumns,
    labelWidths: roomLabels.map((label) => Math.round(label.getBoundingClientRect().width)),
    shellWidth: Math.round(document.querySelector(".shell").getBoundingClientRect().width),
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth
  };
})()`);
await screenshot("mobile-room.png");
await evaluate(`document.querySelector('[data-action="next"]').click(); true`);
await waitFor(`document.querySelector(".frequency-list") !== null`);
report.mobile.frequency = await evaluate(`(() => {
  const actions = document.querySelector(".actions");
  const buttons = [...actions.querySelectorAll("button")];
  return {
    actionDirection: getComputedStyle(actions).flexDirection,
    buttonWidths: buttons.map((button) => Math.round(button.getBoundingClientRect().width)),
    buttonHeights: buttons.map((button) => Math.round(button.getBoundingClientRect().height)),
    inputLabels: [...document.querySelectorAll("input")].every((input) => input.closest("label") || document.querySelector("label[for=\"" + input.id + "\"]"))
  };
})()`);
await evaluate(`document.querySelector('input[name="interval"][value="12h"]').focus(); true`);
report.mobile.focus = await evaluate(`(() => { const input=document.activeElement; const style=getComputedStyle(input); return {value:input.value, outline:style.outline, outlineOffset:style.outlineOffset}; })()`);
await key(" ", "Space", 32, " ");
report.mobile.keyboardSelected = await evaluate(`document.querySelector('input[name="interval"]:checked').value`);
await screenshot("mobile-frequency.png");

await metrics(720, 450, 2, false);
await navigate();
report.zoom200 = await evaluate(`(() => ({
  viewport: [innerWidth, innerHeight],
  devicePixelRatio,
  horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
  h1Visible: document.querySelector("h1").getBoundingClientRect().width > 0,
  buttons: [...document.querySelectorAll("button")].map((button) => ({text:button.textContent, width:Math.round(button.getBoundingClientRect().width), height:Math.round(button.getBoundingClientRect().height)})),
  mobileLayout: getComputedStyle(document.querySelector(".room-list")).gridTemplateColumns.split(" ").length === 1
}))()`);
await screenshot("zoom-200-percent.png");

report.errors = browserErrors;
writeFileSync(new URL("browser-evidence.json", evidenceDir), `${JSON.stringify(report, null, 2)}\n`);
socket.close();
console.log(JSON.stringify(report, null, 2));
