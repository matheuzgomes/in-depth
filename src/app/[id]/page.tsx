import { ALL_TOPICS } from "@/data/topicIndex"
import { hasGuide } from "@/data/guideRegistry"
import { buildWhiteboardHref } from "@/lib/whiteboardRoute"
import { notFound, redirect } from "next/navigation"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return ALL_TOPICS.map((c) => ({ id: c.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const card = ALL_TOPICS.find((c) => c.id === resolvedParams.id)
  
  if (!card) return {}
  
  return {
    title: `${card.title} | Python in Depth`,
    description: card.desc,
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const card = ALL_TOPICS.find((c) => c.id === resolvedParams.id)

  if (!card || !hasGuide(card.id)) {
    notFound()
  }

  redirect(buildWhiteboardHref(card.id, "guide"))
}
