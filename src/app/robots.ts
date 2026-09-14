/**
 * =============================================================================
 * SEO: robots.txt
 * =============================================================================
 *
 * Next.js z tohoto souboru automaticky vygeneruje /robots.txt — instrukce
 * pro vyhledávače (Google, Seznam…), co smí a nesmí procházet.
 *
 * Administraci a API vyhledávačům zakazujeme — nemají tam co dělat
 * a nechceme, aby se /admin objevoval ve výsledcích vyhledávání.
 */
import type { MetadataRoute } from 'next'

const ADRESA_WEBU = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Bez tohohle by Next.js vygeneroval robots.txt JEDNOU napevno při
// produkčním buildu — v ten moment ale NEXT_PUBLIC_SERVER_URL ještě není
// k dispozici (proměnné z Zerops GUI se propíšou až za běhu, ne během
// buildu), takže by se do souboru natrvalo zapsalo chybné "localhost:3000".
// `force-dynamic` (stejně jako u sitemap.ts) zajistí čerstvé vyhodnocení
// při každém požadavku, až je proměnná správně dostupná.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${ADRESA_WEBU}/sitemap.xml`,
  }
}
