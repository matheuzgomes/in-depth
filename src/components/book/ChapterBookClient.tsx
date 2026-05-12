"use client"

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { preloadGuide, loadGuideComponent } from "@/data/guideRegistry"
import { T } from "@/lib/tokens"
import { Badge } from "@/components/ui/Badge"
import { SLabel } from "@/components/ui/SLabel"
import { Divider } from "@/components/ui/Divider"

const BOOKMARKS_KEY = "python-in-depth:bookmarks"
const LAST_READ_KEY = "python-in-depth:last-read"
const BOOK_OPEN_KEY = "python-in-depth:book-opened"

interface SerializableBadge {
  label: string
  color?: "purple" | "teal" | "amber" | "blue" | "coral" | "green"
}

interface ChapterSummary {
  id: string
  title: string
  desc: string
  color: "purple" | "teal" | "amber" | "blue" | "coral" | "green"
  badges: SerializableBadge[]
  cats: string[]
}

interface ChapterBookClientProps {
  chapter: ChapterSummary
  allChapters: ChapterSummary[]
  initialGuide: ReactNode
}

export function ChapterBookClient({ chapter, allChapters, initialGuide }: ChapterBookClientProps) {
  const router = useRouter()
  const [activeChapterId, setActiveChapterId] = useState(chapter.id)
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set<string>()
    return new Set<string>(JSON.parse(window.localStorage.getItem(BOOKMARKS_KEY) ?? "[]"))
  })
  const [closing, setClosing] = useState(false)
  const [pageTurning, setPageTurning] = useState(false)
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null)
  const [loadingGuide, setLoadingGuide] = useState(false)
  const [activeGuide, setActiveGuide] = useState<ReactNode>(initialGuide)
  const guideCacheRef = useRef<Map<string, ReactNode>>(new Map([[chapter.id, initialGuide]]))
  const pendingLoadRef = useRef<Promise<ReactNode | null> | null>(null)
  const preloadAllStartedRef = useRef(false)

  const activeChapter = useMemo(
    () => allChapters.find((entry) => entry.id === activeChapterId) ?? chapter,
    [activeChapterId, allChapters, chapter],
  )
  const chapterIndex = allChapters.findIndex((entry) => entry.id === activeChapter.id)
  const chapterNumber = chapterIndex + 1
  const pageNumber = 12 + chapterNumber * 6
  const previous = chapterIndex > 0 ? allChapters[chapterIndex - 1] : null
  const next = chapterIndex < allChapters.length - 1 ? allChapters[chapterIndex + 1] : null
  const related = allChapters
    .filter((candidate) => candidate.id !== activeChapter.id && activeChapter.cats.some((cat) => candidate.cats.includes(cat)))
    .slice(0, 3)
  const theme = useMemo(() => resolveChapterTheme(activeChapter), [activeChapter])
  const badgeList = useMemo(() => activeChapter.badges ?? [], [activeChapter.badges])
  const bookmarked = bookmarkIds.has(activeChapter.id)

  const updateUrl = useCallback((id: string) => {
    if (typeof window === "undefined") return
    const nextPath = `/${id}`
    if (window.location.pathname === nextPath) return
    window.history.pushState({ chapterId: id }, "", nextPath)
  }, [])

  const ensureGuideReady = useCallback(async (id: string) => {
    const cached = guideCacheRef.current.get(id)
    if (cached) {
      return cached
    }

    const Guide = await loadGuideComponent(id)
    if (!Guide) {
      return null
    }
    const node = <Guide />
    guideCacheRef.current.set(id, node)
    return node
  }, [])

  const activateChapterGuide = useCallback(async (id: string) => {
    setLoadingGuide(true)
    const node = await ensureGuideReady(id)
    if (!node) {
      setLoadingGuide(false)
      router.push(`/${id}`)
      return null
    }
    setActiveGuide(node)
    setLoadingGuide(false)
    return node
  }, [ensureGuideReady, router])

  const preloadNeighbors = useCallback((id: string) => {
    const idx = allChapters.findIndex((entry) => entry.id === id)
    const left = idx > 0 ? allChapters[idx - 1]?.id : null
    const right = idx < allChapters.length - 1 ? allChapters[idx + 1]?.id : null
    if (left) preloadGuide(left)
    if (right) preloadGuide(right)
  }, [allChapters])

  useEffect(() => {
    window.localStorage.setItem(LAST_READ_KEY, activeChapter.id)
    window.localStorage.setItem(BOOK_OPEN_KEY, "1")
    preloadNeighbors(activeChapter.id)
  }, [activeChapter.id, preloadNeighbors])

  useEffect(() => {
    if (preloadAllStartedRef.current) return
    preloadAllStartedRef.current = true
    const ids = allChapters.map((entry) => entry.id).filter((id) => id !== activeChapter.id)
    let index = 0
    let cancelled = false

    const pump = () => {
      if (cancelled) return
      const end = Math.min(index + 2, ids.length)
      for (; index < end; index += 1) {
        const id = ids[index]
        void ensureGuideReady(id)
      }
      if (index < ids.length) schedule()
    }

    const schedule = () => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        const idle = window.requestIdleCallback as (callback: () => void, opts?: { timeout: number }) => number
        idle(pump, { timeout: 700 })
      } else {
        globalThis.setTimeout(pump, 80)
      }
    }

    schedule()
    return () => {
      cancelled = true
    }
  }, [activeChapter.id, allChapters, ensureGuideReady])

  useEffect(() => {
    const onPopState = () => {
      const pathId = window.location.pathname.slice(1)
      if (!pathId) return
      if (!allChapters.some((entry) => entry.id === pathId)) return
      setActiveChapterId(pathId)
      setPendingChapterId(null)
      setPageTurning(false)
      void activateChapterGuide(pathId)
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [activateChapterGuide, allChapters])

  const turnToChapter = useCallback((id: string) => {
    if (pageTurning || closing || id === activeChapter.id) return
    setPendingChapterId(id)
    setPageTurning(true)
    preloadGuide(id)
    pendingLoadRef.current = ensureGuideReady(id)
  }, [activeChapter.id, closing, ensureGuideReady, pageTurning])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && previous) turnToChapter(previous.id)
      if (event.key === "ArrowRight" && next) turnToChapter(next.id)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [next, previous, turnToChapter])

  function toggleBookmark() {
    const next = new Set(bookmarkIds)
    if (next.has(activeChapter.id)) {
      next.delete(activeChapter.id)
    } else {
      next.add(activeChapter.id)
    }
    setBookmarkIds(next)
    window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...next]))
  }

  function closeBook() {
    setClosing(true)
    window.localStorage.setItem(BOOK_OPEN_KEY, "0")
    window.setTimeout(() => {
      router.push("/")
    }, 760)
  }

  async function completePageTurn() {
    if (!pendingChapterId) return
    const id = pendingChapterId
    const warmedNode = pendingLoadRef.current ? await pendingLoadRef.current : await ensureGuideReady(id)
    pendingLoadRef.current = null
    if (!warmedNode) {
      setPageTurning(false)
      setPendingChapterId(null)
      router.push(`/${id}`)
      return
    }
    setActiveGuide(warmedNode)
    setPageTurning(false)
    setPendingChapterId(null)
    setActiveChapterId(id)
    updateUrl(id)
    setLoadingGuide(false)
  }

  return (
    <div className="site-shell">
      <div className="guide-shell">
        <div className="guide-nav-row">
          <Link href="/" className="guide-back-link">
            <ChevronLeft size={15} />
            Back to the book
          </Link>

          <button className="close-book-button" onClick={closeBook}>
            Close book
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeChapter.id}:${closing ? "closing" : "open"}`}
            initial={{ opacity: 0, rotateY: 10, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, rotateY: closing ? -18 : 0, y: 0, scale: closing ? 0.98 : 1 }}
            exit={{ opacity: 0, rotateY: -12, x: 60, scale: 0.986 }}
            transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`chapter-book fade-in chapter-book--${theme}`}
          >
            <div
              className="chapter-progress-rail"
              style={{ ["--progress-width" as string]: `${(chapterNumber / allChapters.length) * 100}%` }}
            />
            {previous ? (
              <button className="book-nav-arrow prev" onClick={() => turnToChapter(previous.id)} aria-label={`Previous chapter: ${previous.title}`}>
                <ArrowLeft size={16} />
              </button>
            ) : null}
            {next ? (
              <button className="book-nav-arrow next" onClick={() => turnToChapter(next.id)} aria-label={`Next chapter: ${next.title}`}>
                <ArrowRight size={16} />
              </button>
            ) : null}

            <div className="chapter-book-frame">
              <div className="chapter-atmosphere" aria-hidden="true">
                <div className="chapter-atmosphere-layer chapter-atmosphere-layer--wash" />
                <div className="chapter-atmosphere-layer chapter-atmosphere-layer--grid" />
                <div className="chapter-atmosphere-layer chapter-atmosphere-layer--signal" />
              </div>
              {closing ? (
                <motion.div
                  className="chapter-closing-cover"
                  initial={{ rotateY: -180, opacity: 0.96 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.64, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="chapter-closing-cover-face">
                    <div className="chapter-closing-cover-inner">
                      <div className="chapter-closing-kicker">Python in Depth</div>
                      <div className="chapter-closing-title">{activeChapter.title}</div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
              <div className="chapter-sheet">
                <div className="chapter-sheet-inner">
                  <div className="page-running-header">
                    <span>Python in Depth</span>
                    <span>{activeChapter.title}</span>
                  </div>

                  <div className="chapter-sheet-top">
                    <div className="chapter-sheet-meta">
                      <div className="chapter-overline">Ch. {pad(chapterNumber)}</div>
                      <h1 className="chapter-title">{activeChapter.title}</h1>
                      <div className="chapter-deck">{activeChapter.desc}</div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                        {badgeList.map((badge, index) => <Badge key={index} label={badge.label} color={badge.color} />)}
                      </div>
                    </div>

                    <div className="chapter-meta-stack chapter-meta-stack--sidebar">
                      <button className={`bookmark-button${bookmarked ? " active" : ""}`} onClick={toggleBookmark}>
                        {bookmarked ? "Bookmarked" : "Bookmark"}
                      </button>

                      <div className="chapter-meta-box">
                        <div className="chapter-meta-label">Position</div>
                        <div className="chapter-meta-value">Chapter {chapterNumber} of {allChapters.length}.</div>
                      </div>

                      <div className="chapter-meta-box">
                        <div className="chapter-meta-label">Cross-references</div>
                        <div className="chapter-meta-value">
                          {related.length > 0 ? related.map((entry, index) => (
                            <span key={entry.id}>
                              <button className="mdx-link-button" onClick={() => turnToChapter(entry.id)}>
                                {`→ Ch.${pad(allChapters.findIndex((candidate) => candidate.id === entry.id) + 1)} · ${entry.title}`}
                              </button>
                              {index < related.length - 1 ? " · " : ""}
                            </span>
                          )) : "No adjacent cross-references."}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chapter-guide-divider" />

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.34 }}
                    className="book-article chapter-unified-article"
                  >
                    {loadingGuide ? <GuideLoadingSurface /> : <div>{activeGuide}</div>}
                  </motion.div>

                  {related.length > 0 && (
                    <>
                      <Divider />
                      <SLabel>Related chapters</SLabel>
                      <div className="guide-related-grid">
                        {related.map((entry) => (
                          <button key={entry.id} onClick={() => turnToChapter(entry.id)} className="guide-related-link">
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 999,
                              background: T[entry.color].bg,
                              border: `1px solid ${T[entry.color].accent}33`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}>
                              <span style={{ width: 8, height: 8, borderRadius: 999, background: T[entry.color].fg, display: "block" }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div className="title">{entry.title}</div>
                              <div className="desc">{entry.desc}</div>
                            </div>
                            <ArrowRight size={13} color={T.text3} />
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {next ? (
                    <button className="continue-button continue-button--button" onClick={() => turnToChapter(next.id)}>
                      Continue reading →
                    </button>
                  ) : null}

                  <div className="chapter-footnote">
                    This chapter now uses client-side chapter swaps with URL sync, so page turns stay responsive even with deep technical guides.
                  </div>

                  <div className="page-number outer-right">{pad(pageNumber)}</div>
                </div>
              </div>
              {pageTurning ? <ChapterTurningPageOverlay onComplete={completePageTurn} /> : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function ChapterTurningPageOverlay({ onComplete }: { onComplete: () => void }) {
  return (
    <div
      className="turning-page-overlay turning-page-overlay--chapter"
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.currentTarget !== event.target) return
        onComplete()
      }}
    >
      <div className="turning-page-shadow" />
      <div className="turning-page-face turning-page-face--front" />
      <div className="turning-page-face turning-page-face--back" />
    </div>
  )
}

function GuideLoadingSurface() {
  return (
    <div style={{ display: "grid", gap: 10, padding: "4px 0 8px" }}>
      <div style={{ height: 12, width: "84%", borderRadius: 5, background: "rgba(255,255,255,0.08)" }} />
      <div style={{ height: 12, width: "92%", borderRadius: 5, background: "rgba(255,255,255,0.07)" }} />
      <div style={{ height: 12, width: "77%", borderRadius: 5, background: "rgba(255,255,255,0.06)" }} />
    </div>
  )
}

function pad(value: number) {
  return String(value).padStart(3, "0")
}

function resolveChapterTheme(chapter: ChapterSummary) {
  if (chapter.cats.includes("async")) return "async"
  if (chapter.cats.includes("memory")) return "memory"
  if (chapter.cats.includes("data-structures")) return "structures"
  if (chapter.cats.includes("language") || chapter.cats.includes("classes")) return "language"
  return "runtime"
}
