"use client"

import { useMemo, useState } from "react"
import type { BytecodeCase, BytecodeCaseId, BytecodeLabData } from "@/types"
import { T } from "@/lib/tokens"
import {
  ExplanationPanel,
  SimulationCodePanel,
  SimulationGrid,
  SimulationPillButton,
  SimulationPillRow,
  SimulationSelectableCard,
  SimulationShell,
  StateCard,
} from "@/components/ui/simulationShared"

interface BytecodeLabProps {
  data: BytecodeLabData
}

export function BytecodeLab({ data }: BytecodeLabProps) {
  const [open, setOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<BytecodeCaseId>(data.defaultCase)

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
          <SimulationPillButton key={item.id} selected={item.id === selectedCase} color={T.amber} onClick={() => setSelectedCase(item.id)}>
            {item.label}
          </SimulationPillButton>
        ))}
      </SimulationPillRow>

      <SimulationGrid minColumn={240}>
        {data.cases.map((item) => (
          <BytecodeSummaryCard key={item.id} item={item} selected={item.id === selectedCase} onSelect={() => setSelectedCase(item.id)} />
        ))}
      </SimulationGrid>

      <SimulationCodePanel sourceCode={current.sourceCode} activeLine={1} />

      <DisassemblyPanel text={current.disassembly} />

      <SimulationGrid minColumn={180}>
        <StateCard label="Question" value={current.question} color={T.amber} minHeight={88} />
        <StateCard label="Key opcodes" value={current.keyOpcodes.join(", ")} color={T.blue} minHeight={88} />
        <StateCard label="Version note" value={current.versionNote} color={T.teal} minHeight={88} />
      </SimulationGrid>

      <SimulationGrid minColumn={220}>
        <DetailPanel label="What the disassembly is telling you" body={current.headline} color={T.blue} />
        <DetailPanel label="Why it can matter" body={current.whyItCanMatter} color={T.green} />
        <DetailPanel label="Production rule" body={current.productionRule} color={T.amber} />
      </SimulationGrid>

      <ExplanationPanel
        title="Interpretation warning"
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

function BytecodeSummaryCard({
  item,
  selected,
  onSelect,
}: {
  item: BytecodeCase
  selected: boolean
  onSelect: () => void
}) {
  return <SimulationSelectableCard title={item.label} body={item.question} footer={item.headline} selected={selected} onClick={onSelect} color={T.amber} />
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

function DisassemblyPanel({ text }: { text: string }) {
  return (
    <div style={{
      borderRadius: 16,
      border: `1px solid ${T.border}`,
      background: `linear-gradient(180deg, ${T.code}, ${T.bg0})`,
      padding: "14px 16px",
      marginBottom: 16,
      overflowX: "auto",
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03)`,
    }}>
      <div style={{
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: T.text3,
        marginBottom: 8,
        fontFamily: "var(--font-display)",
      }}>
        Representative disassembly
      </div>
      <pre style={{
        margin: 0,
        color: T.text2,
        fontFamily: "var(--font-mono)",
        fontSize: 12.5,
        lineHeight: 1.7,
        whiteSpace: "pre",
      }}>
        {text}
      </pre>
    </div>
  )
}
