"use client"

import { useState } from "react"
import type { SliceSimulationData } from "@/types"
import { T } from "@/lib/tokens"
import { ExplanationPanel, SimulationCodePanel, SimulationControls, SimulationGrid, SimulationSection, SimulationShell, StateCard } from "@/components/ui/simulationShared"

interface SliceSimulationProps {
  data: SliceSimulationData
}

export function SliceSimulation({ data }: SliceSimulationProps) {
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
        <StateCard label="start" value={String(step.start)} color={T.teal} />
        <StateCard label="stop" value={String(step.stop)} color={T.amber} />
        <StateCard label="Result length" value={String(step.resultItems.length)} color={T.blue} />
      </SimulationGrid>

      <SimulationSection title={data.sourceLabel} tone="neutral">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {data.items.map((item, index) => {
            const isSelected = step.selectedIndices.includes(index)

            return (
              <div key={index} style={{ minWidth: 62 }}>
                <div style={{ fontSize: 10.5, color: T.text3, marginBottom: 5, textAlign: "center" }}>
                  [{index}]
                </div>
                <div style={{
                  borderRadius: 10,
                  border: `0.5px solid ${isSelected ? `${T.teal.accent}88` : T.border}`,
                  background: isSelected ? T.teal.bg : T.bg1,
                  color: isSelected ? T.teal.fg : T.text2,
                  padding: "10px 12px",
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 650,
                }}>
                  {String(item)}
                </div>
              </div>
            )
          })}
        </div>
      </SimulationSection>

      <SimulationSection title={data.resultLabel} tone={step.allocated ? "blue" : "neutral"}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {step.resultItems.length === 0 ? (
            <div style={{ fontSize: 12.5, color: T.text3 }}>result list not allocated yet</div>
          ) : (
            step.resultItems.map((item, index) => (
              <div key={index} style={{ minWidth: 62 }}>
                <div style={{ fontSize: 10.5, color: T.text3, marginBottom: 5, textAlign: "center" }}>
                  [{index}]
                </div>
                <div style={{
                  borderRadius: 10,
                  border: `0.5px solid ${T.blue.accent}66`,
                  background: T.blue.bg,
                  color: T.blue.fg,
                  padding: "10px 12px",
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 650,
                }}>
                  {String(item)}
                </div>
              </div>
            ))
          )}
        </div>
      </SimulationSection>

      <ExplanationPanel explanation={step.explanation} done={step.done} />
    </SimulationShell>
  )
}
