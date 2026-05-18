import { hasGuide, loadGuide } from "@/data/guideRegistry"
import { PythonInDepth } from "@/components/shell/PythonInDepth"
import { firstQueryValue, normalizeTopicId, normalizeWhiteboardView } from "@/lib/whiteboardRoute"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pynsights.vercel.app"

export const metadata = {
  title: "Pynsights — Advanced Python Interactive Guide",
  description:
    "Interactive Python education covering CPython internals, data structures, async, concurrency, and production patterns. Simulations, visual whiteboard diagrams, and benchmark-backed explanations for experienced Python developers.",
  openGraph: {
    title: "Pynsights — Advanced Python Interactive Guide",
    description:
      "Interactive Python education covering CPython internals, data structures, async, concurrency, and production patterns. Simulations, visual whiteboard diagrams, and benchmark-backed explanations for experienced Python developers.",
    url: baseUrl,
  },
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const initialTopicId = normalizeTopicId(firstQueryValue(resolvedSearchParams.topic))
  const initialView = normalizeWhiteboardView(firstQueryValue(resolvedSearchParams.view))
  const initialGuide =
    initialView === "guide" && hasGuide(initialTopicId)
      ? await loadGuide(initialTopicId)
      : null

  return (
    <>
      <section
        className="seo-home"
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "32px 24px 16px",
          color: "#9490a8",
          fontSize: 16,
          lineHeight: 1.7,
          fontFamily: "var(--font-ui), sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#e8e4f0",
            marginBottom: 12,
          }}
        >
          Pynsights &mdash; Advanced Python Interactive Guide
        </h1>
        <p style={{ margin: 0 }}>
          Interactive Python education covering CPython internals, data structures,
          async/await, the GIL, concurrency, memory models, bytecode, and production
          patterns. 27 topics with hand-drawn whiteboard diagrams, step-through
          simulations, real benchmark comparisons, and direct links to official
          Python documentation and CPython source code.
        </p>
        <p style={{ margin: "8px 0 0" }}>
          No accounts. No signup. Free and open source forever.
        </p>
      </section>
      <PythonInDepth
        initialTopicId={initialTopicId}
        initialView={initialView}
        initialGuide={initialGuide}
      />
    </>
  )
}
