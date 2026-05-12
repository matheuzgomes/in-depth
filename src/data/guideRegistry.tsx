import type { ComponentType } from "react"

type GuideModule = {
  default: ComponentType<Record<string, never>>
}

const guideLoaders: Record<string, () => Promise<GuideModule>> = {
  "sequences-slicing": () => import("@/content/guides/sequences-slicing.mdx"),
  "sequences-pattern-matching": () => import("@/content/guides/sequences-pattern-matching.mdx"),
  "language-identity-equality": () => import("@/content/guides/language-identity-equality.mdx"),
  "language-parameters": () => import("@/content/guides/language-parameters.mdx"),
  "language-mutable-defaults": () => import("@/content/guides/language-mutable-defaults.mdx"),
  "language-decorators-closures": () => import("@/content/guides/language-decorators-closures.mdx"),
  "language-type-hints": () => import("@/content/guides/language-type-hints.mdx"),
  "language-bytecode-dis": () => import("@/content/guides/language-bytecode-dis.mdx"),
  "language-dunder-methods": () => import("@/content/guides/language-dunder-methods.mdx"),
  "runtime-del-gc": () => import("@/content/guides/runtime-del-gc.mdx"),
  "dict-hash-tables": () => import("@/content/guides/dict-hash-tables.mdx"),
  "dict-setdefault": () => import("@/content/guides/dict-setdefault.mdx"),
  "sets-membership-views": () => import("@/content/guides/sets-membership-views.mdx"),
  "memory-list-alternatives": () => import("@/content/guides/memory-list-alternatives.mdx"),
  "memory-container-comparison": () => import("@/content/guides/memory-container-comparison.mdx"),
  "memory-tuples-lists": () => import("@/content/guides/memory-tuples-lists.mdx"),
  "memory-iterables": () => import("@/content/guides/memory-iterables.mdx"),
  "classes-data-builders": () => import("@/content/guides/classes-data-builders.mdx"),
  "classes-dataclass-fields": () => import("@/content/guides/classes-dataclass-fields.mdx"),
  "async-foundations-awaitables": () => import("@/content/guides/async-foundations-awaitables.mdx"),
  "async-context-backpressure": () => import("@/content/guides/async-context-backpressure.mdx"),
  "async-servers-services": () => import("@/content/guides/async-servers-services.mdx"),
  "async-iterators-generators": () => import("@/content/guides/async-iterators-generators.mdx"),
  "async-limits-type-hints": () => import("@/content/guides/async-limits-type-hints.mdx"),
  "runtime-gil-performance": () => import("@/content/guides/runtime-gil-performance.mdx"),
  "asyncio-task-groups": () => import("@/content/guides/asyncio-task-groups.mdx"),
  "production-stdlib-logging": () => import("@/content/guides/production-stdlib-logging.mdx"),
}

const clientGuideCache = new Map<string, ComponentType<Record<string, never>>>()

export function hasGuide(id: string) {
  return id in guideLoaders
}

export async function loadGuide(id: string) {
  const load = guideLoaders[id]
  if (!load) return null
  const Guide = (await load()).default
  return <Guide />
}

export function getGuideLoader(id: string) {
  return guideLoaders[id] ?? null
}

export async function loadGuideComponent(id: string) {
  const cached = clientGuideCache.get(id)
  if (cached) return cached
  const load = guideLoaders[id]
  if (!load) return null
  const Guide = (await load()).default
  clientGuideCache.set(id, Guide)
  return Guide
}

export function preloadGuide(id: string) {
  void loadGuideComponent(id)
}
