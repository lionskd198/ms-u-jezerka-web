/**
 * =============================================================================
 * SEO: sitemap.xml
 * =============================================================================
 *
 * Next.js z tohoto souboru automaticky vygeneruje /sitemap.xml — mapu webu
 * pro vyhledávače. Díky ní Google rychle najde všechny stránky včetně
 * jednotlivých aktualit.
 *
 * Statické stránky vyjmenujeme ručně, aktuality načteme z Payloadu
 * (jen publikované — o to se postará access control kolekce).
 */
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import config from '@/payload.config'

const ADRESA_WEBU = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Bez tohohle by se Next.js pokusil sitemap vygenerovat JEDNOU napevno
// při produkčním buildu (`npm run build`) — v ten moment ale databáze
// nemusí být (a na Zerops ani nebude) dostupná, což by build shodilo.
// `force-dynamic` zajistí, že se sitemap vytvoří vždy až při požadavku.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  // Hlavní stránky webu
  const statickeStranky: MetadataRoute.Sitemap = [
    { url: `${ADRESA_WEBU}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${ADRESA_WEBU}/aktuality`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${ADRESA_WEBU}/dokumenty`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${ADRESA_WEBU}/kontakty`, changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Všechny publikované aktuality
  const aktuality = await payload.find({
    collection: 'aktuality',
    limit: 500,
    sort: '-publishedAt',
  })

  const clanky: MetadataRoute.Sitemap = aktuality.docs.map((aktualita) => ({
    url: `${ADRESA_WEBU}/aktuality/${aktualita.slug}`,
    lastModified: aktualita.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...statickeStranky, ...clanky]
}
