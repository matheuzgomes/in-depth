"use client"

import { useMemo, useState } from "react"
import type { GILLabData, GILScenario, GILScenarioId } from "@/types"
import { T } from "@/lib/tokens"
import { ExplanationPanel, SimulationCodePanel, SimulationShell, StateCard } from "@/components/ui/simulationShared"

interface GILLabProps {
  data: GILLabData
}

export function GILLab({ data }: GILLabProps) {
  const [open, setOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<GILScenarioId>(data.defaultCase)

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
      stepLabel={open ? `${current.label} · ${current.question}` : undefined}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {data.cases.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedCase(item.id)}
            style={{
              borderRadius: 999,
              border: `1px solid ${item.id === selectedCase ? `${T.green.accent}77` : T.border}`,
              background: item.id === selectedCase ? T.green.bg : T.bg2,
              color: item.id === selectedCase ? T.green.fg : T.text2,
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
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        marginBottom: 16,
      }}>
        {data.cases.map((item) => (
          <ScenarioCard key={item.id} item={item} selected={item.id === selectedCase} onSelect={() => setSelectedCase(item.id)} />
        ))}
      </div>

      <SimulationCodePanel sourceCode={current.sourceCode} activeLine={1} />

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        marginBottom: 16,
      }}>
        <StateCard label="Question" value={current.question} color={T.green} minHeight={88} />
        <StateCard label="Python bytecode in parallel?" value={current.bytecodeParallelism} color={T.blue} minHeight={88} />
        <StateCard label="Shared memory model" value={current.sharedMemory} color={T.amber} minHeight={88} />
        <StateCard label="Representative local result" value={current.measurement} color={T.coral} minHeight={88} />
      </div>

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        marginBottom: 16,
      }}>
        <DetailPanel label="Mechanism" body={current.mechanism} color={T.blue} />
        <DetailPanel label="Production rule" body={current.productionRule} color={T.green} />
        <DetailPanel label="Version note" body={current.versionNote} color={T.amber} />
      </div>

      <ExplanationPanel
        title="Important warning"
        explanation={current.warning}
        footer={
          <div style={{ marginTop: 10, fontSize: 11.5, color: T.text3, lineHeight: 1.65 }}>
            {data.note}
          </div>
        }
      />
    </SimulationShell>
  )
}

function ScenarioCard({
  item,
  selected,
  onSelect,
}: {
  item: GILScenario
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        textAlign: "left",
        borderRadius: 12,
        border: `1px solid ${selected ? `${T.green.accent}88` : T.border}`,
        background: selected ? T.green.bg : T.bg2,
        padding: "13px 14px",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: selected ? T.green.fg : T.text1 }}>
          {item.label}
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.65, marginBottom: 6 }}>
        {item.question}
      </div>
      <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.65 }}>
        {item.mechanism}
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
      border: `1px solid ${color.accent}44`,
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
