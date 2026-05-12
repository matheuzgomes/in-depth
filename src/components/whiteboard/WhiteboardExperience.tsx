"use client"

import type { ComponentType, ReactNode } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, Search, X } from "lucide-react"
import { NavContext } from "@/components/navigation/NavContext"
import { RoughPythonMark } from "@/components/whiteboard/RoughPythonMark"
import { loadGuideComponent, preloadGuide } from "@/data/guideRegistry"
import { WHITEBOARD_BENCHMARKS, getWhiteboardBenchmarkTopic, type WhiteboardBenchmarkPreset, type WhiteboardBenchmarkTopic } from "@/data/whiteboardBenchmarks"
import {
  type WhiteboardIconKind,
  type WhiteboardTopic,
  WHITEBOARD_SECTIONS,
  WHITEBOARD_TOPICS,
  getUpcomingTopics,
  getWhiteboardTopic,
} from "@/data/whiteboard"
import { buildWhiteboardHref, normalizeTopicId, normalizeWhiteboardView, type WhiteboardView } from "@/lib/whiteboardRoute"

const LAST_READ_KEY = "python-in-depth:last-read"
const MOBILE_BREAKPOINT = 1024

const MARKER_COLORS = {
  navy: "#1a2e6e",
  red: "#c0392b",
  green: "#1a7a4a",
  black: "#1a1a1a",
  purple: "#6c3483",
} as const

interface WhiteboardExperienceProps {
  initialTopicId: string
  initialView: WhiteboardView
  initialGuide: React.ReactNode | null
}

type LoadedGuideMap = Record<string, ComponentType<Record<string, never>>>
type GuideLoadState = Record<string, "idle" | "loading" | "ready" | "error">

export function WhiteboardExperience({
  initialTopicId,
  initialView,
  initialGuide,
}: WhiteboardExperienceProps) {
  const [query, setQuery] = useState("")
  const [activeTopicId, setActiveTopicId] = useState(initialTopicId)
  const [contentView, setContentView] = useState<"overview" | "guide">(initialView === "guide" ? "guide" : "overview")
  const [visualOpen, setVisualOpen] = useState(initialView === "visual")
  const [tocOpen, setTocOpen] = useState(false)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(() => new Set(WHITEBOARD_SECTIONS.map((section) => section.id)))
  const [loadedGuides, setLoadedGuides] = useState<LoadedGuideMap>({})
  const [guideLoadState, setGuideLoadState] = useState<GuideLoadState>({})
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const serverGuideTopicId = initialView === "guide" ? initialTopicId : ""
  const serverGuideNode = initialGuide

  const activeTopic = useMemo(() => getWhiteboardTopic(activeTopicId) ?? WHITEBOARD_TOPICS[0], [activeTopicId])
  const visibleSections = useMemo(() => {
    const lower = query.trim().toLowerCase()
    if (!lower) return WHITEBOARD_SECTIONS
    return WHITEBOARD_SECTIONS.map((section) => ({
      ...section,
      cards: section.cards.filter((card) =>
        [card.title, card.desc, card.kw, card.sectionLabel, card.boardIntro].join(" ").toLowerCase().includes(lower),
      ),
    })).filter((section) => section.cards.length > 0)
  }, [query])
  const relatedTopics = useMemo(() => {
    if (!activeTopic) return []
    return WHITEBOARD_TOPICS.filter((topic) =>
      topic.id !== activeTopic.id && activeTopic.cats.some((cat) => topic.cats.includes(cat)),
    ).slice(0, 3)
  }, [activeTopic])
  const upcomingTopics = useMemo(() => getUpcomingTopics(activeTopic?.id ?? "", 3), [activeTopic])
  const benchmarkTopic = useMemo(() => getWhiteboardBenchmarkTopic(activeTopic.id), [activeTopic.id])
  const mobilePanelLabel = benchmarkTopic ? "Benchmarks" : "Notes"

  const ensureGuideLoaded = useCallback(async (topicId: string) => {
    if (!topicId) return
    if (loadedGuides[topicId]) return
    if (serverGuideTopicId === topicId && serverGuideNode) return
    if (guideLoadState[topicId] === "loading") return

    setGuideLoadState((current) => ({ ...current, [topicId]: "loading" }))
    try {
      const GuideComponent = await loadGuideComponent(topicId)
      if (!GuideComponent) {
        setGuideLoadState((current) => ({ ...current, [topicId]: "error" }))
        return
      }
      setLoadedGuides((current) => ({ ...current, [topicId]: GuideComponent }))
      setGuideLoadState((current) => ({ ...current, [topicId]: "ready" }))
    } catch {
      setGuideLoadState((current) => ({ ...current, [topicId]: "error" }))
    }
  }, [guideLoadState, loadedGuides, serverGuideNode, serverGuideTopicId])

  const syncBrowserUrl = useCallback((topicId: string, nextView: WhiteboardView, mode: "push" | "replace" = "push") => {
    const href = buildWhiteboardHref(topicId, nextView)
    if (typeof window === "undefined") return
    const stateMethod = mode === "replace" ? window.history.replaceState : window.history.pushState
    stateMethod.call(window.history, null, "", href)
  }, [])

  const closeDrawersIfMobile = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT) {
      setTocOpen(false)
      setSidePanelOpen(false)
    }
  }, [])

  const applyTopicState = useCallback((
    topicId: string,
    nextContentView: "overview" | "guide",
    nextVisualOpen: boolean,
    historyMode: "push" | "replace" = "push",
  ) => {
    setActiveTopicId(topicId)
    setContentView(nextContentView)
    setVisualOpen(nextVisualOpen)
    syncBrowserUrl(topicId, nextVisualOpen ? "visual" : nextContentView, historyMode)
    if (nextContentView === "guide") {
      void ensureGuideLoaded(topicId)
    } else {
      preloadGuide(topicId)
    }
    closeDrawersIfMobile()
  }, [closeDrawersIfMobile, ensureGuideLoaded, syncBrowserUrl])

  useEffect(() => {
    if (!activeTopic) return
    window.localStorage.setItem(LAST_READ_KEY, activeTopic.id)
  }, [activeTopic])

  useEffect(() => {
    preloadGuide(activeTopic.id)
    if (contentView === "guide") {
      const timeoutId = window.setTimeout(() => {
        void ensureGuideLoaded(activeTopic.id)
      }, 0)
      return () => window.clearTimeout(timeoutId)
    }
  }, [activeTopic.id, contentView, ensureGuideLoaded])

  useEffect(() => {
    function handlePopState() {
      const params = new URLSearchParams(window.location.search)
      const nextTopicId = normalizeTopicId(params.get("topic"))
      const nextView = normalizeWhiteboardView(params.get("view"))
      setActiveTopicId(nextTopicId)
      setVisualOpen(nextView === "visual")
      setContentView(nextView === "guide" ? "guide" : "overview")
      if (nextView === "guide") {
        void ensureGuideLoaded(nextTopicId)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [ensureGuideLoaded])

  const navValue = useMemo(() => ({
    allCards: WHITEBOARD_TOPICS,
    openCard: (id: string, view: WhiteboardView = "guide") => {
      const normalizedTopicId = normalizeTopicId(id)
      if (view === "visual") {
        applyTopicState(normalizedTopicId, "overview", true)
        return
      }
      applyTopicState(normalizedTopicId, view === "guide" ? "guide" : "overview", false)
    },
  }), [applyTopicState])

  function toggleSection(sectionId: string) {
    setOpenSectionIds((current) => {
      const next = new Set(current)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  function openOverview(topicId: string) {
    applyTopicState(topicId, "overview", false)
  }

  function openGuide(topicId: string) {
    applyTopicState(topicId, "guide", false)
  }

  function openVisual(topicId = activeTopic.id) {
    setActiveTopicId(topicId)
    setVisualOpen(true)
    syncBrowserUrl(topicId, "visual")
    closeDrawersIfMobile()
  }

  function closeVisual() {
    setVisualOpen(false)
    syncBrowserUrl(activeTopic.id, contentView, "push")
  }

  const renderedGuide = useMemo(() => {
    const LoadedGuide = loadedGuides[activeTopic.id]
    if (LoadedGuide) return <LoadedGuide />
    if (serverGuideTopicId === activeTopic.id && serverGuideNode) {
      return serverGuideNode
    }
    return null
  }, [activeTopic.id, loadedGuides, serverGuideNode, serverGuideTopicId])

  return (
    <NavContext.Provider value={navValue}>
      <div className="whiteboard-page">
        <div className="whiteboard-stage">
          <div className="whiteboard-mobile-toolbar" data-board-interactive="true">
            <button className="whiteboard-drawer-button" onClick={() => setTocOpen((value) => !value)}>
              <Menu size={15} />
              Topics
            </button>
            <button className="whiteboard-drawer-button" onClick={() => setSidePanelOpen((value) => !value)}>
              {mobilePanelLabel}
            </button>
          </div>

          <div className="whiteboard-frame">
            <div ref={surfaceRef} className="whiteboard-surface">
              <BoardDefs />
              <div className="whiteboard-residue-layer" aria-hidden="true" />
              <div className="whiteboard-glare-layer" aria-hidden="true" />
              <div className="whiteboard-smudge smudge-a" aria-hidden="true" />
              <div className="whiteboard-smudge smudge-b" aria-hidden="true" />

              <div className="whiteboard-header">
                <div className="whiteboard-mantra">
                  <div className="whiteboard-python-mark" aria-hidden="true">
                    <RoughPythonMark />
                  </div>
                  <div>
                    <div>Understand.</div>
                    <div>Visualize.</div>
                    <div>Master.</div>
                  </div>
                </div>

                <div className="whiteboard-title-block">
                  <h1>Python in Depth</h1>
                  <Squiggle className="whiteboard-title-squiggle" color={MARKER_COLORS.navy} />
                  <p>An interactive engineering reference for Python internals</p>
                </div>

                <motion.div
                  className="whiteboard-note whiteboard-note--header whiteboard-note--yellow"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <div className="whiteboard-sticky-tape" />
                  <strong>Don&apos;t forget!</strong>
                  <p>{activeTopic.reminder}</p>
                  <span className="whiteboard-smiley">:)</span>
                </motion.div>
              </div>

              <div className="whiteboard-columns">
                <aside className={`whiteboard-toc${tocOpen ? " is-open" : ""}`} data-board-interactive="true">
                  <div className="whiteboard-panel-head">
                    <div className="whiteboard-panel-title">
                      <SketchBookIcon />
                      <span>TABLE OF CONTENTS</span>
                    </div>
                    <button className="whiteboard-icon-button" onClick={() => setTocOpen(false)} aria-label="Close topics">
                      <X size={15} />
                    </button>
                  </div>
                  <Squiggle color={MARKER_COLORS.navy} />

                  <label className="whiteboard-search" data-board-interactive="true">
                    <Search size={16} />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search topics..."
                    />
                  </label>

                  <div className="whiteboard-toc-list">
                    {visibleSections.map((section) => {
                      const open = openSectionIds.has(section.id)
                      return (
                        <div key={section.id} className="whiteboard-section-group">
                          <button type="button" className="whiteboard-section-row" onClick={() => toggleSection(section.id)}>
                            <div className="whiteboard-section-left">
                              <SketchIcon kind={section.tocIcon} color={MARKER_COLORS.red} />
                              <span>{section.boardNumber}. {section.label}</span>
                            </div>
                            <span className={`whiteboard-chevron${open ? " is-open" : ""}`}>⌄</span>
                          </button>
                          {open ? (
                            <div className="whiteboard-topic-rows">
                              {section.cards.map((card) => {
                                const active = card.id === activeTopic.id
                                return (
                                  <button
                                    type="button"
                                    key={card.id}
                                    className={`whiteboard-topic-row${active ? " is-active" : ""}`}
                                    onClick={() => openOverview(card.id)}
                                    onMouseEnter={() => preloadGuide(card.id)}
                                  >
                                    <span className="whiteboard-topic-bullet" />
                                    <span className="whiteboard-topic-number">{card.boardNumber}</span>
                                    <span className="whiteboard-topic-title">{card.title}</span>
                                    <span className="whiteboard-topic-arrow">&gt;</span>
                                  </button>
                                )
                              })}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}

                    {visibleSections.length === 0 ? (
                      <div className="whiteboard-empty-search">No topics match that search.</div>
                    ) : null}
                  </div>

                  <div className="whiteboard-protip-note" aria-hidden="true">
                    <div className="whiteboard-sticky-tape" />
                    <strong>Pro Tip:</strong>
                    <span>The TOC scrolls inside its own box, so the rest of the board stays stable.</span>
                  </div>
                </aside>

                <main className="whiteboard-main" data-board-interactive="true">
                  {contentView === "overview" ? (
                    <OverviewSurface
                      topic={activeTopic}
                      onOpenGuide={openGuide}
                      onOpenVisual={openVisual}
                    />
                  ) : (
                    <GuideSurface
                      topic={activeTopic}
                      guide={renderedGuide}
                      guideStatus={guideLoadState[activeTopic.id] ?? "idle"}
                      onBackToOverview={() => applyTopicState(activeTopic.id, "overview", false)}
                      onOpenVisual={() => openVisual(activeTopic.id)}
                    />
                  )}
                </main>

                <aside className={`whiteboard-simulation${sidePanelOpen ? " is-open" : ""}`} data-board-interactive="true">
                  <div className="whiteboard-panel-head">
                    <div className="whiteboard-panel-title whiteboard-panel-title--running">
                      <span>{benchmarkTopic ? "MEASURED NOTEBOOK" : "BOARD NOTES"}</span>
                      <span className={`whiteboard-running-dot${benchmarkTopic ? "" : " is-muted"}`} />
                      <span className="whiteboard-running-label">{benchmarkTopic ? "Measured" : "Context"}</span>
                    </div>
                    <button className="whiteboard-icon-button simulation-close" onClick={() => setSidePanelOpen(false)} aria-label="Close side panel">
                      <X size={15} />
                    </button>
                  </div>

                  {benchmarkTopic ? (
                    <MeasuredNotebookPanel key={activeTopic.id} topic={benchmarkTopic} />
                  ) : (
                    <TopicNotesPanel
                      topic={activeTopic}
                      relatedTopics={relatedTopics}
                      upcomingTopics={upcomingTopics}
                      onOpenTopic={openOverview}
                      onOpenGuide={openGuide}
                    />
                  )}
                </aside>
              </div>

            </div>
          </div>

          <MarkerTray />
        </div>

        <AnimatePresence>
          {visualOpen ? (
            <motion.div
              className="whiteboard-visual-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="whiteboard-visual-card"
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <button type="button" className="whiteboard-visual-close" onClick={closeVisual} aria-label="Close visual card">
                  ✕
                </button>

                <div className="whiteboard-visual-top">
                  <VisualIllustration topic={activeTopic} />
                </div>

                <div className="whiteboard-visual-bottom">
                  <div className="whiteboard-visual-copy">
                    <div className="whiteboard-visual-label">{activeTopic.boardNumber} visual model</div>
                    <p>{activeTopic.boardIntro}</p>
                    <ul className="whiteboard-visual-list">
                      {activeTopic.takeaways.slice(0, 3).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="whiteboard-visual-actions">
                    <button type="button" className="whiteboard-guide-link" onClick={() => openGuide(activeTopic.id)}>
                      Open in-depth guide
                    </button>
                    <button type="button" className="whiteboard-guide-link whiteboard-guide-link--secondary" onClick={() => openOverview(activeTopic.id)}>
                      Back to board notes
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </NavContext.Provider>
  )
}

function OverviewSurface({
  topic,
  onOpenGuide,
  onOpenVisual,
}: {
  topic: WhiteboardTopic
  onOpenGuide: (topicId: string) => void
  onOpenVisual: (topicId?: string) => void
}) {
  return (
    <>
      <TopicHeading number={topic.boardNumber} title={topic.title} />
      <p className="whiteboard-topic-description">{topic.boardIntro}</p>

      <BoardSection label="WHAT IT IS" color={MARKER_COLORS.navy}>
        {topic.whatItIs.map((line) => <p key={line}>{line}</p>)}
      </BoardSection>

      <BoardSection label="HOW IT WORKS" color={MARKER_COLORS.green}>
        <ol className="whiteboard-step-list">
          {topic.howItWorks.map((line, index) => (
            <li key={line}>
              <span className="whiteboard-step-index">{index + 1}</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </BoardSection>

      <BoardSection label="WHEN TO USE IT" color={MARKER_COLORS.black}>
        <ul className="whiteboard-dash-list">
          {topic.whenToUseIt.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </BoardSection>

      <BoardSection label="KEY TAKEAWAYS" color={MARKER_COLORS.navy}>
        <div className="whiteboard-takeaway-box">
          <ul className="whiteboard-dot-list">
            {topic.takeaways.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
      </BoardSection>

      <div className="whiteboard-bottom-grid">
        <div className="whiteboard-code-card">
          <div className="whiteboard-code-head">
            <div className="whiteboard-code-title">TRY IT OUT!</div>
            <Squiggle color={MARKER_COLORS.red} />
          </div>
          <pre>{topic.tryItOutCode}</pre>
        </div>

        <div className="whiteboard-related">
          <div className="whiteboard-action-row">
            <button type="button" className="whiteboard-see-visual" onClick={() => onOpenVisual(topic.id)}>
              <span>See visual</span>
              <span>→</span>
            </button>
            <button type="button" className="whiteboard-guide-link whiteboard-guide-link--inline" onClick={() => onOpenGuide(topic.id)}>
              Open full guide
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function TopicHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="whiteboard-topic-kicker">
      <span className="whiteboard-topic-number-red">{number}</span>
      <span className="whiteboard-topic-title-stack">
        <span className="whiteboard-topic-heading">{title}</span>
        <Squiggle color={MARKER_COLORS.red} className="whiteboard-topic-underline" />
      </span>
    </div>
  )
}

function GuideSurface({
  topic,
  guide,
  guideStatus,
  onBackToOverview,
  onOpenVisual,
}: {
  topic: WhiteboardTopic
  guide: React.ReactNode
  guideStatus: "idle" | "loading" | "ready" | "error"
  onBackToOverview: () => void
  onOpenVisual: () => void
}) {
  return (
    <div className="whiteboard-guide-shell">
      <div className="whiteboard-guide-head">
        <div>
          <TopicHeading number={topic.boardNumber} title={topic.title} />
          <p className="whiteboard-topic-description">{topic.desc}</p>
        </div>
      </div>

      <article className="guide-article whiteboard-guide-article">
        {guide ? (
          guide
        ) : guideStatus === "error" ? (
          <div className="whiteboard-guide-status">The guide failed to load for this topic.</div>
        ) : (
          <div className="whiteboard-guide-status">Loading the in-depth guide…</div>
        )}
      </article>

      <div className="whiteboard-guide-footer-actions">
        <button type="button" className="whiteboard-guide-link whiteboard-guide-link--inline" onClick={onBackToOverview}>
          Back to overview
        </button>
        <button type="button" className="whiteboard-guide-link whiteboard-guide-link--inline" onClick={onOpenVisual}>
          See visual
        </button>
      </div>
    </div>
  )
}

function TopicNotesPanel({
  topic,
  relatedTopics,
  upcomingTopics,
  onOpenTopic,
  onOpenGuide,
}: {
  topic: WhiteboardTopic
  relatedTopics: WhiteboardTopic[]
  upcomingTopics: WhiteboardTopic[]
  onOpenTopic: (topicId: string) => void
  onOpenGuide: (topicId: string) => void
}) {
  return (
    <div className="whiteboard-notes-stack">
      <div className="whiteboard-side-card">
        <div className="whiteboard-control-header">WHY NO BENCHMARK?</div>
        <p className="whiteboard-side-copy">
          This topic is better taught with structure, semantics, and cross-references than with a synthetic chart.
        </p>
        <p className="whiteboard-side-copy">{topic.reminder}</p>
      </div>

      <div className="whiteboard-side-card">
        <div className="whiteboard-control-header">RELATED GUIDES</div>
        <div className="whiteboard-side-links">
          {relatedTopics.map((entry) => (
            <button type="button" key={entry.id} className="whiteboard-related-link" onClick={() => onOpenGuide(entry.id)}>
              {entry.boardNumber} {entry.title}
            </button>
          ))}
        </div>
      </div>

      <div className="whiteboard-side-card">
        <div className="whiteboard-control-header">NEXT CHECKS</div>
        <div className="whiteboard-side-links">
          {upcomingTopics.map((entry) => (
            <button type="button" key={entry.id} className="whiteboard-related-link" onClick={() => onOpenTopic(entry.id)}>
              {entry.boardNumber} {entry.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MeasuredNotebookPanel({ topic }: { topic: WhiteboardBenchmarkTopic }) {
  const [selection, setSelection] = useState<Record<string, string>>(topic.defaultSelection)
  const presetKey = topic.controls.length === 0
    ? "default"
    : topic.controls.map((control) => selection[control.id] ?? topic.defaultSelection[control.id]).join("|")
  const preset = topic.presets[presetKey] ?? topic.presets.default ?? Object.values(topic.presets)[0]

  return (
    <div className="whiteboard-measured-stack">
      <div className="whiteboard-sim-title">{topic.title}</div>
      <p className="whiteboard-side-copy whiteboard-side-copy--compact">{topic.summary}</p>

      <BenchmarkChart preset={preset} />

      {topic.controls.length > 0 ? (
        <div className="whiteboard-control-block">
          <div className="whiteboard-control-header">CONTROLS</div>
          {topic.controls.map((control) => (
            <label key={control.id} className="whiteboard-select whiteboard-select--stacked">
              <span>{control.label}:</span>
              <select
                value={selection[control.id] ?? topic.defaultSelection[control.id]}
                onChange={(event) => setSelection((current) => ({ ...current, [control.id]: event.target.value }))}
              >
                {control.options.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}

      <div className="whiteboard-metrics-block">
        <div className="whiteboard-control-header">METRICS</div>
        {preset.metrics.map((metric) => (
          <div key={metric.label} className="whiteboard-metric-row whiteboard-metric-row--static">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      <div className="whiteboard-side-card">
        <div className="whiteboard-control-header">NOTES</div>
        <ul className="whiteboard-dot-list whiteboard-dot-list--notes">
          {preset.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="whiteboard-side-card whiteboard-side-card--env">
        <div className="whiteboard-control-header">TEST ENVIRONMENT</div>
        <div className="whiteboard-environment-grid">
          <EnvironmentRow label="Python" value={`${WHITEBOARD_BENCHMARKS.environment.implementation} ${WHITEBOARD_BENCHMARKS.environment.pythonVersion}`} />
          <EnvironmentRow label="Platform" value={WHITEBOARD_BENCHMARKS.environment.platform} />
          <EnvironmentRow label="Machine" value={`${WHITEBOARD_BENCHMARKS.environment.machine} · ${WHITEBOARD_BENCHMARKS.environment.cpuCount ?? "?"} CPUs`} />
          <EnvironmentRow label="Generated" value={WHITEBOARD_BENCHMARKS.environment.generatedAtUtc} />
        </div>
      </div>
    </div>
  )
}

function EnvironmentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="whiteboard-environment-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function BenchmarkChart({ preset }: { preset: WhiteboardBenchmarkPreset }) {
  const width = 332
  const height = 216
  const padding = { top: 18, right: 16, bottom: 34, left: 42 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const maxValue = Math.max(...preset.series.flatMap((series) => series.values), 1)
  const yTicks = [0, maxValue / 2, maxValue]

  return (
    <div className="whiteboard-chart-card">
      <div className="whiteboard-chart-title">{preset.chartTitle}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="whiteboard-chart-svg" aria-hidden="true">
        <path d={`M ${padding.left} ${padding.top} V ${height - padding.bottom} H ${width - padding.right}`} stroke={MARKER_COLORS.black} strokeWidth="1.4" filter="url(#wobble)" fill="none" />
        {yTicks.map((tick) => {
          const ratio = tick / maxValue
          const y = padding.top + plotHeight - ratio * plotHeight
          return (
            <g key={tick}>
              <path d={`M ${padding.left - 4} ${y} H ${padding.left + plotWidth}`} stroke="rgba(0,0,0,0.08)" strokeWidth="0.9" filter="url(#softWobble)" fill="none" />
              <text x={6} y={y + 4} className="whiteboard-chart-axis">
                {formatChartTick(tick, preset.yUnit)}
              </text>
            </g>
          )
        })}

        {preset.xLabels.map((tick, index) => {
          const x = padding.left + (plotWidth / Math.max(preset.xLabels.length - 1, 1)) * index
          return (
            <text key={tick} x={x - tick.length * 2.2} y={height - 10} className="whiteboard-chart-axis">
              {tick}
            </text>
          )
        })}

        {preset.series.map((series) => {
          const path = series.values.map((point, index) => {
            const x = padding.left + (plotWidth / Math.max(series.values.length - 1, 1)) * index
            const y = padding.top + plotHeight - (point / maxValue) * plotHeight
            return `${index === 0 ? "M" : "L"} ${x} ${y}`
          }).join(" ")

          return (
            <g key={series.label}>
              <motion.path
                d={path}
                stroke={series.color}
                strokeWidth="2.4"
                fill="none"
                filter="url(#wobble)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
              {series.values.map((point, index) => {
                const x = padding.left + (plotWidth / Math.max(series.values.length - 1, 1)) * index
                const y = padding.top + plotHeight - (point / maxValue) * plotHeight
                return <circle key={`${series.label}-${index}`} cx={x} cy={y} r="2.8" fill={series.color} filter="url(#softWobble)" />
              })}
            </g>
          )
        })}
      </svg>

      <div className="whiteboard-chart-legend">
        {preset.series.map((series) => (
          <div key={series.label} className="whiteboard-legend-item">
            <span style={{ color: series.color }}>—</span>
            <span>{series.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatChartTick(value: number, unit: WhiteboardBenchmarkPreset["yUnit"]) {
  if (unit === "kib") return `${value.toFixed(0)} KiB`
  if (unit === "ms") return `${value.toFixed(value < 10 ? 1 : 0)} ms`
  return `${value.toFixed(value < 10 ? 2 : 1)} µs`
}

function BoardDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        <filter id="wobble">
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="2" result="noise" seed="2" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="softWobble">
          <feTurbulence type="turbulence" baseFrequency="0.011" numOctaves="2" result="noise" seed="4" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}

function BoardSection({
  label,
  color,
  children,
}: {
  label: string
  color: string
  children: ReactNode
}) {
  return (
    <section className="whiteboard-copy-section">
      <div className="whiteboard-copy-head" style={{ color }}>
        <span>{label}</span>
        <Squiggle color={color} />
      </div>
      <div className="whiteboard-copy-body">{children}</div>
    </section>
  )
}

function SketchBookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="whiteboard-sketch-book" aria-hidden="true">
      <path d="M3 5.5 C 5 4.7, 7.2 4.6, 10.2 5.5 L 10.2 19 C 7.4 18.3, 5.1 18.4, 3 19 Z" stroke={MARKER_COLORS.navy} strokeWidth="1.6" filter="url(#wobble)" />
      <path d="M21 5.5 C 19 4.7, 16.8 4.6, 13.8 5.5 L 13.8 19 C 16.6 18.3, 18.9 18.4, 21 19 Z" stroke={MARKER_COLORS.navy} strokeWidth="1.6" filter="url(#wobble)" />
      <path d="M12 5.3 L 12 19" stroke={MARKER_COLORS.navy} strokeWidth="1.3" filter="url(#wobble)" />
    </svg>
  )
}

function SketchIcon({ kind, color }: { kind: WhiteboardIconKind; color: string }) {
  const stroke = { stroke: color, strokeWidth: 1.8, fill: "none", filter: "url(#wobble)" } as const

  return (
    <svg viewBox="0 0 20 20" className="whiteboard-sketch-icon" aria-hidden="true">
      {kind === "sequence" ? (
        <>
          <rect x="2.2" y="6" width="4.2" height="8" rx="0.4" {...stroke} />
          <rect x="7.8" y="6" width="4.2" height="8" rx="0.4" {...stroke} />
          <rect x="13.4" y="6" width="4.2" height="8" rx="0.4" {...stroke} />
        </>
      ) : null}
      {kind === "memory" ? (
        <>
          <rect x="3" y="4" width="14" height="12" rx="0.4" {...stroke} />
          <path d="M6 8 H14" {...stroke} />
          <path d="M6 12 H10" {...stroke} />
        </>
      ) : null}
      {kind === "runtime" ? (
        <>
          <path d="M4 10 a6 6 0 1 1 2 4" {...stroke} />
          <path d="M5 14 L3 15.5 L3.5 12.8" {...stroke} />
        </>
      ) : null}
      {kind === "async" ? (
        <>
          <path d="M3 14 C 5.5 8, 7 6, 10 6 C 13 6, 14.5 10, 17 4" {...stroke} />
          <circle cx="10" cy="6" r="1" fill={color} filter="url(#wobble)" />
        </>
      ) : null}
      {kind === "code" ? (
        <>
          <path d="M7.2 5 L3.5 10 L7.2 15" {...stroke} />
          <path d="M12.8 5 L16.5 10 L12.8 15" {...stroke} />
        </>
      ) : null}
      {kind === "types" ? (
        <>
          <path d="M5 5 H15" {...stroke} />
          <path d="M10 5 V15" {...stroke} />
          <circle cx="10" cy="15" r="2.2" {...stroke} />
        </>
      ) : null}
      {kind === "hash" ? (
        <>
          <path d="M6 4 L4 16" {...stroke} />
          <path d="M12 4 L10 16" {...stroke} />
          <path d="M3 8 H15" {...stroke} />
          <path d="M2 12 H14" {...stroke} />
        </>
      ) : null}
      {kind === "classes" ? (
        <>
          <rect x="3" y="4" width="14" height="12" rx="0.4" {...stroke} />
          <path d="M6 8 H14" {...stroke} />
          <path d="M6 12 H11" {...stroke} />
        </>
      ) : null}
    </svg>
  )
}

function Squiggle({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 12" className={className ?? "whiteboard-squiggle"} preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 8 C 18 3, 24 10, 40 6 C 56 2, 64 10, 82 6 C 98 2, 108 8, 118 5" stroke={color} strokeWidth="2" fill="none" filter="url(#wobble)" />
    </svg>
  )
}

function VisualIllustration({ topic }: { topic: WhiteboardTopic }) {
  const titleColor = MARKER_COLORS.navy
  const accent = MARKER_COLORS.red
  const good = MARKER_COLORS.green
  const purple = MARKER_COLORS.purple

  return (
    <svg viewBox="0 0 620 300" className="whiteboard-visual-svg">
      <text x="26" y="32" className="whiteboard-visual-title">{topic.title}</text>
      <path d="M26 40 C 120 32, 188 48, 310 38 C 410 32, 516 46, 594 38" stroke={titleColor} strokeWidth="2.2" fill="none" filter="url(#wobble)" />

      {topic.visualKind === "slice-window" ? (
        <>
          <VisualBox x={70} y={95} w={340} h={84} label="Source sequence" />
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <VisualBox key={item} x={92 + item * 48} y={120} w={36} h={34} label={String(item)} small />
          ))}
          <motion.rect x="188" y="110" width="136" height="52" rx="4" stroke={accent} strokeWidth="2.4" fill="none" filter="url(#wobble)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />
          <ArrowPath x1={324} y1={178} x2={476} y2={178} color={accent} />
          <VisualBox x={454} y={150} w={110} h={54} label="new list" color={good} />
        </>
      ) : null}

      {topic.visualKind === "match-flow" ? (
        <>
          <VisualBox x={52} y={104} w={142} h={48} label="subject" />
          <ArrowPath x1={194} y1={128} x2={286} y2={128} color={accent} />
          <VisualBox x={286} y={72} w={170} h={42} label={'case ["push", name, value]'} color={titleColor} />
          <VisualBox x={286} y={124} w={170} h={42} label={'case ["quit"]'} color={good} />
          <VisualBox x={286} y={176} w={170} h={42} label="case _" color={purple} />
          <ArrowPath x1={456} y1={145} x2={560} y2={145} color={good} />
          <VisualBox x={520} y={122} w={66} h={46} label="match" color={good} />
        </>
      ) : null}

      {topic.visualKind === "alias-graph" ? (
        <>
          <VisualBox x={80} y={110} w={80} h={42} label="a" />
          <VisualBox x={80} y={170} w={80} h={42} label="b" />
          <VisualBox x={300} y={130} w={150} h={62} label="list object" color={good} />
          <ArrowPath x1={160} y1={132} x2={300} y2={150} color={accent} />
          <ArrowPath x1={160} y1={188} x2={300} y2={168} color={accent} />
          <VisualNote x={470} y={106} text="same object" color={accent} />
        </>
      ) : null}

      {topic.visualKind === "signature-map" ? (
        <>
          <VisualBox x={70} y={108} w={196} h={74} label="connect(host, /, port, *, timeout, ssl)" color={titleColor} />
          <ArrowPath x1={266} y1={145} x2={398} y2={145} color={accent} />
          <VisualBox x={398} y={84} w={148} h={40} label="positional only" color={good} />
          <VisualBox x={398} y={136} w={148} h={40} label="keyword only" color={purple} />
          <VisualBox x={398} y={188} w={148} h={40} label="public contract" color={accent} />
        </>
      ) : null}

      {topic.visualKind === "shared-default" ? (
        <>
          <VisualBox x={76} y={108} w={152} h={60} label="function defaults" />
          <VisualBox x={332} y={122} w={120} h={50} label="same list" color={accent} />
          <ArrowPath x1={228} y1={138} x2={332} y2={138} color={accent} />
          <ArrowPath x1={228} y1={156} x2={332} y2={156} color={accent} />
          <VisualNote x={472} y={124} text="reused across calls" color={accent} />
        </>
      ) : null}

      {topic.visualKind === "closure-scope" ? (
        <>
          <VisualBox x={84} y={96} w={136} h={80} label="outer scope" />
          <VisualBox x={318} y={96} w={146} h={80} label="wrapper / closure" color={good} />
          <ArrowPath x1={220} y1={136} x2={318} y2={136} color={accent} />
          <VisualNote x={478} y={122} text="free vars in cells" color={purple} />
          <VisualBox x={248} y={204} w={110} h={38} label="wraps(fn)" color={titleColor} />
        </>
      ) : null}

      {topic.visualKind === "type-boundary" ? (
        <>
          <VisualBox x={72} y={110} w={164} h={52} label="Iterable[int]" color={good} />
          <ArrowPath x1={236} y1={136} x2={348} y2={136} color={accent} />
          <VisualBox x={348} y={110} w={164} h={52} label="list[int]" color={titleColor} />
          <VisualNote x={178} y={200} text="abstract in" color={good} />
          <VisualNote x={398} y={200} text="concrete out" color={titleColor} />
        </>
      ) : null}

      {topic.visualKind === "bytecode-stream" ? (
        <>
          {[..."LOAD_FAST LIST_APPEND RETURN_VALUE".split(" ")].map((opcode, index) => (
            <VisualBox key={opcode} x={40 + index * 106} y={130} w={92} h={44} label={opcode} color={index % 2 === 0 ? titleColor : purple} />
          ))}
          <VisualNote x={80} y={214} text="execution shape" color={accent} />
        </>
      ) : null}

      {topic.visualKind === "protocol-grid" ? (
        <>
          <VisualBox x={66} y={78} w={154} h={48} label="len(obj)" />
          <VisualBox x={66} y={138} w={154} h={48} label="for item in obj" />
          <VisualBox x={66} y={198} w={154} h={48} label="obj == other" />
          <VisualBox x={332} y={78} w={188} h={48} label="__len__" color={good} />
          <VisualBox x={332} y={138} w={188} h={48} label="__iter__" color={titleColor} />
          <VisualBox x={332} y={198} w={188} h={48} label="__eq__" color={purple} />
          <ArrowPath x1={220} y1={102} x2={332} y2={102} color={accent} />
          <ArrowPath x1={220} y1={162} x2={332} y2={162} color={accent} />
          <ArrowPath x1={220} y1={222} x2={332} y2={222} color={accent} />
        </>
      ) : null}

      {topic.visualKind === "refcount-flow" ? (
        <>
          <VisualBox x={76} y={120} w={96} h={48} label="ref=3" color={good} />
          <ArrowPath x1={172} y1={144} x2={260} y2={144} color={accent} />
          <VisualBox x={260} y={120} w={96} h={48} label="ref=1" color={purple} />
          <ArrowPath x1={356} y1={144} x2={444} y2={144} color={accent} />
          <VisualBox x={444} y={120} w={96} h={48} label="ref=0" color={accent} />
          <VisualNote x={454} y={194} text="eligible for cleanup" color={accent} />
        </>
      ) : null}

      {topic.visualKind === "hash-probe" ? (
        <>
          {[0, 1, 2, 3, 4, 5].map((slot) => (
            <VisualBox key={slot} x={84 + slot * 68} y={126} w={52} h={36} label={String(slot)} small color={slot === 2 || slot === 3 ? accent : titleColor} />
          ))}
          <ArrowPath x1={212} y1={178} x2={280} y2={178} color={accent} />
          <VisualNote x={206} y={96} text="collision" color={accent} />
          <VisualNote x={316} y={96} text="match" color={good} />
        </>
      ) : null}

      {topic.visualKind === "grouping-buckets" ? (
        <>
          <VisualBox x={76} y={88} w={144} h={52} label="role -> []" />
          <VisualBox x={76} y={152} w={144} h={52} label="team -> []" />
          <ArrowPath x1={220} y1={114} x2={330} y2={114} color={accent} />
          <ArrowPath x1={220} y1={178} x2={330} y2={178} color={accent} />
          <VisualBox x={330} y={82} w={160} h={58} label="append into bucket" color={good} />
          <VisualBox x={330} y={146} w={160} h={58} label="no branch noise" color={purple} />
        </>
      ) : null}

      {topic.visualKind === "set-algebra" ? (
        <>
          <ellipse cx="210" cy="152" rx="92" ry="66" stroke={titleColor} strokeWidth="2" fill="none" filter="url(#wobble)" />
          <ellipse cx="290" cy="152" rx="92" ry="66" stroke={good} strokeWidth="2" fill="none" filter="url(#wobble)" />
          <text x="184" y="152" className="whiteboard-visual-small">allowed</text>
          <text x="276" y="152" className="whiteboard-visual-small">requested</text>
          <text x="236" y="152" className="whiteboard-visual-small">∩</text>
        </>
      ) : null}

      {topic.visualKind === "container-matrix" ? (
        <>
          {["list", "tuple", "set", "array"].map((label, index) => (
            <VisualBox key={label} x={72 + index * 124} y={126} w={94} h={48} label={label} color={index % 2 === 0 ? titleColor : good} />
          ))}
          <VisualNote x={92} y={214} text="memory vs lookup vs mutation" color={accent} />
        </>
      ) : null}

      {topic.visualKind === "storage-tracks" ? (
        <>
          <VisualBox x={78} y={92} w={136} h={44} label="list" />
          <VisualBox x={78} y={152} w={136} h={44} label="deque" color={good} />
          <VisualBox x={334} y={92} w={136} h={44} label="array.array" color={purple} />
          <VisualBox x={334} y={152} w={136} h={44} label="generator" color={accent} />
          <ArrowPath x1={214} y1={114} x2={334} y2={114} color={titleColor} />
          <ArrowPath x1={214} y1={174} x2={334} y2={174} color={good} />
        </>
      ) : null}

      {topic.visualKind === "tuple-layout" ? (
        <>
          <VisualBox x={92} y={122} w={156} h={56} label="tuple: exact slots" color={good} />
          <VisualBox x={354} y={122} w={156} h={56} label="list: spare capacity" color={accent} />
          <ArrowPath x1={248} y1={150} x2={354} y2={150} color={titleColor} />
        </>
      ) : null}

      {topic.visualKind === "stream-pipeline" ? (
        <>
          <VisualBox x={60} y={132} w={116} h={42} label="source" />
          <ArrowPath x1={176} y1={152} x2={250} y2={152} color={accent} />
          <VisualBox x={250} y={132} w={116} h={42} label="iterator" color={good} />
          <ArrowPath x1={366} y1={152} x2={440} y2={152} color={accent} />
          <VisualBox x={440} y={132} w={116} h={42} label="consumer" color={purple} />
        </>
      ) : null}

      {topic.visualKind === "record-choices" ? (
        <>
          <VisualBox x={62} y={118} w={148} h={50} label="namedtuple" color={titleColor} />
          <VisualBox x={236} y={118} w={148} h={50} label="NamedTuple" color={good} />
          <VisualBox x={410} y={118} w={148} h={50} label="dataclass" color={accent} />
        </>
      ) : null}

      {topic.visualKind === "field-generation" ? (
        <>
          <VisualBox x={74} y={96} w={148} h={48} label="fields + annotations" />
          <ArrowPath x1={222} y1={120} x2={338} y2={120} color={accent} />
          <VisualBox x={338} y={86} w={160} h={60} label="generated __init__ / __repr__" color={good} />
          <VisualBox x={338} y={162} w={160} h={60} label="frozen / slots / order" color={purple} />
        </>
      ) : null}

      {topic.visualKind === "gil-threads" ? (
        <>
          <VisualBox x={82} y={92} w={136} h={42} label="thread A bytecode" />
          <VisualBox x={82} y={152} w={136} h={42} label="thread B bytecode" />
          <VisualBox x={296} y={118} w={110} h={50} label="GIL" color={accent} />
          <ArrowPath x1={218} y1={114} x2={296} y2={136} color={titleColor} />
          <ArrowPath x1={218} y1={174} x2={296} y2={150} color={titleColor} />
          <VisualBox x={446} y={118} w={120} h={50} label="I/O overlap" color={good} />
        </>
      ) : null}

      {topic.visualKind === "event-loop" ? (
        <>
          <VisualBox x={62} y={92} w={122} h={38} label="task A" />
          <VisualBox x={62} y={152} w={122} h={38} label="task B" color={good} />
          <VisualBox x={238} y={120} w={130} h={46} label="event loop" color={titleColor} />
          <VisualBox x={430} y={92} w={122} h={38} label="I/O wait" color={purple} />
          <VisualBox x={430} y={152} w={122} h={38} label="ready queue" color={accent} />
          <ArrowPath x1={184} y1={111} x2={238} y2={131} color={accent} />
          <ArrowPath x1={184} y1={171} x2={238} y2={155} color={accent} />
          <ArrowPath x1={368} y1={143} x2={430} y2={111} color={accent} />
          <ArrowPath x1={368} y1={143} x2={430} y2={171} color={accent} />
        </>
      ) : null}

      {topic.visualKind === "backpressure-flow" ? (
        <>
          <VisualBox x={58} y={130} w={116} h={42} label="producer" />
          <ArrowPath x1={174} y1={152} x2={258} y2={152} color={accent} />
          <VisualBox x={258} y={118} w={120} h={56} label="queue / semaphore" color={purple} />
          <ArrowPath x1={378} y1={152} x2={470} y2={152} color={accent} />
          <VisualBox x={470} y={130} w={110} h={42} label="consumer" color={good} />
        </>
      ) : null}

      {topic.visualKind === "server-pipeline" ? (
        <>
          <VisualBox x={52} y={132} w={108} h={42} label="reader" />
          <ArrowPath x1={160} y1={152} x2={240} y2={152} color={accent} />
          <VisualBox x={240} y={132} w={124} h={42} label="handler" color={titleColor} />
          <ArrowPath x1={364} y1={152} x2={452} y2={152} color={accent} />
          <VisualBox x={452} y={132} w={108} h={42} label="writer" color={good} />
          <VisualNote x={430} y={208} text="drain()" color={accent} />
        </>
      ) : null}

      {topic.visualKind === "async-stream" ? (
        <>
          <VisualBox x={76} y={120} w={120} h={44} label="yield chunk 1" color={titleColor} />
          <VisualBox x={248} y={120} w={120} h={44} label="yield chunk 2" color={good} />
          <VisualBox x={420} y={120} w={120} h={44} label="yield chunk 3" color={purple} />
          <ArrowPath x1={196} y1={142} x2={248} y2={142} color={accent} />
          <ArrowPath x1={368} y1={142} x2={420} y2={142} color={accent} />
        </>
      ) : null}

      {topic.visualKind === "async-boundary" ? (
        <>
          <VisualBox x={76} y={118} w={146} h={50} label="awaitable API" color={titleColor} />
          <VisualBox x={308} y={88} w={146} h={50} label="I/O-friendly" color={good} />
          <VisualBox x={308} y={168} w={146} h={50} label="CPU stall" color={accent} />
          <ArrowPath x1={222} y1={143} x2={308} y2={113} color={good} />
          <ArrowPath x1={222} y1={143} x2={308} y2={193} color={accent} />
        </>
      ) : null}

      {topic.visualKind === "task-tree" ? (
        <>
          <VisualBox x={250} y={70} w={118} h={44} label="TaskGroup" color={titleColor} />
          <ArrowPath x1={310} y1={114} x2={180} y2={168} color={accent} />
          <ArrowPath x1={310} y1={114} x2={310} y2={168} color={accent} />
          <ArrowPath x1={310} y1={114} x2={440} y2={168} color={accent} />
          <VisualBox x={122} y={168} w={116} h={40} label="child A" color={good} />
          <VisualBox x={252} y={168} w={116} h={40} label="child B" color={purple} />
          <VisualBox x={382} y={168} w={116} h={40} label="child C" color={good} />
        </>
      ) : null}

      {topic.visualKind === "log-pipeline" ? (
        <>
          <VisualBox x={64} y={132} w={112} h={42} label="logger" color={titleColor} />
          <ArrowPath x1={176} y1={152} x2={264} y2={152} color={accent} />
          <VisualBox x={264} y={132} w={112} h={42} label="handler" color={good} />
          <ArrowPath x1={376} y1={152} x2={464} y2={152} color={accent} />
          <VisualBox x={464} y={132} w={112} h={42} label="sink" color={purple} />
          <VisualNote x={258} y={212} text="context fields travel with the record" color={accent} />
        </>
      ) : null}
    </svg>
  )
}

function VisualBox({
  x,
  y,
  w,
  h,
  label,
  color = MARKER_COLORS.navy,
  small = false,
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  color?: string
  small?: boolean
}) {
  return (
    <>
      <motion.rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="3"
        stroke={color}
        strokeWidth="2"
        fill="none"
        filter="url(#wobble)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
      <text x={x + 10} y={y + h / 2 + 5} className={small ? "whiteboard-visual-xs" : "whiteboard-visual-small"}>{label}</text>
    </>
  )
}

function VisualNote({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  return <text x={x} y={y} className="whiteboard-visual-note" fill={color}>{text}</text>
}

function ArrowPath({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const midX = (x1 + x2) / 2
  return (
    <>
      <motion.path
        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2 - 14} ${y2}`}
        stroke={color}
        strokeWidth="2.4"
        fill="none"
        filter="url(#wobble)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
      <motion.path
        d={`M ${x2 - 20} ${y2 - 8} L ${x2} ${y2} L ${x2 - 20} ${y2 + 8}`}
        stroke={color}
        strokeWidth="2.4"
        fill="none"
        filter="url(#wobble)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
    </>
  )
}

function MarkerTray() {
  const markers = [
    { color: MARKER_COLORS.black, rotate: -3, tip: false },
    { color: MARKER_COLORS.navy, rotate: 2, tip: false },
    { color: MARKER_COLORS.red, rotate: -1, tip: false },
    { color: MARKER_COLORS.green, rotate: 3, tip: false },
    { color: MARKER_COLORS.purple, rotate: -4, tip: true },
  ]

  return (
    <div className="whiteboard-tray" aria-hidden="true">
      <div className="whiteboard-tray-rail" />
      <div className="whiteboard-markers">
        {markers.map((marker, index) => (
          <div key={`${marker.color}-${index}`} className="whiteboard-marker" style={{ ["--marker-color" as string]: marker.color, rotate: `${marker.rotate}deg` }}>
            <div className="whiteboard-marker-cap" />
            <div className="whiteboard-marker-body">
              <span>EXPO</span>
            </div>
            {marker.tip ? <div className="whiteboard-marker-tip" /> : <div className="whiteboard-marker-cap end" />}
          </div>
        ))}
      </div>
      <div className="whiteboard-eraser">
        <span>EXPO</span>
      </div>
    </div>
  )
}
