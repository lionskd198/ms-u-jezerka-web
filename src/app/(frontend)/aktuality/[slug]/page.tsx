/**
 * =============================================================================
 * STRÁNKA: Detail aktuality ( /aktuality/nazev-clanku )
 * =============================================================================
 *
 * Složka [slug] v hranatých závorkách je tzv. dynamický segment — Next.js
 * na tuto stránku pošle jakoukoli adresu /aktuality/COKOLI a hodnotu
 * "COKOLI" předá v `params.slug`. Podle ní najdeme článek v Payloadu.
 *
 * Rozvržení dle návrhu: tlačítko zpět, štítek, datum, velký nadpis, text.
 * Navíc (naše funkcionalita): úvodní obrázek a přílohy ke stažení.
 */
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import type { Aktualita } from '@/payload-types'
import config from '@/payload.config'

import { formatujDatum } from '../../komponenty/AktualitaKarta'
import { StitekTypu } from '../../komponenty/StitekTypu'

export const dynamic = 'force-dynamic'

/** Najde článek podle slugu (sdílí ho stránka i generateMetadata níže). */
const najdiAktualitu = async (slug: string) => {
  const payload = await getPayload({ config })
  const vysledek = await payload.find({
    collection: 'aktuality',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  return vysledek.docs[0]
}

/**
 * Z JSON obsahu editoru vytáhne čistý text prvních odstavců —
 * používá se jako SEO popisek (description) článku.
 */
const uvodniText = (obsah: Aktualita['obsah'], maxDelka = 160): string => {
  const texty: string[] = []
  const projdi = (uzel: unknown) => {
    if (!uzel || typeof uzel !== 'object') return
    const u = uzel as { text?: string; children?: unknown[] }
    if (typeof u.text === 'string') texty.push(u.text)
    u.children?.forEach(projdi)
  }
  projdi(obsah?.root)
  const cely = texty.join(' ').trim()
  return cely.length > maxDelka ? `${cely.slice(0, maxDelka - 1)}…` : cely
}

/**
 * SEO metadata pro konkrétní článek — Next.js tuto funkci zavolá při
 * každém požadavku a výsledek vloží do <head> (titulek, popis, OG tagy
 * pro hezký náhled při sdílení odkazu).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const aktualita = await najdiAktualitu(slug)
  if (!aktualita) return {}

  const popis = uvodniText(aktualita.obsah)
  const obrazek = typeof aktualita.uvodniObrazek === 'object' ? aktualita.uvodniObrazek : null

  return {
    title: aktualita.nazev,
    description: popis,
    alternates: { canonical: `/aktuality/${aktualita.slug}` },
    openGraph: {
      type: 'article',
      title: aktualita.nazev,
      description: popis,
      publishedTime: aktualita.publishedAt ?? undefined,
      ...(obrazek?.url && { images: [{ url: obrazek.sizes?.karta?.url ?? obrazek.url }] }),
    },
  }
}

export default async function DetailAktuality({
  params,
}: {
  // Stejně jako searchParams jsou i params v Next.js 15+ Promise.
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Najdeme článek podle slugu (depth: 2 rozbalí i obrázek a přílohy).
  const aktualita = await najdiAktualitu(slug)

  // Když článek neexistuje, zobrazíme standardní 404 stránku Next.js.
  if (!aktualita) {
    notFound()
  }

  const obrazek = typeof aktualita.uvodniObrazek === 'object' ? aktualita.uvodniObrazek : null

  return (
    <main className="mx-auto w-full max-w-[900px] flex-1 px-7 pb-[90px] pt-14">
      <Link
        href="/aktuality"
        className="mb-6 inline-block text-[15px] font-bold text-primary hover:underline"
      >
        ← Zpět na aktuality
      </Link>

      {/* ===== Hlavička článku ===== */}
      <div className="mb-3.5">
        <StitekTypu typ={aktualita.typ} velky />
      </div>
      <div className="mb-2.5 text-sm font-semibold text-tlumena">
        zveřejněno {formatujDatum(aktualita.publishedAt)}
      </div>
      <h1 className="mb-6 font-nadpisy text-[clamp(28px,4vw,38px)] font-extrabold leading-[1.2]">
        {aktualita.nazev}
      </h1>

      {/* U akcí zvýrazníme datum a čas konání */}
      {aktualita.typ === 'akce' && aktualita.datumAkce && (
        <p className="mb-6 inline-block rounded-karta bg-akcent2 px-4 py-2 font-bold text-primary-tmava">
          📅 Koná se{' '}
          {new Date(aktualita.datumAkce).toLocaleString('cs-CZ', {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </p>
      )}

      {/* ===== Úvodní obrázek (pokud je nahraný) ===== */}
      {obrazek?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={obrazek.sizes?.velky?.url ?? obrazek.url}
          alt={obrazek.alt}
          className="mb-6 w-full rounded-karta"
        />
      )}

      {/* ===== Obsah článku (rich text z editoru) ===== */}
      <div className="obsah-clanku">
        <RichText data={aktualita.obsah} />
      </div>

      {/* ===== Přílohy (dokumenty ke stažení) ===== */}
      {aktualita.prilohy && aktualita.prilohy.length > 0 && (
        <section className="mt-8 rounded-karta border border-black/5 bg-panel p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <h2 className="mb-3.5 font-nadpisy text-[19px] font-bold text-primary">
            Přílohy ke stažení
          </h2>
          <ul className="space-y-2.5">
            {aktualita.prilohy.map((priloha) =>
              // Vztahy mohou být jen ID (číslo), pokud nejsou rozbalené —
              // ty přeskočíme (s depth: 2 by měly být vždy objekty).
              typeof priloha === 'object' ? (
                <li key={priloha.id}>
                  <a
                    href={priloha.url ?? '#'}
                    className="font-bold text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {priloha.nazev} — Stáhnout ↓
                  </a>
                  {priloha.popis && <p className="text-sm text-tlumena">{priloha.popis}</p>}
                </li>
              ) : null,
            )}
          </ul>
        </section>
      )}
    </main>
  )
}
