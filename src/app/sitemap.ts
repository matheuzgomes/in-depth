import { ALL_TOPICS } from "@/data/topicIndex"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pynsights.vercel.app"

export default function sitemap() {
  const topicEntries = ALL_TOPICS.map((topic) => ({
    url: `${baseUrl}/${topic.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...topicEntries,
  ]
}
