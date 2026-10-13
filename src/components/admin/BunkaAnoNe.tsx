/**
 * Buňka ve výpisu administrace pro zaškrtávací pole — místo textu
 * „pravda / nepravda" ukáže zelenou fajfku nebo červený křížek.
 */
import React from 'react'

export function BunkaAnoNe({ cellData }: { cellData?: unknown }) {
  const ano = Boolean(cellData)
  return (
    <span
      title={ano ? 'Ano' : 'Ne'}
      aria-label={ano ? 'Ano' : 'Ne'}
      style={{ color: ano ? '#1a8f4c' : '#c0392b', fontSize: '1.15em', fontWeight: 700 }}
    >
      {ano ? '✓' : '✗'}
    </span>
  )
}
