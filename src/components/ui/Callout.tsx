"use client"

import { Lightbulb, AlertTriangle, Info } from "lucide-react"
import type { CalloutProps } from "@/types"
import { T } from "@/lib/tokens"

const CALLOUT_CFG = {
  tip:  { bg: T.teal.bg,  border: T.teal.accent,  color: T.teal.fg,  Icon: Lightbulb },
  warn: { bg: T.amber.bg, border: T.amber.accent, color: T.amber.fg, Icon: AlertTriangle },
  info: { bg: T.blue.bg,  border: T.blue.accent,  color: T.blue.fg,  Icon: Info },
}

export function Callout({ type = "tip", children }: CalloutProps) {
  const cfg = CALLOUT_CFG[type]
  return (
    <div style={{
      borderRadius: "var(--callout-radius, 10px)",
      padding: "var(--callout-padding, 14px 16px)",
      margin: "16px 0",
      fontSize: "var(--callout-size, 13.4px)",
      lineHeight: "var(--callout-line-height, 1.78)",
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      background: `var(--callout-bg, ${cfg.bg})`,
      border: `var(--callout-border-width, 1px) solid var(--callout-border, ${cfg.border}55)`,
      color: `var(--callout-ink, ${cfg.color})`,
      boxShadow: "var(--callout-shadow, none)",
    }}>
      <cfg.Icon size={15} style={{ flexShrink: 0, marginTop: 2.5 }} />
      <span style={{ color: "inherit" }}>{children}</span>
    </div>
  )
}
