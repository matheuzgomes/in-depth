import { ALL_TOPICS } from "@/data/topicIndex"
import { hasGuide, loadGuide } from "@/data/guideRegistry"
import { PythonInDepth } from "@/components/shell/PythonInDepth"
import { getWhiteboardTopic } from "@/data/whiteboard"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export const dynamic = "force-static"
export const dynamicParams = false

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pynsights.vercel.app"

export function generateStaticParams() {
  return ALL_TOPICS.map((c) => ({ id: c.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const card = ALL_TOPICS.find((c) => c.id === resolvedParams.id)
  if (!card) return {}

  const topic = getWhiteboardTopic(card.id)
  const sectionLabel = topic?.sectionLabel ?? ""

  return {
    title: `${card.title} | Pynsights`,
    description: card.desc,
    openGraph: {
      title: `${card.title} | Pynsights`,
      description: card.desc,
      url: `/${card.id}`,
      type: "article",
      tags: [sectionLabel, ...card.cats].filter(Boolean),
    },
    twitter: {
      title: `${card.title} | Pynsights`,
      description: card.desc,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const card = ALL_TOPICS.find((c) => c.id === resolvedParams.id)

  if (!card || !hasGuide(card.id)) {
    notFound()
  }

  const guide = await loadGuide(card.id)
  const topic = getWhiteboardTopic(card.id)

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${card.title} | Pynsights`,
    description: card.desc,
    url: `${baseUrl}/${card.id}`,
    proficiencyLevel: "Advanced",
    educationalLevel: "Advanced",
    about: {
      "@type": "Thing",
      name: "Python",
    },
    ...(topic?.sectionLabel ? { articleSection: topic.sectionLabel } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <PythonInDepth
        initialTopicId={card.id}
        initialView="guide"
        initialGuide={guide}
      />
    </>
  )
}
