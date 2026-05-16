"use client"

import { ArrowLeft, ArrowRight, Bookmark, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { TopicCardData } from "@/types"
const BOOKMARKS_KEY = "teachboard:bookmarks"

const LAST_READ_KEY = "teachboard:last-read"

type SerializableGuideCard = Pick<TopicCardData, "id" | "title" | "desc" | "color" | "badges" | "cats" | "kw">

export function GuideReaderPage({
  card,
  allCards,
  guide,
}: {
  card: SerializableGuideCard
  allCards: SerializableGuideCard[]
  guide: React.ReactNode
}) {
  const [bookmarked, setBookmarked] = useState(() => {
    if (typeof window === "undefined") return false
    const stored = new Set<string>(JSON.parse(window.localStorage.getItem(BOOKMARKS_KEY) ?? "[]"))
    return stored.has(card.id)
  })
  const index = allCards.findIndex((entry) => entry.id === card.id)
  const previous = index > 0 ? allCards[index - 1] : null
  const next = index >= 0 && index < allCards.length - 1 ? allCards[index + 1] : null
  const related = useMemo(
    () => allCards.filter((entry) => entry.id !== card.id && card.cats.some((cat) => entry.cats.includes(cat))).slice(0, 3),
    [allCards, card.cats, card.id],
  )

  useEffect(() => {
    window.localStorage.setItem(LAST_READ_KEY, card.id)
  }, [card.id])

  function toggleBookmark() {
    const stored = new Set<string>(JSON.parse(window.localStorage.getItem(BOOKMARKS_KEY) ?? "[]"))
    if (stored.has(card.id)) {
      stored.delete(card.id)
      setBookmarked(false)
    } else {
      stored.add(card.id)
      setBookmarked(true)
    }
    window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...stored]))
  }

  return (
    <div className="guide-reader-page">
      <div className="guide-reader-shell">
        <div className="guide-reader-topbar">
          <Link href="/" className="guide-reader-back">
            <ArrowLeft size={15} />
            Back to whiteboard
          </Link>
          <button className={`guide-reader-bookmark${bookmarked ? " is-active" : ""}`} onClick={toggleBookmark}>
            <Bookmark size={14} />
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>
        </div>

        <div className="guide-reader-hero">
          <div className="guide-reader-kicker">Python in Depth</div>
          <h1>{card.title}</h1>
          <p>{card.desc}</p>
          <div className="guide-reader-badges">
            {card.badges.map((badge) => (
              <span key={badge.label} className={`guide-reader-badge guide-reader-badge--${badge.color}`}>
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        <div className="guide-reader-layout">
          <article className="guide-reader-article">{guide}</article>

          <aside className="guide-reader-sidebar">
            <div className="guide-reader-note">
              <div className="guide-reader-note-title">Reader mode</div>
              <p>Use the whiteboard for quick mental models. Use this page for the full technical explanation, code, and cross references.</p>
            </div>

            {related.length > 0 ? (
              <div className="guide-reader-note">
                <div className="guide-reader-note-title">Related chapters</div>
                <div className="guide-reader-links">
                  {related.map((entry) => (
                    <Link key={entry.id} href={`/${entry.id}`} className="guide-reader-side-link">
                      <span>{entry.title}</span>
                      <ArrowRight size={13} />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="guide-reader-note">
              <div className="guide-reader-note-title">Chapter navigation</div>
              <div className="guide-reader-links">
                {previous ? (
                  <Link href={`/${previous.id}`} className="guide-reader-side-link">
                    <span>{previous.title}</span>
                    <ArrowLeft size={13} />
                  </Link>
                ) : null}
                {next ? (
                  <Link href={`/${next.id}`} className="guide-reader-side-link">
                    <span>{next.title}</span>
                    <ArrowRight size={13} />
                  </Link>
                ) : null}
                <Link href="/" className="guide-reader-side-link">
                  <span>Open the whiteboard overview</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
