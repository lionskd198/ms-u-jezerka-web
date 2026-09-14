/**
 * =============================================================================
 * STRÁNKA: Projekty ( /projekty )
 * =============================================================================
 *
 * Výpis projektů, do kterých je školka dlouhodobě zapojená (např.
 * Recyklohraní) — název, krátký popis a fotka/logo. Bez vlastních podstránek.
 */
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

import { ProjektKarta } from '../komponenty/ProjektKarta'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Projekty',
}

export default async function ProjektyStranka() {
  const payload = await getPayload({ config })

  const projekty = await payload.find({
    collection: 'projekty',
    sort: 'nazev',
    limit: 100,
    depth: 1,
  })

  return (
    <main className="mx-auto w-full max-w-[1000px] flex-1 px-7 pb-[90px] pt-14">
      <h1 className="mb-2 font-nadpisy text-4xl font-extrabold">Projekty</h1>
      <p className="mb-9 text-base text-tlumena">Projekty, do kterých je naše školka zapojená.</p>

      {projekty.docs.length === 0 ? (
        <p className="text-tlumena">Zatím tu nejsou žádné projekty.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {projekty.docs.map((projekt) => (
            <ProjektKarta key={projekt.id} projekt={projekt} />
          ))}
        </div>
      )}
    </main>
  )
}
