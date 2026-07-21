/**
 * Barevný štítek (pill) s typem aktuality — dle návrhu oranžový akcent
 * s bílým textem. Používá se ve výpisu aktualit i v detailu článku.
 */
import React from 'react'

import { TYPY_AKTUALIT } from '@/collections/Aktuality'

export function StitekTypu({ typ, velky = false }: { typ: string; velky?: boolean }) {
  // Najdeme český popisek typu podle jeho hodnoty (value → label).
  const popisek = TYPY_AKTUALIT.find((t) => t.value === typ)?.label ?? typ

  return (
    <span
      className={`inline-block rounded-full bg-akcent font-bold text-white ${
        velky ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]'
      }`}
    >
      {popisek}
    </span>
  )
}
