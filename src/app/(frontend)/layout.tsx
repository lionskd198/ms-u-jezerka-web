/**
 * =============================================================================
 * LAYOUT VEŘEJNÉHO WEBU
 * =============================================================================
 *
 * Next.js App Router: `layout.tsx` obaluje všechny stránky ve stejné složce —
 * tady celou skupinu (frontend). Složky v závorkách, tzv. "route groups",
 * se v URL adrese neobjevují; slouží jen k oddělení veřejného webu od
 * administrace, která žije ve skupině (payload).
 *
 * Layout vykreslí hlavičku s navigací a patičku; `children` je obsah
 * konkrétní stránky. Patička si přes Payload Local API načte kontakty.
 */
import type { Metadata } from 'next'
// next/font stáhne Google Fonts při buildu a servíruje je z vlastního webu —
// rychlejší a bez závislosti na Googlu za provozu. Každý font vystavíme
// jako CSS proměnnou, na kterou se odkazují design tokeny ve styles.css.
import { Baloo_2, Nunito } from 'next/font/google'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

/** Veřejná adresa webu (pro SEO tagy) — z .env, na produkci skutečná doména. */
const ADRESA_WEBU = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Font nadpisů (dle návrhu: Baloo 2)
const pismoNadpisy = Baloo_2({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800'],
  variable: '--pismo-nadpisy',
})

// Font běžného textu (dle návrhu: Nunito)
const pismoText = Nunito({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700', '800'],
  variable: '--pismo-text',
})

/**
 * SEO metadata celého webu. Next.js z nich generuje <meta> tagy v hlavičce;
 * jednotlivé stránky je dědí a mohou přepsat (viz detail aktuality).
 */
export const metadata: Metadata = {
  // Základ pro absolutní URL v OG tazích a canonical odkazech.
  metadataBase: new URL(ADRESA_WEBU),
  title: {
    default: 'MŠ U Jezérka Ratíškovice',
    template: '%s | MŠ U Jezérka Ratíškovice',
  },
  description:
    'Mateřská škola U Jezérka Ratíškovice — aktuality, dokumenty ke stažení a kontakty.',
  // Open Graph — náhled při sdílení odkazu (Facebook, Messenger, WhatsApp…)
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'MŠ U Jezérka Ratíškovice',
    title: 'MŠ U Jezérka Ratíškovice',
    description:
      'Mateřská škola U Jezérka Ratíškovice — aktuality, dokumenty ke stažení a kontakty.',
  },
  // Vyhledávače smí web indexovat (administraci blokuje robots.txt).
  robots: {
    index: true,
    follow: true,
  },
}

/** Položky hlavní navigace — stačí upravit tady a změní se všude. */
const NAVIGACE = [
  { nazev: 'Úvod', cesta: '/' },
  { nazev: 'Aktuality', cesta: '/aktuality' },
  { nazev: 'Dokumenty', cesta: '/dokumenty' },
  { nazev: 'Třídy', cesta: '/tridy' },
  { nazev: 'Kontakty', cesta: '/kontakty' },
]

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  // Local API: data z Payloadu čteme přímo (žádné HTTP volání) —
  // tohle je největší výhoda toho, že Payload běží uvnitř Next.js.
  const payload = await getPayload({ config })
  const kontakty = await payload.findGlobal({ slug: 'kontakty' })

  /**
   * Strukturovaná data (JSON-LD) — strojově čitelný popis školky pro
   * vyhledávače. Google díky nim může zobrazit adresu, telefon apod.
   * přímo ve výsledcích vyhledávání.
   */
  const strukturovanaData = {
    '@context': 'https://schema.org',
    '@type': 'Preschool',
    name: kontakty.nazevSkoly,
    url: ADRESA_WEBU,
    ...(kontakty.email && { email: kontakty.email }),
    ...(kontakty.telefony?.[0] && { telephone: kontakty.telefony[0].cislo }),
    ...(kontakty.adresa && {
      address: { '@type': 'PostalAddress', streetAddress: kontakty.adresa },
    }),
  }

  return (
    <html lang="cs" className={`${pismoNadpisy.variable} ${pismoText.variable}`}>
      <body className="flex min-h-screen flex-col bg-pozadi font-telo text-inkoust">
        {/* Strukturovaná data pro vyhledávače (viz komentář výše) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturovanaData) }}
        />
        {/* ===== Hlavička s navigací (sticky = drží se nahoře při scrollu) ===== */}
        <header className="sticky top-0 z-20 bg-primary shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 px-7 py-3.5">
            <Link href="/" className="flex items-center gap-3">
              {/* Logo dle návrhu: barevný kruh + název školky */}
              <span aria-hidden className="h-[38px] w-[38px] shrink-0 rounded-full bg-akcent2" />
              <span className="font-nadpisy text-[22px] font-bold tracking-[0.2px] text-white">
                MŠ U Jezérka
              </span>
            </Link>
            <nav className="flex flex-wrap gap-1.5">
              {NAVIGACE.map((polozka) => (
                <Link
                  key={polozka.cesta}
                  href={polozka.cesta}
                  className="rounded-karta px-4 py-2.5 text-base font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {polozka.nazev}
                </Link>
              ))}
              {/* Jídelníček — externí odkaz, zobrazí se jen když je v Kontaktech vyplněný */}
              {kontakty.odkazNaJidelnicek && (
                <a
                  href={kontakty.odkazNaJidelnicek}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-karta px-4 py-2.5 text-base font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                >
                  Jídelníček
                </a>
              )}
            </nav>
          </div>
        </header>

        {/* ===== Obsah konkrétní stránky ===== */}
        <div className="flex flex-1 flex-col">{children}</div>

        {/*
          ===== Patička (jeden řádek dle návrhu, data z Payloadu) =====
          Web používá jen nezbytnou cookie pro přihlášení do administrace,
          proto nepotřebuje cookie lištu. Kdyby se někdy přidala analytika
          nebo jiné nepovinné cookies, lišta se souhlasem bude nutná (GDPR)!
        */}
        <footer className="bg-primary-tmava px-7 py-8 text-center text-sm text-white/75">
          {kontakty.nazevSkoly}
          {kontakty.adresa && <> · {kontakty.adresa.replace(/\n/g, ', ')}</>}
          {kontakty.email && <> · {kontakty.email}</>}
        </footer>
      </body>
    </html>
  )
}
