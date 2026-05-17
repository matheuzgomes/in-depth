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
    <PythonInDepth
      initialTopicId={initialTopicId}
      initialView={initialView}
      initialGuide={initialGuide}
    />
  )
}
