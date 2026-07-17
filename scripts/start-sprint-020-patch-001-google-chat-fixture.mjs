#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = mkdtempSync(join(tmpdir(), "yasashii-google-chat-new-"));
const server = resolve(process.cwd(), "plugins/yasashii-secretary/skills/google-chat/scripts/wizard-server.mjs");
const port = process.argv[2] || "18783";
const child = spawn(process.execPath, [server, "--root", root, "--port", port], {
  stdio: "inherit",
  env: {
    ...process.env,
    YASASHII_GOOGLE_CHAT_SYNTHETIC: "1",
    YASASHII_GOOGLE_CHAT_TEST_PRIVATE: "1",
    YASASHII_GOOGLE_CHAT_TEST_SECRETS: "1",
    YASASHII_GOOGLE_CHAT_SKIP_GIT: "1",
  },
});

const cleanup = () => rmSync(root, { recursive: true, force: true });
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
child.on("exit", (code) => {
  cleanup();
  process.exit(code || 0);
});
