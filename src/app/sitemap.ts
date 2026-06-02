import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = 'https://algora.dev';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages for both locales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/ar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/en/problems`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ar/problems`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/ar/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/en/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/ar/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic problem pages from DB
  let problemPages: MetadataRoute.Sitemap = [];
  try {
    const problems = await db.problem.findMany({
      where: { isPublished: true },
      select: { id: true, slug: true, updatedAt: true },
      orderBy: { orderIndex: 'asc' },
    });

    problemPages = problems.flatMap((p) => [
      {
        url: `${BASE_URL}/en/problems/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/ar/problems/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
    ]);
  } catch {
    // DB might not be available during build; skip problem pages
  }

  return [...staticPages, ...problemPages];
}
