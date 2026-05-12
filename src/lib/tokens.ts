import type { ColorKey, ColorToken } from "@/types"

// ── Design token object (mirrors the CSS variables) ───────────────────────────
interface TokenMap {
  bg0: string; bg1: string; bg2: string; bg3: string; bg4: string
  article: string; articleAlt: string; code: string
  border: string; borderHi: string; borderGlow: string
  text1: string; text2: string; text3: string; text4: string
  purple: ColorToken; teal: ColorToken; amber: ColorToken
  blue: ColorToken; coral: ColorToken; green: ColorToken
}

export const T = {
  bg0: "#0a0a0d",
  bg1: "#14131b",
  bg2: "#1a1820",
  bg3: "#1c1b24",
  bg4: "#22212e",
  article: "#1c1b24",
  articleAlt: "#22212e",
  code: "#17161d",
  border: "rgba(168, 156, 245, 0.12)",
  borderHi: "rgba(232, 224, 208, 0.2)",
  borderGlow: "rgba(168, 156, 245, 0.16)",
  text1: "#e8e4f0",
  text2: "#9490a8",
  text3: "#5e5c6e",
  text4: "#4a4860",
  purple: { bg: "rgba(168, 156, 245, 0.12)", fg: "#a89cf5", accent: "#a89cf5" },
  teal:   { bg: "rgba(94, 201, 161, 0.12)", fg: "#5ec9a1", accent: "#5ec9a1" },
  amber:  { bg: "rgba(240, 176, 96, 0.12)", fg: "#f0b060", accent: "#f0b060" },
  blue:   { bg: "rgba(132, 160, 220, 0.12)", fg: "#9fb8ff", accent: "#9fb8ff" },
  coral:  { bg: "rgba(208, 127, 96, 0.12)", fg: "#d7a38a", accent: "#d7a38a" },
  green:  { bg: "rgba(139, 191, 124, 0.12)", fg: "#97c985", accent: "#97c985" },
} satisfies TokenMap

/** Returns the color token for a given key, defaulting to purple */
export function colorOf(key: ColorKey | undefined): ColorToken {
  return T[key ?? "purple"] as ColorToken
}
