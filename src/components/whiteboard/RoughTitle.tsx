"use client"

import { useEffect, useRef } from "react"

const TITLE_COLOR = "#1a2e6e"

export function RoughTitle() {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function draw() {
      const svg = svgRef.current
      if (!svg) return

      while (svg.firstChild) {
        svg.removeChild(svg.firstChild)
      }

      const rough = (await import("roughjs")).default
      if (cancelled) return

      const rc = rough.svg(svg)

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
      text.setAttribute("x", "250")
      text.setAttribute("y", "72")
      text.setAttribute("fill", TITLE_COLOR)
      text.setAttribute("font-size", "64")
      text.setAttribute("font-family", "var(--font-board-display)")
      text.setAttribute("text-anchor", "middle")
      text.setAttribute("filter", "url(#wobble)")
      text.textContent = "Python in Depth"
      svg.appendChild(text)

      const underline = rc.path(
        "M 42 84 C 90 76, 140 94, 190 82 C 220 74, 250 90, 280 82 C 310 74, 360 92, 410 80 C 440 74, 463 84, 470 88",
        {
          seed: 42,
          stroke: TITLE_COLOR,
          strokeWidth: 2.8,
          fill: "none",
          roughness: 1.6,
          bowing: 1.5,
        },
      )
      svg.appendChild(underline)
    }

    void draw()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 500 110"
      className="whiteboard-rough-title"
      aria-hidden="true"
      style={{ width: "100%", display: "block" }}
    />
  )
}
