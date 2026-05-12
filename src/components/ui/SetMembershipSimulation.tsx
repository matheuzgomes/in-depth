"use client"

import { useState } from "react"
import type { SetMembershipSimulationData } from "@/types"
import { T } from "@/lib/tokens"
import { ExplanationPanel, SimulationCodePanel, SimulationControls, SimulationGrid, SimulationSection, SimulationShell, StateCard } from "@/components/ui/simulationShared"

interface SetMembershipSimulationProps {
  data: SetMembershipSimulationData
}

const STATUS_STYLE = {
  empty: { bg: T.bg1, fg: T.text3, border: T.border },
  occupied: { bg: T.bg1, fg: T.text2, border: T.border },
  active: { bg: T.teal.bg, fg: T.teal.fg, border: `${T.teal.accent}88` },
  collision: { bg: T.amber.bg, fg: T.amber.fg, border: `${T.amber.accent}88` },
  match: { bg: T.blue.bg, fg: T.blue.fg, border: `${T.blue.accent}88` },
} as const

export function SetMembershipSimulation({ data }: SetMembershipSimulationProps) {
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

      <SimulationGrid minColumn={170}>
        <StateCard label="Lookup value" value={step.lookupValue} color={T.teal} />
        <StateCard label="Home bucket" value={String(step.homeBucket)} color={T.amber} />
        <StateCard label={data.resultLabel} value={step.resultValue === null ? "not known yet" : String(step.resultValue)} color={T.blue} />
      </SimulationGrid>

      <SimulationSection title={data.setLabel} tone="neutral">
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))" }}>
          {step.slots.map((slot, index) => {
            const style = STATUS_STYLE[slot.status]
            return (
              <div
                key={index}
                style={{
                  borderRadius: 10,
                  border: `0.5px solid ${style.border}`,
                  background: style.bg,
                  padding: "10px 10px 11px",
                  minHeight: 78,
                }}
              >
                <div style={{ fontSize: 10.5, color: T.text3, marginBottom: 7 }}>bucket {index}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: style.fg, lineHeight: 1.55 }}>
                  {slot.value ?? "empty"}
                </div>
              </div>
            )
          })}
        </div>
      </SimulationSection>

      <ExplanationPanel
        explanation={step.explanation}
        done={step.done}
        footer={
          <>
            <div style={{ marginTop: 10, fontSize: 12.5, color: T.text3 }}>
              Probe path: {step.probePath.length === 0 ? "not started yet" : step.probePath.join(" -> ")}
            </div>
            {data.note ? (
              <div style={{ marginTop: 8, fontSize: 11.5, color: T.text3, lineHeight: 1.65 }}>
                {data.note}
              </div>
            ) : null}
          </>
        }
      />
    </SimulationShell>
  )
}
