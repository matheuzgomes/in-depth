import { WhiteboardExperience } from "@/components/whiteboard/WhiteboardExperience"
import type { WhiteboardView } from "@/lib/whiteboardRoute"

interface PythonInDepthProps {
  initialTopicId: string
  initialView: WhiteboardView
  initialGuide: React.ReactNode | null
}

export function PythonInDepth({ initialTopicId, initialView, initialGuide }: PythonInDepthProps) {
  return (
    <WhiteboardExperience
      initialTopicId={initialTopicId}
      initialView={initialView}
      initialGuide={initialGuide}
    />
  )
}
