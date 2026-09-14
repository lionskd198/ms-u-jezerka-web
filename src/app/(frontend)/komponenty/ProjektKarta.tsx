/**
 * Karta jednoho projektu na stránce /projekty — fotka/logo, název, krátký
 * popis. Projekty nemají vlastní podstránku, takže karta nikam neodkazuje.
 */
import React from 'react'

import type { Projekt } from '@/payload-types'

export function ProjektKarta({ projekt }: { projekt: Projekt }) {
  const obrazek = typeof projekt.obrazek === 'object' ? projekt.obrazek : null

  return (
    <div className="rounded-karta border border-black/5 bg-panel p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
      {obrazek?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={obrazek.sizes?.karta?.url ?? obrazek.url}
          alt={obrazek.alt}
          className="mb-3.5 h-16 w-auto max-w-[160px] rounded-karta object-contain"
        />
      ) : (
        <span aria-hidden className="mb-3.5 block h-16 w-16 rounded-karta bg-akcent2" />
      )}
      <div className="mb-1 font-nadpisy text-lg font-bold">{projekt.nazev}</div>
      {projekt.popis && <p className="text-sm leading-relaxed text-inkoust/85">{projekt.popis}</p>}
    </div>
  )
}
