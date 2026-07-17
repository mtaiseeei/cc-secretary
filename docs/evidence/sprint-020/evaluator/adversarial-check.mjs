#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { createGoogleChatClient } from "../../../../plugins/yasashii-secretary/skills/google-chat/scripts/client.mjs";
import { applyGoogleChatConfig } from "../../../../plugins/yasashii-secretary/skills/google-chat/scripts/config-transaction.mjs";

const repo = resolve(import.meta.dirname, "../../../..");
const roots = [];
let failed = 0;

function temp(prefix) {
  const root = mkdtempSync(join(tmpdir(), prefix));
  roots.push(root);
  return root;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: "utf8", ...options });
}

function check(condition, label, detail = "") {
  process.stdout.write(`${condition ? "PASS" : "FAIL"} ${label}${detail ? `: ${detail}` : ""}\n`);
  if (!condition) failed += 1;
}

try {
  const local = temp("yasashii-gchat-staged-local-");
  const remote = temp("yasashii-gchat-staged-remote-");
  run("git", ["init", "--bare", remote]);
  run("git", ["init", "-b", "main"], { cwd: local });
  run("git", ["config", "user.name", "Evaluator"], { cwd: local });
  run("git", ["config", "user.email", "evaluator@example.invalid"], { cwd: local });
  writeFileSync(join(local, "README.md"), "fixture\n");
  run("git", ["add", "README.md"], { cwd: local });
  run("git", ["commit", "-m", "初期化"], { cwd: local });
  run("git", ["remote", "add", "origin", remote], { cwd: local });
  run("git", ["push", "-u", "origin", "main"], { cwd: local });
  writeFileSync(join(local, "利用者の下書き.md"), "設定変更とは無関係な下書き\n");
  run("git", ["add", "利用者の下書き.md"], { cwd: local });

  const oldPrivate = process.env.YASASHII_GOOGLE_CHAT_TEST_PRIVATE;
  const oldSecrets = process.env.YASASHII_GOOGLE_CHAT_TEST_SECRETS;
  process.env.YASASHII_GOOGLE_CHAT_TEST_PRIVATE = "1";
  process.env.YASASHII_GOOGLE_CHAT_TEST_SECRETS = "1";
  await applyGoogleChatConfig({
    root: local,
    selectedSpaces: [{ name: "spaces/AAA", displayName: "評価用", spaceType: "SPACE" }],
    interval: "3h",
    automaticPushConsent: true,
    commitPushConsent: true,
  });
  if (oldPrivate === undefined) delete process.env.YASASHII_GOOGLE_CHAT_TEST_PRIVATE;
  else process.env.YASASHII_GOOGLE_CHAT_TEST_PRIVATE = oldPrivate;
  if (oldSecrets === undefined) delete process.env.YASASHII_GOOGLE_CHAT_TEST_SECRETS;
  else process.env.YASASHII_GOOGLE_CHAT_TEST_SECRETS = oldSecrets;

  const committed = run("git", ["show", "--pretty=", "--name-only", "HEAD"], { cwd: local }).trim().split("\n");
  check(!committed.includes("利用者の下書き.md"), "設定commitへ同意対象外の既存staged fileを含めない", committed.join(","));

  const apiClient = createGoogleChatClient({
    accessToken: "synthetic",
    fetchImpl: async () => new Response(JSON.stringify({ error: { status: "PERMISSION_DENIED", message: "Google Chat API is disabled for this project" } }), { status: 403 }),
  });
  let apiCode = null;
  try { await apiClient.getSpace("spaces/AAA"); } catch (error) { apiCode = error.code; }
  check(apiCode === "api-disabled", "403 API無効を管理者blockと分ける", String(apiCode));

  const flow = temp("yasashii-gchat-stale-run-");
  mkdirSync(join(flow, "bin"), { recursive: true });
  mkdirSync(join(flow, "google-chat", "history", "評価用--AAA"), { recursive: true });
  const fakeGit = join(flow, "bin", "git");
  const fakeGh = join(flow, "bin", "gh");
  writeFileSync(fakeGit, `#!/bin/sh
if [ "$1" = "pull" ]; then
  count_file="$FAKE_FLOW_ROOT/pull-count"
  count=0
  [ -f "$count_file" ] && count=$(cat "$count_file")
  count=$((count + 1))
  printf '%s' "$count" > "$count_file"
  if [ "$count" -ge 2 ]; then
    printf '# 評価用 - 2026-07-17\n\n新しい実行を待っていないのに見つかった語\n' > "$FAKE_FLOW_ROOT/google-chat/history/評価用--AAA/2026-07-17.md"
  fi
fi
exit 0
`);
  writeFileSync(fakeGh, `#!/bin/sh
if [ "$1 $2" = "workflow run" ]; then exit 0; fi
if [ "$1 $2" = "run list" ]; then echo '[{"databaseId":7,"status":"completed","conclusion":"success"}]'; exit 0; fi
if [ "$1 $2" = "run watch" ] && [ "$3" = "7" ]; then exit 0; fi
exit 1
`);
  chmodSync(fakeGit, 0o755);
  chmodSync(fakeGh, 0o755);
  const searchFlow = join(repo, "plugins/yasashii-secretary/skills/google-chat/scripts/search-flow.mjs");
  const stale = JSON.parse(run(process.execPath, [searchFlow, "--root", flow, "--query", "新しい実行を待っていないのに見つかった語", "--choice", "sync"], {
    env: { ...process.env, YASASHII_GIT_BIN: fakeGit, YASASHII_GH_BIN: fakeGh, FAKE_FLOW_ROOT: flow },
  }));
  check(stale.status !== "found", "dispatch後に新規runが現れない場合は過去runを成功扱いしない", `${stale.status}; ${stale.events.join(",")}`);
} finally {
  for (const root of roots.reverse()) rmSync(root, { recursive: true, force: true });
}

process.stdout.write(`ADVERSARIAL_FAIL=${failed}\n`);
process.exitCode = failed === 0 ? 0 : 1;
