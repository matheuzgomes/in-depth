"use client"

import { useMemo, useState } from "react"
import type { AsyncTimelineLabData, AsyncTimelineStatus } from "@/types"
import { T } from "@/lib/tokens"
import {
  ExplanationPanel,
  SimulationCodePanel,
  SimulationControls,
  SimulationGrid,
  SimulationPillButton,
  SimulationPillRow,
  SimulationSection,
  SimulationShell,
  StateCard,
} from "@/components/ui/simulationShared"

interface AsyncTimelineLabProps {
  data: AsyncTimelineLabData
}

const STATUS_STYLE: Record<AsyncTimelineStatus, { bg: string; fg: string; border: string }> = {
  running: { bg: T.teal.bg, fg: T.teal.fg, border: `${T.teal.accent}88` },
  ready: { bg: T.blue.bg, fg: T.blue.fg, border: `${T.blue.accent}88` },
  awaiting: { bg: T.amber.bg, fg: T.amber.fg, border: `${T.amber.accent}88` },
  blocked: { bg: T.coral.bg, fg: T.coral.fg, border: `${T.coral.accent}88` },
  done: { bg: "rgba(136, 196, 90, 0.12)", fg: T.green.fg, border: `${T.green.accent}88` },
  cancelled: { bg: "rgba(255, 132, 132, 0.12)", fg: T.coral.fg, border: `${T.coral.accent}88` },
}

export function AsyncTimelineLab({ data }: AsyncTimelineLabProps) {
  const [open, setOpen] = useState(false)
  const [scenarioId, setScenarioId] = useState(data.defaultScenarioId)
  const [stepIndex, setStepIndex] = useState(0)

  const scenario = useMemo(
    () => data.scenarios.find((item) => item.id === scenarioId) ?? data.scenarios[0],
    [data.scenarios, scenarioId],
  )

  const step = scenario.steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === scenario.steps.length - 1

  return (
    <SimulationShell
      open={open}
      title={data.title}
      summary={data.summary}
      ctaLabel={data.ctaLabel}
      onOpen={() => {
        setOpen(true)
        setScenarioId(data.defaultScenarioId)
        setStepIndex(0)
      }}
      stepLabel={open ? `${scenario.label} · Tick ${step.tick} · ${step.label}` : undefined}
    >
      <SimulationPillRow>
        {data.scenarios.map((item) => (
          <SimulationPillButton key={item.id} selected={item.id === scenario.id} onClick={() => {
              setScenarioId(item.id)
              setStepIndex(0)
            }}>
            {item.label}
          </SimulationPillButton>
        ))}
      </SimulationPillRow>

      <SimulationControls
        isFirst={isFirst}
        isLast={isLast}
        onBack={() => setStepIndex(stepIndex - 1)}
        onNext={() => setStepIndex(stepIndex + 1)}
        onReset={() => setStepIndex(0)}
        onResult={() => setStepIndex(scenario.steps.length - 1)}
      />

      <SimulationCodePanel sourceCode={scenario.sourceCode} activeLine={step.activeLine} />

      <SimulationGrid minColumn={180}>
        <StateCard label="Scenario" value={scenario.label} color={T.teal} />
        <StateCard label="Event loop tick" value={String(step.tick)} color={T.blue} />
        <StateCard label="Current event" value={step.event} color={T.amber} minHeight={88} />
      </SimulationGrid>

      <SimulationSection title="Task lanes" tone="neutral">
        <div style={{ display: "grid", gap: 10 }}>
          {step.tasks.map((task) => {
            const style = STATUS_STYLE[task.status]
            return (
              <div key={task.name} style={{
                borderRadius: 10,
                border: `0.5px solid ${style.border}`,
                background: style.bg,
                padding: "10px 12px",
                display: "grid",
                gap: 4,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: style.fg, fontWeight: 650 }}>
                    {task.name}
                  </div>
                  <div style={{ fontSize: 10.5, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {task.status}
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.65 }}>
                  {task.detail}
                </div>
              </div>
            )
          })}
        </div>
      </SimulationSection>

      <ExplanationPanel
        title="What the event loop is doing now"
        explanation={step.explanation}
        done={step.done}
        footer={
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.65 }}>
              <strong style={{ color: T.text2, fontWeight: 650 }}>Scenario summary:</strong> {scenario.summary}
            </div>
            <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.65 }}>
              <strong style={{ color: T.text2, fontWeight: 650 }}>Key takeaway:</strong> {scenario.takeaway}
            </div>
            {data.note ? (
              <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.65 }}>
                {data.note}
              </div>
            ) : null}
          </div>
        }
      />
    </SimulationShell>
  )
}
