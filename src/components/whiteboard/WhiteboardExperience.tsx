"use client"

import type { ComponentType, ReactNode } from "react"
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, Search, X } from "lucide-react"
import { CardRef } from "@/components/navigation/CardRef"
import { NavContext } from "@/components/navigation/NavContext"
import { RoughPythonMark } from "@/components/whiteboard/RoughPythonMark"
import { RoughVisualDiagram } from "@/components/whiteboard/RoughVisualDiagram"
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

const LAST_READ_KEY = "teachboard:last-read"
const MOBILE_BREAKPOINT = 1024

const MARKER_COLORS = {
  navy: "#1a2e6e",
  red: "#c0392b",
  green: "#1a7a4a",
  black: "#1a1a1a",
  purple: "#6c3483",
} as const

const PYTHON_STICKY_NOTES = [
  "A slice copies when the left side is a list. Nice syntax, real allocation.",
  "If a default value is mutable, pause before you ship it.",
  "A dict lookup is fast until your key's hash story gets weird.",
  "Async only helps if the code gives the loop a place to breathe.",
  "Prefer boring names. Future you debugs with tired eyes.",
  "Tuples say fixed shape. Lists say this may grow.",
  "If order matters, say so in the type you choose.",
  "Log the decision point, not every footstep.",
  "A set is for questions like: have I seen this before?",
  "Bytecode explains shape. Measurements still decide.",
  "Dataclasses generate methods, not judgment.",
  "The GIL is not your lock. Use a real one for shared state.",
]

function pickTocNote() {
  const index = Math.floor(Math.random() * PYTHON_STICKY_NOTES.length)
  return PYTHON_STICKY_NOTES[index]
}

function buildTopicNotes(topic: WhiteboardTopic) {
  return [
    topic.reminder,
    topic.takeaways[0],
    topic.howItWorks[0],
    topic.whenToUseIt[0],
    topic.boardIntro,
  ].filter(Boolean)
}

function pickTopicNote(topic: WhiteboardTopic, noteTurn: number) {
  const notes = buildTopicNotes(topic)
  const index = noteTurn % notes.length
  return notes[index] ?? topic.reminder
}

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
  const [topicNoteTurn, setTopicNoteTurn] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [tocNote] = useState(() => pickTocNote())

  useEffect(() => { setMounted(true) }, [])
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(() => new Set())
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
  const quickNote = useMemo(() => pickTopicNote(activeTopic, topicNoteTurn), [activeTopic, topicNoteTurn])
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
    setActiveTopicId((currentTopicId) => {
      if (currentTopicId !== topicId) {
        setTopicNoteTurn((current) => current + 1)
      }
      return topicId
    })
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
      setActiveTopicId((currentTopicId) => {
        if (currentTopicId !== nextTopicId) {
          setTopicNoteTurn((current) => current + 1)
        }
        return nextTopicId
      })
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
                  <div className="whiteboard-content">
                    <h1>Python in Depth</h1>
                    <Squiggle className="whiteboard-title-squiggle" color={MARKER_COLORS.navy} />
                  </div>
                  <p>An interactive engineering reference for Python internals</p>
                </div>

                <motion.div
                  className="whiteboard-note whiteboard-note--header whiteboard-note--yellow"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <div className="whiteboard-sticky-tape" />
                  <strong>Quick note</strong>
                  <p>{quickNote}</p>
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
                    <span>{mounted ? tocNote : ""}</span>
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
                  <RoughVisualDiagram topic={activeTopic} />
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

function renderNoteBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
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

      {preset.winner ? (
        <div className="whiteboard-winner-banner" style={{ borderLeftColor: MARKER_COLORS.navy }}>
          <span className="whiteboard-winner-label">Winner</span>
          <span className="whiteboard-winner-text"><strong>{preset.winner.label}</strong> — {preset.winner.detail}</span>
        </div>
      ) : null}

      {preset.guideRef ? (
        <div className="whiteboard-side-card whiteboard-side-card--ref">
          <div className="whiteboard-control-header">RELATED GUIDE</div>
          <CardRef id={preset.guideRef} />
        </div>
      ) : null}

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
        {preset.metrics.length > 0 ? (
          <div className="whiteboard-metric-card-grid">
            {preset.metrics.map((metric) => (
              <div key={metric.label} className="whiteboard-metric-card">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="whiteboard-side-card">
        <div className="whiteboard-control-header">NOTES</div>
        <div className="whiteboard-prose-notes">
          {preset.notes.length > 0 ? preset.notes.map((note, i) => (
            <p key={i} className="whiteboard-note-paragraph">{renderNoteBold(note)}</p>
          )) : <p className="whiteboard-note-paragraph whiteboard-note-paragraph--empty">No notes for this preset.</p>}
        </div>
      </div>

      <div className="whiteboard-side-card whiteboard-side-card--env">
        <div className="whiteboard-control-header">TEST ENVIRONMENT</div>
        <div className="whiteboard-environment-grid">
          <EnvironmentRow label="Python Version" value={WHITEBOARD_BENCHMARKS.environment.pythonVersion} />
          <EnvironmentRow label="Machine" value={WHITEBOARD_BENCHMARKS.environment.machine} />
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
  switch (preset.chartKind) {
    case "bar":
      return <BarBenchmarkChart preset={preset} />
    case "lollipop":
      return <LollipopBenchmarkChart preset={preset} />
    default:
      return <LineBenchmarkChart preset={preset} />
  }
}

function LineBenchmarkChart({ preset }: { preset: WhiteboardBenchmarkPreset }) {
  const clipId = useId().replace(/:/g, "")
  const width = 332
  const height = 216
  const padding = { top: 18, right: 16, bottom: 34, left: 42 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const maxValue = Math.max(...preset.series.flatMap((series) => series.values), 1)
  const yTicks = [0, maxValue / 2, maxValue]

  return (
    <div className="whiteboard-chart-card whiteboard-chart-card--line">
      <div className="whiteboard-chart-title">{preset.chartTitle}</div>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="whiteboard-chart-svg" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} />
          </clipPath>
        </defs>
        <ChartAxes width={width} height={height} padding={padding} plotWidth={plotWidth} plotHeight={plotHeight} yTicks={yTicks} yUnit={preset.yUnit} xLabels={preset.xLabels} />
        {yTicks.map((tick) => {
          const ratio = tick / maxValue
          const y = padding.top + plotHeight - ratio * plotHeight
          return (
            <path key={tick} d={`M ${padding.left - 4} ${y} H ${padding.left + plotWidth}`} stroke="rgba(0,0,0,0.08)" strokeWidth="0.9" filter="url(#softWobble)" fill="none" />
          )
        })}

        <g clipPath={`url(#${clipId})`}>
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
        </g>
      </svg>
      <BenchmarkLegend preset={preset} />
    </div>
  )
}

function BarBenchmarkChart({ preset }: { preset: WhiteboardBenchmarkPreset }) {
  const clipId = useId().replace(/:/g, "")
  const width = 332
  const height = 228
  const padding = { top: 18, right: 16, bottom: 40, left: 42 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const maxValue = Math.max(...preset.series.flatMap((series) => series.values), 1)
  const yTicks = [0, maxValue / 2, maxValue]
  const groupWidth = plotWidth / Math.max(preset.xLabels.length, 1)
  const barGap = 6
  const usableGroupWidth = Math.max(groupWidth - 10, 24)
  const barWidth = Math.max(8, Math.min(24, (usableGroupWidth - barGap * (preset.series.length - 1)) / Math.max(preset.series.length, 1)))
  const offsetWidth = preset.series.length * barWidth + Math.max(preset.series.length - 1, 0) * barGap

  return (
    <div className="whiteboard-chart-card whiteboard-chart-card--bar">
      <div className="whiteboard-chart-title">{preset.chartTitle}</div>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="whiteboard-chart-svg" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} />
          </clipPath>
        </defs>
        <ChartAxes width={width} height={height} padding={padding} plotWidth={plotWidth} plotHeight={plotHeight} yTicks={yTicks} yUnit={preset.yUnit} xLabels={preset.xLabels} grouped />
        {yTicks.map((tick) => {
          const ratio = tick / maxValue
          const y = padding.top + plotHeight - ratio * plotHeight
          return <path key={tick} d={`M ${padding.left - 4} ${y} H ${padding.left + plotWidth}`} stroke="rgba(0,0,0,0.08)" strokeWidth="0.9" filter="url(#softWobble)" fill="none" />
        })}

        <g clipPath={`url(#${clipId})`}>
          {preset.xLabels.map((_, labelIndex) => {
            const groupCenter = padding.left + groupWidth * labelIndex + groupWidth / 2
            const groupLeft = groupCenter - offsetWidth / 2

            return preset.series.map((series, seriesIndex) => {
              const value = series.values[labelIndex] ?? 0
              const barHeight = (value / maxValue) * plotHeight
              const x = groupLeft + seriesIndex * (barWidth + barGap)
              const y = padding.top + plotHeight - barHeight

              return (
                <motion.rect
                  key={`${series.label}-${labelIndex}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="2.5"
                  fill={series.color}
                  opacity="0.9"
                  filter="url(#softWobble)"
                  initial={{ height: 0, y: padding.top + plotHeight }}
                  animate={{ height: barHeight, y }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              )
            })
          })}
        </g>
      </svg>
      <BenchmarkLegend preset={preset} />
    </div>
  )
}

function LollipopBenchmarkChart({ preset }: { preset: WhiteboardBenchmarkPreset }) {
  const clipId = useId().replace(/:/g, "")
  const width = 332
  const height = 228
  const padding = { top: 18, right: 16, bottom: 40, left: 42 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const maxValue = Math.max(...preset.series.flatMap((series) => series.values), 1)
  const yTicks = [0, maxValue / 2, maxValue]
  const groupWidth = plotWidth / Math.max(preset.xLabels.length, 1)
  const stemGap = 10
  const usableGroupWidth = Math.max(groupWidth - 10, 22)
  const step = preset.series.length > 1 ? Math.min(stemGap, usableGroupWidth / Math.max(preset.series.length - 1, 1)) : 0
  const groupSpan = step * Math.max(preset.series.length - 1, 0)

  return (
    <div className="whiteboard-chart-card whiteboard-chart-card--lollipop">
      <div className="whiteboard-chart-title">{preset.chartTitle}</div>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="whiteboard-chart-svg" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} />
          </clipPath>
        </defs>
        <ChartAxes width={width} height={height} padding={padding} plotWidth={plotWidth} plotHeight={plotHeight} yTicks={yTicks} yUnit={preset.yUnit} xLabels={preset.xLabels} grouped />
        {yTicks.map((tick) => {
          const ratio = tick / maxValue
          const y = padding.top + plotHeight - ratio * plotHeight
          return <path key={tick} d={`M ${padding.left - 4} ${y} H ${padding.left + plotWidth}`} stroke="rgba(0,0,0,0.08)" strokeWidth="0.9" filter="url(#softWobble)" fill="none" />
        })}

        <g clipPath={`url(#${clipId})`}>
          {preset.xLabels.map((_, labelIndex) => {
            const baseCenter = padding.left + groupWidth * labelIndex + groupWidth / 2
            const startX = baseCenter - groupSpan / 2

            return preset.series.map((series, seriesIndex) => {
              const value = series.values[labelIndex] ?? 0
              const x = startX + seriesIndex * step
              const y = padding.top + plotHeight - (value / maxValue) * plotHeight

              return (
                <g key={`${series.label}-${labelIndex}`}>
                  <motion.path
                    d={`M ${x} ${padding.top + plotHeight} L ${x} ${y}`}
                    stroke={series.color}
                    strokeWidth="2"
                    fill="none"
                    filter="url(#wobble)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="4.1"
                    fill={series.color}
                    filter="url(#softWobble)"
                    initial={{ scale: 0.2, opacity: 0.2 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                  />
                </g>
              )
            })
          })}
        </g>
      </svg>
      <BenchmarkLegend preset={preset} />
    </div>
  )
}

function ChartAxes({
  width,
  height,
  padding,
  plotWidth,
  plotHeight,
  yTicks,
  yUnit,
  xLabels,
  grouped = false,
}: {
  width: number
  height: number
  padding: { top: number; right: number; bottom: number; left: number }
  plotWidth: number
  plotHeight: number
  yTicks: number[]
  yUnit: WhiteboardBenchmarkPreset["yUnit"]
  xLabels: string[]
  grouped?: boolean
}) {
  return (
    <>
      <path d={`M ${padding.left} ${padding.top} V ${height - padding.bottom} H ${width - padding.right}`} stroke={MARKER_COLORS.black} strokeWidth="1.4" filter="url(#wobble)" fill="none" />
      {yTicks.map((tick) => {
        const ratio = tick / Math.max(yTicks[yTicks.length - 1], 1)
        const y = padding.top + plotHeight - ratio * plotHeight
        return (
          <text key={`tick-${tick}`} x={padding.left - 4} y={y + 4} textAnchor="end" className="whiteboard-chart-axis">
            {formatChartTick(tick, yUnit)}
          </text>
        )
      })}
      {xLabels.map((tick, index) => {
        const divisor = grouped ? Math.max(xLabels.length, 1) : Math.max(xLabels.length - 1, 1)
        const x = grouped
          ? padding.left + (plotWidth / divisor) * index + plotWidth / divisor / 2
          : padding.left + (plotWidth / divisor) * index

        return (
          <text key={tick} x={x} y={height - 10} textAnchor="middle" className="whiteboard-chart-axis">
            {tick}
          </text>
        )
      })}
    </>
  )
}

function BenchmarkLegend({ preset }: { preset: WhiteboardBenchmarkPreset }) {
  return (
    <div className="whiteboard-chart-legend">
      {preset.series.map((series) => (
        <div key={series.label} className="whiteboard-legend-item">
          <span className="whiteboard-legend-swatch" style={{ background: series.color }} />
          <span>{series.label}</span>
        </div>
      ))}
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


