"use client"

import { createContext, useContext } from "react"

interface BookSceneNavContextValue {
  navigate: (href: string) => void
}

export const BookSceneNavContext = createContext<BookSceneNavContextValue | null>(null)

export function useBookSceneNav() {
  return useContext(BookSceneNavContext)
}
