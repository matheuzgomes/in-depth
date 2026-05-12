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

    void draw()
    return () => {
      cancelled = true
    }
  }, [definition, topic.title])

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

function getDiagramDefinition(kind: WhiteboardVisualKind): DiagramDefinition {
  switch (kind) {
    case "slice-window":
      return {
        elements: [
          { type: "box", x: 70, y: 95, w: 340, h: 84, label: "Source sequence" },
          ...[0, 1, 2, 3, 4, 5].map((item) => ({ type: "box", x: 92 + item * 48, y: 120, w: 36, h: 34, label: String(item), small: true } as DiagramBox)),
          { type: "highlight", x: 188, y: 110, w: 136, h: 52, color: ACCENT_COLOR },
          { type: "arrow", x1: 324, y1: 178, x2: 476, y2: 178, color: ACCENT_COLOR },
          { type: "box", x: 454, y: 150, w: 110, h: 54, label: "new list", color: GOOD_COLOR },
        ],
      }
    case "match-flow":
      return {
        elements: [
          { type: "box", x: 52, y: 104, w: 142, h: 48, label: "subject" },
          { type: "arrow", x1: 194, y1: 128, x2: 286, y2: 128, color: ACCENT_COLOR },
          { type: "box", x: 286, y: 72, w: 170, h: 42, label: 'case ["push", name, value]', color: TITLE_COLOR },
          { type: "box", x: 286, y: 124, w: 170, h: 42, label: 'case ["quit"]', color: GOOD_COLOR },
          { type: "box", x: 286, y: 176, w: 170, h: 42, label: "case _", color: ALT_COLOR },
          { type: "arrow", x1: 456, y1: 145, x2: 560, y2: 145, color: GOOD_COLOR },
          { type: "box", x: 520, y: 122, w: 66, h: 46, label: "match", color: GOOD_COLOR },
        ],
      }
    case "alias-graph":
      return {
        elements: [
          { type: "box", x: 80, y: 110, w: 80, h: 42, label: "a" },
          { type: "box", x: 80, y: 170, w: 80, h: 42, label: "b" },
          { type: "box", x: 300, y: 130, w: 150, h: 62, label: "list object", color: GOOD_COLOR },
          { type: "arrow", x1: 160, y1: 132, x2: 300, y2: 150, color: ACCENT_COLOR },
          { type: "arrow", x1: 160, y1: 188, x2: 300, y2: 168, color: ACCENT_COLOR },
          { type: "note", x: 470, y: 106, text: "same object", color: ACCENT_COLOR },
        ],
      }
    case "signature-map":
      return {
        elements: [
          { type: "box", x: 70, y: 108, w: 196, h: 74, label: "connect(host, /, port, *, timeout, ssl)", color: TITLE_COLOR },
          { type: "arrow", x1: 266, y1: 145, x2: 398, y2: 145, color: ACCENT_COLOR },
          { type: "box", x: 398, y: 84, w: 148, h: 40, label: "positional only", color: GOOD_COLOR },
          { type: "box", x: 398, y: 136, w: 148, h: 40, label: "keyword only", color: ALT_COLOR },
          { type: "box", x: 398, y: 188, w: 148, h: 40, label: "public contract", color: ACCENT_COLOR },
        ],
      }
    case "shared-default":
      return {
        elements: [
          { type: "box", x: 76, y: 108, w: 152, h: 60, label: "function defaults" },
          { type: "box", x: 332, y: 122, w: 120, h: 50, label: "same list", color: ACCENT_COLOR },
          { type: "arrow", x1: 228, y1: 138, x2: 332, y2: 138, color: ACCENT_COLOR },
          { type: "arrow", x1: 228, y1: 156, x2: 332, y2: 156, color: ACCENT_COLOR },
          { type: "note", x: 472, y: 124, text: "reused across calls", color: ACCENT_COLOR },
        ],
      }
    case "closure-scope":
      return {
        elements: [
          { type: "box", x: 84, y: 96, w: 136, h: 80, label: "outer scope" },
          { type: "box", x: 318, y: 96, w: 146, h: 80, label: "wrapper / closure", color: GOOD_COLOR },
          { type: "arrow", x1: 220, y1: 136, x2: 318, y2: 136, color: ACCENT_COLOR },
          { type: "note", x: 478, y: 122, text: "free vars in cells", color: ALT_COLOR },
          { type: "box", x: 248, y: 204, w: 110, h: 38, label: "wraps(fn)", color: TITLE_COLOR },
        ],
      }
    case "type-boundary":
      return {
        elements: [
          { type: "box", x: 72, y: 110, w: 164, h: 52, label: "Iterable[int]", color: GOOD_COLOR },
          { type: "arrow", x1: 236, y1: 136, x2: 348, y2: 136, color: ACCENT_COLOR },
          { type: "box", x: 348, y: 110, w: 164, h: 52, label: "list[int]", color: TITLE_COLOR },
          { type: "note", x: 178, y: 200, text: "abstract in", color: GOOD_COLOR },
          { type: "note", x: 398, y: 200, text: "concrete out", color: TITLE_COLOR },
        ],
      }
    case "bytecode-stream":
      return {
        elements: [
          ..."LOAD_FAST LIST_APPEND RETURN_VALUE".split(" ").map((opcode, index) => ({ type: "box", x: 94 + index * 156, y: 126, w: 124, h: 48, label: opcode, color: index % 2 === 0 ? TITLE_COLOR : ALT_COLOR } as DiagramBox)),
          { type: "note", x: 174, y: 214, text: "execution shape", color: ACCENT_COLOR },
        ],
      }
    case "protocol-grid":
      return {
        elements: [
          { type: "box", x: 66, y: 78, w: 154, h: 48, label: "len(obj)" },
          { type: "box", x: 66, y: 138, w: 154, h: 48, label: "for item in obj" },
          { type: "box", x: 66, y: 198, w: 154, h: 48, label: "obj == other" },
          { type: "box", x: 332, y: 78, w: 188, h: 48, label: "__len__", color: GOOD_COLOR },
          { type: "box", x: 332, y: 138, w: 188, h: 48, label: "__iter__", color: TITLE_COLOR },
          { type: "box", x: 332, y: 198, w: 188, h: 48, label: "__eq__", color: ALT_COLOR },
          { type: "arrow", x1: 220, y1: 102, x2: 332, y2: 102, color: ACCENT_COLOR },
          { type: "arrow", x1: 220, y1: 162, x2: 332, y2: 162, color: ACCENT_COLOR },
          { type: "arrow", x1: 220, y1: 222, x2: 332, y2: 222, color: ACCENT_COLOR },
        ],
      }
    case "refcount-flow":
      return {
        elements: [
          { type: "box", x: 76, y: 120, w: 96, h: 48, label: "ref=3", color: GOOD_COLOR },
          { type: "arrow", x1: 172, y1: 144, x2: 260, y2: 144, color: ACCENT_COLOR },
          { type: "box", x: 260, y: 120, w: 96, h: 48, label: "ref=1", color: ALT_COLOR },
          { type: "arrow", x1: 356, y1: 144, x2: 444, y2: 144, color: ACCENT_COLOR },
          { type: "box", x: 444, y: 120, w: 96, h: 48, label: "ref=0", color: ACCENT_COLOR },
          { type: "note", x: 454, y: 194, text: "eligible for cleanup", color: ACCENT_COLOR },
        ],
      }
    case "hash-probe":
      return {
        elements: [
          ...[0, 1, 2, 3, 4, 5].map((slot) => ({ type: "box", x: 84 + slot * 68, y: 126, w: 52, h: 36, label: String(slot), small: true, color: slot === 2 || slot === 3 ? ACCENT_COLOR : TITLE_COLOR } as DiagramBox)),
          { type: "arrow", x1: 212, y1: 178, x2: 280, y2: 178, color: ACCENT_COLOR },
          { type: "note", x: 206, y: 96, text: "collision", color: ACCENT_COLOR },
          { type: "note", x: 316, y: 96, text: "match", color: GOOD_COLOR },
        ],
      }
    case "grouping-buckets":
      return {
        elements: [
          { type: "box", x: 76, y: 88, w: 144, h: 52, label: "role -> []" },
          { type: "box", x: 76, y: 152, w: 144, h: 52, label: "team -> []" },
          { type: "arrow", x1: 220, y1: 114, x2: 330, y2: 114, color: ACCENT_COLOR },
          { type: "arrow", x1: 220, y1: 178, x2: 330, y2: 178, color: ACCENT_COLOR },
          { type: "box", x: 330, y: 82, w: 160, h: 58, label: "append into bucket", color: GOOD_COLOR },
          { type: "box", x: 330, y: 146, w: 160, h: 58, label: "no branch noise", color: ALT_COLOR },
        ],
      }
    case "set-algebra":
      return {
        elements: [
          { type: "ellipse", cx: 210, cy: 152, rx: 92, ry: 66, label: "allowed", color: TITLE_COLOR },
          { type: "ellipse", cx: 290, cy: 152, rx: 92, ry: 66, label: "requested", color: GOOD_COLOR },
          { type: "text", x: 246, y: 155, text: "∩", small: false, color: MARKER_COLORS.black },
        ],
      }
    case "container-matrix":
      return {
        elements: [
          ...["list", "tuple", "set", "array"].map((label, index) => ({ type: "box", x: 72 + index * 124, y: 126, w: 94, h: 48, label, color: index % 2 === 0 ? TITLE_COLOR : GOOD_COLOR } as DiagramBox)),
          { type: "note", x: 92, y: 214, text: "memory vs lookup vs mutation", color: ACCENT_COLOR },
        ],
      }
    case "storage-tracks":
      return {
        elements: [
          { type: "box", x: 78, y: 92, w: 136, h: 44, label: "list" },
          { type: "box", x: 78, y: 152, w: 136, h: 44, label: "deque", color: GOOD_COLOR },
          { type: "box", x: 334, y: 92, w: 136, h: 44, label: "array.array", color: ALT_COLOR },
          { type: "box", x: 334, y: 152, w: 136, h: 44, label: "generator", color: ACCENT_COLOR },
          { type: "arrow", x1: 214, y1: 114, x2: 334, y2: 114, color: TITLE_COLOR },
          { type: "arrow", x1: 214, y1: 174, x2: 334, y2: 174, color: GOOD_COLOR },
        ],
      }
    case "tuple-layout":
      return {
        elements: [
          { type: "box", x: 92, y: 122, w: 156, h: 56, label: "tuple: exact slots", color: GOOD_COLOR },
          { type: "box", x: 354, y: 122, w: 156, h: 56, label: "list: spare capacity", color: ACCENT_COLOR },
          { type: "arrow", x1: 248, y1: 150, x2: 354, y2: 150, color: TITLE_COLOR },
        ],
      }
    case "stream-pipeline":
      return {
        elements: [
          { type: "box", x: 60, y: 132, w: 116, h: 42, label: "source" },
          { type: "arrow", x1: 176, y1: 152, x2: 250, y2: 152, color: ACCENT_COLOR },
          { type: "box", x: 250, y: 132, w: 116, h: 42, label: "iterator", color: GOOD_COLOR },
          { type: "arrow", x1: 366, y1: 152, x2: 440, y2: 152, color: ACCENT_COLOR },
          { type: "box", x: 440, y: 132, w: 116, h: 42, label: "consumer", color: ALT_COLOR },
        ],
      }
    case "record-choices":
      return {
        elements: [
          { type: "box", x: 62, y: 118, w: 148, h: 50, label: "namedtuple", color: TITLE_COLOR },
          { type: "box", x: 236, y: 118, w: 148, h: 50, label: "NamedTuple", color: GOOD_COLOR },
          { type: "box", x: 410, y: 118, w: 148, h: 50, label: "dataclass", color: ACCENT_COLOR },
        ],
      }
    case "field-generation":
      return {
        elements: [
          { type: "box", x: 74, y: 96, w: 148, h: 48, label: "fields + annotations" },
          { type: "arrow", x1: 222, y1: 120, x2: 338, y2: 120, color: ACCENT_COLOR },
          { type: "box", x: 338, y: 86, w: 160, h: 60, label: "generated __init__ / __repr__", color: GOOD_COLOR },
          { type: "box", x: 338, y: 162, w: 160, h: 60, label: "frozen / slots / order", color: ALT_COLOR },
        ],
      }
    case "gil-threads":
      return {
        elements: [
          { type: "box", x: 82, y: 92, w: 136, h: 42, label: "thread A bytecode" },
          { type: "box", x: 82, y: 152, w: 136, h: 42, label: "thread B bytecode" },
          { type: "box", x: 296, y: 118, w: 110, h: 50, label: "GIL", color: ACCENT_COLOR },
          { type: "arrow", x1: 218, y1: 114, x2: 296, y2: 136, color: TITLE_COLOR },
          { type: "arrow", x1: 218, y1: 174, x2: 296, y2: 150, color: TITLE_COLOR },
          { type: "box", x: 446, y: 118, w: 120, h: 50, label: "I/O overlap", color: GOOD_COLOR },
        ],
      }
    case "event-loop":
      return {
        elements: [
          { type: "box", x: 62, y: 92, w: 122, h: 38, label: "task A" },
          { type: "box", x: 62, y: 152, w: 122, h: 38, label: "task B", color: GOOD_COLOR },
          { type: "box", x: 238, y: 120, w: 130, h: 46, label: "event loop", color: TITLE_COLOR },
          { type: "box", x: 430, y: 92, w: 122, h: 38, label: "I/O wait", color: ALT_COLOR },
          { type: "box", x: 430, y: 152, w: 122, h: 38, label: "ready queue", color: ACCENT_COLOR },
          { type: "arrow", x1: 184, y1: 111, x2: 238, y2: 131, color: ACCENT_COLOR },
          { type: "arrow", x1: 184, y1: 171, x2: 238, y2: 155, color: ACCENT_COLOR },
          { type: "arrow", x1: 368, y1: 143, x2: 430, y2: 111, color: ACCENT_COLOR },
          { type: "arrow", x1: 368, y1: 143, x2: 430, y2: 171, color: ACCENT_COLOR },
        ],
      }
    case "backpressure-flow":
      return {
        elements: [
          { type: "box", x: 58, y: 130, w: 116, h: 42, label: "producer" },
          { type: "arrow", x1: 174, y1: 152, x2: 258, y2: 152, color: ACCENT_COLOR },
          { type: "box", x: 258, y: 118, w: 120, h: 56, label: "queue / semaphore", color: ALT_COLOR },
          { type: "arrow", x1: 378, y1: 152, x2: 470, y2: 152, color: ACCENT_COLOR },
          { type: "box", x: 470, y: 130, w: 110, h: 42, label: "consumer", color: GOOD_COLOR },
        ],
      }
    case "server-pipeline":
      return {
        elements: [
          { type: "box", x: 52, y: 132, w: 108, h: 42, label: "reader" },
          { type: "arrow", x1: 160, y1: 152, x2: 240, y2: 152, color: ACCENT_COLOR },
          { type: "box", x: 240, y: 132, w: 124, h: 42, label: "handler", color: TITLE_COLOR },
          { type: "arrow", x1: 364, y1: 152, x2: 452, y2: 152, color: ACCENT_COLOR },
          { type: "box", x: 452, y: 132, w: 108, h: 42, label: "writer", color: GOOD_COLOR },
          { type: "note", x: 430, y: 208, text: "drain()", color: ACCENT_COLOR },
        ],
      }
    case "async-stream":
      return {
        elements: [
          { type: "box", x: 76, y: 120, w: 120, h: 44, label: "yield chunk 1", color: TITLE_COLOR },
          { type: "box", x: 248, y: 120, w: 120, h: 44, label: "yield chunk 2", color: GOOD_COLOR },
          { type: "box", x: 420, y: 120, w: 120, h: 44, label: "yield chunk 3", color: ALT_COLOR },
          { type: "arrow", x1: 196, y1: 142, x2: 248, y2: 142, color: ACCENT_COLOR },
          { type: "arrow", x1: 368, y1: 142, x2: 420, y2: 142, color: ACCENT_COLOR },
        ],
      }
    case "async-boundary":
      return {
        elements: [
          { type: "box", x: 76, y: 118, w: 146, h: 50, label: "awaitable API", color: TITLE_COLOR },
          { type: "box", x: 308, y: 88, w: 146, h: 50, label: "I/O-friendly", color: GOOD_COLOR },
          { type: "box", x: 308, y: 168, w: 146, h: 50, label: "CPU stall", color: ACCENT_COLOR },
          { type: "arrow", x1: 222, y1: 143, x2: 308, y2: 113, color: GOOD_COLOR },
          { type: "arrow", x1: 222, y1: 143, x2: 308, y2: 193, color: ACCENT_COLOR },
        ],
      }
    case "task-tree":
      return {
        elements: [
          { type: "box", x: 250, y: 70, w: 118, h: 44, label: "TaskGroup", color: TITLE_COLOR },
          { type: "arrow", x1: 310, y1: 114, x2: 180, y2: 168, color: ACCENT_COLOR },
          { type: "arrow", x1: 310, y1: 114, x2: 310, y2: 168, color: ACCENT_COLOR },
          { type: "arrow", x1: 310, y1: 114, x2: 440, y2: 168, color: ACCENT_COLOR },
          { type: "box", x: 122, y: 168, w: 116, h: 40, label: "child A", color: GOOD_COLOR },
          { type: "box", x: 252, y: 168, w: 116, h: 40, label: "child B", color: ALT_COLOR },
          { type: "box", x: 382, y: 168, w: 116, h: 40, label: "child C", color: GOOD_COLOR },
        ],
      }
    case "log-pipeline":
      return {
        elements: [
          { type: "box", x: 64, y: 132, w: 112, h: 42, label: "logger", color: TITLE_COLOR },
          { type: "arrow", x1: 176, y1: 152, x2: 264, y2: 152, color: ACCENT_COLOR },
          { type: "box", x: 264, y: 132, w: 112, h: 42, label: "handler", color: GOOD_COLOR },
          { type: "arrow", x1: 376, y1: 152, x2: 464, y2: 152, color: ACCENT_COLOR },
          { type: "box", x: 464, y: 132, w: 112, h: 42, label: "sink", color: ALT_COLOR },
          { type: "note", x: 258, y: 212, text: "context fields travel with the record", color: ACCENT_COLOR },
        ],
      }
  }
}
