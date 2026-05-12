import { GuideReaderPage } from "@/components/guide/GuideReaderPage"
import type { TopicCardData } from "@/types"

type SerializableGuideCard = Pick<TopicCardData, "id" | "title" | "desc" | "color" | "badges" | "cats" | "kw">

interface GuidePageProps {
  card: TopicCardData
  allCards: TopicCardData[]
  initialGuide: React.ReactNode
}

export function GuidePage({ card, allCards, initialGuide }: GuidePageProps) {
  const serializableCard: SerializableGuideCard = {
    id: card.id,
    title: card.title,
    desc: card.desc,
    color: card.color,
    badges: card.badges,
    cats: card.cats,
    kw: card.kw,
  }

  const serializableCards: SerializableGuideCard[] = allCards.map((entry) => ({
    id: entry.id,
    title: entry.title,
    desc: entry.desc,
    color: entry.color,
    badges: entry.badges,
    cats: entry.cats,
    kw: entry.kw,
  }))

  return <GuideReaderPage card={serializableCard} allCards={serializableCards} guide={initialGuide} />
}
