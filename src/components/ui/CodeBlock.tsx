"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import type { CodeBlockProps } from "@/types"
import { T } from "@/lib/tokens"
import { highlight } from "@/lib/highlight"

export function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{
      position: "relative",
      borderRadius: 0,
      background: `linear-gradient(180deg, ${T.code}, ${T.bg1})`,
      border: `1px solid rgba(232,224,208,0.08)`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.02)`,
      padding: "16px 18px",
      margin: "12px 0", fontFamily: "var(--font-mono)",
      fontSize: 12.5, lineHeight: 1.75, overflowX: "auto",
    }}>
      <button
        onClick={copy}
        style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(255,255,255,0.02)", border: `1px solid rgba(232,224,208,0.08)`,
          borderRadius: 999, padding: "5px 9px", cursor: "pointer",
          color: T.text2, fontFamily: "var(--font-mono)", fontSize: 10.5,
          letterSpacing: "0.08em", textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 4,
          transition: "all 0.15s",
        }}
      >
        {copied
          ? <><Check size={11} /><span>copied</span></>
          : <><Copy size={11} /><span>copy</span></>}
      </button>
      <code style={{ display: "block", whiteSpace: "pre" }}>{highlight(code)}</code>
    </div>
  )
}
