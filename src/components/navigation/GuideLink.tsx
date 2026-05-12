"use client"

import { ExternalLink } from "lucide-react"
import { useContext } from "react"
import { NavContext } from "@/components/navigation/NavContext"
import { PrefetchLink } from "@/components/navigation/PrefetchLink"
import { buildWhiteboardHref } from "@/lib/whiteboardRoute"

interface GuideLinkProps {
  id: string
}

export function GuideLink({ id }: GuideLinkProps) {
  const nav = useContext(NavContext)
  const card = nav?.allCards.find((entry) => entry.id === id)
  const href = buildWhiteboardHref(id, "guide")

  if (nav && card) {
    return (
      <button
        type="button"
        className="guide-link-button"
        style={{ cursor: "pointer" }}
        onClick={() => nav.openCard(id, "guide")}
      >
        <ExternalLink size={13} />
        Read the full in-depth guide
      </button>
    )
  }

  return (
    <PrefetchLink
      href={href}
      className="guide-link-button"
      style={{
        cursor: "pointer",
      }}
    >
      <ExternalLink size={13} />
      Read the full in-depth guide
    </PrefetchLink>
  )
}
