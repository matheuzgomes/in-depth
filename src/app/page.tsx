import { hasGuide, loadGuide } from "@/data/guideRegistry"
import { PythonInDepth } from "@/components/shell/PythonInDepth"
import { firstQueryValue, normalizeTopicId, normalizeWhiteboardView } from "@/lib/whiteboardRoute"

export const metadata = {
  title: "Python in Depth",
  description: "From foundation to production. An interactive guide.",
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
