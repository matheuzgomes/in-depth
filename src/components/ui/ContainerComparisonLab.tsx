"use client"

import { useMemo, useState } from "react"
import type { ContainerComparisonContainer, ContainerComparisonId, ContainerComparisonLabData, ContainerWorkloadId } from "@/types"
import { T } from "@/lib/tokens"
import {
  ExplanationPanel,
  SimulationCodePanel,
  SimulationGrid,
  SimulationPillButton,
  SimulationPillRow,
  SimulationSection,
  SimulationSelectableCard,
  SimulationShell,
  StateCard,
} from "@/components/ui/simulationShared"

interface ContainerComparisonLabProps {
  data: ContainerComparisonLabData
}

const CONTAINER_COLORS = {
  list: T.teal,
  tuple: T.blue,
  set: T.green,
  array: T.amber,
} as const

export function ContainerComparisonLab({ data }: ContainerComparisonLabProps) {
  const [open, setOpen] = useState(false)
  const [selectedContainer, setSelectedContainer] = useState<ContainerComparisonId>(data.defaultContainer)
  const [selectedWorkload, setSelectedWorkload] = useState<ContainerWorkloadId>(data.defaultWorkload)

  const container = useMemo(
    () => data.containers.find((item) => item.id === selectedContainer) ?? data.containers[0],
    [data.containers, selectedContainer],
  )
  const workload = useMemo(
    () => data.workloads.find((item) => item.id === selectedWorkload) ?? data.workloads[0],
    [data.workloads, selectedWorkload],
  )
  const metric = container.metrics[selectedWorkload]

  return (
    <SimulationShell
      open={open}
      title={data.title}
      summary={data.summary}
      ctaLabel={data.ctaLabel}
      onOpen={() => {
        setOpen(true)
        setSelectedContainer(data.defaultContainer)
        setSelectedWorkload(data.defaultWorkload)
      }}
      stepLabel={open ? `Workload: ${workload.label} · Focus: ${container.label}` : undefined}
    >
      <div style={{ display: "grid", gap: 10 }}>
        <SimulationSection title="Workload" tone="teal">
          <SimulationPillRow>
            {data.workloads.map((item) => (
              <SimulationPillButton key={item.id} selected={item.id === selectedWorkload} onClick={() => setSelectedWorkload(item.id)}>
                {item.label}
              </SimulationPillButton>
            ))}
          </SimulationPillRow>
        </SimulationSection>

        <SimulationSection title="Container" tone="blue">
          <SimulationPillRow>
            {data.containers.map((item) => (
              <SimulationPillButton key={item.id} selected={item.id === selectedContainer} onClick={() => setSelectedContainer(item.id)}>
                {item.label}
              </SimulationPillButton>
            ))}
          </SimulationPillRow>
        </SimulationSection>
      </div>

      <SimulationGrid minColumn={220}>
        {data.containers.map((item) => (
          <SummaryCard
            key={item.id}
            container={item}
            selected={item.id === selectedContainer}
            workload={selectedWorkload}
            onSelect={() => setSelectedContainer(item.id)}
          />
        ))}
      </SimulationGrid>

      <SimulationCodePanel sourceCode={metric.code} activeLine={1} />

      <SimulationGrid minColumn={180}>
        <StateCard label="Complexity / shape" value={metric.complexity} color={CONTAINER_COLORS[container.id]} />
        <StateCard label="Measured local proof" value={metric.measured} color={T.blue} />
        <StateCard label="Workload verdict" value={metric.headline} color={T.amber} />
      </SimulationGrid>

      <SimulationGrid minColumn={210}>
        <DetailPanel label="Storage model" body={container.storageModel} />
        <DetailPanel label="Best when" body={metric.bestWhen} />
        <DetailPanel label="Bad fit when" body={metric.avoidWhen} />
      </SimulationGrid>

      <ExplanationPanel
        title={`${container.label} under ${workload.label.toLowerCase()}`}
        explanation={`${workload.summary} ${metric.technical}`}
        footer={
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.65 }}>
              <strong style={{ color: T.text2, fontWeight: 650 }}>Language guarantee:</strong> {container.languageGuarantee}
            </div>
            <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.65 }}>
              <strong style={{ color: T.text2, fontWeight: 650 }}>CPython note:</strong> {container.cpythonNote}
            </div>
            <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.65 }}>
              <strong style={{ color: T.text2, fontWeight: 650 }}>Order / uniqueness:</strong> {container.orderContract} {container.uniquenessContract}
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

function SummaryCard({
  container,
  workload,
  selected,
  onSelect,
}: {
  container: ContainerComparisonContainer
  workload: ContainerWorkloadId
  selected: boolean
  onSelect: () => void
}) {
  const color = CONTAINER_COLORS[container.id]
  const metric = container.metrics[workload]

  return <SimulationSelectableCard title={container.label} body={container.summary} footer={`${metric.measured} - ${metric.headline}`} selected={selected} onClick={onSelect} color={color} eyebrow={metric.complexity} />
}

function DetailPanel({
  label,
  body,
}: {
  label: string
  body: string
}) {
  return (
    <SimulationSection title={label} tone="neutral">
      <div style={{ fontSize: 12.5, color: T.text1, lineHeight: 1.75 }}>
        {body}
      </div>
    </SimulationSection>
  )
}
