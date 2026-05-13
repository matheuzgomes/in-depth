import benchmarkData from "@/data/whiteboardBenchmarks.json"

export interface WhiteboardBenchmarkEnvironment {
  pythonVersion: string
  implementation: string
  platform: string
  machine: string
  system: string
  release: string
  cpuCount: number | null
  generatedAtUtc: string
}

export interface WhiteboardBenchmarkControlOption {
  id: string
  label: string
}

export interface WhiteboardBenchmarkControl {
  id: string
  label: string
  options: WhiteboardBenchmarkControlOption[]
}

export interface WhiteboardBenchmarkSeries {
  label: string
  color: string
  values: number[]
}

export interface WhiteboardBenchmarkMetric {
  label: string
  value: string
}

export interface WhiteboardBenchmarkPreset {
  chartKind: "line" | "bar" | "lollipop"
  chartTitle: string
  xLabels: string[]
  yUnit: "us" | "ms" | "kib"
  series: WhiteboardBenchmarkSeries[]
  metrics: WhiteboardBenchmarkMetric[]
  notes: string[]
}

export interface WhiteboardBenchmarkTopic {
  title: string
  summary: string
  controls: WhiteboardBenchmarkControl[]
  defaultSelection: Record<string, string>
  presets: Record<string, WhiteboardBenchmarkPreset>
}

export interface WhiteboardBenchmarkDataset {
  environment: WhiteboardBenchmarkEnvironment
  topics: Record<string, WhiteboardBenchmarkTopic>
}

export const WHITEBOARD_BENCHMARKS = benchmarkData as WhiteboardBenchmarkDataset

export function getWhiteboardBenchmarkTopic(topicId: string) {
  return WHITEBOARD_BENCHMARKS.topics[topicId] ?? null
}
