"use client"

import type { BadgeProps } from "@/types"
import { T } from "@/lib/tokens"

export function Badge({ label, color = "purple" }: BadgeProps) {
  const c = T[color]
  return (
    <span style={{
      fontSize: 10.5,
      padding: "4px 10px",
      borderRadius: 999,
      fontWeight: 600,
      background: c.bg,
      color: c.fg,
      border: `1px solid ${c.accent}38`,
      whiteSpace: "nowrap",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      fontFamily: "var(--font-display)",
    }}>
      {label}
    </span>
  )
}
