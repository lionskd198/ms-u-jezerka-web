/**
 * Karta jedné třídy v seznamu na stránce /tridy (a v sekci „Třídy a učitelky"
 * na stránce Kontakty) — logo, název, věková skupina, krátký popis.
 */
import Link from 'next/link'
import React from 'react'

import type { Trida } from '@/payload-types'

export function TridaKarta({ trida }: { trida: Trida }) {
  const logo = typeof trida.logo === 'object' ? trida.logo : null

  return (
    <Link
      href={`/tridy/${trida.slug}`}
      className="block rounded-karta border border-black/5 bg-panel p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_26px_rgba(0,0,0,0.1)]"
    >
      {logo?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.sizes?.karta?.url ?? logo.url}
          alt={logo.alt}
          className="mb-3.5 h-16 w-auto max-w-[160px] rounded-karta object-contain"
        />
      ) : (
        <span aria-hidden className="mb-3.5 block h-16 w-16 rounded-karta bg-akcent2" />
      )}
      <div className="mb-1 font-nadpisy text-lg font-bold">{trida.nazev}</div>
      {trida.vek && <div className="mb-2.5 text-[13px] font-semibold text-tlumena">{trida.vek}</div>}
      {trida.popis && <p className="text-sm leading-relaxed text-inkoust/85">{trida.popis}</p>}
    </Link>
  )
}
