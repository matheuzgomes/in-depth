"use client"

import { useMemo, useState } from "react"
import type { BytecodeCase, BytecodeCaseId, BytecodeLabData } from "@/types"
import { T } from "@/lib/tokens"
import { ExplanationPanel, SimulationCodePanel, SimulationShell, StateCard } from "@/components/ui/simulationShared"

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
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {data.cases.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedCase(item.id)}
            style={{
              borderRadius: 999,
              border: `1px solid ${item.id === selectedCase ? `${T.amber.accent}77` : T.border}`,
              background: item.id === selectedCase ? T.amber.bg : T.bg2,
              color: item.id === selectedCase ? T.amber.fg : T.text2,
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
          <BytecodeSummaryCard key={item.id} item={item} selected={item.id === selectedCase} onSelect={() => setSelectedCase(item.id)} />
        ))}
      </div>

      <SimulationCodePanel sourceCode={current.sourceCode} activeLine={1} />

      <DisassemblyPanel text={current.disassembly} />

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        marginBottom: 16,
      }}>
        <StateCard label="Question" value={current.question} color={T.amber} minHeight={88} />
        <StateCard label="Key opcodes" value={current.keyOpcodes.join(", ")} color={T.blue} minHeight={88} />
        <StateCard label="Version note" value={current.versionNote} color={T.teal} minHeight={88} />
      </div>

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        marginBottom: 16,
      }}>
        <DetailPanel label="What the disassembly is telling you" body={current.headline} color={T.blue} />
        <DetailPanel label="Why it can matter" body={current.whyItCanMatter} color={T.green} />
        <DetailPanel label="Production rule" body={current.productionRule} color={T.amber} />
      </div>

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
  return (
    <button
      onClick={onSelect}
      style={{
        textAlign: "left",
        borderRadius: 12,
        border: `1px solid ${selected ? `${T.amber.accent}88` : T.border}`,
        background: selected ? T.amber.bg : T.bg2,
        padding: "13px 14px",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: selected ? T.amber.fg : T.text1 }}>
          {item.label}
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.65, marginBottom: 6 }}>
        {item.question}
      </div>
      <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.65 }}>
        {item.headline}
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
