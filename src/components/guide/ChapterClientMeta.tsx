"use client"

import { useEffect, useState } from "react"
import { Bookmark } from "lucide-react"

const BOOKMARKS_KEY = "python-in-depth:bookmarks"
const LAST_READ_KEY = "python-in-depth:last-read"

export function ChapterClientMeta({ chapterId }: { chapterId: string }) {
  const [bookmarked, setBookmarked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    const stored = new Set<string>(JSON.parse(window.localStorage.getItem(BOOKMARKS_KEY) ?? "[]"))
    return stored.has(chapterId)
  })

  useEffect(() => {
    window.localStorage.setItem(LAST_READ_KEY, chapterId)
  }, [chapterId])

  function toggleBookmark() {
    const stored = new Set<string>(JSON.parse(window.localStorage.getItem(BOOKMARKS_KEY) ?? "[]"))
    if (stored.has(chapterId)) {
      stored.delete(chapterId)
      setBookmarked(false)
    } else {
      stored.add(chapterId)
      setBookmarked(true)
    }
    window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...stored]))
  }

  return (
    <button className={`bookmark-button${bookmarked ? " active" : ""}`} onClick={toggleBookmark}>
      <Bookmark size={13} />
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  )
}
