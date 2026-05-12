"use client"

import { useState } from "react"
import type { LoopSimulationData } from "@/types"
import { T } from "@/lib/tokens"
import { ExplanationPanel, SimulationCodePanel, SimulationControls, SimulationShell, StateCard } from "@/components/ui/simulationShared"

interface LoopSimulationProps {
  data: LoopSimulationData
}

export function LoopSimulation({ data }: LoopSimulationProps) {
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const step = data.steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === data.steps.length - 1

  const openSimulation = () => {
    setOpen(true)
    setStepIndex(0)
  }

  return (
    <SimulationShell
      open={open}
      title={data.title}
      summary={data.summary}
      ctaLabel={data.ctaLabel}
      onOpen={openSimulation}
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
        <StateCard label={data.itemVariableLabel} value={step.currentItem === null ? "not bound yet" : String(step.currentItem)} color={T.teal} />
        <StateCard label={data.accumulatorLabel} value={String(step.accumulatorValue)} color={T.blue} />
        <StateCard label="Traversal state" value={step.done ? data.resultLabel : step.pointer === null ? "ready to iterate" : `reading index ${step.pointer}`} color={T.amber} />
      </div>

      <div style={{
        borderRadius: 12,
        border: `0.5px solid ${T.border}`,
        background: T.bg2,
        padding: "14px 14px 16px",
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text1, marginBottom: 12 }}>
          {data.iterableLabel}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {data.items.map((item, index) => {
            const isCurrent = step.pointer === index
            const isVisited = step.visitedIndices.includes(index)
            const background = isCurrent
              ? T.teal.bg
              : isVisited
                ? "rgba(136, 196, 90, 0.12)"
                : T.bg1
            const borderColor = isCurrent
              ? `${T.teal.accent}88`
              : isVisited
                ? `${T.green.accent}66`
                : T.border
            const color = isCurrent ? T.teal.fg : isVisited ? T.green.fg : T.text2

            return (
              <div key={index} style={{ minWidth: 62 }}>
                <div style={{ fontSize: 10.5, color: T.text3, marginBottom: 5, textAlign: "center" }}>
                  [{index}]
                </div>
                <div style={{
                  borderRadius: 10,
                  border: `0.5px solid ${borderColor}`,
                  background,
                  color,
                  padding: "10px 12px",
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 650,
                  boxShadow: isCurrent ? `0 0 0 1px ${T.teal.accent}22 inset` : "none",
                }}>
                  {String(item)}
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
            Final result: {data.resultLabel} = {String(step.accumulatorValue)}
          </div>
        ) : undefined}
      />
    </SimulationShell>
  )
}
