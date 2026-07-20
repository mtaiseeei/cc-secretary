#!/usr/bin/env node

// Sprint 032 Patch 001 層C: 実pluginセッションのsmoke test。
// Claude Code CLIの正式なlocal plugin読込（--plugin-dir）で実セッションを起動し、
// 合成の非機密データだけで5 scenarioの会話を実行して、応答のMarkdown構造を検査する。
// 検査は完全な文面一致ではなく、実plugin経路（rule-manifest → rules → copy）から
// 導出した契約（scripts/lib/sprint-032-patch-001-conversation.mjs）に対する構造検査。
//
// 実Token、顧客データ、OAuth、Chatwork API、Google Chat API、Repository Secret、
// GitHub Actionsは使用しない。証跡は TMPDIR（既定 /private/tmp）配下だけへ保存する。
//
// 実行: TMPDIR=/private/tmp node scripts/sprint-032-patch-001-conversation-smoke.mjs

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isCollapsedProse,
  lineKinds,
  loadConversationContract,
  parseBlocks,
  usesFixedThreeSchema,
} from "./lib/sprint-032-patch-001-conversation.mjs";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginDir = join(repo, "plugins", "secretary");
const contract = loadConversationContract(repo);
const tmpBase = process.env.TMPDIR && process.env.TMPDIR.startsWith("/private/tmp")
  ? process.env.TMPDIR
  : "/private/tmp";

function seedWorkspace() {
  const workspace = mkdtempSync(join(tmpBase, "yasashii-smoke-"));
  const memory = join(workspace, "secretary", "memory");
  const docs = join(workspace, "secretary", "docs", "2026", "07");
  mkdirSync(memory, { recursive: true });
  mkdirSync(join(memory, "journal"), { recursive: true });
  mkdirSync(docs, { recursive: true });
  writeFileSync(join(memory, "MEMORY.md"), "# 記憶の目次\n\n- まだ大きな記憶はありません\n");
  writeFileSync(
    join(memory, "preferences.md"),
    "# 個人設定\n\n## 基本\n\n- 呼び方: テストさん\n\n## 言葉遣い\n\n- 口調: 丁寧\n- 専門用語: ふつう\n- 報告の詳しさ: みじかく\n- 決定の確認: 都度\n",
  );
  const memos = [
    ["2026-07-02_請求書テンプレート.md", "# 請求書テンプレートの整理\n\n請求書の共通テンプレートを整理した。\n"],
    ["2026-07-10_7月分請求書の下書き.md", "# 7月分請求書の下書き\n\n金額欄が未記入のまま。\n"],
    ["2026-07-15_請求書送付先の変更メモ.md", "# 請求書送付先の変更メモ\n\n新しい送付先はこのメモだけに記録されている。\n"],
    ["2026-07-16_散歩コース.md", "# 散歩コース\n\n請求とは無関係の合成メモ。\n"],
  ];
  for (const [name, body] of memos) writeFileSync(join(docs, name), body);
  return workspace;
}

const SCENARIOS = [
  {
    kind: "complex-question",
    label: "複雑な一般質問",
    prompt:
      "GitとGitHubの違いがよく分かりません。秘書の記憶を守る観点で、違いと、どう使い分ければよいかを教えてください。",
  },
  {
    kind: "diagnosis",
    label: "複数原因の診断",
    prompt:
      "昨日からメモの保存が失敗します。ターミナルには「EACCES: permission denied, open 'secretary/docs/2026/07/memo.md'」と出ていました。考えられる原因と対処を教えてください。",
  },
  {
    kind: "search-results",
    label: "3件以上の検索結果",
    prompt:
      "secretary/docs の中から「請求書」に関するメモを探して、見つかったものを一覧で教えてください。",
  },
  {
    kind: "partial-failure",
    label: "部分失敗",
    prompt:
      "次の3件のメモを保存してください。1件目はタイトル「会議メモ」本文「7月20日の定例の要点」。2件目はタイトル「買い物リスト」本文「付箋とインク」。3件目はタイトル「共有メモ」本文「共有事項」で、保存先は必ず /System/yasashii-smoke-readonly/共有メモ.md にしてください。保存できないものがあっても、できた分の結果を教えてください。",
  },
  {
    kind: "completion-report",
    label: "作業完了報告",
    prompt:
      "「会議メモ2」というタイトルで、本文「打ち合わせは7月22日に決定」というメモを秘書のdocsへ保存してください。",
  },
];

function runSession(workspace, prompt) {
  const env = { ...process.env };
  delete env.CLAUDECODE;
  delete env.CLAUDE_CODE_ENTRYPOINT;
  const args = [
    "-p",
    `/secretary ${prompt}`,
    "--plugin-dir",
    pluginDir,
    "--permission-mode",
    "acceptEdits",
    "--allowedTools",
    "Bash,Read,Write,Edit,Glob,Grep,Skill,LS,TodoWrite",
    "--output-format",
    "json",
  ];
  const run = spawnSync("claude", args, {
    cwd: workspace,
    env,
    encoding: "utf8",
    timeout: 420000,
    maxBuffer: 32 * 1024 * 1024,
  });
  let result = null;
  try {
    const parsed = JSON.parse(run.stdout);
    result = typeof parsed.result === "string" ? parsed.result : null;
  } catch {
    result = null;
  }
  return { status: run.status, stdout: run.stdout ?? "", stderr: run.stderr ?? "", result };
}

// 層Cの確認項目は文面一致ではなく構造のみ。層Bより緩く、仕様のC確認項目に対応させる。
function smokeChecks(kind, text) {
  const { labels } = contract;
  const kinds = lineKinds(text);
  const blocks = parseBlocks(text);
  const bullets = kinds.filter((k) => k === "bullet" || k === "numbered").length;
  const nested = kinds.filter((k) => k === "nested").length;
  const fixed = usesFixedThreeSchema(text, labels);
  const collapsed = isCollapsedProse(text);
  const structured = blocks.length >= 2 || bullets >= 2;
  const checks = [];
  const push = (name, ok, note = "") => checks.push({ name, ok, note });

  if (kind === "completion-report") {
    push("完了報告は3つの意味が物理的に別行または別項目", kinds.length >= 3 || bullets >= 3);
    push("3項目形式を使う場合はcopyのラベルに一致", !fixed || labels.every((label) => text.includes(`${label}:`) || text.includes(`${label}：`)));
    push("1行への連結なし", !collapsed);
  } else {
    push("一般回答に固定3ラベルを強制していない", !fixed);
    push("複数論点が改行なしの長文へ潰れていない", !collapsed);
    push("段落または箇条書きとして読める", structured, `blocks=${blocks.length} bullets=${bullets} nested=${nested}`);
    if (kind === "search-results") push("3件以上を項目として読み分けられる", bullets >= 3 || blocks.length >= 4);
    if (kind === "partial-failure") push("成功・失敗・影響・次の行動を読み分けられる", bullets + nested + blocks.length >= 4);
  }
  return checks;
}

const evidenceDir = mkdtempSync(join(tmpBase, "sprint-032-patch-001-smoke-evidence-"));
const summary = [];
let failed = 0;

try {
  execFileSync("claude", ["--version"], { encoding: "utf8" });
} catch (error) {
  process.stdout.write("SMOKE_SKIP claude CLIが利用できないため実pluginセッションを実行できません\n");
  process.stdout.write(`SMOKE_SKIP_REASON ${error.message}\n`);
  process.exit(2);
}

for (const scenario of SCENARIOS) {
  const workspace = seedWorkspace();
  process.stdout.write(`RUN ${scenario.kind} (${scenario.label}) workspace=${workspace}\n`);
  const session = runSession(workspace, scenario.prompt);
  const record = { ...scenario, workspace, status: session.status, result: session.result };
  if (session.result === null) {
    failed += 1;
    record.checks = [{ name: "実セッションの応答取得", ok: false, note: session.stderr.slice(0, 400) }];
    process.stdout.write(`FAIL ${scenario.kind}: 応答を取得できませんでした（exit=${session.status}）\n`);
  } else {
    record.checks = smokeChecks(scenario.kind, session.result);
    for (const check of record.checks) {
      if (!check.ok) failed += 1;
      process.stdout.write(`${check.ok ? "PASS" : "FAIL"} ${scenario.kind}: ${check.name}${check.note ? ` (${check.note})` : ""}\n`);
    }
  }
  summary.push(record);
  writeFileSync(join(evidenceDir, `${scenario.kind}.json`), JSON.stringify(record, null, 2));
}

writeFileSync(join(evidenceDir, "summary.json"), JSON.stringify(summary, null, 2));
process.stdout.write(`SMOKE_EVIDENCE ${evidenceDir}\n`);
process.stdout.write(`SPRINT032_PATCH001_SMOKE_FAIL=${failed}\n`);
process.exit(failed === 0 ? 0 : 1);
