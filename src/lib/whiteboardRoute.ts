import { ALL_TOPICS } from "@/data/topicIndex"

export type WhiteboardView = "overview" | "guide" | "visual"

const VALID_TOPIC_IDS = new Set(ALL_TOPICS.map((topic) => topic.id))

export function normalizeTopicId(candidate: string | null | undefined) {
  if (candidate && VALID_TOPIC_IDS.has(candidate)) return candidate
  return ALL_TOPICS[0]?.id ?? ""
}

export function normalizeWhiteboardView(candidate: string | null | undefined): WhiteboardView {
  if (candidate === "guide" || candidate === "visual") return candidate
  return "overview"
}

export function buildWhiteboardHref(topicId: string, view: WhiteboardView = "overview") {
  const params = new URLSearchParams()
  params.set("topic", normalizeTopicId(topicId))
  params.set("view", normalizeWhiteboardView(view))
  return `/?${params.toString()}`
}

export function firstQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}
