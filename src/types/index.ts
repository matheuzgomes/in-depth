import type { ComponentType, ReactNode } from "react"

// ── Color system ──────────────────────────────────────────────────────────────
export type ColorKey = "purple" | "teal" | "amber" | "blue" | "coral" | "green"
export type CalloutType = "tip" | "warn" | "info"

// ── Token sub-object ──────────────────────────────────────────────────────────
export interface ColorToken {
  bg: string
  fg: string
  accent: string
}

// ── UI atoms ──────────────────────────────────────────────────────────────────
export interface BadgeProps {
  label: string
  color?: ColorKey
}

export interface SLabelProps {
  children: ReactNode
  style?: React.CSSProperties
}

export interface CodeBlockProps {
  code: string
}

export interface CalloutProps {
  type?: CalloutType
  children: ReactNode
}

export interface BenchBarProps {
  label: string
  value: number
  max: number
  display: string
  color?: ColorKey
}

export interface VerdictItem {
  name: string
  value: string
  sub: string
  good: boolean
}

export interface VerdictGridProps {
  items: VerdictItem[]
}

export interface LoopSimulationStep {
  label: string
  explanation: string
  activeLine: number
  pointer: number | null
  currentItem: string | number | null
  accumulatorValue: string | number
  visitedIndices: number[]
  done?: boolean
}

export interface LoopSimulationData {
  title: string
  summary: string
  ctaLabel?: string
  sourceCode: string
  iterableLabel: string
  itemVariableLabel: string
  accumulatorLabel: string
  items: Array<string | number>
  resultLabel: string
  steps: LoopSimulationStep[]
}

export interface SliceSimulationStep {
  label: string
  explanation: string
  activeLine: number
  start: number
  stop: number
  selectedIndices: number[]
  resultItems: Array<string | number>
  allocated?: boolean
  done?: boolean
}

export interface SliceSimulationData {
  title: string
  summary: string
  ctaLabel?: string
  sourceCode: string
  sourceLabel: string
  resultLabel: string
  items: Array<string | number>
  steps: SliceSimulationStep[]
}

export interface DictSlotState {
  key: string | null
  value: string | number | null
  status: "empty" | "occupied" | "active" | "collision" | "match"
}

export interface DictLookupSimulationStep {
  label: string
  explanation: string
  activeLine: number
  lookupKey: string
  homeBucket: number
  probeBucket: number | null
  probePath: number[]
  slots: DictSlotState[]
  resultValue: string | number | null
  done?: boolean
}

export interface DictLookupSimulationData {
  title: string
  summary: string
  ctaLabel?: string
  sourceCode: string
  tableLabel: string
  resultLabel: string
  note?: string
  steps: DictLookupSimulationStep[]
}

export interface PatternCaseState {
  pattern: string
  status: "pending" | "active" | "failed" | "matched"
  note: string
}

export interface PatternBinding {
  name: string
  value: string | number
}

export interface PatternMatchingSimulationStep {
  label: string
  explanation: string
  activeLine: number
  subject: Array<string | number>
  cases: PatternCaseState[]
  bindings: PatternBinding[]
  resultValue: string | null
  done?: boolean
}

export interface PatternMatchingSimulationData {
  title: string
  summary: string
  ctaLabel?: string
  sourceCode: string
  subjectLabel: string
  resultLabel: string
  steps: PatternMatchingSimulationStep[]
}

export interface SetSlotState {
  value: string | null
  status: "empty" | "occupied" | "active" | "collision" | "match"
}

export interface SetMembershipSimulationStep {
  label: string
  explanation: string
  activeLine: number
  lookupValue: string
  homeBucket: number
  probeBucket: number | null
  probePath: number[]
  slots: SetSlotState[]
  resultValue: boolean | null
  done?: boolean
}

export interface SetMembershipSimulationData {
  title: string
  summary: string
  ctaLabel?: string
  sourceCode: string
  setLabel: string
  resultLabel: string
  note?: string
  steps: SetMembershipSimulationStep[]
}

export type ContainerComparisonId = "list" | "tuple" | "set" | "array"
export type ContainerWorkloadId = "memory" | "membership" | "growth" | "iteration" | "numeric"

export interface ContainerComparisonWorkloadMetric {
  headline: string
  complexity: string
  measured: string
  technical: string
  bestWhen: string
  avoidWhen: string
  code: string
}

export interface ContainerComparisonContainer {
  id: ContainerComparisonId
  label: string
  shortLabel: string
  summary: string
  storageModel: string
  orderContract: string
  uniquenessContract: string
  languageGuarantee: string
  cpythonNote: string
  metrics: Record<ContainerWorkloadId, ContainerComparisonWorkloadMetric>
}

export interface ContainerComparisonWorkload {
  id: ContainerWorkloadId
  label: string
  summary: string
}

export interface ContainerComparisonLabData {
  title: string
  summary: string
  ctaLabel?: string
  note?: string
  defaultContainer: ContainerComparisonId
  defaultWorkload: ContainerWorkloadId
  containers: ContainerComparisonContainer[]
  workloads: ContainerComparisonWorkload[]
}

export type SpecialMethodCaseId =
  | "equality"
  | "identity"
  | "repr"
  | "truthiness"
  | "iteration"
  | "membership"
  | "context"

export interface SpecialMethodCase {
  id: SpecialMethodCaseId
  label: string
  trigger: string
  summary: string
  primaryMethod: string
  fallback?: string
  implementationRule: string
  warning: string
  code: string
}

export interface SpecialMethodLabData {
  title: string
  summary: string
  ctaLabel?: string
  note?: string
  defaultCase: SpecialMethodCaseId
  cases: SpecialMethodCase[]
}

export type BytecodeCaseId = "locals" | "closure" | "comprehension" | "adaptive"

export interface BytecodeCase {
  id: BytecodeCaseId
  label: string
  question: string
  sourceCode: string
  disassembly: string
  keyOpcodes: string[]
  headline: string
  whyItCanMatter: string
  productionRule: string
  warning: string
  versionNote: string
}

export interface BytecodeLabData {
  title: string
  summary: string
  ctaLabel?: string
  note?: string
  defaultCase: BytecodeCaseId
  cases: BytecodeCase[]
}

export type GILScenarioId = "cpu_threads" | "io_threads" | "processes" | "free_threaded"

export interface GILScenario {
  id: GILScenarioId
  label: string
  question: string
  sourceCode: string
  measurement: string
  bytecodeParallelism: string
  sharedMemory: string
  mechanism: string
  productionRule: string
  warning: string
  versionNote: string
}

export interface GILLabData {
  title: string
  summary: string
  ctaLabel?: string
  note?: string
  defaultCase: GILScenarioId
  cases: GILScenario[]
}

export type AsyncTimelineStatus = "running" | "ready" | "awaiting" | "blocked" | "done" | "cancelled"

export interface AsyncTimelineTaskState {
  name: string
  status: AsyncTimelineStatus
  detail: string
}

export interface AsyncTimelineStep {
  label: string
  explanation: string
  activeLine: number
  tick: number
  event: string
  tasks: AsyncTimelineTaskState[]
  done?: boolean
}

export interface AsyncTimelineScenario {
  id: string
  label: string
  summary: string
  sourceCode: string
  steps: AsyncTimelineStep[]
  takeaway: string
}

export interface AsyncTimelineLabData {
  title: string
  summary: string
  ctaLabel?: string
  note?: string
  defaultScenarioId: string
  scenarios: AsyncTimelineScenario[]
}

// ── Card & section data ───────────────────────────────────────────────────────
export interface BadgeData {
  label: string
  color: ColorKey
}

export interface CardData {
  id: string
  color: ColorKey
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: ComponentType<any>
  title: string
  desc: string
  badges: BadgeData[]
  cats: string[]
  kw: string
  body: (nav: NavContextValue) => ReactNode
  guide?: ReactNode
}

export type TopicCardData = Omit<CardData, "body" | "guide">

export interface Section {
  id: string
  label: string
  cards: CardData[]
}

export interface TopicSection {
  id: string
  label: string
  cards: TopicCardData[]
}

export interface FilterItem {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: ComponentType<any>
}

// ── Navigation context ────────────────────────────────────────────────────────
export interface NavContextValue {
  openCard: (id: string, view?: "overview" | "guide" | "visual") => void
  allCards: TopicCardData[]
}
