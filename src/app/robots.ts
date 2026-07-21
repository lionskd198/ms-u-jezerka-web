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
