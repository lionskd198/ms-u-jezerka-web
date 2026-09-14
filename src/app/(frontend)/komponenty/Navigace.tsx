'use client'

/**
 * Hlavní navigace v hlavičce — na širší obrazovce řádek odkazů, na mobilu
 * (pod 768px) sbalené menu s hamburger tlačítkem. Musí to být klientská
 * komponenta kvůli stavu "otevřeno/zavřeno" (useState), zbytek hlavičky
 * v layout.tsx zůstává serverová komponenta.
 */
import Link from 'next/link'
import { useState } from 'react'

type Polozka = { nazev: string; cesta: string }

const TRIDA_ODKAZU =
  'rounded-karta px-4 py-2.5 text-base font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white'

export function Navigace({
  polozky,
  odkazNaJidelnicek,
}: {
  polozky: Polozka[]
  odkazNaJidelnicek?: string | null
}) {
  const [otevreno, setOtevreno] = useState(false)

  return (
    <div className="relative">
      {/* ===== Širší obrazovka: běžný řádek odkazů ===== */}
      <nav className="hidden flex-wrap gap-1.5 md:flex">
        {polozky.map((polozka) => (
          <Link key={polozka.cesta} href={polozka.cesta} className={TRIDA_ODKAZU}>
            {polozka.nazev}
          </Link>
        ))}
        {odkazNaJidelnicek && (
          <a
            href={odkazNaJidelnicek}
            target="_blank"
            rel="noopener noreferrer"
            className={TRIDA_ODKAZU}
          >
            Jídelníček
          </a>
        )}
        <Link href="/kontakty" className={TRIDA_ODKAZU}>
          Kontakty
        </Link>
      </nav>

      {/* ===== Mobil: hamburger tlačítko ===== */}
      <button
        type="button"
        onClick={() => setOtevreno((v) => !v)}
        aria-expanded={otevreno}
        aria-label={otevreno ? 'Zavřít menu' : 'Otevřít menu'}
        className="flex h-11 w-11 items-center justify-center rounded-karta text-white transition-colors hover:bg-white/15 md:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          {otevreno ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {/* ===== Mobil: rozbalené menu pod hlavičkou ===== */}
      {otevreno && (
        <nav className="absolute right-0 top-[calc(100%+10px)] z-30 flex w-[220px] flex-col gap-1 rounded-karta bg-primary p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] md:hidden">
          {polozky.map((polozka) => (
            <Link
              key={polozka.cesta}
              href={polozka.cesta}
              onClick={() => setOtevreno(false)}
              className={TRIDA_ODKAZU}
            >
              {polozka.nazev}
            </Link>
          ))}
          {odkazNaJidelnicek && (
            <a
              href={odkazNaJidelnicek}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOtevreno(false)}
              className={TRIDA_ODKAZU}
            >
              Jídelníček
            </a>
          )}
          <Link href="/kontakty" onClick={() => setOtevreno(false)} className={TRIDA_ODKAZU}>
            Kontakty
          </Link>
        </nav>
      )}
    </div>
  )
}
