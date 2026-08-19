/**
 * =============================================================================
 * STRÁNKA: Detail třídy ( /tridy/nazev-tridy )
 * =============================================================================
 *
 * Logo, název, věková skupina, učitelky, delší text a odkazy na fotogalerie
 * z akcí třídy — ty se načítají zvlášť z kolekce Fotografie (záznamy
 * přiřazené k téhle třídě), ne z pole na Trida.
 */
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'

const najdiTridu = async (slug: string) => {
  const payload = await getPayload({ config })
  const vysledek = await payload.find({
    collection: 'tridy',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  return vysledek.docs[0]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const trida = await najdiTridu(slug)
  if (!trida) return {}

  return {
    title: trida.nazev,
    description: trida.popis ?? undefined,
    alternates: { canonical: `/tridy/${trida.slug}` },
  }
}

export default async function DetailTridy({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const trida = await najdiTridu(slug)

  if (!trida) {
    notFound()
  }

  const logo = typeof trida.logo === 'object' ? trida.logo : null

  const payload = await getPayload({ config })
  const fotografie = await payload.find({
    collection: 'fotografie',
    where: { trida: { equals: trida.id } },
    sort: '-createdAt',
    limit: 50,
  })

  return (
    <main className="mx-auto w-full max-w-[900px] flex-1 px-7 pb-[90px] pt-14">
      <Link
        href="/tridy"
        className="mb-6 inline-block text-[15px] font-bold text-primary hover:underline"
      >
        ← Zpět na třídy
      </Link>

      {/* ===== Hlavička třídy ===== */}
      <div className="mb-6 flex flex-wrap items-center gap-5">
        {logo?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.sizes?.karta?.url ?? logo.url}
            alt={logo.alt}
            className="h-28 w-auto max-w-[220px] rounded-karta object-contain"
          />
        ) : (
          <span aria-hidden className="block h-28 w-28 shrink-0 rounded-karta bg-akcent2" />
        )}
        <div>
          <h1 className="font-nadpisy text-[clamp(28px,4vw,38px)] font-extrabold leading-[1.2]">
            {trida.nazev}
          </h1>
          {trida.vek && <div className="mt-1 text-sm font-semibold text-tlumena">{trida.vek}</div>}
        </div>
      </div>

      {trida.ucitelky && trida.ucitelky.length > 0 && (
        <p className="mb-6 text-[15px]">
          <span className="font-bold">Učitelky:</span>{' '}
          {trida.ucitelky.map((u) => u.jmeno).join(', ')}
        </p>
      )}

      {trida.popis && <p className="mb-6 text-base text-tlumena">{trida.popis}</p>}

      {/* ===== Obsah třídy (rich text z editoru) ===== */}
      {trida.obsah && (
        <div className="obsah-clanku">
          <RichText data={trida.obsah} />
        </div>
      )}

      {/* ===== Fotogalerie z akcí (z kolekce Fotografie, název akce + odkaz) ===== */}
      {fotografie.docs.length > 0 && (
        <section className="mt-8 rounded-karta border border-black/5 bg-panel p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <h2 className="mb-3.5 font-nadpisy text-[19px] font-bold text-primary">
            Fotogalerie z akcí
          </h2>
          <ul className="space-y-2.5">
            {fotografie.docs.map((polozka) => (
              <li key={polozka.id}>
                <a
                  href={polozka.odkaz}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:underline"
                >
                  {polozka.nazevAkce}
                </a>
                {polozka.text && <p className="text-sm text-tlumena">{polozka.text}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
