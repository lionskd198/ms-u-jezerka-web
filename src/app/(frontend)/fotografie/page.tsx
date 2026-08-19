/**
 * =============================================================================
 * STRÁNKA: Fotografie ( /fotografie )
 * =============================================================================
 *
 * Výpis všech záznamů z kolekce Fotografie — odkazy na fotogalerie z akcí,
 * volitelně přiřazené ke třídě (pak se stejný záznam zobrazuje i na stránce
 * dané třídy). Bez přiřazené třídy je akce obecná, jen tady.
 */
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Fotografie',
}

export default async function FotografieStranka() {
  const payload = await getPayload({ config })

  const fotografie = await payload.find({
    collection: 'fotografie',
    sort: '-createdAt',
    limit: 100,
    depth: 1,
  })

  return (
    <main className="mx-auto w-full max-w-[900px] flex-1 px-7 pb-[90px] pt-14">
      <h1 className="mb-2 font-nadpisy text-4xl font-extrabold">Fotografie</h1>
      <p className="mb-9 text-base text-tlumena">Odkazy na fotogalerie z akcí školky a tříd.</p>

      {fotografie.docs.length === 0 ? (
        <p className="text-tlumena">Zatím tu nejsou žádné fotogalerie.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {fotografie.docs.map((polozka) => {
            const trida = typeof polozka.trida === 'object' ? polozka.trida : null
            return (
              <div
                key={polozka.id}
                className="rounded-karta border border-black/5 bg-panel p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              >
                {trida && (
                  <Link
                    href={`/tridy/${trida.slug}`}
                    className="mb-2.5 inline-block rounded-full bg-akcent2 px-2.5 py-0.5 text-[11px] font-bold text-primary-tmava hover:brightness-95"
                  >
                    {trida.nazev}
                  </Link>
                )}
                <div>
                  <a
                    href={polozka.odkaz}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-nadpisy text-[19px] font-bold text-primary hover:underline"
                  >
                    {polozka.nazevAkce}
                  </a>
                </div>
                {polozka.text && <p className="mt-1.5 text-sm text-tlumena">{polozka.text}</p>}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
