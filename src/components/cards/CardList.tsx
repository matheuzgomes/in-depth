"use client"

import type { Section, NavContextValue } from "@/types"
import { T } from "@/lib/tokens"
import { SLabel } from "@/components/ui/SLabel"
import { CardItem } from "@/components/cards/CardItem"

interface CardListProps {
  sections: Section[]
  visibleIds: string[]
  openCards: Set<string>
  query: string
  nav: NavContextValue
  onToggle: (id: string) => void
  onRef: (id: string, el: HTMLDivElement | null) => void
}

export function CardList({
  sections, visibleIds, openCards, query, nav, onToggle, onRef,
}: CardListProps) {
  const visibleSections = sections.filter(s =>
    s.cards.some(c => visibleIds.includes(c.id))
  )

  if (visibleSections.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0", color: T.text3, fontSize: 14 }}>
        No topics match &ldquo;{query}&rdquo;
      </div>
    )
  }

  return (
    <>
      {visibleSections.map(section => (
        <section key={section.id} className="fade-in section-block">
          <SLabel>{section.label}</SLabel>
          {section.cards
            .filter(c => visibleIds.includes(c.id))
            .map(card => (
              <CardItem
                key={card.id}
                card={card}
                isOpen={openCards.has(card.id)}
                nav={nav}
                onToggle={() => onToggle(card.id)}
                onRef={el => onRef(card.id, el)}
              />
            ))}
        </section>
      ))}
    </>
  )
}
