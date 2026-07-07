#!/usr/bin/env bash
#
# path-guard.sh — スコープ封じ込めの共有ライブラリ
#
# 秘書の各ヘルパー（memory-tools.sh / workspace-tools.sh 等）が source して使う。
# 破壊的操作・書き込みは、対象の実解決先（symlink 完全解決後の正規化パス）が
# 与えられた境界（例: secretary/ や secretary/memory/）の内側にある場合のみ許可する。
# constraints.md「封じ込め（不変条件）」を単一の実装で担保する。
#
# 提供関数:
#   _realpath <path>          実解決先の物理絶対パスを返す（symlink 完全解決）
#   _safe_path <base> <rel>   base 配下に rel の実解決先が収まる安全な絶対パスを返す
#                             返り値: 0=安全（出力あり） / 1=範囲外・不正 rel / 2=親フォルダが無い

# 実解決先の物理絶対パスを返す（最終要素が存在しなくても親まで解決）。realpath 非依存。
_realpath() {
  p="$1"
  d="$(cd "$(dirname "$p")" 2>/dev/null && pwd -P)" || return 1
  b="$(basename "$p")"
  n=0
  while [ -L "$d/$b" ]; do
    n=$((n + 1)); [ "$n" -gt 40 ] && return 1
    link="$(readlink "$d/$b")"
    case "$link" in
      /*) d="$(cd "$(dirname "$link")" 2>/dev/null && pwd -P)" || return 1 ;;
      *)  d="$(cd "$d/$(dirname "$link")" 2>/dev/null && pwd -P)" || return 1 ;;
    esac
    b="$(basename "$link")"
  done
  printf '%s/%s' "$d" "$b"
}

# base（実在ディレクトリ）配下に rel の実解決先が収まる安全な絶対パスを標準出力に返す。
# symlink（対象自身・中間ディレクトリ）を解決してから境界判定するため、symlink 越えで外へ出られない。
_safe_path() {
  base="$1"; rel="$2"
  # 1) エッジ rel: 空・'.'・'..' は「対象未指定」として拒否（偽装成功させない）
  case "$rel" in
    ""|.|..) return 1 ;;
  esac
  # 2) '..' セグメントを含むパスは拒否（防御の第一線）
  case "/$rel/" in
    */../*) return 1 ;;
  esac
  cand="$base/$rel"
  b="$(basename "$cand")"
  case "$b" in .|..) return 1 ;; esac
  baseabs="$(cd "$base" 2>/dev/null && pwd -P)" || return 1
  # 3) 実解決先を求める（symlink 完全解決）
  if [ -e "$cand" ] || [ -L "$cand" ]; then
    real="$(_realpath "$cand")" || return 1
  else
    parentabs="$(cd "$(dirname "$cand")" 2>/dev/null && pwd -P)" || return 2
    real="$parentabs/$b"
  fi
  # 4) 実解決先が base 配下（base 自身は不可）であること。接頭辞衝突回避のため境界に '/' を付ける
  case "$real/" in
    "$baseabs"/) return 1 ;;
    "$baseabs"/*) : ;;
    *) return 1 ;;
  esac
  printf '%s' "$real"
  return 0
}
