"use client"

import { useLayoutEffect, useRef } from "react"
import type { CSSProperties, ReactNode } from "react"
import { ChevronLeft, ChevronRight, Play, RotateCcw, SkipForward } from "lucide-react"
import { T } from "@/lib/tokens"
import { highlightLine } from "@/lib/highlight"

// ── Light theme simulation palette ─────────────────────────────────────
export const C = {
  shell: "#ede8de",
  card: "#faf6f0",
  code: "#f5f2ec",
  border: "rgba(26, 26, 26, 0.12)",
  borderHi: "rgba(26, 26, 26, 0.2)",
  text1: "#172033",
  text2: "#4a4860",
  text3: "#7c7a8a",
  teal: "#2d7d63",
  amber: "#a87330",
  blue: "#5a7fbf",
}

export function darkAccent(fg: string): string {
  const map: Record<string, string> = {
    "#a89cf5": "#7a6fd4",
    "#5ec9a1": C.teal,
    "#f0b060": C.amber,
    "#9fb8ff": C.blue,
    "#d7a38a": "#b07858",
    "#97c985": "#60a050",
  }
  return map[fg] ?? fg
}

// ── Roughjs hachure overlay ────────────────────────────────────────────

function RoughOverlay({
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
    <svg ref={svgRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 1,
      }}
    />
  )
}

// ── Components ─────────────────────────────────────────────────────────

export function SimulationShell({
  open,
  title,
  summary,
  ctaLabel,
  stepLabel,
  onOpen,
  children,
}: {
  open: boolean
  title: string
  summary: string
  ctaLabel?: string
  stepLabel?: string
  onOpen: () => void
  children: ReactNode
}) {
  return (
    <div style={{
      margin: "18px 0 22px",
      borderRadius: 24,
      border: `1px solid ${C.borderHi}`,
      background: C.shell,
      boxShadow: `0 4px 16px rgba(0, 0, 0, 0.06)`,
      overflow: "hidden",
    }}>
      {!open ? (
        <div style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text1, fontFamily: "var(--font-board-display)", marginBottom: 8 }}>
            {title}
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: C.text2, fontFamily: "var(--font-board-body)", maxWidth: 58 * 8 }}>
            {summary}
          </p>
          <button
            onClick={onOpen}
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              border: `1px solid ${T.teal.accent}66`,
              background: `linear-gradient(180deg, ${T.teal.bg}, ${C.shell})`,
              color: C.teal,
              padding: "10px 14px",
              fontSize: 12.5,
              fontWeight: 650,
              fontFamily: "var(--font-board-body)",
              cursor: "pointer",
            }}
          >
            <Play size={14} />
            <span>{ctaLabel ?? "See simulation"}</span>
          </button>
        </div>
      ) : (
        <>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 18px",
            borderBottom: `1px solid ${C.border}`,
            background: `linear-gradient(180deg, ${C.card}, ${C.shell})`,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text1, fontFamily: "var(--font-board-display)" }}>{title}</div>
              {stepLabel ? (
                <div style={{ fontSize: 11.5, color: C.text3, fontFamily: "var(--font-board-body)", marginTop: 4, lineHeight: 1.45 }}>{stepLabel}</div>
              ) : null}
            </div>
          </div>
          <div style={{ padding: "18px", display: "grid", gap: 16 }}>{children}</div>
        </>
      )}
    </div>
  )
}

export function SimulationControls({
  isFirst,
  isLast,
  onBack,
  onNext,
  onReset,
  onResult,
}: {
  isFirst: boolean
  isLast: boolean
  onBack: () => void
  onNext: () => void
  onReset: () => void
  onResult: () => void
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
      <button onClick={onBack} disabled={isFirst} style={controlButtonStyle(isFirst)}>
        <ChevronLeft size={14} />
        <span>Back</span>
      </button>
      <button onClick={onNext} disabled={isLast} style={controlButtonStyle(isLast)}>
        <span>Next</span>
        <ChevronRight size={14} />
      </button>
      <button onClick={onReset} style={controlButtonStyle(false)}>
        <RotateCcw size={14} />
        <span>Reset</span>
      </button>
      <button onClick={onResult} disabled={isLast} style={controlButtonStyle(isLast)}>
        <SkipForward size={14} />
        <span>Result</span>
      </button>
    </div>
  )
}

export function SimulationCodePanel({
  sourceCode,
  activeLine,
}: {
  sourceCode: string
  activeLine: number
}) {
  const codeLines = sourceCode.trim().split("\n")

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      background: C.code,
    }}>
      <RoughOverlay stroke="rgba(26, 26, 26, 0.2)" fill="rgba(26, 26, 26, 0.02)" />
      <div style={{ position: "relative", zIndex: 2, padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.75, overflowX: "auto" }}>
        {codeLines.map((line, index) => {
          const lineNumber = index + 1
          const active = activeLine === lineNumber

          return (
            <div
              key={lineNumber}
              style={{
                display: "grid",
                gridTemplateColumns: "30px minmax(0, 1fr)",
                gap: 10,
                alignItems: "start",
                padding: "2px 6px",
                margin: "1px 0",
                borderRadius: 8,
                background: active ? "rgba(94, 201, 161, 0.14)" : "transparent",
                border: active ? `1px solid ${T.teal.accent}55` : "1px solid transparent",
              }}
            >
              <span style={{ color: active ? C.teal : C.text3, userSelect: "none" }}>{lineNumber}</span>
              <code style={{ display: "block", whiteSpace: "pre", color: C.text1 }}>{highlightLine(line)}</code>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StateCard({
  label,
  value,
  color,
  minHeight = 76,
}: {
  label: string
  value: string
  color: { bg: string; fg: string; accent: string }
  minHeight?: number
}) {
  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 16,
      border: `1px solid ${color.accent}44`,
      background: C.card,
      padding: "12px 13px",
      minHeight,
      minWidth: 0,
    }}>
      <RoughOverlay />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: darkAccent(color.fg), marginBottom: 8, fontWeight: 800, fontFamily: "var(--font-board-display)" }}>
          {label}
        </div>
        <div style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.55, fontFamily: "var(--font-mono)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {value}
        </div>
      </div>
    </div>
  )
}

export function ExplanationPanel({
  title = "What is happening now",
  explanation,
  footer,
  done = false,
}: {
  title?: string
  explanation: string
  footer?: ReactNode
  done?: boolean
}) {
  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      background: done ? "rgba(106, 171, 238, 0.12)" : C.card,
    }}>
      <RoughOverlay />
      <div style={{ position: "relative", zIndex: 2, padding: "13px 14px" }}>
        <div style={{ fontSize: 12.5, color: C.text1, fontWeight: 650, fontFamily: "var(--font-board-display)", marginBottom: 5 }}>
          {title}
        </div>
        <div style={{ fontSize: 12.5, color: C.text2, fontFamily: "var(--font-board-body)", lineHeight: 1.75 }}>
          {explanation}
        </div>
        {footer}
      </div>
    </div>
  )
}

export function SimulationGrid({
  children,
  minColumn = 180,
}: {
  children: ReactNode
  minColumn?: number
}) {
  return (
    <div style={{
      display: "grid",
      gap: 12,
      gridTemplateColumns: `repeat(auto-fit, minmax(min(${minColumn}px, 100%), 1fr))`,
    }}>
      {children}
    </div>
  )
}

export function SimulationSection({
  title,
  children,
  tone = "neutral",
}: {
  title: string
  children: ReactNode
  tone?: "neutral" | "teal" | "amber" | "blue"
}) {
  const toneMap = {
    neutral: { bg: C.card, border: C.border, title: C.text1 },
    teal: { bg: "rgba(94, 201, 161, 0.10)", border: `${T.teal.accent}33`, title: C.teal },
    amber: { bg: "rgba(240, 176, 96, 0.10)", border: `${T.amber.accent}33`, title: C.amber },
    blue: { bg: "rgba(132, 160, 220, 0.10)", border: `${T.blue.accent}33`, title: C.blue },
  } as const
  const current = toneMap[tone]

  return (
    <section style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 16,
      border: `1px solid ${current.border}`,
      background: current.bg,
      padding: "14px 14px 16px",
      display: "grid",
      gap: 12,
      minWidth: 0,
    }}>
      <RoughOverlay />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-board-display)", color: current.title }}>
          {title}
        </div>
        {children}
      </div>
    </section>
  )
}

export function SimulationPillRow({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>
}

export function SimulationPillButton({
  selected,
  color = T.teal,
  onClick,
  children,
}: {
  selected: boolean
  color?: { bg: string; fg: string; accent: string }
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: 999,
        border: `1px solid ${selected ? `${color.accent}77` : C.border}`,
        background: selected ? color.bg : C.card,
        color: selected ? darkAccent(color.fg) : C.text2,
        padding: "7px 11px",
        fontSize: 11.5,
        fontWeight: 650,
        fontFamily: "var(--font-board-body)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}

export function SimulationSelectableCard({
  title,
  body,
  footer,
  selected,
  onClick,
  color = T.teal,
  eyebrow,
}: {
  title: string
  body: ReactNode
  footer?: ReactNode
  selected: boolean
  onClick: () => void
  color?: { bg: string; fg: string; accent: string }
  eyebrow?: ReactNode
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    const btn = btnRef.current
    const svg = svgRef.current
    if (!btn || !svg) return

    let cancelled = false

    async function draw() {
      const s = svgRef.current
      if (!s) return
      const b = btnRef.current
      if (!b) return
      const w = b.offsetWidth
      const h = b.offsetHeight
      if (w === 0 || h === 0) return

      while (s.firstChild) s.removeChild(s.firstChild)
      const rough = (await import("roughjs")).default
      if (cancelled) return
      const rc = rough.svg(s)
      const node = rc.rectangle(0, 0, w, h, {
        seed: 42,
        stroke: "rgba(26, 26, 26, 0.25)",
        strokeWidth: 2.5,
        fill: "rgba(26, 26, 26, 0.03)",
        fillStyle: "hachure",
        roughness: 1.8,
        bowing: 1.6,
      })
      if (node) s.appendChild(node)
    }

    void draw()

    const ro = new ResizeObserver(() => { void draw() })
    ro.observe(btn)

    return () => {
      cancelled = true
      ro.disconnect()
    }
  }, [])

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      style={{
        position: "relative",
        overflow: "hidden",
        textAlign: "left",
        borderRadius: 16,
        border: `1px solid ${selected ? `${color.accent}88` : C.border}`,
        background: selected ? color.bg : C.card,
        padding: "14px",
        cursor: "pointer",
        display: "grid",
        gap: 8,
        minWidth: 0,
      }}
    >
      <svg ref={svgRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 1,
        }}
      />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-board-display)", color: selected ? darkAccent(color.fg) : C.text1 }}>
            {title}
          </div>
          {eyebrow ? (
            <div style={{ fontSize: 10.5, color: C.text3, fontFamily: "var(--font-board-body)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {eyebrow}
            </div>
          ) : null}
        </div>
        <div style={{ fontSize: 12.5, color: C.text2, fontFamily: "var(--font-board-body)", lineHeight: 1.65, overflowWrap: "anywhere" }}>
          {body}
        </div>
        {footer ? (
          <div style={{ fontSize: 11.5, color: selected ? darkAccent(color.fg) : C.text3, fontFamily: "var(--font-board-body)", lineHeight: 1.65, overflowWrap: "anywhere" }}>
            {footer}
          </div>
        ) : null}
      </div>
    </button>
  )
}

// ── Shared styles ──────────────────────────────────────────────────────

function controlButtonStyle(disabled: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    border: `1px solid ${disabled ? C.border : C.borderHi}`,
    background: disabled ? C.code : `linear-gradient(180deg, ${C.card}, ${C.shell})`,
    color: disabled ? C.text3 : C.text2,
    padding: "8px 12px",
    fontSize: 11.5,
    fontWeight: 650,
    fontFamily: "var(--font-board-body)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
  }
}
