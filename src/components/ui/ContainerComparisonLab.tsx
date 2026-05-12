"use client"

import { useMemo, useState } from "react"
import type { ContainerComparisonContainer, ContainerComparisonId, ContainerComparisonLabData, ContainerWorkloadId } from "@/types"
import { T } from "@/lib/tokens"
import { ExplanationPanel, SimulationCodePanel, SimulationShell, StateCard } from "@/components/ui/simulationShared"

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
      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        <SelectorRow
          label="Workload"
          options={data.workloads.map((item) => ({
            id: item.id,
            label: item.label,
            selected: item.id === selectedWorkload,
            onSelect: () => setSelectedWorkload(item.id),
          }))}
        />
        <SelectorRow
          label="Container"
          options={data.containers.map((item) => ({
            id: item.id,
            label: item.label,
            selected: item.id === selectedContainer,
            onSelect: () => setSelectedContainer(item.id),
          }))}
        />
      </div>

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        marginBottom: 16,
      }}>
        {data.containers.map((item) => (
          <SummaryCard
            key={item.id}
            container={item}
            selected={item.id === selectedContainer}
            workload={selectedWorkload}
            onSelect={() => setSelectedContainer(item.id)}
          />
        ))}
      </div>

      <SimulationCodePanel sourceCode={metric.code} activeLine={1} />

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        marginBottom: 16,
      }}>
        <StateCard label="Complexity / shape" value={metric.complexity} color={CONTAINER_COLORS[container.id]} />
        <StateCard label="Measured local proof" value={metric.measured} color={T.blue} />
        <StateCard label="Workload verdict" value={metric.headline} color={T.amber} />
      </div>

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        marginBottom: 16,
      }}>
        <DetailPanel label="Storage model" body={container.storageModel} color={CONTAINER_COLORS[container.id]} />
        <DetailPanel label="Best when" body={metric.bestWhen} color={T.green} />
        <DetailPanel label="Bad fit when" body={metric.avoidWhen} color={T.coral} />
      </div>

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

function SelectorRow({
  label,
  options,
}: {
  label: string
  options: Array<{ id: string; label: string; selected: boolean; onSelect: () => void }>
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div style={{ fontSize: 11.5, color: T.text3, minWidth: 72, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={option.onSelect}
            style={{
              borderRadius: 999,
              border: `0.5px solid ${option.selected ? `${T.teal.accent}77` : T.border}`,
              background: option.selected ? T.teal.bg : T.bg2,
              color: option.selected ? T.teal.fg : T.text2,
              padding: "7px 11px",
              fontSize: 11.5,
              fontWeight: 650,
              cursor: "pointer",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
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

  return (
    <button
      onClick={onSelect}
      style={{
        textAlign: "left",
        borderRadius: 12,
        border: `0.5px solid ${selected ? `${color.accent}88` : T.border}`,
        background: selected ? color.bg : T.bg2,
        padding: "13px 14px",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: selected ? color.fg : T.text1 }}>
          {container.label}
        </div>
        <div style={{ fontSize: 10.5, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {metric.complexity}
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.65, marginBottom: 8 }}>
        {container.summary}
      </div>
      <div style={{ fontSize: 12.5, color: selected ? color.fg : T.text1, fontWeight: 650 }}>
        {metric.measured}
      </div>
      <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.65, marginTop: 6 }}>
        {metric.headline}
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
      border: `0.5px solid ${color.accent}44`,
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
