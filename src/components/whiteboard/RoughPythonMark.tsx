"use client"

import { useEffect, useRef } from "react"

export function RoughPythonMark() {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function drawMark() {
      const svg = svgRef.current
      if (!svg) return

      while (svg.firstChild) {
        svg.removeChild(svg.firstChild)
      }

      const rough = (await import("roughjs")).default
      if (cancelled) return

      const rc = rough.svg(svg)
      const SEED = 42
      const BLUE_SHIFT_Y = 19.5
      const YELLOW_SHIFT_Y = -19.5

      const BLUE_BODY = `
        M 54.918 9.5
        C 42.295 9.5 43.242 14.808 43.242 14.808
        L 43.256 20.325 H 55.137 V 22 H 37.073
        C 37.073 22 29.5 21.071 29.5 33.819
        C 29.5 46.567 36.111 46.104 36.111 46.104
        H 40.393 V 40.358
        C 40.393 40.358 40.155 33.747 46.876 33.747
        H 58.672
        C 58.672 33.747 64.983 33.847 64.983 27.641
        V 15.936
        C 64.983 15.936 65.952 9.5 54.918 9.5
        Z
      `

      const YELLOW_BODY = `
        M 55.082 100.5
        C 67.705 100.5 66.758 95.192 66.758 95.192
        L 66.744 89.675 H 54.863 V 88 H 72.927
        C 72.927 88 80.5 88.929 80.5 76.181
        C 80.5 63.433 73.889 63.896 73.889 63.896
        H 69.607 V 69.642
        C 69.607 69.642 69.845 76.253 63.124 76.253
        H 51.328
        C 51.328 76.253 45.017 76.153 45.017 82.359
        V 94.064
        C 45.017 94.064 44.048 100.5 55.082 100.5
        Z
      `

      // Small icon tuning for better readability at header size.
      const baseOpts = {
        roughness: 1.8,
        bowing: 1.2,
        strokeWidth: 2.8,
        hachureAngle: -41,
        hachureGap: 4,
        fillWeight: 1.0,
      }

      const blueNode = rc.path(BLUE_BODY, {
        ...baseOpts,
        seed: SEED,
        fill: "#3776AB",
        stroke: "#2b5f8e",
        fillStyle: "hachure",
      })

      const yellowNode = rc.path(YELLOW_BODY, {
        ...baseOpts,
        seed: SEED + 1,
        fill: "#FFD43B",
        stroke: "#c8a800",
        fillStyle: "hachure",
      })

      const blueEyeNode = rc.circle(53.5, 16.5, 3.5, {
        seed: SEED + 2,
        roughness: 0.6,
        strokeWidth: 1.2,
        stroke: "#1a1a1a",
        fill: "#1a1a1a",
        fillStyle: "solid",
      })

      const yellowEyeNode = rc.circle(56.5, 93.5, 3.5, {
        seed: SEED + 3,
        roughness: 0.6,
        strokeWidth: 1.2,
        stroke: "#1a1a1a",
        fill: "#1a1a1a",
        fillStyle: "solid",
      })

      blueNode.setAttribute("transform", `translate(0 ${BLUE_SHIFT_Y})`)
      blueEyeNode.setAttribute("transform", `translate(0 ${BLUE_SHIFT_Y})`)
      yellowNode.setAttribute("transform", `translate(0 ${YELLOW_SHIFT_Y})`)
      yellowEyeNode.setAttribute("transform", `translate(0 ${YELLOW_SHIFT_Y})`)

      svg.appendChild(blueNode)
      svg.appendChild(yellowNode)
      svg.appendChild(blueEyeNode)
      svg.appendChild(yellowEyeNode)
    }

    void drawMark()

    return () => {
      cancelled = true
    }
  }, [])

  return <svg ref={svgRef} viewBox="18 4 74 102" role="presentation" />
}
