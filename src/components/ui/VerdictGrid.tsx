"use client"

import type { VerdictGridProps } from "@/types"
import { T } from "@/lib/tokens"

export function VerdictGrid({ items }: VerdictGridProps) {
  return (
    <div className="book-verdict-grid">
      {items.map((item, i) => (
        <div key={i} className="book-verdict-item">
          <div className="book-verdict-name">{item.name}</div>
          <div className="book-verdict-value" style={{ color: item.good ? T.teal.fg : T.coral.fg }}>
            {item.value}
          </div>
          <div className="book-verdict-sub">{item.sub}</div>
        </div>
      ))}
    </div>
  )
}
