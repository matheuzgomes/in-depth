"use client"

import type { CSSProperties, ReactNode } from "react"
import { ChevronLeft, ChevronRight, Play, RotateCcw, SkipForward } from "lucide-react"
import { T } from "@/lib/tokens"
import { highlightLine } from "@/lib/highlight"

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
      border: `1px solid ${T.borderHi}`,
      background: `linear-gradient(180deg, ${T.articleAlt}, ${T.article})`,
      boxShadow: `0 20px 48px rgba(2, 6, 16, 0.28), inset 0 1px 0 rgba(255,255,255,0.03)`,
      overflow: "hidden",
    }}>
      {!open ? (
        <div style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 8 }}>
            {title}
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: T.text2, maxWidth: 58 * 8 }}>
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
              background: `linear-gradient(180deg, ${T.teal.bg}, ${T.bg2})`,
              color: T.teal.fg,
              padding: "10px 14px",
              fontSize: 12.5,
              fontWeight: 650,
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
            borderBottom: `1px solid ${T.border}`,
              background: `linear-gradient(180deg, ${T.bg2}, ${T.articleAlt})`,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text1 }}>{title}</div>
              {stepLabel ? (
                <div style={{ fontSize: 11.5, color: T.text3, marginTop: 4, lineHeight: 1.45 }}>{stepLabel}</div>
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
      borderRadius: 16,
      border: `1px solid ${T.border}`,
      background: `linear-gradient(180deg, ${T.code}, ${T.bg0})`,
      padding: "14px 16px",
      fontFamily: "var(--font-mono)",
      fontSize: 12.5,
      lineHeight: 1.75,
      overflowX: "auto",
    }}>
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
            <span style={{ color: active ? T.teal.fg : T.text3, userSelect: "none" }}>{lineNumber}</span>
            <code style={{ display: "block", whiteSpace: "pre" }}>{highlightLine(line)}</code>
          </div>
        )
      })}
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
      borderRadius: 16,
      border: `1px solid ${color.accent}44`,
      background: `linear-gradient(180deg, ${color.bg}, rgba(255,255,255,0.02))`,
      padding: "12px 13px",
      minHeight,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: color.fg, marginBottom: 8, fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, color: T.text1, lineHeight: 1.55, fontFamily: "var(--font-mono)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
        {value}
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
      borderRadius: 16,
      border: `1px solid ${T.border}`,
      background: done ? "rgba(106, 171, 238, 0.12)" : `linear-gradient(180deg, ${T.bg2}, ${T.articleAlt})`,
      padding: "13px 14px",
    }}>
      <div style={{ fontSize: 12.5, color: T.text1, fontWeight: 650, marginBottom: 5 }}>
        {title}
      </div>
      <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.75 }}>
        {explanation}
      </div>
      {footer}
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
    neutral: { bg: T.bg2, border: T.border, title: T.text1 },
    teal: { bg: "rgba(94, 201, 161, 0.08)", border: `${T.teal.accent}33`, title: T.teal.fg },
    amber: { bg: "rgba(240, 176, 96, 0.08)", border: `${T.amber.accent}33`, title: T.amber.fg },
    blue: { bg: "rgba(132, 160, 220, 0.08)", border: `${T.blue.accent}33`, title: T.blue.fg },
  } as const
  const current = toneMap[tone]

  return (
    <section style={{
      borderRadius: 16,
      border: `1px solid ${current.border}`,
      background: current.bg,
      padding: "14px 14px 16px",
      display: "grid",
      gap: 12,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: current.title }}>
        {title}
      </div>
      {children}
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
        border: `1px solid ${selected ? `${color.accent}77` : T.border}`,
        background: selected ? color.bg : T.bg2,
        color: selected ? color.fg : T.text2,
        padding: "7px 11px",
        fontSize: 11.5,
        fontWeight: 650,
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
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        borderRadius: 16,
        border: `1px solid ${selected ? `${color.accent}88` : T.border}`,
        background: selected ? color.bg : T.bg2,
        padding: "14px",
        cursor: "pointer",
        display: "grid",
        gap: 8,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: selected ? color.fg : T.text1 }}>
          {title}
        </div>
        {eyebrow ? (
          <div style={{ fontSize: 10.5, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {eyebrow}
          </div>
        ) : null}
      </div>
      <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.65, overflowWrap: "anywhere" }}>
        {body}
      </div>
      {footer ? (
        <div style={{ fontSize: 11.5, color: selected ? color.fg : T.text3, lineHeight: 1.65, overflowWrap: "anywhere" }}>
          {footer}
        </div>
      ) : null}
    </button>
  )
}

function controlButtonStyle(disabled: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    border: `1px solid ${disabled ? T.border : T.borderHi}`,
    background: disabled ? T.bg1 : `linear-gradient(180deg, ${T.bg3}, ${T.bg2})`,
    color: disabled ? T.text3 : T.text2,
    padding: "8px 12px",
    fontSize: 11.5,
    fontWeight: 650,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
  }
}
