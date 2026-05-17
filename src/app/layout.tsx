import type { Metadata } from "next"
import { Caveat, Inter, JetBrains_Mono, Patrick_Hand, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pynsights.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: "%s | Pynsights",
    default: "Pynsights — Advanced Python Interactive Guide",
  },
  description:
    "Interactive Python education covering CPython internals, data structures, async, concurrency, and production patterns. Simulations, visual whiteboard diagrams, and benchmark-backed explanations for experienced Python developers.",
  keywords: [
    "advanced python",
    "python internals",
    "cpython",
    "python education",
    "python data structures",
    "python async",
    "python concurrency",
    "python performance",
    "python whiteboard",
    "interactive python guide",
    "learn advanced python",
  ],
  openGraph: {
    title: "Pynsights — Advanced Python Interactive Guide",
    description:
      "Interactive Python education covering CPython internals, data structures, async, concurrency, and production patterns. Simulations, visual whiteboard diagrams, and benchmark-backed explanations for experienced Python developers.",
    url: baseUrl,
    siteName: "Pynsights",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pynsights",
    description:
      "Interactive Python education covering CPython internals, data structures, async, concurrency, and production patterns.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pynsights",
    url: baseUrl,
    description:
      "Interactive Python education covering CPython internals, data structures, async, concurrency, and production patterns.",
    inLanguage: "en-US",
  }

  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} ${caveat.variable} ${patrickHand.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
