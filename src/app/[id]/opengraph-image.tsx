import { ImageResponse } from "next/og"
import { ALL_TOPICS } from "@/data/topicIndex"
import { getWhiteboardTopic } from "@/data/whiteboard"

export const alt = "Pynsights — Advanced Python Interactive Guide"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export const dynamic = "force-static"

export function generateStaticParams() {
  return ALL_TOPICS.map((c) => ({ id: c.id }))
}

const KEY_TO_HEX: Record<string, string> = {
  purple: "#a89cf5",
  teal: "#5ec9a1",
  amber: "#f0b060",
  blue: "#9fb8ff",
  coral: "#d7a38a",
  green: "#97c985",
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const card = ALL_TOPICS.find((c) => c.id === resolvedParams.id)
  const topic = card ? getWhiteboardTopic(card.id) : undefined

  const accent = card ? KEY_TO_HEX[card.color] ?? "#a89cf5" : "#a89cf5"
  const title = card?.title ?? "Advanced Python"
  const desc = card?.desc ?? "Interactive Python education covering CPython internals, data structures, async, concurrency, and production patterns."

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#14131b",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* left accent bar */}
        <div
          style={{
            width: 24,
            height: "100%",
            background: accent,
          }}
        />
        {/* text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px 60px 60px",
            flex: 1,
            gap: 12,
          }}
        >
          {/* brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: accent,
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Pynsights
          </div>
          {/* section label + title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {topic?.sectionLabel && (
              <div
                style={{
                  color: "#9490a8",
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {topic.sectionLabel}
              </div>
            )}
            <div
              style={{
                color: "#e8e4f0",
                fontSize: 52,
                fontWeight: 700,
                lineHeight: 1.2,
                maxWidth: 720,
              }}
            >
              {title}
            </div>
          </div>
          {/* description */}
          <div
            style={{
              color: "#9490a8",
              fontSize: 26,
              lineHeight: 1.4,
              maxWidth: 700,
            }}
          >
            {desc}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
