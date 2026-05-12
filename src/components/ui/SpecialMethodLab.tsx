"use client"

import { useMemo, useState } from "react"
import type { SpecialMethodCase, SpecialMethodCaseId, SpecialMethodLabData } from "@/types"
import { T } from "@/lib/tokens"
import { ExplanationPanel, SimulationCodePanel, SimulationShell, StateCard } from "@/components/ui/simulationShared"

interface SpecialMethodLabProps {
  data: SpecialMethodLabData
}

export function SpecialMethodLab({ data }: SpecialMethodLabProps) {
  const [open, setOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<SpecialMethodCaseId>(data.defaultCase)

  const current = useMemo(
    () => data.cases.find((item) => item.id === selectedCase) ?? data.cases[0],
    [data.cases, selectedCase],
  )

  return (
    <SimulationShell
      open={open}
      title={data.title}
      summary={data.summary}
      ctaLabel={data.ctaLabel}
      onOpen={() => {
        setOpen(true)
        setSelectedCase(data.defaultCase)
      }}
      stepLabel={open ? `${current.label} · ${current.trigger}` : undefined}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {data.cases.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedCase(item.id)}
            style={{
              borderRadius: 999,
              border: `0.5px solid ${item.id === selectedCase ? `${T.teal.accent}77` : T.border}`,
              background: item.id === selectedCase ? T.teal.bg : T.bg2,
              color: item.id === selectedCase ? T.teal.fg : T.text2,
              padding: "7px 11px",
              fontSize: 11.5,
              fontWeight: 650,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        marginBottom: 16,
      }}>
        {data.cases.map((item) => (
          <CaseSummaryCard key={item.id} item={item} selected={item.id === selectedCase} onSelect={() => setSelectedCase(item.id)} />
        ))}
      </div>

      <SimulationCodePanel sourceCode={current.code} activeLine={1} />

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        marginBottom: 16,
      }}>
        <StateCard label="Python spelling" value={current.trigger} color={T.teal} />
        <StateCard label="Primary hook" value={current.primaryMethod} color={T.blue} />
        <StateCard label="Fallback" value={current.fallback ?? "none"} color={T.amber} minHeight={88} />
      </div>

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        marginBottom: 16,
      }}>
        <DetailPanel label="What Python is doing" body={current.summary} color={T.teal} />
        <DetailPanel label="Implementation rule" body={current.implementationRule} color={T.green} />
        <DetailPanel label="Production warning" body={current.warning} color={T.coral} />
      </div>

      <ExplanationPanel
        title={`${current.trigger} dispatch path`}
        explanation={`${current.summary} ${current.fallback ?? "There is no meaningful fallback path for this operation."}`}
        footer={
          <div style={{ marginTop: 10, fontSize: 11.5, color: T.text3, lineHeight: 1.65 }}>
            {data.note}
          </div>
        }
      />
    </SimulationShell>
  )
}

function CaseSummaryCard({
  item,
  selected,
  onSelect,
}: {
  item: SpecialMethodCase
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        textAlign: "left",
        borderRadius: 12,
        border: `0.5px solid ${selected ? `${T.teal.accent}88` : T.border}`,
        background: selected ? T.teal.bg : T.bg2,
        padding: "13px 14px",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: selected ? T.teal.fg : T.text1 }}>
          {item.label}
        </div>
        <div style={{ fontSize: 10.5, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {item.primaryMethod}
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.65, marginBottom: 6 }}>
        {item.trigger}
      </div>
      <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.65 }}>
        {item.summary}
      </div>
    </button>
  )
}

function DetailPanel({
  label,
  body,
  color,
}: {
  label: string
  body: string
  color: { bg: string; fg: string; accent: string }
}) {
  return (
    <div style={{
      borderRadius: 12,
      border: `0.5px solid ${color.accent}44`,
      background: color.bg,
      padding: "13px 14px",
    }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: color.fg, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: T.text1, lineHeight: 1.75 }}>
        {body}
      </div>
    </div>
  )
}
