#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REQUIRED_APIS = Object.freeze(["chat.googleapis.com", "people.googleapis.com"]);
export const MANUAL_STEPS = Object.freeze([
  "project",
  "chat-api",
  "people-api",
  "audience",
  "desktop-client",
  "client-json",
]);

function commandResult(value) {
  if (typeof value === "string") return { stdout: value, stderr: "", status: 0 };
  return { stdout: value?.stdout || "", stderr: value?.stderr || "", status: Number(value?.status || 0) };
}

export function systemRunner(command, args, options = {}) {
  try {
    return { stdout: execFileSync(command, args, { cwd: options.cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }), stderr: "", status: 0 };
  } catch (error) {
    return { stdout: String(error.stdout || ""), stderr: String(error.stderr || ""), status: Number(error.status || 1) };
  }
}

export function discoverRepository({ cwd = process.cwd(), runner = systemRunner } = {}) {
  const result = commandResult(runner("git", ["rev-parse", "--show-toplevel"], { cwd }));
  if (result.status !== 0 || !result.stdout.trim()) {
    return { status: "repository-needed", changed: false, message: "Google Chatを接続するGitリポジトリを確認できませんでした。対象のリポジトリを開いてから、もう一度お試しください。" };
  }
  const root = resolve(result.stdout.trim());
  return { status: "repository-ready", changed: false, root, repoName: basename(root) };
}

function shortHash(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 6);
}

export function projectProposal(repoName, { collision = false } = {}) {
  const displayName = `${repoName}-google-chat`;
  let projectId = displayName.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  const reasons = [];
  if (projectId !== displayName) reasons.push("Project IDで使えない文字を安全な文字へ置き換えました");
  if (!/^[a-z]/.test(projectId)) {
    projectId = `p-${projectId}`;
    reasons.push("Project IDを英字で始めるため接頭辞を追加しました");
  }
  if (projectId.length > 30) {
    projectId = `${projectId.slice(0, 23).replace(/-+$/g, "")}-${shortHash(displayName)}`;
    reasons.push("Project IDの長さをGoogle Cloudの上限に合わせました");
  }
  if (projectId.length < 6) {
    projectId = `${projectId}-gchat`.slice(0, 30).replace(/-+$/g, "");
    reasons.push("Project IDの最小文字数に合わせました");
  }
  if (collision) {
    projectId = `${projectId.slice(0, 23).replace(/-+$/g, "")}-${shortHash(`${displayName}:collision`)}`;
    reasons.push("同じProject IDが使用済みのため識別子を追加しました");
  }
  return { displayName, projectId, adjusted: reasons.length > 0, reasons };
}

export function officialLinks(projectId = "") {
  const project = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
  return {
    project: "https://console.cloud.google.com/projectcreate",
    chatApi: `https://console.cloud.google.com/apis/library/chat.googleapis.com${project}`,
    peopleApi: `https://console.cloud.google.com/apis/library/people.googleapis.com${project}`,
    audience: `https://console.cloud.google.com/auth/audience${project}`,
    clients: `https://console.cloud.google.com/auth/clients${project}`,
    install: "https://cloud.google.com/sdk/docs/install",
  };
}

export function projectConfirmation({ repo, organization, proposal }) {
  return {
    status: "cloud-project-confirmation-needed",
    changed: false,
    repo,
    organization,
    displayName: proposal.displayName,
    projectId: proposal.projectId,
    apis: [...REQUIRED_APIS],
    billingAccount: "自動接続しません",
    changes: ["Google Cloudプロジェクトを作成", "Google Chat APIを有効化", "People APIを有効化"],
  };
}

export function inspectGcloud({ cwd = process.cwd(), runner = systemRunner } = {}) {
  const version = commandResult(runner("gcloud", ["version", "--format=json"], { cwd }));
  if (version.status !== 0) {
    return {
      status: "cli-install-confirmation-needed",
      changed: false,
      official: true,
      installationCost: "インストール自体は無料です",
      caution: "Google公式の管理ツールですが、Google Cloudの設定を変更できます。インストール方法と実行予定を確認し、承認後だけ導入します。",
      fallback: officialLinks().install,
    };
  }
  const accounts = commandResult(runner("gcloud", ["auth", "list", "--filter=status:ACTIVE", "--format=json"], { cwd }));
  const organizations = commandResult(runner("gcloud", ["organizations", "list", "--format=json"], { cwd }));
  let activeAccounts = [];
  let availableOrganizations = [];
  try { activeAccounts = accounts.status === 0 ? JSON.parse(accounts.stdout || "[]") : []; } catch { activeAccounts = []; }
  try { availableOrganizations = organizations.status === 0 ? JSON.parse(organizations.stdout || "[]") : []; } catch { availableOrganizations = []; }
  return {
    status: activeAccounts.length === 0 ? "login-needed" : availableOrganizations.length > 1 ? "organization-selection-needed" : "cli-ready",
    changed: false,
    activeAccounts: activeAccounts.map((item) => ({ account: item.account })),
    organizations: availableOrganizations.map((item) => ({ id: String(item.name || "").replace(/^organizations\//, ""), displayName: item.displayName || "名称未取得" })),
  };
}

export function gcloudPlan({ projectId, displayName, organization }) {
  if (!projectId || !displayName || !organization) throw Object.assign(new Error("Project案とGoogle Workspace組織を確認してください。"), { code: "plan-incomplete" });
  return [
    { id: "create-project", command: "gcloud", args: ["projects", "create", projectId, "--name", displayName, "--organization", String(organization)] },
    { id: "enable-chat-api", command: "gcloud", args: ["services", "enable", REQUIRED_APIS[0], "--project", projectId] },
    { id: "enable-people-api", command: "gcloud", args: ["services", "enable", REQUIRED_APIS[1], "--project", projectId] },
  ];
}

export function executeApprovedPlan({ plan, approved = false, cwd = process.cwd(), runner = systemRunner, completed = [] } = {}) {
  if (!approved) return { status: "confirmation-needed", changed: false, completed: [...completed], next: plan.find((item) => !completed.includes(item.id))?.id || null };
  const allowed = new Set(["create-project", "enable-chat-api", "enable-people-api"]);
  const done = new Set(completed);
  for (const item of plan) {
    if (!allowed.has(item.id) || item.command !== "gcloud") throw Object.assign(new Error("予定外のCloud操作を拒否しました。"), { code: "unsafe-command" });
    if (done.has(item.id)) continue;
    const result = commandResult(runner(item.command, item.args, { cwd }));
    if (result.status !== 0) {
      const text = `${result.stderr}\n${result.stdout}`;
      const code = /already exists|already in use|409/i.test(text) ? "project-id-collision"
        : /permission|forbidden|denied|403/i.test(text) ? "permission-needed"
          : item.id === "create-project" ? "project-create-failed" : "api-enable-failed";
      return { status: "cloud-preparing", changed: done.size > completed.length, completed: [...done], next: item.id, error: { code, message: "Google Cloudの準備を途中で止めました。完了済みの工程は保持し、次の操作を確認してください。" } };
    }
    done.add(item.id);
  }
  return { status: "browser-step-needed", changed: true, completed: [...done], next: "audience" };
}

export function resumeState(input = {}) {
  const completed = [...new Set((input.completed || []).filter((step) => [...MANUAL_STEPS, "create-project", "enable-chat-api", "enable-people-api"].includes(step)))];
  const next = input.next && [...MANUAL_STEPS, "create-project", "enable-chat-api", "enable-people-api", "wizard"].includes(input.next) ? input.next : null;
  return {
    repo: input.repo || null,
    displayName: input.displayName || null,
    projectId: input.projectId || null,
    organization: input.organization || null,
    completed,
    next,
    checkedAt: input.checkedAt || new Date().toISOString(),
  };
}

export function manualStep({ projectId, completed = [] } = {}) {
  const links = officialLinks(projectId);
  const done = new Set(completed);
  if (done.has("create-project")) done.add("project");
  if (done.has("enable-chat-api")) done.add("chat-api");
  if (done.has("enable-people-api")) done.add("people-api");
  const definitions = {
    project: { link: links.project, label: "Google Cloudでプロジェクトを作る", action: "Project IDを確認してプロジェクトを作成します。", done: "作成したプロジェクトを選択できれば完了です。" },
    "chat-api": { link: links.chatApi, label: "Google Chat APIを有効にする", action: "「有効にする」を押します。", done: "APIが有効と表示されれば完了です。" },
    "people-api": { link: links.peopleApi, label: "People APIを有効にする", action: "「有効にする」を押します。", done: "APIが有効と表示されれば完了です。" },
    audience: { link: links.audience, label: "Audienceを内部（Internal）にする", action: "Audienceで「内部（Internal）」を選び、保存します。", done: "AudienceがInternalと表示されれば完了です。" },
    "desktop-client": { link: links.clients, label: "Desktop appの接続設定を作る", action: "ClientsでApplication type「Desktop app」を選び、作成します。", done: "Desktop appのClientが一覧に出れば完了です。" },
    "client-json": { link: links.clients, label: "接続用JSONをダウンロードする", action: "作成したDesktop appを開き、JSONをダウンロードします。", done: "接続用JSONがこのPCに保存されれば完了です。" },
  };
  const next = MANUAL_STEPS.find((step) => !done.has(step));
  if (!next) return { status: "client-file-ready", next: "wizard", message: "接続用JSONを確認できました。ローカル設定画面を開けます。" };
  return { status: "browser-step-needed", step: next, projectId, ...definitions[next], prompt: "できたら「できました」と返信してください。" };
}

export function acknowledgeManualStep({ projectId, completed = [], reply = "" } = {}) {
  const current = manualStep({ projectId, completed });
  if (current.status === "client-file-ready") return current;
  if (String(reply).trim() !== "できました") return current;
  return manualStep({ projectId, completed: [...completed, current.step] });
}

function parseArgs(argv) {
  const parsed = { command: argv[2] || "inspect" };
  for (let i = 3; i < argv.length; i += 2) parsed[String(argv[i]).replace(/^--/, "")] = argv[i + 1];
  return parsed;
}

if (resolve(process.argv[1] || "") === resolve(fileURLToPath(import.meta.url))) {
  const args = parseArgs(process.argv);
  const repo = discoverRepository({ cwd: args.root || process.cwd() });
  let output = repo;
  if (args.command === "inspect" && repo.status === "repository-ready") output = { repository: repo, gcloud: inspectGcloud({ cwd: repo.root }), proposal: projectProposal(repo.repoName) };
  if (args.command === "links") output = officialLinks(args.project || "");
  if (args.command === "plan") {
    if (repo.status !== "repository-ready") output = repo;
    else {
      const proposal = projectProposal(repo.repoName, { collision: args.collision === "true" });
      output = projectConfirmation({ repo: repo.root, organization: args.organization, proposal });
      output.commands = args.organization ? gcloudPlan({ ...proposal, organization: args.organization }) : [];
    }
  }
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}
