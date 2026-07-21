/**
 * Karta jednoho článku v sekci „Co je nového" na úvodní stránce.
 * Dle návrhu: štítek typu, datum, titulek (bez obrázku — ten se
 * zobrazuje až v detailu článku).
 */
import Link from 'next/link'
import React from 'react'

import type { Aktualita } from '@/payload-types'

import { StitekTypu } from './StitekTypu'

/** Zformátuje ISO datum na české "18. 6. 2026". */
export const formatujDatum = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString('cs-CZ') : ''

export function AktualitaKarta({ aktualita }: { aktualita: Aktualita }) {
  return (
    <Link
      href={`/aktuality/${aktualita.slug}`}
      className="block rounded-karta border border-black/5 bg-panel p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_26px_rgba(0,0,0,0.1)]"
    >
      <div className="mb-3">
        <StitekTypu typ={aktualita.typ} />
      </div>
      <div className="mb-1.5 text-[13px] font-semibold text-tlumena">
        {aktualita.typ === 'akce' && aktualita.datumAkce
          ? `koná se ${formatujDatum(aktualita.datumAkce)}`
          : formatujDatum(aktualita.publishedAt)}
      </div>
      <div className="font-nadpisy text-[19px] font-bold leading-[1.35]">{aktualita.nazev}</div>
    </Link>
  )
}
