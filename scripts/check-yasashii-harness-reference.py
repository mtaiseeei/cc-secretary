#!/usr/bin/env python3
"""Validate remote yasashii-harness repository and distribution manifests."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys


EXPECTED_REPO = "mtaiseeei/yasashii-harness"
EXPECTED_URL = "https://github.com/mtaiseeei/yasashii-harness"


def load(path: str) -> object:
    with Path(path).open(encoding="utf-8") as handle:
        return json.load(handle)


def json_path(value: object, path: str) -> object:
    if not path.startswith("$."):
        raise ValueError(f"unsupported JSON path: {path}")
    cursor = value
    for part in path[2:].split("."):
        while "[" in part:
            key, rest = part.split("[", 1)
            if key:
                cursor = cursor[key]
            index, part = rest.split("]", 1)
            cursor = cursor[int(index)]
        if part:
            cursor = cursor[part]
    return cursor


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-json", required=True)
    parser.add_argument("--claude-marketplace", required=True)
    parser.add_argument("--claude-plugin", required=True)
    parser.add_argument("--codex-marketplace", required=True)
    parser.add_argument("--codex-plugin", required=True)
    parser.add_argument("--metadata-overrides", required=True)
    args = parser.parse_args()

    try:
        repo = load(args.repo_json)
        claude_market = load(args.claude_marketplace)
        claude_plugin = load(args.claude_plugin)
        codex_market = load(args.codex_marketplace)
        codex_plugin = load(args.codex_plugin)
        overrides = load(args.metadata_overrides)
    except (OSError, json.JSONDecodeError) as error:
        print(f"REFERENCE_FAIL: unreadable JSON: {error}", file=sys.stderr)
        return 1

    errors: list[str] = []

    def expect(label: str, actual: object, expected: object) -> None:
        if actual != expected:
            errors.append(f"{label}: expected {expected!r}, got {actual!r}")

    try:
        expect("repo.full_name", repo.get("full_name"), EXPECTED_REPO)
        expect("repo.name", repo.get("name"), "yasashii-harness")
        expect("repo.owner.login", repo.get("owner", {}).get("login"), "mtaiseeei")
        expect("repo.private", repo.get("private"), False)
        expect("repo.fork", repo.get("fork"), False)

        expect("Claude marketplace name", claude_market.get("name"), "yasashii-harness")
        expect("Claude plugin entry name", claude_market["plugins"][0].get("name"), "harness")
        expect("Claude plugin entry source", claude_market["plugins"][0].get("source"), "./plugins/harness")
        expect("Claude plugin entry repository", claude_market["plugins"][0].get("repository"), EXPECTED_URL)
        expect("Claude plugin manifest name", claude_plugin.get("name"), "harness")
        expect("Claude plugin repository", claude_plugin.get("repository"), EXPECTED_URL)
        expect("Claude plugin homepage", claude_plugin.get("homepage"), EXPECTED_URL)

        expect("Codex marketplace name", codex_market.get("name"), "yasashii-harness")
        expect("Codex plugin entry name", codex_market["plugins"][0].get("name"), "harness")
        expect("Codex plugin entry source", codex_market["plugins"][0].get("source"), {
            "source": "local", "path": "./plugins/harness"
        })
        expect("Codex plugin manifest name", codex_plugin.get("name"), "harness")
        expect("Codex plugin repository", codex_plugin.get("repository"), EXPECTED_URL)
        expect("Codex plugin homepage", codex_plugin.get("homepage"), EXPECTED_URL)

        documents = {
            ".claude-plugin/marketplace.json": claude_market,
            ".agents/plugins/marketplace.json": codex_market,
            "plugins/harness/.claude-plugin/plugin.json": claude_plugin,
            "plugins/harness/.codex-plugin/plugin.json": codex_plugin,
        }
        expect("metadata overlay version", overrides.get("version"), 1)
        override_files = overrides.get("files")
        if not isinstance(override_files, dict):
            errors.append("metadata overlay files must be an object")
        else:
            expect("metadata overlay target set", set(override_files), set(documents))
            for filename, fields in override_files.items():
                if filename not in documents or not isinstance(fields, dict):
                    continue
                for field, expected in fields.items():
                    try:
                        actual = json_path(documents[filename], field)
                    except (KeyError, IndexError, TypeError, ValueError) as error:
                        errors.append(f"{filename} {field}: unreadable ({error})")
                    else:
                        expect(f"{filename} {field}", actual, expected)
    except (KeyError, IndexError, TypeError, AttributeError) as error:
        errors.append(f"required structure missing: {error}")

    if errors:
        print("REFERENCE_FAIL:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print("REFERENCE_OK repo=public,fork=false manifests=consistent metadata=exact")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
