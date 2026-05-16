"use client"

import { useLayoutEffect, useRef } from "react"

export function RoughOverlay({
  stroke = "rgba(26, 26, 26, 0.25)",
  fill = "rgba(26, 26, 26, 0.03)",
}: {
  stroke?: string
  fill?: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const parent = svg.parentElement
    if (!parent) return

    let cancelled = false

    async function draw() {
      const s = svgRef.current
      if (!s) return
      const p = s.parentElement
      if (!p) return
      const w = p.offsetWidth
      const h = p.offsetHeight
      if (w === 0 || h === 0) return

      while (s.firstChild) s.removeChild(s.firstChild)
      const rough = (await import("roughjs")).default
      if (cancelled) return
      const rc = rough.svg(s)
      const node = rc.rectangle(0, 0, w, h, {
        seed: 42,
        stroke,
        strokeWidth: 2.5,
        fill,
        fillStyle: "hachure",
        roughness: 1.8,
        bowing: 1.6,
      })
      if (node) s.appendChild(node)
    }

    void draw()

    const ro = new ResizeObserver(() => { void draw() })
    ro.observe(parent)

    return () => {
      cancelled = true
      ro.disconnect()
    }
  }, [stroke, fill])

  return (
    <svg
      ref={svgRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        opacity: 1,
      }}
      aria-hidden="true"
    />
  )
}
