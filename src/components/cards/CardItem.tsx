"use client"

import { ChevronDown } from "lucide-react"
import type { CardData, NavContextValue } from "@/types"
import { T } from "@/lib/tokens"
import { Badge } from "@/components/ui/Badge"

interface CardItemProps {
  card: CardData
  isOpen: boolean
  nav: NavContextValue
  onToggle: () => void
  onRef: (el: HTMLDivElement | null) => void
}

export function CardItem({ card, isOpen, nav, onToggle, onRef }: CardItemProps) {
  const c = T[card.color] ?? T.purple

  return (
    <div
      className={`topic-card${isOpen ? " is-open" : ""}`}
      ref={onRef}
      style={{
        marginBottom: 6,
        ["--topic-border" as string]: isOpen ? `${c.accent}66` : T.border,
        ["--topic-open-border" as string]: `${c.accent}99`,
      }}
    >
      <div
        onClick={onToggle}
        className="topic-card-header"
      >
        <div className="topic-card-icon" style={{
          background: c.bg,
          color: c.fg,
          border: `1px solid ${c.accent}44`,
          boxShadow: isOpen ? `0 0 0 1px ${c.accent}22, 0 0 28px ${c.accent}18` : "none",
        }}>
          <card.Icon size={16} strokeWidth={1.8} />
        </div>

        <div className="topic-card-copy">
          <div className="topic-card-title">{card.title}</div>
          <div className="topic-card-desc">
            {card.desc}
          </div>
        </div>

        <div className="topic-card-badges">
          {card.badges.map((b, i) => <Badge key={i} label={b.label} color={b.color} />)}
        </div>

        <ChevronDown
          size={16}
          strokeWidth={1.8}
          style={{
            color: T.text3, flexShrink: 0, transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "none",
          }}
        />
      </div>

      {/* Body */}
      {isOpen && (
        <div
          className="slide-down topic-card-body"
        >
          {card.body(nav)}
        </div>
      )}
    </div>
  )
}
