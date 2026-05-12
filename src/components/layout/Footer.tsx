"use client"

import { T } from "@/lib/tokens"

interface FooterProps {
  visibleCount: number
}

export function Footer({ visibleCount }: FooterProps) {
  return (
    <div className="site-footer" style={{ borderTop: `1px solid ${T.border}` }}>
      <span>{visibleCount} topic{visibleCount !== 1 ? "s" : ""} visible</span>
      <span>Python in depth · dark editorial runtime</span>
    </div>
  )
}
