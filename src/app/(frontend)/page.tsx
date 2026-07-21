/**
 * =============================================================================
 * ÚVODNÍ STRÁNKA ( / )
 * =============================================================================
 *
 * Tohle je "server komponenta" — běží na serveru, takže může přímo číst data
 * z Payloadu přes Local API (getPayload). Do prohlížeče se pošle až hotové HTML.
 *
 * Rozvržení dle grafického návrhu:
 *   1. hero sekce s gradientem, štítkem, nadpisem a dvěma tlačítky
 *   2. bílý pruh se statistikami překrývající hero
 *   3. „Co je nového" — dvě nejnovější aktuality
 *   4. „Rychlé odkazy" — tři barevné dlaždice
 */
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

import { AktualitaKarta } from './komponenty/AktualitaKarta'

// Stránku vždy vykreslit čerstvě (žádná cache) — změny v administraci
// se tak na webu projeví okamžitě po obnovení stránky.
export const dynamic = 'force-dynamic'

/** Dlaždice rychlých odkazů — statické, vedou na hlavní sekce webu. */
const RYCHLE_ODKAZY = [
  {
    titulek: 'Aktuality',
    popis: 'Novinky a důležité informace ze školky.',
    cesta: '/aktuality',
  },
  {
    titulek: 'Dokumenty',
    popis: 'Řády, formuláře a jídelníček ke stažení.',
    cesta: '/dokumenty',
  },
  {
    titulek: 'Kontakty',
    popis: 'Adresa, provozní doba a učitelky tříd.',
    cesta: '/kontakty',
  },
]

export default async function UvodniStranka() {
  const payload = await getPayload({ config })

  // Obsah hero sekce (global „Úvodní stránka")…
  const oNas = await payload.findGlobal({ slug: 'o-nas' })

  // …a dvě nejnovější publikované aktuality pro sekci „Co je nového".
  // Access control kolekce sám zajistí, že nepřihlášeným vrátí jen publikované.
  const aktuality = await payload.find({
    collection: 'aktuality',
    sort: '-publishedAt',
    limit: 2,
  })

  return (
    <main className="flex-1">
      {/* ===== 1. Hero sekce s gradientem ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-tmava px-7 pb-24 pt-[72px]">
        {/* Dekorativní plovoucí kruhy z návrhu */}
        <div
          aria-hidden
          className="animace-plavani absolute -right-10 -top-[60px] h-[220px] w-[220px] rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="absolute -bottom-[70px] -left-[30px] h-[180px] w-[180px] rounded-full bg-white/5"
        />

        <div className="relative mx-auto max-w-[900px] text-center">
          {oNas.stitek && (
            <div className="mb-[22px] inline-block rounded-full bg-akcent2 px-4 py-1.5 text-sm font-bold text-primary-tmava">
              {oNas.stitek}
            </div>
          )}
          <h1 className="mb-[18px] font-nadpisy text-[clamp(34px,5vw,58px)] font-extrabold leading-[1.1] text-white">
            {oNas.nadpis}
          </h1>
          {oNas.podtitulek && (
            <p className="mx-auto mb-[34px] max-w-[560px] text-[19px] leading-relaxed text-white/90">
              {oNas.podtitulek}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link
              href="/aktuality"
              className="rounded-karta bg-akcent2 px-[26px] py-3.5 text-base font-bold text-primary-tmava transition-[filter] hover:brightness-105"
            >
              Aktuality
            </Link>
            <Link
              href="/dokumenty"
              className="rounded-karta border-2 border-white/50 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              Dokumenty ke stažení
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 2. Pruh statistik (záporný margin = překrývá hero) ===== */}
      {oNas.statistiky && oNas.statistiky.length > 0 && (
        <section className="relative z-[2] mx-auto -mt-12 max-w-[1100px] px-7">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6 rounded-karta bg-panel p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
            {oNas.statistiky.map((stat) => (
              <div key={stat.id}>
                <div className="font-nadpisy text-[32px] font-extrabold text-primary">
                  {stat.hodnota}
                </div>
                <div className="mt-1 text-sm font-semibold text-tlumena">{stat.popisek}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== 3. Co je nového ===== */}
      <section className="mx-auto my-16 max-w-[1100px] px-7">
        <div className="mb-[22px] flex flex-wrap items-baseline justify-between gap-2.5">
          <h2 className="font-nadpisy text-[28px] font-bold">Co je nového</h2>
          <Link
            href="/aktuality"
            className="text-[15px] font-bold text-primary hover:underline"
          >
            Všechny aktuality →
          </Link>
        </div>
        {aktuality.docs.length === 0 ? (
          <p className="text-tlumena">Zatím tu nejsou žádné aktuality.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
            {aktuality.docs.map((aktualita) => (
              <AktualitaKarta key={aktualita.id} aktualita={aktualita} />
            ))}
          </div>
        )}
      </section>

      {/* ===== 4. Rychlé odkazy ===== */}
      <section className="mx-auto mb-20 mt-16 max-w-[1100px] px-7">
        <h2 className="mb-[22px] font-nadpisy text-[28px] font-bold">Rychlé odkazy</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
          {RYCHLE_ODKAZY.map((odkaz) => (
            <Link
              key={odkaz.cesta}
              href={odkaz.cesta}
              className="rounded-karta bg-primary p-7 pr-6 text-white transition-[filter] hover:brightness-110"
            >
              <span aria-hidden className="mb-4 block h-11 w-11 rounded-full bg-white/20" />
              <span className="mb-1.5 block font-nadpisy text-[19px] font-bold">
                {odkaz.titulek}
              </span>
              <span className="block text-sm leading-normal text-white/80">{odkaz.popis}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
