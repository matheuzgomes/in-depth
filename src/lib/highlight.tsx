"use client"

import type { ReactNode } from "react"
import { T } from "@/lib/tokens"

// ── Syntax token definitions ──────────────────────────────────────────────────
const TOKENS = [
  { re: /(#[^\n]*)/, cls: "cm" },
  { re: /\b(def|class|import|from|return|yield|async|await|with|as|for|in|if|elif|else|while|not|and|or|is|None|True|False|raise|try|except|finally|pass|lambda|global|nonlocal|del|assert|break|continue)\b/, cls: "kw" },
  { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, cls: "str" },
  { re: /\b(\d+(?:\.\d+)?)\b/, cls: "num" },
  { re: /\b([a-z_][a-z_0-9]*)\s*(?=\()/, cls: "fn" },
]

const TC: Record<string, string> = {
  cm:  "#4e4c5e",
  kw:  T.purple.fg,
  str: T.amber.fg,
  num: T.blue.fg,
  fn:  T.teal.fg,
}

export function highlightLine(line: string): ReactNode[] {
  const parts: ReactNode[] = []
  let rest = line, key = 0

  while (rest.length) {
    let best: { m: RegExpMatchArray; cls: string } | null = null
    let bi = Infinity

    for (const t of TOKENS) {
      const m = rest.match(t.re)
      if (m && m.index !== undefined && m.index < bi) {
        best = { m, cls: t.cls }
        bi = m.index
      }
    }

    if (!best) {
      parts.push(<span key={key++} style={{ color: "#c8c6d4" }}>{rest}</span>)
      break
    }
    if (bi > 0) parts.push(<span key={key++} style={{ color: "#c8c6d4" }}>{rest.slice(0, bi)}</span>)
    parts.push(<span key={key++} style={{ color: TC[best.cls] }}>{best.m[0]}</span>)
    rest = rest.slice(bi + best.m[0].length)
  }

  return parts
}

/** Syntax-highlights Python code and returns an array of React nodes */
export function highlight(code: string): ReactNode[] {
  return code.trim().split("\n").map((line, li) => (
    <div key={li} style={{ minHeight: "1.6em" }}>
      {highlightLine(line)}
    </div>
  ))
}
