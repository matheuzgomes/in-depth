"use client"

import { type ReactNode, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ALL_TOPICS } from "@/data/topicIndex"
import { NavContext } from "@/components/navigation/NavContext"
import { buildWhiteboardHref } from "@/lib/whiteboardRoute"

interface GuideNavProviderProps {
  children: ReactNode
}

export function GuideNavProvider({ children }: GuideNavProviderProps) {
  const router = useRouter()
  const allCards = useMemo(() => ALL_TOPICS, [])

  return (
    <NavContext.Provider
      value={{
        allCards,
        openCard: (id, view = "guide") => {
          const href = buildWhiteboardHref(id, view)
          router.prefetch(href)
          router.push(href)
        },
      }}
    >
      {children}
    </NavContext.Provider>
  )
}
