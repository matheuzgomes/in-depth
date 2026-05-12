"use client"

import { useContext } from "react"
import Link from "next/link"
import { T } from "@/lib/tokens"
import { NavContext } from "@/components/navigation/NavContext"
import { buildWhiteboardHref } from "@/lib/whiteboardRoute"

interface CardRefProps {
  id: string
}

export function CardRef({ id }: CardRefProps) {
  const nav = useContext(NavContext)
  const card = nav?.allCards.find(c => c.id === id)

  if (!nav || !card) {
    return (
      <Link
        href={buildWhiteboardHref(id, "guide")}
        className="card-ref-chip"
        style={{
          textDecoration: "none",
        }}
      >
        {id}
      </Link>
    )
  }

  const c = T[card.color] ?? T.purple

  return (
    <button
      onClick={() => nav.openCard(id, "guide")}
      className="card-ref-chip"
      style={{
        cursor: "pointer",
        color: c.fg,
        borderColor: `${c.accent}44`,
      }}
    >
      <card.Icon size={11} strokeWidth={2} />
      {card.title}
    </button>
  )
}
