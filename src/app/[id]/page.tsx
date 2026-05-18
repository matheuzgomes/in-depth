import { ALL_TOPICS } from "@/data/topicIndex"
import { hasGuide, loadGuide } from "@/data/guideRegistry"
import { PythonInDepth } from "@/components/shell/PythonInDepth"
import { getWhiteboardTopic } from "@/data/whiteboard"
import { TOPIC_SUMMARIES } from "@/data/topicSummaries"
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

  const broadKeywords = [
    "advanced python",
    "python internals",
    "python education",
    "cpython",
    "learn python",
  ]

  const perTopicKeywords = [
    ...(card.kw ? card.kw.split(" ") : []),
    ...card.cats,
    sectionLabel,
    "python tutorial",
    "python guide",
  ].filter(Boolean)

  return {
    title: `${card.title} | Pynsights`,
    description: card.desc,
    keywords: [...broadKeywords, ...perTopicKeywords],
    alternates: {
      canonical: `${baseUrl}/${card.id}`,
    },
    openGraph: {
      title: `${card.title} | Pynsights`,
      description: card.desc,
      url: `/${card.id}`,
      type: "article",
      tags: [sectionLabel, ...card.cats, ...broadKeywords].filter(Boolean),
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

  const breadcrumbJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Pynsights",
        item: baseUrl,
      },
    ],
  }

  if (topic?.sectionLabel) {
    ;(breadcrumbJsonLd.itemListElement as Array<Record<string, unknown>>).push({
      "@type": "ListItem",
      position: 2,
      name: topic.sectionLabel,
    })
    ;(breadcrumbJsonLd.itemListElement as Array<Record<string, unknown>>).push({
      "@type": "ListItem",
      position: 3,
      name: card.title,
      item: `${baseUrl}/${card.id}`,
    })
  } else {
    ;(breadcrumbJsonLd.itemListElement as Array<Record<string, unknown>>).push({
      "@type": "ListItem",
      position: 2,
      name: card.title,
      item: `${baseUrl}/${card.id}`,
    })
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {TOPIC_SUMMARIES[card.id] && (
        <section
          className="seo-content"
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
            {card.title}
          </h1>
          <p style={{ margin: 0 }}>{card.desc}</p>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {TOPIC_SUMMARIES[card.id].split("\n").filter(Boolean).map((paragraph, i) => (
              <p key={i} style={{ margin: 0 }}>
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}
      <PythonInDepth
        initialTopicId={card.id}
        initialView="guide"
        initialGuide={guide}
      />
    </>
  )
}
