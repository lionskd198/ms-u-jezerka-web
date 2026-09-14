/**
 * =============================================================================
 * STRÁNKA: Aktuality ( /aktuality )
 * =============================================================================
 *
 * Výpis všech publikovaných článků dle návrhu (řádkové karty: datum vlevo,
 * štítek + titulek vpravo) — doplněný o FILTR podle typu.
 *
 * Filtr funguje přes URL parametr: /aktuality?typ=akce
 * Server komponenta dostane parametry v `searchParams`, přidá podmínku
 * do dotazu na Payload a vykreslí jen odpovídající články. Tlačítka filtru
 * jsou obyčejné odkazy — žádný JavaScript v prohlížeči není potřeba.
 */
import Link from 'next/link'
import { getPayload, type Where } from 'payload'
import React from 'react'

import { TYPY_AKTUALIT, verejnyDotazAktuality } from '@/collections/Aktuality'
import config from '@/payload.config'

import { formatujDatum } from '../komponenty/AktualitaKarta'
import { StitekTypu } from '../komponenty/StitekTypu'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Aktuality',
}

export default async function AktualityStranka({
  searchParams,
}: {
  // V Next.js 15+ jsou searchParams Promise — musí se awaitovat.
  searchParams: Promise<{ typ?: string }>
}) {
  const { typ } = await searchParams
  const payload = await getPayload({ config })

  // Podmínka dotazu (typ Where = "query" objekt Payloadu) — vždy jen
  // veřejně viditelné aktuality, případně navíc zúžené podle typu z URL.
  const jePlatnyTyp = TYPY_AKTUALIT.some((t) => t.value === typ)
  const where: Where = jePlatnyTyp
    ? { and: [verejnyDotazAktuality(), { typ: { equals: typ } }] }
    : verejnyDotazAktuality()

  const aktuality = await payload.find({
    collection: 'aktuality',
    where,
    sort: '-publishedAt',
    limit: 50,
  })

  return (
    <main className="mx-auto w-full max-w-[900px] flex-1 px-7 pb-[90px] pt-14">
      <h1 className="mb-2 font-nadpisy text-4xl font-extrabold">Aktuality</h1>
      <p className="mb-6 text-base text-tlumena">Novinky a důležité informace ze školky.</p>

      {/* ===== Filtr podle typu (pill tlačítka v barvách návrhu) ===== */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/aktuality"
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            !jePlatnyTyp
              ? 'bg-primary text-white'
              : 'border border-black/10 bg-panel text-tlumena hover:border-primary hover:text-primary'
          }`}
        >
          Vše
        </Link>
        {TYPY_AKTUALIT.map((polozka) => (
          <Link
            key={polozka.value}
            href={`/aktuality?typ=${polozka.value}`}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              typ === polozka.value
                ? 'bg-primary text-white'
                : 'border border-black/10 bg-panel text-tlumena hover:border-primary hover:text-primary'
            }`}
          >
            {polozka.label}
          </Link>
        ))}
      </div>

      {/* ===== Výpis článků (řádkové karty dle návrhu) ===== */}
      {aktuality.docs.length === 0 ? (
        <p className="text-tlumena">Žádné aktuality k zobrazení.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {aktuality.docs.map((aktualita) => (
            <Link
              key={aktualita.id}
              href={`/aktuality/${aktualita.slug}`}
              className="flex flex-wrap items-start gap-5 rounded-karta border border-black/5 bg-panel p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_26px_rgba(0,0,0,0.1)]"
            >
              {/* Datum vlevo — u akcí datum konání, jinak datum zveřejnění */}
              <div className="min-w-[110px] text-[13px] font-bold text-tlumena">
                {aktualita.typ === 'akce' && aktualita.datumAkce
                  ? formatujDatum(aktualita.datumAkce)
                  : formatujDatum(aktualita.publishedAt)}
              </div>
              <div className="min-w-[200px] flex-1">
                <div className="mb-2.5">
                  <StitekTypu typ={aktualita.typ} />
                </div>
                <div className="font-nadpisy text-[19px] font-bold leading-[1.35]">
                  {aktualita.nazev}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
