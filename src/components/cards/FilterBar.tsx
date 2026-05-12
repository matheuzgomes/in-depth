"use client"

import { Search, X } from "lucide-react"
import type { FilterItem } from "@/types"
import { T } from "@/lib/tokens"

interface FilterBarProps {
  filters: FilterItem[]
  active: string
  query: string
  visibleCount: number
  totalCount: number
  onChange: (id: string) => void
  onQueryChange: (q: string) => void
}

export function FilterBar({
  filters, active, query, visibleCount, totalCount, onChange, onQueryChange,
}: FilterBarProps) {
  return (
    <div className="filter-surface">
      <div className="filter-search">
        <Search size={14} color={T.text3} strokeWidth={2} />
        <input
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search topics, patterns, functions…"
          style={{
            border: "none", background: "transparent", outline: "none",
            flex: 1, fontSize: 13.5, color: T.text1, fontFamily: "var(--font-ui)",
          }}
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: T.text3, display: "flex", padding: 0 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="filter-chip-row">
        {filters.map(f => {
          const isActive = active === f.id
          return (
            <button
              key={f.id}
              onClick={() => onChange(f.id)}
              className={`filter-chip${isActive ? " active" : ""}`}
              style={{
                fontSize: 12, cursor: "pointer",
                fontFamily: "var(--font-ui)", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <f.Icon size={12} strokeWidth={2} />
              {f.label}
            </button>
          )
        })}
      </div>

      <div className="filter-summary">
        <span>{visibleCount} topic{visibleCount !== 1 ? "s" : ""} visible</span>
        <span>{totalCount} total topics in the archive</span>
      </div>
    </div>
  )
}
