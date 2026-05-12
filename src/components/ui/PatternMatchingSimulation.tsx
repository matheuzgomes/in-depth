"use client"

import { useState } from "react"
import type { PatternMatchingSimulationData } from "@/types"
import { T } from "@/lib/tokens"
import { ExplanationPanel, SimulationCodePanel, SimulationControls, SimulationShell, StateCard } from "@/components/ui/simulationShared"

interface PatternMatchingSimulationProps {
  data: PatternMatchingSimulationData
}

const CASE_STYLE = {
  pending: { bg: T.bg1, fg: T.text2, border: T.border },
  active: { bg: T.teal.bg, fg: T.teal.fg, border: `${T.teal.accent}88` },
  failed: { bg: T.amber.bg, fg: T.amber.fg, border: `${T.amber.accent}88` },
  matched: { bg: T.blue.bg, fg: T.blue.fg, border: `${T.blue.accent}88` },
} as const

export function PatternMatchingSimulation({ data }: PatternMatchingSimulationProps) {
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const step = data.steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === data.steps.length - 1

  return (
    <SimulationShell
      open={open}
      title={data.title}
      summary={data.summary}
      ctaLabel={data.ctaLabel}
      onOpen={() => {
        setOpen(true)
        setStepIndex(0)
      }}
      stepLabel={open ? `Step ${stepIndex + 1} of ${data.steps.length}: ${step.label}` : undefined}
    >
      <SimulationControls
        isFirst={isFirst}
        isLast={isLast}
        onBack={() => setStepIndex(stepIndex - 1)}
        onNext={() => setStepIndex(stepIndex + 1)}
        onReset={() => setStepIndex(0)}
        onResult={() => setStepIndex(data.steps.length - 1)}
      />

      <SimulationCodePanel sourceCode={data.sourceCode} activeLine={step.activeLine} />

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        marginBottom: 16,
      }}>
        <StateCard label={data.subjectLabel} value={JSON.stringify(step.subject)} color={T.teal} />
        <StateCard
          label="Bound names"
          value={step.bindings.length === 0 ? "none yet" : step.bindings.map(({ name, value }) => `${name} = ${String(value)}`).join("\n")}
          color={T.amber}
          minHeight={88}
        />
        <StateCard label={data.resultLabel} value={step.resultValue ?? "not computed yet"} color={T.blue} />
      </div>

      <div style={{
        borderRadius: 12,
        border: `0.5px solid ${T.border}`,
        background: T.bg2,
        padding: "14px 14px 16px",
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text1, marginBottom: 12 }}>
          Cases in source order
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {step.cases.map((caseState, index) => {
            const style = CASE_STYLE[caseState.status]
            return (
              <div
                key={`${caseState.pattern}-${index}`}
                style={{
                  borderRadius: 10,
                  border: `0.5px solid ${style.border}`,
                  background: style.bg,
                  padding: "10px 12px",
                }}
              >
                <div style={{ fontSize: 10.5, color: T.text3, marginBottom: 6 }}>case {index + 1}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: style.fg, marginBottom: 6 }}>
                  {caseState.pattern}
                </div>
                <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.65 }}>
                  {caseState.note}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ExplanationPanel
        explanation={step.explanation}
        done={step.done}
        footer={step.done ? (
          <div style={{ marginTop: 10, fontSize: 12.5, color: T.blue.fg }}>
            Final branch result: {step.resultValue}
          </div>
        ) : null}
      />
    </SimulationShell>
  )
}
