"use client"

import { createContext, useContext } from "react"
import type { NavContextValue } from "@/types"

export const NavContext = createContext<NavContextValue | null>(null)

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error("useNav must be used within NavContext.Provider")
  return ctx
}
