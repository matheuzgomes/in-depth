"use client"

import type { BenchBarProps } from "@/types"
import { T } from "@/lib/tokens"

export function BenchBar({ label, value, max, display, color = "teal" }: BenchBarProps) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="book-bench">
      <div className="book-bench-row">
        <span>{label}</span>
        <span style={{ fontWeight: 500, color: T.text1, fontFamily: "var(--font-mono)" }}>{display}</span>
      </div>
      <div className="book-bench-track">
        <div
          className="book-bench-fill"
          style={{
            color: T[color].accent,
            width: `${pct}%`,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  )
}
