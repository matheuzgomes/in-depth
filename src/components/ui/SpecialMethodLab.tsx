"use client"

import { useMemo, useState } from "react"
import type { SpecialMethodCase, SpecialMethodCaseId, SpecialMethodLabData } from "@/types"
import { T } from "@/lib/tokens"
import {
  C,
  ExplanationPanel,
  SimulationCodePanel,
  SimulationGrid,
  SimulationPillButton,
  SimulationPillRow,
  SimulationSelectableCard,
  SimulationShell,
  StateCard,
  darkAccent,
} from "@/components/ui/simulationShared"

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
      <SimulationPillRow>
        {data.cases.map((item) => (
          <SimulationPillButton key={item.id} selected={item.id === selectedCase} onClick={() => setSelectedCase(item.id)}>
            {item.label}
          </SimulationPillButton>
        ))}
      </SimulationPillRow>

      <SimulationGrid minColumn={220}>
        {data.cases.map((item) => (
          <CaseSummaryCard key={item.id} item={item} selected={item.id === selectedCase} onSelect={() => setSelectedCase(item.id)} />
        ))}
      </SimulationGrid>

      <SimulationCodePanel sourceCode={current.code} activeLine={1} />

      <SimulationGrid minColumn={170}>
        <StateCard label="Python spelling" value={current.trigger} color={T.teal} />
        <StateCard label="Primary hook" value={current.primaryMethod} color={T.blue} />
        <StateCard label="Fallback" value={current.fallback ?? "none"} color={T.amber} minHeight={88} />
      </SimulationGrid>

      <SimulationGrid minColumn={220}>
        <DetailPanel label="What Python is doing" body={current.summary} color={T.teal} />
        <DetailPanel label="Implementation rule" body={current.implementationRule} color={T.green} />
        <DetailPanel label="Production warning" body={current.warning} color={T.coral} />
      </SimulationGrid>

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
  return <SimulationSelectableCard title={item.label} body={item.trigger} footer={item.summary} selected={selected} onClick={onSelect} color={T.teal} eyebrow={item.primaryMethod} />
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
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: darkAccent(color.fg), marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: C.text1, lineHeight: 1.75 }}>
        {body}
      </div>
    </div>
  )
}
