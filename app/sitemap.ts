import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://etupedia.com'

  // Popular/featured articles to include in sitemap for better SEO
  const popularArticles = [
    'Artificial_intelligence',
    'Machine_learning',
    'Quantum_computing',
    'Climate_change',
    'Renewable_energy',
    'Neuroscience',
    'Psychology',
    'Philosophy',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer_science',
    'History',
    'Economics',
    'Sociology',
    'Literature',
    'Art',
    'Music',
    'Medicine',
  ]

  const articles = popularArticles.map((article) => ({
    url: `${baseUrl}/article/${article}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...articles,
  ]
}
