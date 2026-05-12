"use client"

import type { SLabelProps } from "@/types"

export function SLabel({ children, style = {} }: SLabelProps) {
  return (
    <div className="section-heading" style={style}>
      <span>{children}</span>
    </div>
  )
}
