"use client"

import { useEffect, useMemo, useRef } from "react"
import type { WhiteboardTopic, WhiteboardVisualKind } from "@/data/whiteboard"

const MARKER_COLORS = {
  navy: "#1a2e6e",
  red: "#c0392b",
  green: "#1a7a4a",
  purple: "#6c3483",
  black: "#1a1a1a",
} as const

type DiagramBox = {
  type: "box"
  x: number
  y: number
  w: number
  h: number
  label: string
  color?: string
  small?: boolean
}

type DiagramArrow = {
  type: "arrow"
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
}

type DiagramNote = {
  type: "note"
  x: number
  y: number
  text: string
  color?: string
}

type DiagramEllipse = {
  type: "ellipse"
  cx: number
  cy: number
  rx: number
  ry: number
  label?: string
  color?: string
}

type DiagramHighlight = {
  type: "highlight"
  x: number
  y: number
  w: number
  h: number
  color?: string
}

type DiagramText = {
  type: "text"
  x: number
  y: number
  text: string
  small?: boolean
  color?: string
}

type DiagramElement = DiagramBox | DiagramArrow | DiagramNote | DiagramEllipse | DiagramHighlight | DiagramText

interface DiagramDefinition {
  elements: DiagramElement[]
}

const TITLE_COLOR = MARKER_COLORS.navy
const ACCENT_COLOR = MARKER_COLORS.red
const GOOD_COLOR = MARKER_COLORS.green
const ALT_COLOR = MARKER_COLORS.purple

export function RoughVisualDiagram({ topic }: { topic: WhiteboardTopic }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const definition = useMemo(() => getDiagramDefinition(topic.visualKind), [topic.visualKind])

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
      const titleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
      const title = document.createElementNS("http://www.w3.org/2000/svg", "text")
      title.setAttribute("x", "26")
      title.setAttribute("y", "32")
      title.setAttribute("fill", TITLE_COLOR)
      title.setAttribute("font-size", "22")
      title.setAttribute("font-family", "var(--font-board-display)")
      title.textContent = topic.title
      titleGroup.appendChild(title)
      titleGroup.appendChild(rc.path("M26 40 C 120 32, 188 48, 310 38 C 410 32, 516 46, 594 38", {
        seed: 31,
        stroke: TITLE_COLOR,
        strokeWidth: 2.2,
        fill: "none",
        roughness: 1.3,
        bowing: 1.2,
      }))
      svg.appendChild(titleGroup)

      switch (topic.visualKind) {
        case "slice-window": renderSliceWindowDiagram(rc, svg); break
        case "match-flow": renderMatchFlowDiagram(rc, svg); break
        case "alias-graph": renderAliasGraphDiagram(rc, svg); break
        case "signature-map": renderSignatureMapDiagram(rc, svg); break
        case "shared-default": renderSharedDefaultDiagram(rc, svg); break
        case "closure-scope": renderClosureScopeDiagram(rc, svg); break
        case "type-boundary": renderTypeBoundaryDiagram(rc, svg); break
        case "bytecode-stream": renderBytecodeStreamDiagram(rc, svg); break
        case "protocol-grid": renderProtocolGridDiagram(rc, svg); break
        case "refcount-flow": renderRefcountFlowDiagram(rc, svg); break
        case "hash-probe": renderHashProbeDiagram(rc, svg); break
        case "grouping-buckets": renderGroupingBucketsDiagram(rc, svg); break
        case "set-algebra": renderSetAlgebraDiagram(rc, svg); break
        case "container-matrix": renderContainerMatrixDiagram(rc, svg); break
        case "storage-tracks": renderStorageTracksDiagram(rc, svg); break
        case "tuple-layout": renderTupleLayoutDiagram(rc, svg); break
        case "stream-pipeline": renderStreamPipelineDiagram(rc, svg); break
        case "record-choices": renderRecordChoicesDiagram(rc, svg); break
        case "field-generation": renderFieldGenerationDiagram(rc, svg); break
        case "gil-threads": renderGilThreadsDiagram(rc, svg); break
        case "event-loop": renderEventLoopDiagram(rc, svg); break
        case "backpressure-flow": renderBackpressureFlowDiagram(rc, svg); break
        case "server-pipeline": renderServerPipelineDiagram(rc, svg); break
        case "async-stream": renderAsyncStreamDiagram(rc, svg); break
        case "async-boundary": renderAsyncBoundaryDiagram(rc, svg); break
        case "task-tree": renderTaskTreeDiagram(rc, svg); break
        case "log-pipeline": renderLogPipelineDiagram(rc, svg); break
        default:
          definition.elements.forEach((element, index) => {
            const node = renderElement(rc, element, index)
            if (!node) return
            if (Array.isArray(node)) {
              node.forEach((entry) => svg.appendChild(entry))
              return
            }
            svg.appendChild(node)
          })
      }
    }

    void draw()
    return () => {
      cancelled = true
    }
  }, [definition, topic.title, topic.visualKind])

  return <svg ref={svgRef} viewBox="0 0 620 300" className="whiteboard-visual-svg" aria-hidden="true" />
}

function renderElement(
  rc: ReturnType<NonNullable<(typeof import("roughjs"))["default"]>["svg"]>,
  element: DiagramElement,
  index: number,
) {
  const seed = 101 + index * 5
  const color = element.color ?? TITLE_COLOR

  if (element.type === "box") {
    const rect = rc.rectangle(element.x, element.y, element.w, element.h, {
      seed,
      stroke: color,
      strokeWidth: 2,
      fill: "rgba(255,255,255,0)",
      roughness: 1.15,
      bowing: 1.1,
    })
    const label = createText(
      element.x + 10,
      element.y + element.h / 2 + 5,
      element.label,
      element.small ? 12.5 : 14,
      MARKER_COLORS.black,
      "var(--font-board-body)",
    )
    return [rect, label]
  }

  if (element.type === "arrow") {
    const midX = (element.x1 + element.x2) / 2
    const line = rc.path(`M ${element.x1} ${element.y1} C ${midX} ${element.y1}, ${midX} ${element.y2}, ${element.x2 - 14} ${element.y2}`, {
      seed,
      stroke: color,
      strokeWidth: 2.4,
      fill: "none",
      roughness: 1.2,
      bowing: 1.35,
    })
    const head = rc.path(`M ${element.x2 - 20} ${element.y2 - 8} L ${element.x2} ${element.y2} L ${element.x2 - 20} ${element.y2 + 8}`, {
      seed: seed + 1,
      stroke: color,
      strokeWidth: 2.4,
      fill: "none",
      roughness: 1.1,
      bowing: 1.1,
    })
    return [line, head]
  }

  if (element.type === "note") {
    return createText(element.x, element.y, element.text, 17, color, "var(--font-board-display)")
  }

  if (element.type === "ellipse") {
    const shape = rc.ellipse(element.cx, element.cy, element.rx * 2, element.ry * 2, {
      seed,
      stroke: color,
      strokeWidth: 2,
      fill: "none",
      roughness: 1.25,
      bowing: 1.3,
    })
    if (!element.label) return shape
    const label = createText(element.cx - element.label.length * 3.1, element.cy + 4, element.label, 13.5, MARKER_COLORS.black, "var(--font-board-body)")
    return [shape, label]
  }

  if (element.type === "highlight") {
    return rc.rectangle(element.x, element.y, element.w, element.h, {
      seed,
      stroke: color,
      strokeWidth: 2.5,
      fill: "none",
      roughness: 1.5,
      bowing: 1.4,
    })
  }

  return createText(
    element.x,
    element.y,
    element.text,
    element.small ? 12.5 : 14,
    element.color ?? MARKER_COLORS.black,
    "var(--font-board-body)",
  )
}

function createText(x: number, y: number, text: string, size: number, fill: string, family: string) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "text")
  node.setAttribute("x", String(x))
  node.setAttribute("y", String(y))
  node.setAttribute("fill", fill)
  node.setAttribute("font-size", String(size))
  node.setAttribute("font-family", family)
  node.textContent = text
  return node
}

function createAnchoredText(
  x: number,
  y: number,
  text: string,
  size: number,
  fill: string,
  family = "var(--font-board-body)",
  anchor: "start" | "middle" | "end" = "start",
) {
  const node = createText(x, y, text, size, fill, family)
  node.setAttribute("text-anchor", anchor)
  return node
}

function appendNodes(svg: SVGSVGElement, nodes: SVGElement | SVGElement[]) {
  if (Array.isArray(nodes)) {
    nodes.forEach((node) => svg.appendChild(node))
    return
  }
  svg.appendChild(nodes)
}

function createArrowHead(
  rc: ReturnType<NonNullable<(typeof import("roughjs"))["default"]>["svg"]>,
  x: number,
  y: number,
  direction: "down" | "right-down" | "right" | "up",
  color: string,
  seed: number,
) {
  const path = direction === "down"
    ? `M ${x - 8} ${y - 13} L ${x} ${y} L ${x + 8} ${y - 13}`
    : direction === "right"
    ? `M ${x - 13} ${y - 7} L ${x} ${y} L ${x - 13} ${y + 7}`
    : direction === "up"
    ? `M ${x - 8} ${y + 13} L ${x} ${y} L ${x + 8} ${y + 13}`
    : `M ${x - 15} ${y - 5} L ${x} ${y} L ${x - 5} ${y - 15}`

  return rc.path(path, {
    seed,
    stroke: color,
    strokeWidth: 2.4,
    fill: "none",
    roughness: 1.1,
    bowing: 1.1,
  })
}

function renderSliceWindowDiagram(
  rc: ReturnType<NonNullable<(typeof import("roughjs"))["default"]>["svg"]>,
  svg: SVGSVGElement,
) {
  const sourceX = 58
  const sourceY = 104
  const cellW = 66
  const cellH = 44
  const indexY = sourceY + cellH + 18
  const values = ["10", "20", "30", "40", "50", "60"]
  const selected = new Set([2, 3, 4])

  appendNodes(svg, createAnchoredText(58, 80, "source list", 18, TITLE_COLOR, "var(--font-board-display)"))
  appendNodes(svg, createAnchoredText(494, 80, "items[2:5]", 24, ACCENT_COLOR, "var(--font-board-display)", "middle"))

  appendNodes(svg, rc.rectangle(sourceX - 12, sourceY - 18, values.length * cellW + 24, cellH + 50, {
    seed: 211,
    stroke: TITLE_COLOR,
    strokeWidth: 2.1,
    fill: "rgba(255, 255, 255, 0)",
    roughness: 1.25,
    bowing: 1.2,
  }))

  values.forEach((value, index) => {
    const x = sourceX + index * cellW
    appendNodes(svg, rc.rectangle(x, sourceY, cellW, cellH, {
      seed: 220 + index,
      stroke: selected.has(index) ? ACCENT_COLOR : TITLE_COLOR,
      strokeWidth: selected.has(index) ? 2.7 : 1.8,
      fill: selected.has(index) ? "rgba(255, 241, 118, 0.34)" : "rgba(255, 255, 255, 0)",
      fillStyle: "hachure",
      hachureAngle: -12,
      hachureGap: 7,
      roughness: 1.1,
      bowing: 1.05,
    }))
    appendNodes(svg, createAnchoredText(x + cellW / 2, sourceY + 30, value, 17, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
    appendNodes(svg, createAnchoredText(x, indexY, String(index), 13, TITLE_COLOR, "var(--font-board-body)", "middle"))
  })

  appendNodes(svg, createAnchoredText(sourceX + values.length * cellW, indexY, String(values.length), 13, TITLE_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(sourceX, sourceY + cellH + 43, "boundary indexes", 13, TITLE_COLOR, "var(--font-board-body)"))

  const startX = sourceX + 2 * cellW
  const stopX = sourceX + 5 * cellW
  const arrowY = sourceY - 34

  appendNodes(svg, rc.path(`M ${startX} ${arrowY} C ${startX - 22} ${arrowY + 16}, ${startX - 6} ${sourceY - 10}, ${startX} ${sourceY}`, {
    seed: 260,
    stroke: GOOD_COLOR,
    strokeWidth: 2.3,
    fill: "none",
    roughness: 1.25,
    bowing: 1.2,
  }))
  appendNodes(svg, createArrowHead(rc, startX, sourceY, "down", GOOD_COLOR, 262))
  appendNodes(svg, createAnchoredText(startX - 14, arrowY - 6, "start = 2", 17, GOOD_COLOR, "var(--font-board-display)", "middle"))

  appendNodes(svg, rc.path(`M ${stopX} ${arrowY} C ${stopX + 24} ${arrowY + 16}, ${stopX + 6} ${sourceY - 10}, ${stopX} ${sourceY}`, {
    seed: 261,
    stroke: ACCENT_COLOR,
    strokeWidth: 2.3,
    fill: "none",
    roughness: 1.25,
    bowing: 1.2,
  }))
  appendNodes(svg, createArrowHead(rc, stopX, sourceY, "down", ACCENT_COLOR, 263))
  appendNodes(svg, createAnchoredText(stopX + 28, arrowY - 6, "stop = 5", 17, ACCENT_COLOR, "var(--font-board-display)", "middle"))

  appendNodes(svg, rc.rectangle(startX + 2, sourceY - 7, stopX - startX - 4, cellH + 14, {
    seed: 271,
    stroke: ACCENT_COLOR,
    strokeWidth: 2.8,
    fill: "none",
    roughness: 1.5,
    bowing: 1.35,
  }))

  appendNodes(svg, createAnchoredText(498, sourceY + 22, "stop boundary", 14, ACCENT_COLOR, "var(--font-board-display)"))
  appendNodes(svg, createAnchoredText(498, sourceY + 41, "not copied", 14, ACCENT_COLOR, "var(--font-board-display)"))
  appendNodes(svg, createAnchoredText(58, sourceY + cellH + 66, "copied: positions 2-4", 16, ACCENT_COLOR, "var(--font-board-display)"))

  const resultX = 176
  const resultY = 238
  appendNodes(svg, rc.path(`M ${startX + 94} ${sourceY + cellH + 34} C ${startX + 118} 208, ${resultX + 110} 208, ${resultX + 136} ${resultY - 10}`, {
    seed: 280,
    stroke: GOOD_COLOR,
    strokeWidth: 2.5,
    fill: "none",
    roughness: 1.2,
    bowing: 1.3,
  }))
  appendNodes(svg, createArrowHead(rc, resultX + 136, resultY - 10, "right-down", GOOD_COLOR, 281))
  appendNodes(svg, createAnchoredText(462, resultY + 26, "new list object", 18, GOOD_COLOR, "var(--font-board-display)", "middle"))

  ;["30", "40", "50"].forEach((value, index) => {
    const x = resultX + index * cellW
    appendNodes(svg, rc.rectangle(x, resultY, cellW, 38, {
      seed: 290 + index,
      stroke: GOOD_COLOR,
      strokeWidth: 2.1,
      fill: "rgba(209, 250, 229, 0.32)",
      fillStyle: "hachure",
      hachureAngle: 18,
      hachureGap: 7,
      roughness: 1.1,
      bowing: 1.05,
    }))
    appendNodes(svg, createAnchoredText(x + cellW / 2, resultY + 25, value, 16, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  })
}

type RoughSVG = ReturnType<NonNullable<(typeof import("roughjs"))["default"]>["svg"]>

function renderMatchFlowDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(36, 82, 112, 48, { seed: 310, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(36, 58, "subject", 18, TITLE_COLOR, "var(--font-board-display)"))
  appendNodes(svg, createAnchoredText(92, 110, "msg", 14, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 148 106 C 162 106, 188 82, 210 82", { seed: 311, stroke: ACCENT_COLOR, strokeWidth: 2.2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 210, 82, "right", ACCENT_COLOR, 312))
  appendNodes(svg, createAnchoredText(178, 100, "tried in order", 11, ACCENT_COLOR, "var(--font-board-display)", "middle"))
  const cases = [
    { y: 62, label: 'case ["push", name, value]', color: GOOD_COLOR, fill: "rgba(209, 250, 229, 0.25)", hachure: true },
    { y: 110, label: 'case ["quit"]', color: TITLE_COLOR, fill: "rgba(255,255,255,0)", hachure: false },
    { y: 158, label: "case _", color: ALT_COLOR, fill: "rgba(255,255,255,0)", hachure: false },
  ]
  cases.forEach((c, i) => {
    const opts: Record<string, unknown> = { seed: 313 + i, stroke: c.color, strokeWidth: c.hachure ? 2.4 : 2, fill: c.fill, roughness: 1.15, bowing: 1.05 }
    if (c.hachure) { opts.fillStyle = "hachure"; opts.hachureAngle = -12; opts.hachureGap = 8 }
    appendNodes(svg, rc.rectangle(210, c.y, 196, 40, opts))
    appendNodes(svg, createAnchoredText(308, c.y + 26, c.label, 12, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  })
  appendNodes(svg, rc.path("M 406 82 C 434 82, 452 90, 476 96", { seed: 316, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 476, 96, "right", GOOD_COLOR, 317))
  appendNodes(svg, createAnchoredText(486, 100, "match", 18, GOOD_COLOR, "var(--font-board-display)"))
  appendNodes(svg, createAnchoredText(308, 218, "guards run after pattern matches", 11, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderAliasGraphDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(50, 98, 64, 40, { seed: 320, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(50, 78, "names", 18, TITLE_COLOR, "var(--font-board-display)"))
  appendNodes(svg, createAnchoredText(82, 122, "a", 15, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(50, 158, 64, 40, { seed: 321, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(82, 182, "b", 15, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(250, 110, 155, 70, { seed: 322, stroke: GOOD_COLOR, strokeWidth: 2.4, fill: "rgba(209, 250, 229, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(327, 149, "list object", 14, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 114 118 C 160 118, 180 136, 244 134", { seed: 323, stroke: ACCENT_COLOR, strokeWidth: 2.3, fill: "none", roughness: 1.2, bowing: 1.35 }))
  appendNodes(svg, createArrowHead(rc, 244, 134, "right", ACCENT_COLOR, 324))
  appendNodes(svg, rc.path("M 114 178 C 160 178, 180 162, 244 160", { seed: 325, stroke: ACCENT_COLOR, strokeWidth: 2.3, fill: "none", roughness: 1.2, bowing: 1.35 }))
  appendNodes(svg, createArrowHead(rc, 244, 160, "right", ACCENT_COLOR, 326))
  appendNodes(svg, createAnchoredText(460, 112, "same object", 17, ACCENT_COLOR, "var(--font-board-display)"))
  appendNodes(svg, rc.path("M 458 128 C 478 134, 458 140, 442 146", { seed: 327, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "none", roughness: 1.1, bowing: 1.2 }))
  appendNodes(svg, createArrowHead(rc, 442, 146, "right", ACCENT_COLOR, 328))
  appendNodes(svg, createAnchoredText(400, 162, "a is b  (True)", 12, ALT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(400, 180, "a == b (True)", 12, ALT_COLOR, "var(--font-board-body)"))
}

function renderSignatureMapDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(36, 56, 544, 48, { seed: 330, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(308, 66, "connect(", 18, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(130, 66, "host", 18, GOOD_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(218, 66, ", /,", 14, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(302, 66, "port", 18, TITLE_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(372, 66, ", *,", 14, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(438, 66, "timeout", 18, ACCENT_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(519, 66, ", ssl)", 14, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 130 104 L 130 120", { seed: 331, stroke: GOOD_COLOR, strokeWidth: 2, fill: "none", roughness: 1.1, bowing: 1.1 }))
  appendNodes(svg, createArrowHead(rc, 130, 120, "down", GOOD_COLOR, 332))
  appendNodes(svg, rc.rectangle(72, 124, 138, 44, { seed: 333, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "rgba(209, 250, 229, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(141, 150, "positional-only", 13, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 300 104 L 300 120", { seed: 334, stroke: TITLE_COLOR, strokeWidth: 2, fill: "none", roughness: 1.1, bowing: 1.1 }))
  appendNodes(svg, createArrowHead(rc, 300, 120, "down", TITLE_COLOR, 335))
  appendNodes(svg, rc.rectangle(238, 124, 138, 44, { seed: 336, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(307, 150, "positional-or-kw", 13, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 450 104 L 450 120", { seed: 337, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.1, bowing: 1.1 }))
  appendNodes(svg, createArrowHead(rc, 450, 120, "down", ACCENT_COLOR, 338))
  appendNodes(svg, rc.rectangle(400, 124, 138, 44, { seed: 339, stroke: ACCENT_COLOR, strokeWidth: 2.2, fill: "rgba(255, 241, 118, 0.2)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(469, 150, "keyword-only", 13, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(308, 194, "/  and  *   are syntax markers in the signature", 13, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderSharedDefaultDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(30, 60, 150, 52, { seed: 340, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(105, 71, "def f(x=[]):", 14, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(105, 91, 'print(x)', 14, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(28, 38, "defined once", 16, TITLE_COLOR, "var(--font-board-display)"))
  const calls = ["f()  # 1st", "f()  # 2nd", "f()  # 3rd"]
  calls.forEach((label, i) => {
    appendNodes(svg, rc.rectangle(286, 52 + i * 42, 94, 32, { seed: 341 + i, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "rgba(255, 241, 118, 0.2)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(333, 72 + i * 42, label, 11, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  })
  appendNodes(svg, rc.rectangle(124, 86, 116, 52, { seed: 344, stroke: ACCENT_COLOR, strokeWidth: 2.4, fill: "rgba(255, 241, 118, 0.3)", fillStyle: "hachure", hachureAngle: 18, hachureGap: 7, roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(182, 116, "shared [ ]", 13, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 180 86 C 198 74, 220 66, 250 68", { seed: 345, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 250, 68, "right", ACCENT_COLOR, 346))
  appendNodes(svg, rc.path("M 240 98 C 250 94, 260 92, 270 92", { seed: 347, stroke: TITLE_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 270, 92, "right", TITLE_COLOR, 348))
  appendNodes(svg, rc.path("M 240 134 C 250 134, 260 134, 270 134", { seed: 349, stroke: TITLE_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 270, 134, "right", TITLE_COLOR, 350))
  appendNodes(svg, rc.rectangle(280, 190, 238, 44, { seed: 351, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "rgba(209, 250, 229, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(399, 216, "fix: None sentinel + fresh list per call", 13, GOOD_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(290, 252, "default evaluated at definition-time, not call-time", 12, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderClosureScopeDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(40, 84, 148, 78, { seed: 360, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(114, 102, "outer scope", 13, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(60, 130, "x = 10", 13, ACCENT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, rc.ellipse(88, 148, 24, 14, { seed: 361, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "rgba(255, 241, 118, 0.3)", roughness: 1.2, bowing: 1.2 }))
  appendNodes(svg, createAnchoredText(88, 150, "cell", 10, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(260, 84, 166, 78, { seed: 362, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "rgba(209, 250, 229, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(343, 98, "wrapper/closure", 13, GOOD_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(274, 118, "def inner():", 12, MARKER_COLORS.black, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(274, 136, "print(x)", 12, ACCENT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, rc.path("M 188 118 C 212 118, 230 118, 254 118", { seed: 363, stroke: TITLE_COLOR, strokeWidth: 2.2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 254, 118, "right", TITLE_COLOR, 364))
  appendNodes(svg, rc.rectangle(82, 196, 130, 36, { seed: 365, stroke: ALT_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(147, 216, "x lives in a cell object", 11, ALT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(282, 196, 130, 36, { seed: 366, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(347, 216, "wraps(fn)", 12, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 212 214 C 240 214, 256 214, 278 214", { seed: 367, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 278, 214, "right", ACCENT_COLOR, 368))
  appendNodes(svg, createAnchoredText(300, 256, "free vars stored in cells, loaded via closure opcodes", 11, ALT_COLOR, "var(--font-board-body)", "middle"))
}

function renderTypeBoundaryDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(56, 108, 170, 52, { seed: 370, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "rgba(209, 250, 229, 0.25)", fillStyle: "hachure", hachureAngle: -12, hachureGap: 8, roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(141, 120, "Iterable[int]", 16, GOOD_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(141, 140, "abstract input", 11, GOOD_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 226 134 C 262 134, 278 134, 312 134", { seed: 371, stroke: ACCENT_COLOR, strokeWidth: 2.4, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 312, 134, "right", ACCENT_COLOR, 372))
  appendNodes(svg, rc.rectangle(320, 108, 170, 52, { seed: 373, stroke: TITLE_COLOR, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(405, 120, "list[int]", 16, TITLE_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(405, 140, "concrete output", 11, TITLE_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(275, 210, "abstract in  →  concrete out", 14, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(240, 196, 160, 38, { seed: 374, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(320, 238, "return concrete, accept abstract", 11, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderBytecodeStreamDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  const opcodes = [
    { label: "LOAD_FAST", op: "x", color: TITLE_COLOR },
    { label: "LIST_APPEND", op: "result", color: ALT_COLOR },
    { label: "RETURN_VALUE", op: "", color: TITLE_COLOR },
  ]
  opcodes.forEach((op, i) => {
    const x = 54 + i * 176
    appendNodes(svg, rc.rectangle(x, 106, 148, 48, { seed: 380 + i, stroke: op.color, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(x + 74, 120, op.label, 12, op.color, "var(--font-board-body)", "middle"))
    appendNodes(svg, createAnchoredText(x + 74, 138, op.op, 11, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
    if (i < opcodes.length - 1) {
      const arrowX = x + 148
      appendNodes(svg, rc.path(`M ${arrowX} 130 C ${arrowX + 12} 130, ${arrowX + 16} 130, ${arrowX + 28} 130`, { seed: 383 + i, stroke: ACCENT_COLOR, strokeWidth: 2.2, fill: "none", roughness: 1.2, bowing: 1.3 }))
      appendNodes(svg, createArrowHead(rc, arrowX + 28, 130, "right", ACCENT_COLOR, 386 + i))
    }
  })
  appendNodes(svg, rc.rectangle(40, 184, 540, 38, { seed: 389, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "rgba(255, 241, 118, 0.2)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(310, 207, "opcodes explain execution shape — always confirm with real benchmarks", 12, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(60, 80, "bytecode stream", 16, TITLE_COLOR, "var(--font-board-display)"))
}

function renderProtocolGridDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  const rows = [
    { syntax: "len(obj)", dunder: "__len__", color: GOOD_COLOR },
    { syntax: "for x in obj", dunder: "__iter__", color: TITLE_COLOR },
    { syntax: "obj == other", dunder: "__eq__", color: ALT_COLOR },
  ]
  rows.forEach((r, i) => {
    const y = 68 + i * 58
    appendNodes(svg, rc.rectangle(50, y, 140, 42, { seed: 400 + i, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(120, y + 26, r.syntax, 13, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
    appendNodes(svg, rc.path(`M 190 ${y + 21} C 216 ${y + 21}, 224 ${y + 21}, 248 ${y + 21}`, { seed: 403 + i, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
    appendNodes(svg, createArrowHead(rc, 248, y + 21, "right", ACCENT_COLOR, 406 + i))
    appendNodes(svg, rc.rectangle(256, y, 160, 42, { seed: 409 + i, stroke: r.color, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(336, y + 26, r.dunder, 13, r.color, "var(--font-board-body)", "middle"))
  })
  appendNodes(svg, createAnchoredText(50, 250, "each protocol maps syntax → dunder method via type lookup", 11, ACCENT_COLOR, "var(--font-board-body)"))
}

function renderRefcountFlowDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  const stages = [
    { label: "ref=3", color: GOOD_COLOR, x: 56 },
    { label: "ref=1", color: ALT_COLOR, x: 226 },
    { label: "ref=0", color: ACCENT_COLOR, x: 396 },
  ]
  stages.forEach((s, i) => {
    appendNodes(svg, rc.rectangle(s.x, 108, 106, 46, { seed: 420 + i, stroke: s.color, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(s.x + 53, 135, s.label, 15, s.color, "var(--font-board-display)", "middle"))
    if (i < stages.length - 1) {
      const ax1 = s.x + 106
      const ax2 = stages[i + 1].x
      appendNodes(svg, rc.path(`M ${ax1} 131 C ${ax1 + 16} 131, ${ax2 - 16} 131, ${ax2} 131`, { seed: 423 + i, stroke: TITLE_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
      appendNodes(svg, createArrowHead(rc, ax2, 131, "right", TITLE_COLOR, 426 + i))
    }
  })
  appendNodes(svg, rc.rectangle(396, 178, 140, 38, { seed: 429, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "rgba(255, 241, 118, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(466, 200, "eligible for cleanup", 12, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 449 154 L 449 174", { seed: 430, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 449, 174, "down", ACCENT_COLOR, 431))
  appendNodes(svg, createAnchoredText(58, 240, "CPython frees immediately when refcount hits 0; cycles need GC", 11, TITLE_COLOR, "var(--font-board-body)"))
}

function renderHashProbeDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(34, 54, 84, 38, { seed: 440, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(76, 76, "hash(key)", 13, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 118 73 C 140 73, 148 90, 162 98", { seed: 441, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 162, 98, "right-down", ACCENT_COLOR, 442))
  const slots = [null, null, "key_A", "key_B", null, null]
  slots.forEach((val, i) => {
    const x = 46 + i * 84
    const isCollision = i === 2 || i === 3
    appendNodes(svg, rc.rectangle(x, 110, 70, 36, { seed: 443 + i, stroke: isCollision ? ACCENT_COLOR : TITLE_COLOR, strokeWidth: isCollision ? 2.4 : 1.8, fill: isCollision ? "rgba(255, 241, 118, 0.3)" : "rgba(255,255,255,0)", fillStyle: isCollision ? "hachure" : undefined, hachureAngle: -12, hachureGap: 8, roughness: 1.15, bowing: 1.05 }))
    appendNodes(svg, createAnchoredText(x + 35, 130, val ?? String(i), 12, isCollision ? ACCENT_COLOR : MARKER_COLORS.black, "var(--font-board-body)", "middle"))
    appendNodes(svg, createAnchoredText(x + 35, 160, String(i), 10, TITLE_COLOR, "var(--font-board-body)", "middle"))
  })
  appendNodes(svg, createAnchoredText(192, 86, "collision", 17, ACCENT_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(366, 86, "probe", 17, ACCENT_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, rc.path("M 192 102 L 192 108", { seed: 449, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "none", roughness: 1.1, bowing: 1.2 }))
  appendNodes(svg, createArrowHead(rc, 192, 108, "down", ACCENT_COLOR, 450))
  appendNodes(svg, rc.path("M 366 102 L 366 108", { seed: 451, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "none", roughness: 1.1, bowing: 1.2 }))
  appendNodes(svg, createArrowHead(rc, 366, 108, "down", ACCENT_COLOR, 452))
  appendNodes(svg, createAnchoredText(130, 236, "open addressing: probe next slot on collision", 12, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderGroupingBucketsDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  const groups = [
    { label: 'role → ["admin", "admin"]', y: 74 },
    { label: 'team → ["core", "ml"]', y: 138 },
  ]
  groups.forEach((g, i) => {
    appendNodes(svg, rc.rectangle(50, g.y, 168, 44, { seed: 460 + i, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(134, g.y + 26, g.label, 11, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
    appendNodes(svg, rc.path(`M 218 ${g.y + 22} C 244 ${g.y + 22}, 256 ${g.y + 22}, 278 ${g.y + 22}`, { seed: 462 + i, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
    appendNodes(svg, createArrowHead(rc, 278, g.y + 22, "right", ACCENT_COLOR, 464 + i))
  })
  appendNodes(svg, rc.rectangle(288, 64, 176, 52, { seed: 466, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "rgba(209, 250, 229, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(376, 80, "append into bucket", 12, GOOD_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(376, 100, "one stable pattern", 11, GOOD_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(288, 128, 176, 52, { seed: 467, stroke: ALT_COLOR, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(376, 144, "no branch noise", 12, ALT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(376, 164, "no manual if/else", 11, ALT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(50, 212, 'use setdefault or defaultdict instead of "if key in dict" branching', 12, ACCENT_COLOR, "var(--font-board-body)"))
}

function renderSetAlgebraDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.ellipse(210, 152, 90, 68, { seed: 470, stroke: TITLE_COLOR, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.25, bowing: 1.3 }))
  appendNodes(svg, rc.ellipse(290, 152, 90, 68, { seed: 471, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.25, bowing: 1.3 }))
  appendNodes(svg, createAnchoredText(160, 142, "allowed", 15, TITLE_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(340, 142, "requested", 15, GOOD_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(250, 155, "∩", 26, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(196, 232, 108, 34, { seed: 472, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "rgba(255, 241, 118, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(250, 251, "allowed & requested", 11, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 250 200 C 250 210, 250 218, 250 228", { seed: 473, stroke: ACCENT_COLOR, strokeWidth: 1.6, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 250, 228, "down", ACCENT_COLOR, 474))
  appendNodes(svg, createAnchoredText(250, 56, "set algebra replaces nested loops", 14, TITLE_COLOR, "var(--font-board-body)", "middle"))
}

function renderContainerMatrixDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  const containers = [
    { label: "list", sub: "mutable seq", color: TITLE_COLOR, x: 44 },
    { label: "tuple", sub: "fixed seq", color: GOOD_COLOR, x: 180 },
    { label: "set", sub: "membership", color: ALT_COLOR, x: 316 },
    { label: "array", sub: "packed nums", color: TITLE_COLOR, x: 452 },
  ]
  const centers = containers.map(c => c.x + 59)
  containers.forEach((c, i) => {
    appendNodes(svg, rc.rectangle(c.x, 96, 118, 48, { seed: 480 + i, stroke: c.color, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(centers[i], 124, c.label, 16, c.color, "var(--font-board-display)", "middle"))
  })
  const ratings = [["✓✓", "—", "—", "✓"], ["✓", "✓", "✓✓", "✓"], ["—", "✓✓", "—", "✓✓"]]
  const attrs = ["mutation", "lookup", "memory"]
  attrs.forEach((label, i) => {
    appendNodes(svg, createAnchoredText(24, 168 + i * 28, label, 10, TITLE_COLOR, "var(--font-board-body)"))
    ratings[i].forEach((r, j) => {
      appendNodes(svg, createAnchoredText(centers[j], 168 + i * 28, r, 10, j === 3 && i === 0 ? GOOD_COLOR : TITLE_COLOR, "var(--font-board-body)", "middle"))
    })
  })
  appendNodes(svg, createAnchoredText(310, 260, "pick by workload, not habit", 13, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderStorageTracksDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  const items = [
    { label: "list:    [refs] ... spare", color: TITLE_COLOR, y: 72 },
    { label: "array:  [packed] primitives", color: ALT_COLOR, y: 122 },
    { label: "deque:  [block]↔[block]", color: GOOD_COLOR, y: 172 },
    { label: "generator: → stream →", color: ACCENT_COLOR, y: 222 },
  ]
  items.forEach((item, i) => {
    appendNodes(svg, rc.rectangle(40, item.y, 360, 38, { seed: 490 + i, stroke: item.color, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(220, item.y + 24, item.label, 13, item.color, "var(--font-board-body)", "middle"))
  })
  appendNodes(svg, createAnchoredText(460, 82, "mutable,", 12, TITLE_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(460, 98, "spare capacity", 12, TITLE_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(460, 132, "packed,", 12, ALT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(460, 148, "homogeneous", 12, ALT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(460, 182, "fast ends,", 12, GOOD_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(460, 198, "linked blocks", 12, GOOD_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(460, 232, "lazy,", 12, ACCENT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(460, 248, "no materialization", 12, ACCENT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(310, 270, "the storage model is the optimization", 12, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderTupleLayoutDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(44, 106, 200, 52, { seed: 500, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "rgba(209, 250, 229, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(144, 118, "tuple", 16, GOOD_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(60, 140, "exact slots", 12, MARKER_COLORS.black, "var(--font-board-body)"))
  appendNodes(svg, rc.path("M 244 132 C 268 132, 280 132, 304 132", { seed: 501, stroke: TITLE_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 304, 132, "right", TITLE_COLOR, 502))
  appendNodes(svg, rc.rectangle(312, 106, 200, 52, { seed: 503, stroke: ACCENT_COLOR, strokeWidth: 2.2, fill: "rgba(255, 241, 118, 0.2)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(412, 118, "list", 16, ACCENT_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(326, 140, "spare capacity", 12, MARKER_COLORS.black, "var(--font-board-body)"))
  appendNodes(svg, rc.rectangle(528, 112, 56, 40, { seed: 504, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "rgba(255, 241, 118, 0.3)", fillStyle: "hachure", hachureAngle: 18, hachureGap: 6, roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(556, 134, "spare", 10, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(144, 210, "tuple:     exact-fit allocation, immutable, constant-friendly", 12, GOOD_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(144, 230, "list:      over-allocates so append stays amortized O(1)", 12, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderStreamPipelineDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  const stages = [
    { label: "source", sub: "container", x: 44, color: TITLE_COLOR },
    { label: "iterator", sub: "lazy", x: 222, color: GOOD_COLOR },
    { label: "consumer", sub: "processes", x: 400, color: ALT_COLOR },
  ]
  stages.forEach((s, i) => {
    appendNodes(svg, rc.rectangle(s.x, 106, 120, 48, { seed: 510 + i, stroke: s.color, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(s.x + 60, 118, s.label, 15, s.color, "var(--font-board-display)", "middle"))
    appendNodes(svg, createAnchoredText(s.x + 60, 138, s.sub, 10, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
    if (i < stages.length - 1) {
      const ax1 = s.x + 120
      const ax2 = stages[i + 1].x
      appendNodes(svg, rc.path(`M ${ax1} 130 C ${ax1 + 16} 130, ${ax2 - 16} 130, ${ax2} 130`, { seed: 513 + i, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
      appendNodes(svg, createArrowHead(rc, ax2, 130, "right", ACCENT_COLOR, 516 + i))
    }
  })
  appendNodes(svg, createAnchoredText(44, 194, "list / tuple: all elements in memory at once", 11, ACCENT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(44, 212, "generator: values produced lazily, one at a time", 11, GOOD_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(44, 230, "memoryview: exposes raw buffer without copying", 11, ALT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(44, 80, "streaming pipeline", 16, TITLE_COLOR, "var(--font-board-display)"))
}

function renderRecordChoicesDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  const records = [
    { label: "namedtuple", sub: "tuple-backed · immutable", color: TITLE_COLOR, x: 44 },
    { label: "NamedTuple", sub: "tuple + type annotations", color: GOOD_COLOR, x: 228 },
    { label: "dataclass", sub: "class-backed · mutable", color: ACCENT_COLOR, x: 412 },
  ]
  records.forEach((r, i) => {
    appendNodes(svg, rc.rectangle(r.x, 94, 156, 52, { seed: 520 + i, stroke: r.color, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(r.x + 78, 106, r.label, 16, r.color, "var(--font-board-display)", "middle"))
    appendNodes(svg, createAnchoredText(r.x + 78, 126, "(...)   ", 10, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
    appendNodes(svg, createAnchoredText(r.x + 78, 138, r.sub, 9, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  })
  appendNodes(svg, createAnchoredText(44, 178, "tuple-like (pos, immut)", 11, TITLE_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(228, 178, "tuple + types", 11, GOOD_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(412, 178, "class-like (named, mutable, methods)", 11, ACCENT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(310, 216, "choose by mutation and access expectations", 12, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(160, 204, 300, 38, { seed: 523, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
}

function renderFieldGenerationDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(48, 70, 160, 46, { seed: 530, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(128, 96, "fields + annotations", 13, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 208 93 C 230 93, 250 78, 280 80", { seed: 531, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 280, 80, "right", ACCENT_COLOR, 532))
  appendNodes(svg, rc.path("M 208 93 C 242 93, 258 140, 280 140", { seed: 533, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 280, 140, "right-down", ACCENT_COLOR, 534))
  appendNodes(svg, rc.rectangle(290, 54, 184, 52, { seed: 535, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "rgba(209, 250, 229, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(382, 70, "generated __init__", 12, GOOD_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(382, 88, "generated __repr__", 12, GOOD_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(290, 118, 184, 52, { seed: 536, stroke: ALT_COLOR, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(382, 132, "frozen / slots", 12, ALT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(382, 150, "order / kw_only", 12, ALT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(48, 202, "@dataclass inspects annotations and generates methods", 12, ACCENT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(48, 220, "treat flags as public behavior choices", 12, ACCENT_COLOR, "var(--font-board-body)"))
}

function renderGilThreadsDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(40, 74, 128, 38, { seed: 540, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(104, 97, "thread A", 13, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(40, 132, 128, 38, { seed: 541, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(104, 155, "thread B", 13, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(216, 96, 104, 50, { seed: 542, stroke: ACCENT_COLOR, strokeWidth: 2.4, fill: "rgba(255, 241, 118, 0.3)", fillStyle: "hachure", hachureAngle: 18, hachureGap: 7, roughness: 1.2, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(268, 100, "GIL", 18, ACCENT_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(268, 130, "one at a time", 10, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 168 93 C 188 93, 198 110, 212 108", { seed: 543, stroke: TITLE_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 212, 108, "right", TITLE_COLOR, 544))
  appendNodes(svg, rc.path("M 168 151 C 188 151, 198 138, 212 138", { seed: 545, stroke: TITLE_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 212, 138, "right", TITLE_COLOR, 546))
  appendNodes(svg, rc.rectangle(376, 86, 134, 40, { seed: 547, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "rgba(209, 250, 229, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(443, 110, "I/O overlap", 14, GOOD_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, rc.rectangle(376, 138, 134, 40, { seed: 548, stroke: ACCENT_COLOR, strokeWidth: 2.2, fill: "rgba(255, 241, 118, 0.2)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(443, 162, "CPU serial", 14, ACCENT_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, rc.path("M 320 110 C 342 104, 352 104, 370 100", { seed: 549, stroke: GOOD_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 370, 100, "right", GOOD_COLOR, 550))
  appendNodes(svg, rc.path("M 320 138 C 342 148, 352 148, 370 150", { seed: 551, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 370, 150, "right", ACCENT_COLOR, 552))
  appendNodes(svg, createAnchoredText(40, 210, "GIL limits bytecode parallelism — C extensions & I/O can release it", 11, ACCENT_COLOR, "var(--font-board-body)"))
}

function renderEventLoopDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(38, 70, 106, 38, { seed: 560, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(91, 93, "task A", 13, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(38, 128, 106, 38, { seed: 561, stroke: GOOD_COLOR, strokeWidth: 2, fill: "rgba(209, 250, 229, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(91, 151, "task B", 13, GOOD_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(196, 96, 124, 46, { seed: 562, stroke: TITLE_COLOR, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(258, 112, "event loop", 14, TITLE_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(258, 130, "scheduler", 10, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 144 89 C 162 89, 170 106, 192 106", { seed: 563, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 192, 106, "right", ACCENT_COLOR, 564))
  appendNodes(svg, rc.path("M 144 147 C 162 147, 170 134, 192 132", { seed: 565, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 192, 132, "right", ACCENT_COLOR, 566))
  appendNodes(svg, rc.rectangle(368, 70, 106, 38, { seed: 567, stroke: ALT_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(421, 93, "I/O wait", 13, ALT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(368, 128, 106, 38, { seed: 568, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "rgba(255, 241, 118, 0.2)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(421, 151, "ready queue", 13, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 320 109 C 340 104, 348 96, 362 84", { seed: 569, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 362, 84, "right", ACCENT_COLOR, 570))
  appendNodes(svg, rc.path("M 320 131 C 340 138, 348 146, 362 146", { seed: 571, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 362, 146, "right", ACCENT_COLOR, 572))
  appendNodes(svg, createAnchoredText(258, 200, "tasks yield at await boundaries", 12, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(258, 218, "blocking one stalls all others", 12, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderBackpressureFlowDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(34, 104, 110, 42, { seed: 580, stroke: TITLE_COLOR, strokeWidth: 2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(89, 129, "producer", 14, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 144 125 C 162 125, 174 125, 194 125", { seed: 581, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 194, 125, "right", ACCENT_COLOR, 582))
  appendNodes(svg, rc.rectangle(204, 92, 132, 52, { seed: 583, stroke: ALT_COLOR, strokeWidth: 2.2, fill: "rgba(255, 241, 118, 0.22)", fillStyle: "hachure", hachureAngle: -12, hachureGap: 8, roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(270, 106, "bounded queue", 13, ALT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(270, 128, "semaphore", 12, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 336 125 C 356 125, 368 125, 388 125", { seed: 584, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 388, 125, "right", ACCENT_COLOR, 585))
  appendNodes(svg, rc.rectangle(398, 104, 110, 42, { seed: 586, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "rgba(209, 250, 229, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(453, 129, "consumer", 14, GOOD_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 398 146 C 360 174, 340 174, 290 146", { seed: 587, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "none", roughness: 1.25, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 290, 146, "up", ACCENT_COLOR, 588))
  appendNodes(svg, createAnchoredText(340, 178, "backpressure", 11, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(270, 226, "bound fan-out per resource, not globally", 11, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderServerPipelineDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  const stages = [
    { label: "reader", sub: "recv", x: 36, color: TITLE_COLOR },
    { label: "handler", sub: "process", x: 202, color: GOOD_COLOR },
    { label: "writer", sub: "send", x: 368, color: ACCENT_COLOR },
  ]
  stages.forEach((s, i) => {
    appendNodes(svg, rc.rectangle(s.x, 108, 112, 48, { seed: 590 + i, stroke: s.color, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(s.x + 56, 120, s.label, 15, s.color, "var(--font-board-display)", "middle"))
    appendNodes(svg, createAnchoredText(s.x + 56, 140, s.sub, 10, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
    if (i < stages.length - 1) {
      const ax1 = s.x + 112
      const ax2 = stages[i + 1].x
      appendNodes(svg, rc.path(`M ${ax1} 132 C ${ax1 + 12} 132, ${ax2 - 12} 132, ${ax2} 132`, { seed: 593 + i, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
      appendNodes(svg, createArrowHead(rc, ax2, 132, "right", ACCENT_COLOR, 596 + i))
    }
  })
  appendNodes(svg, rc.rectangle(368, 180, 100, 34, { seed: 599, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "rgba(255, 241, 118, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(418, 200, "drain()", 14, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 428 156 C 428 162, 424 168, 418 176", { seed: 600, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 418, 176, "down", ACCENT_COLOR, 601))
  appendNodes(svg, createAnchoredText(36, 236, "drain() ensures buffered writes complete — critical for flow control", 11, ACCENT_COLOR, "var(--font-board-body)"))
}

function renderAsyncStreamDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  const chunks = [
    { label: "yield chunk 1", color: TITLE_COLOR, x: 50 },
    { label: "yield chunk 2", color: GOOD_COLOR, x: 222 },
    { label: "yield chunk 3", color: ALT_COLOR, x: 394 },
  ]
  chunks.forEach((ch, i) => {
    appendNodes(svg, rc.rectangle(ch.x, 106, 120, 48, { seed: 610 + i, stroke: ch.color, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(ch.x + 60, 118, ch.label, 11, ch.color, "var(--font-board-body)", "middle"))
    appendNodes(svg, createAnchoredText(ch.x + 60, 140, "await asyncio.sleep(0.01)", 9, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
    if (i < chunks.length - 1) {
      const ax1 = ch.x + 120
      const ax2 = chunks[i + 1].x
      appendNodes(svg, rc.path(`M ${ax1} 130 C ${ax1 + 14} 130, ${ax2 - 14} 130, ${ax2} 130`, { seed: 613 + i, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
      appendNodes(svg, createArrowHead(rc, ax2, 130, "right", ACCENT_COLOR, 616 + i))
    }
  })
  appendNodes(svg, createAnchoredText(50, 80, "async stream", 16, TITLE_COLOR, "var(--font-board-display)"))
  appendNodes(svg, createAnchoredText(50, 194, "each yield is an await boundary", 11, ACCENT_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(50, 212, "consumer pulls one item at a time via async for", 11, GOOD_COLOR, "var(--font-board-body)"))
  appendNodes(svg, createAnchoredText(50, 230, "streaming reduces peak memory and time-to-first-item", 11, ALT_COLOR, "var(--font-board-body)"))
}

function renderAsyncBoundaryDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(44, 96, 146, 50, { seed: 620, stroke: TITLE_COLOR, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(117, 106, "awaitable API", 14, TITLE_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(117, 126, "coroutine / awaitable", 10, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 190 121 C 214 108, 226 100, 248 92", { seed: 621, stroke: GOOD_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 248, 92, "right", GOOD_COLOR, 622))
  appendNodes(svg, rc.path("M 190 121 C 214 140, 226 158, 248 166", { seed: 623, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 248, 166, "right", ACCENT_COLOR, 624))
  appendNodes(svg, rc.rectangle(256, 66, 148, 50, { seed: 625, stroke: GOOD_COLOR, strokeWidth: 2.2, fill: "rgba(209, 250, 229, 0.25)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(330, 76, "I/O-friendly", 14, GOOD_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(330, 98, "await sleeps / reads", 10, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.rectangle(256, 148, 148, 50, { seed: 626, stroke: ACCENT_COLOR, strokeWidth: 2.2, fill: "rgba(255, 241, 118, 0.2)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(330, 158, "CPU stall", 14, ACCENT_COLOR, "var(--font-board-display)", "middle"))
  appendNodes(svg, createAnchoredText(330, 180, "blocks the loop", 10, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(117, 230, "CPU-bound work still monopolizes the event loop", 12, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderTaskTreeDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  appendNodes(svg, rc.rectangle(238, 54, 132, 44, { seed: 630, stroke: TITLE_COLOR, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(304, 80, "TaskGroup", 16, TITLE_COLOR, "var(--font-board-display)", "middle"))
  ;[238, 304, 370].forEach((x, i) => {
    appendNodes(svg, rc.path(`M 304 98 C 304 110, ${x} 124, ${x} 134`, { seed: 631 + i, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
    appendNodes(svg, createArrowHead(rc, x, 134, "down", ACCENT_COLOR, 634 + i))
  })
  const children = [
    { label: "child A", x: 180, color: GOOD_COLOR },
    { label: "child B", x: 268, color: ALT_COLOR },
    { label: "child C", x: 356, color: GOOD_COLOR },
  ]
  children.forEach((ch) => {
    appendNodes(svg, rc.rectangle(ch.x, 138, 114, 42, { seed: 637 + children.indexOf(ch), stroke: ch.color, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(ch.x + 57, 163, ch.label, 13, ch.color, "var(--font-board-body)", "middle"))
  })
  appendNodes(svg, createAnchoredText(304, 216, "structured concurrency", 13, TITLE_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(304, 234, "failure propagates to siblings", 11, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, rc.path("M 304 182 C 304 192, 304 200, 304 212", { seed: 640, stroke: TITLE_COLOR, strokeWidth: 1.6, fill: "none", roughness: 1.2, bowing: 1.3 }))
  appendNodes(svg, createArrowHead(rc, 304, 212, "down", TITLE_COLOR, 641))
  appendNodes(svg, createAnchoredText(304, 260, "tasks need an owner or they become cleanup debt", 11, ACCENT_COLOR, "var(--font-board-body)", "middle"))
}

function renderLogPipelineDiagram(rc: RoughSVG, svg: SVGSVGElement) {
  const stages = [
    { label: "logger", sub: "levels · hierarchy", x: 34, color: TITLE_COLOR },
    { label: "handler", sub: "filters · format", x: 200, color: GOOD_COLOR },
    { label: "sink", sub: "file · stdout · syslog", x: 366, color: ALT_COLOR },
  ]
  stages.forEach((s, i) => {
    appendNodes(svg, rc.rectangle(s.x, 102, 114, 50, { seed: 650 + i, stroke: s.color, strokeWidth: 2.2, fill: "rgba(255,255,255,0)", roughness: 1.15, bowing: 1.1 }))
    appendNodes(svg, createAnchoredText(s.x + 57, 116, s.label, 14, s.color, "var(--font-board-display)", "middle"))
    appendNodes(svg, createAnchoredText(s.x + 57, 136, s.sub, 9, MARKER_COLORS.black, "var(--font-board-body)", "middle"))
    if (i < stages.length - 1) {
      const ax1 = s.x + 114
      const ax2 = stages[i + 1].x
      appendNodes(svg, rc.path(`M ${ax1} 127 C ${ax1 + 12} 127, ${ax2 - 12} 127, ${ax2} 127`, { seed: 653 + i, stroke: ACCENT_COLOR, strokeWidth: 2, fill: "none", roughness: 1.2, bowing: 1.3 }))
      appendNodes(svg, createArrowHead(rc, ax2, 127, "right", ACCENT_COLOR, 656 + i))
    }
  })
  appendNodes(svg, rc.rectangle(34, 190, 400, 38, { seed: 659, stroke: ACCENT_COLOR, strokeWidth: 1.8, fill: "rgba(255, 241, 118, 0.2)", roughness: 1.15, bowing: 1.1 }))
  appendNodes(svg, createAnchoredText(234, 212, "context fields (user_id, request_id) travel with the record", 11, ACCENT_COLOR, "var(--font-board-body)", "middle"))
  appendNodes(svg, createAnchoredText(34, 250, "logger structure is observability architecture", 12, ACCENT_COLOR, "var(--font-board-body)"))
}

function getDiagramDefinition(_kind: WhiteboardVisualKind): DiagramDefinition {
  return { elements: [] }
}
