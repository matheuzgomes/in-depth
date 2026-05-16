"use client"

import { useMemo, useState } from "react"
import type { GILLabData, GILScenario, GILScenarioId } from "@/types"
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
      <SimulationPillRow>
        {data.cases.map((item) => (
          <SimulationPillButton key={item.id} selected={item.id === selectedCase} color={T.green} onClick={() => setSelectedCase(item.id)}>
            {item.label}
          </SimulationPillButton>
        ))}
      </SimulationPillRow>

      <SimulationGrid minColumn={240}>
        {data.cases.map((item) => (
          <ScenarioCard key={item.id} item={item} selected={item.id === selectedCase} onSelect={() => setSelectedCase(item.id)} />
        ))}
      </SimulationGrid>

      <SimulationCodePanel sourceCode={current.sourceCode} activeLine={1} />

      <SimulationGrid minColumn={190}>
        <StateCard label="Question" value={current.question} color={T.green} minHeight={88} />
        <StateCard label="Python bytecode in parallel?" value={current.bytecodeParallelism} color={T.blue} minHeight={88} />
        <StateCard label="Shared memory model" value={current.sharedMemory} color={T.amber} minHeight={88} />
        <StateCard label="Representative local result" value={current.measurement} color={T.coral} minHeight={88} />
      </SimulationGrid>

      <SimulationGrid minColumn={220}>
        <DetailPanel label="Mechanism" body={current.mechanism} color={T.blue} />
        <DetailPanel label="Production rule" body={current.productionRule} color={T.green} />
        <DetailPanel label="Version note" body={current.versionNote} color={T.amber} />
      </SimulationGrid>

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
  return <SimulationSelectableCard title={item.label} body={item.question} footer={item.mechanism} selected={selected} onClick={onSelect} color={T.green} />
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
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: darkAccent(color.fg), marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: C.text1, lineHeight: 1.75 }}>
        {body}
      </div>
    </div>
  )
}
