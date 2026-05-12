"use client"

import { type CSSProperties, type ReactNode, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PrefetchLinkProps {
  href: string
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function PrefetchLink({ href, children, className, style }: PrefetchLinkProps) {
  const router = useRouter()

  const prefetch = useCallback(() => {
    router.prefetch(href)
  }, [href, router])

  useEffect(() => {
    prefetch()
  }, [prefetch])

  return (
    <Link
      href={href}
      prefetch
      className={className}
      style={style}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
    >
      {children}
    </Link>
  )
}
