"use client"

interface HeaderProps {
  visibleCount: number
  totalCount: number
}

export function Header({ visibleCount, totalCount }: HeaderProps) {
  return (
    <div>
      <h1 className="brand-title">
        Python <span className="accent">in</span> depth
      </h1>

      <p className="brand-copy">
        Production Python explained like an engineered system: language model, runtime behavior, data structures, async flow, and failure boundaries.
      </p>

      <div className="brand-meta-grid">
        <div className="brand-meta-card">
          <div className="brand-meta-label">Coverage</div>
          <div className="brand-meta-value">
            <strong>{visibleCount}</strong> visible topics across <strong>{totalCount}</strong> deep references
          </div>
        </div>
      </div>
    </div>
  )
}
