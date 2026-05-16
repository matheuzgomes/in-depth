import type { Metadata } from "next"
import { Caveat, Inter, JetBrains_Mono, Patrick_Hand, Playfair_Display } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
})

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-board-display",
  weight: ["500", "600", "700"],
})

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-board-body",
  weight: "400",
})

export const metadata: Metadata = {
  title: {
    template: "%s | teachboard",
    default: "teachboard",
  },
  description: "From foundation to production",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} ${caveat.variable} ${patrickHand.variable}`}>
      <body>{children}</body>
    </html>
  )
}
