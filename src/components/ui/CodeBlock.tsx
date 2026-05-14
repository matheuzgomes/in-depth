"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Copy, Check } from "lucide-react"
import type { CodeBlockProps } from "@/types"
import { T } from "@/lib/tokens"
import { highlight } from "@/lib/highlight"

export function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const copy = () => {
    navigator.clipboard.writeText(code.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  useLayoutEffect(() => {
    const div = divRef.current
    const svg = svgRef.current
    if (!div || !svg) return

    let cancelled = false

    async function draw() {
      const s = svgRef.current
      if (!s) return
      const w = s.clientWidth
      const h = s.clientHeight
      if (w === 0 || h === 0) return

      while (s.firstChild) s.removeChild(s.firstChild)
      const rough = (await import("roughjs")).default
      if (cancelled) return
      const rc = rough.svg(s)
      const node = rc.rectangle(0, 0, w, h, {
        seed: 42,
        stroke: "rgba(26, 26, 26, 0.55)",
        strokeWidth: 3,
        fill: "rgba(26, 26, 26, 0.03)",
        fillStyle: "hachure",
        roughness: 2.0,
        bowing: 1.8,
      })
      if (node) {
        node.setAttribute("filter", "url(#softWobble)")
        s.appendChild(node)
      }
    }

    void draw()

    const ro = new ResizeObserver(() => { void draw() })
    ro.observe(div)

    return () => {
      cancelled = true
      ro.disconnect()
    }
  }, [code])

  return (
    <div ref={divRef} style={{
      position: "relative",
      borderRadius: 0,
      background: `linear-gradient(180deg, var(--cb-bg-start, ${T.code}), var(--cb-bg-end, ${T.bg1}))`,
      border: `var(--cb-border, 1px solid rgba(232,224,208,0.08))`,
      boxShadow: `var(--cb-shadow, inset 0 1px 0 rgba(255,255,255,0.02))`,
      margin: "var(--cb-margin, 12px 0)",
    }}>
      <svg ref={svgRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 1,
        }}
      />
      <div style={{
        overflowX: "auto",
        padding: "var(--cb-padding, 16px 18px)",
        fontSize: 15, lineHeight: 1.6,
      }}>
        <button
          onClick={copy}
          style={{
            position: "absolute", top: 10, right: 10,
            zIndex: 3,
            background: "var(--cb-btn-bg, rgba(255,255,255,0.02))", border: `var(--cb-btn-border, 1px solid rgba(232,224,208,0.08))`,
            borderRadius: 999, padding: "5px 9px", cursor: "pointer",
            color: "var(--cb-btn-color, " + T.text2 + ")", fontFamily: "var(--font-mono)", fontSize: 10.5,
            letterSpacing: "0.08em", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 4,
            transition: "all 0.15s",
          }}
        >
          {copied
            ? <><Check size={11} /><span>copied</span></>
            : <><Copy size={11} /><span>copy</span></>}
        </button>
        <code style={{ display: "block", whiteSpace: "pre", position: "relative", zIndex: 2, fontFamily: "var(--font-ui)" }}>{highlight(code)}</code>
      </div>
    </div>
  )
}
