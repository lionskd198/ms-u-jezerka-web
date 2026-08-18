/**
 * =============================================================================
 * STRÁNKA: Třídy ( /tridy )
 * =============================================================================
 *
 * Výpis všech tříd školky jako karty (logo, název, věk, krátký popis) —
 * kliknutím se přejde na vlastní stránku třídy.
 */
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

import { TridaKarta } from '../komponenty/TridaKarta'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Třídy',
}

export default async function TridyStranka() {
  const payload = await getPayload({ config })

  const tridy = await payload.find({
    collection: 'tridy',
    sort: 'nazev',
    limit: 100,
    depth: 1,
  })

  return (
    <main className="mx-auto w-full max-w-[1000px] flex-1 px-7 pb-[90px] pt-14">
      <h1 className="mb-2 font-nadpisy text-4xl font-extrabold">Třídy</h1>
      <p className="mb-9 text-base text-tlumena">Naše třídy a jejich učitelky.</p>

      {tridy.docs.length === 0 ? (
        <p className="text-tlumena">Zatím tu nejsou žádné třídy.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {tridy.docs.map((trida) => (
            <TridaKarta key={trida.id} trida={trida} />
          ))}
        </div>
      )}
    </main>
  )
}
